import { Graphviz } from '@hpcc-js/wasm';
import fg from 'fast-glob';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

let verbose = false;

const log = {
  debug: (msg: string) => {
    if (verbose) console.log(`[*] ${msg}`);
  },
  info: (msg: string) => {
    if (verbose) console.log(`[*] ${msg}`);
  },
  success: (msg: string) => console.log(`[+] ${msg}`),
  error: (msg: string) => console.log(`[-] ${msg}`),
  warn: (msg: string) => {
    if (verbose) console.warn(`[!] ${msg}`);
  },
};

type ActionType = 'assemble' | 'start';

interface Edge {
  from: string;
  to: string;
  action: ActionType;
}

interface ServiceDefinition {
  name: string;
  assembleDeps: string[];
  startDeps: string[];
}

export type OutputFormat = 'svg' | 'dot';

export interface DependencyGraphOptions {
  projectRoot: string;
  dependencyFilter?: 'assemble' | 'start';
  serviceFilter?: string;
  outputName?: string;
  formats?: OutputFormat[];
  verbose?: boolean;
}

/**
 * Parses an array literal AST node representing a service's `dependencies`
 * field and extracts the names and action types of each dependency entry.
 *
 * Each element in the array is expected to be an object literal with
 * `serviceName` (string literal or static property access) and `action`
 * (a value whose text contains `'assemble'` or `'start'`) properties.
 * Elements that do not conform to this shape are skipped with a log message.
 *
 * @param arrayNode - The `ArrayLiteralExpression` AST node to parse.
 * @param staticNames - Pre-collected map of `ClassName.member` → string value,
 *   used to resolve property-access expressions for `serviceName`.
 * @returns An object with two arrays: `assembleDeps` and `startDeps`,
 *   each containing the resolved service names for that action type.
 */
const extractDependenciesFromArray = (
  arrayNode: ts.ArrayLiteralExpression,
  staticNames: Map<string, string>,
): {
  assembleDeps: string[];
  startDeps: string[];
} => {
  const result = {
    assembleDeps: [] as string[],
    startDeps: [] as string[],
  };

  log.debug(`Iterating ${arrayNode.elements.length} dependency element(s)`);

  for (const [index, element] of arrayNode.elements.entries()) {
    if (!ts.isObjectLiteralExpression(element)) {
      log.error(
        `Skipping element #${index} [not an object literal, kind: ${ts.SyntaxKind[element.kind]}]`,
      );
      continue;
    }

    let serviceName: string | null = null;
    let action: ActionType | null = null;

    for (const prop of element.properties) {
      if (!ts.isPropertyAssignment(prop)) {
        log.error(
          `Skipping property in element #${index} [not a property assignment, kind: ${ts.SyntaxKind[prop.kind]}]`,
        );
        continue;
      }

      const propName = prop.name.getText();

      if (propName === 'serviceName') {
        if (ts.isStringLiteral(prop.initializer)) {
          serviceName = prop.initializer.text;
          log.debug(
            `Element #${index} serviceName (string literal): ${serviceName}`,
          );
        } else if (ts.isPropertyAccessExpression(prop.initializer)) {
          const key = prop.initializer.getText();
          const resolved = staticNames.get(key);

          if (resolved) {
            serviceName = resolved;
            log.debug(
              `Element #${index} serviceName (resolved property access): ${key} -> ${serviceName}`,
            );
          } else {
            log.error(
              `Element #${index} failed [unresolved dependency property access: ${key}]`,
            );
          }
        } else {
          log.error(
            `Element #${index} failed [unsupported dependency serviceName, kind: ${ts.SyntaxKind[prop.initializer.kind]}, text: ${prop.initializer.getText()}]`,
          );
        }
      }

      if (propName === 'action') {
        const actionText = prop.initializer.getText();

        if (actionText.includes('assemble')) {
          action = 'assemble';
        }

        if (actionText.includes('start')) {
          action = 'start';
        }

        if (!action) {
          log.error(
            `Element #${index} failed [unrecognized action: ${actionText}]`,
          );
        } else {
          log.debug(`Element #${index} action: ${action}`);
        }
      }
    }

    if (!serviceName || !action) {
      log.error(
        `Skipping element #${index} [missing serviceName=${serviceName} or action=${action}]`,
      );
      continue;
    }

    if (action === 'assemble') {
      result.assembleDeps.push(serviceName);
    }

    if (action === 'start') {
      result.startDeps.push(serviceName);
    }
  }

  return result;
};

/**
 * Recursively walks a TypeScript AST and collects static string property
 * declarations on class nodes into the provided map.
 *
 * Only static properties whose initializer is a string literal are recorded,
 * keyed as `ClassName.memberName`.
 *
 * @param node - The AST node to visit.
 * @param map - Map to populate with `"ClassName.memberName"` → string value entries.
 * @param projectRoot - Absolute path to the project root, used only for
 *   relative-path log messages.
 * @param filePath - Absolute path of the source file being scanned, used for
 *   relative-path log messages.
 */
const visitStaticNames = (
  node: ts.Node,
  map: Map<string, string>,
  projectRoot: string,
  filePath: string,
): void => {
  if (ts.isClassDeclaration(node) && node.name) {
    for (const member of node.members) {
      if (!ts.isPropertyDeclaration(member)) {
        continue;
      }

      const isStatic = member.modifiers?.some(
        (m) => m.kind === ts.SyntaxKind.StaticKeyword,
      );

      if (!isStatic) {
        continue;
      }

      const memberName = member.name.getText();

      if (member.initializer && ts.isStringLiteral(member.initializer)) {
        const key = `${node.name!.text}.${memberName}`;
        map.set(key, member.initializer.text);
        log.debug(
          `Collected static name [${key} = "${member.initializer.text}"] from ${path.relative(projectRoot, filePath)}`,
        );
      }
    }
  }

  ts.forEachChild(node, (child) =>
    visitStaticNames(child, map, projectRoot, filePath),
  );
};

/**
 * Scans all given TypeScript source files and builds a map of every static
 * string property declared on a class, keyed as `ClassName.memberName`.
 *
 * This map is used later to resolve `serviceName` values that are written as
 * a property access expression (e.g. `MyService.serviceName`) rather than a
 * plain string literal.
 *
 * @param filePaths - Absolute paths to the TypeScript files to scan.
 * @param projectRoot - Absolute path to the project root, used only for
 *   relative-path log messages.
 * @returns A map of `"ClassName.memberName"` → `string value` for every
 *   static string property found across all files.
 */
const collectStaticNames = (
  filePaths: string[],
  projectRoot: string,
): Map<string, string> => {
  log.debug(`Collecting static names across ${filePaths.length} file(s)`);
  const map = new Map<string, string>();

  for (const filePath of filePaths) {
    const content = fs.readFileSync(filePath, 'utf8');

    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );

    visitStaticNames(sourceFile, map, projectRoot, filePath);
  }

  log.info(`Collected ${map.size} static name(s) total`);
  return map;
};

/**
 * Attempts to determine the runtime service name for a class declaration AST
 * node by inspecting its `serviceName` or `name` property member.
 *
 * Resolution is tried in the following order:
 * 1. String literal initializer (e.g. `serviceName = 'my-service'`).
 * 2. Static property access resolved via `staticNames`
 *    (e.g. `serviceName = MyService.serviceName`).
 *
 * Returns `null` when the node is not a class declaration, or when no
 * `serviceName` / `name` member with a resolvable value is found. Classes
 * without an explicit service name are intentionally excluded from the graph.
 *
 * @param node - The AST node to inspect; only `ClassDeclaration` nodes are
 *   processed.
 * @param staticNames - Pre-collected map of `ClassName.member` → string value
 *   used to resolve property-access expressions.
 * @returns The resolved service name string, or `null` if the name could not
 *   be determined.
 */
const extractServiceName = (
  node: ts.Node,
  staticNames: Map<string, string>,
): string | null => {
  if (ts.isClassDeclaration(node)) {
    const className = node.name ? node.name.text : '<anonymous>';

    for (const member of node.members) {
      if (!ts.isPropertyDeclaration(member)) {
        continue;
      }

      const memberName = member.name.getText();

      if (memberName !== 'serviceName' && memberName !== 'name') {
        continue;
      }
      log.debug(
        `Trying to extract service name on class [${className}] member [${memberName}]`,
      );

      if (member.initializer && ts.isStringLiteral(member.initializer)) {
        const value = member.initializer.text;
        log.debug(`Resolved via string literal: ${value}`);
        return value;
      } else if (
        member.initializer &&
        ts.isPropertyAccessExpression(member.initializer)
      ) {
        const key = member.initializer.getText();
        const resolved = staticNames.get(key);

        if (resolved) {
          log.debug(`Resolved via property access: ${key} -> ${resolved}`);
          return resolved;
        }

        log.error(`Failed [unresolved property access: ${key}]`);
      } else if (member.initializer) {
        log.error(
          `Failed [unsupported initializer on class [${className}] member [${memberName}], kind: ${ts.SyntaxKind[member.initializer.kind]}, text: ${member.initializer.getText()}]`,
        );
      } else {
        log.error(
          `Failed [class [${className}] member [${memberName}] has no initializer]`,
        );
      }
    }

    log.warn(
      `No explicit service name found on class [${className}], skipping`,
    );
  }

  return null;
};

/**
 * Recursively walks a TypeScript AST and extracts {@link ServiceDefinition}
 * objects from concrete, non-abstract service class declarations.
 *
 * Abstract classes are skipped. Classes without a resolvable service name or
 * without an explicit `dependencies` member are skipped with a log message.
 *
 * @param node - The AST node to visit.
 * @param staticNames - Pre-collected map of `ClassName.member` → string value,
 *   forwarded to name- and dependency-resolution helpers.
 * @param services - Array to append discovered service definitions to.
 * @param classCount - Mutable counter incremented for each class declaration
 *   encountered, used for diagnostic logging after the walk completes.
 */
const visitServiceDefinitions = (
  node: ts.Node,
  staticNames: Map<string, string>,
  services: ServiceDefinition[],
  classCount: { value: number },
): void => {
  if (ts.isClassDeclaration(node)) {
    classCount.value++;

    const isAbstract =
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.AbstractKeyword) ??
      false;

    if (isAbstract) {
      log.debug(
        `Skipping abstract class [${node.name?.text ?? '<anonymous>'}]`,
      );
    } else {
      const serviceName = extractServiceName(node, staticNames);

      if (serviceName) {
        log.success(`Extracted service name: ${serviceName}`);
        let assembleDeps: string[] = [];
        let startDeps: string[] = [];
        let dependenciesFound = false;

        for (const member of node.members) {
          if (!ts.isPropertyDeclaration(member)) {
            continue;
          }

          const memberName = member.name.getText();

          if (memberName !== 'dependencies') {
            continue;
          }
          dependenciesFound = true;
          log.debug(`Trying to extract dependencies...`);

          if (
            member.initializer &&
            ts.isArrayLiteralExpression(member.initializer)
          ) {
            const deps = extractDependenciesFromArray(
              member.initializer,
              staticNames,
            );

            assembleDeps = deps.assembleDeps;
            startDeps = deps.startDeps;
            log.success(
              `Extracted dependency. Assemble: [${assembleDeps.join(',')}] & Start: [${startDeps.join(',')}]`,
            );
          } else if (member.initializer) {
            log.error(
              `Failed [dependencies initializer is not an array, kind: ${ts.SyntaxKind[member.initializer.kind]}, text: ${member.initializer.getText()}]`,
            );
          } else {
            log.error(`Failed [dependencies member has no initializer]`);
          }
        }

        if (!dependenciesFound) {
          log.warn(
            `Skipping class [${serviceName}] - no explicit 'dependencies' member found`,
          );
        } else {
          services.push({ name: serviceName, assembleDeps, startDeps });
        }
      }
    }
  }

  ts.forEachChild(node, (child) =>
    visitServiceDefinitions(child, staticNames, services, classCount),
  );
};

/**
 * Parses a single TypeScript source file and returns all service definitions
 * found within it.
 *
 * The file is parsed into an AST and walked recursively. Every class
 * declaration is inspected with the following rules:
 * - Abstract classes are skipped (logged at debug level).
 * - Classes whose service name cannot be determined are skipped.
 * - Concrete classes with no explicit `dependencies` member are skipped with a
 *   warning, as they are not considered full service definitions.
 * - Qualifying classes are parsed via {@link extractServiceName} and
 *   {@link extractDependenciesFromArray}.
 *
 * @param filePath - Absolute path to the TypeScript file to parse.
 * @param staticNames - Pre-collected map of `ClassName.member` → string value,
 *   forwarded to name- and dependency-resolution helpers.
 * @param projectRoot - Absolute path to the project root, used only for
 *   relative-path log messages.
 * @returns An array of {@link ServiceDefinition} objects found in the file.
 *   May be empty if the file contains no recognizable service classes.
 */
const parseFile = (
  filePath: string,
  staticNames: Map<string, string>,
  projectRoot: string,
): ServiceDefinition[] => {
  log.info(`Parsing file [${path.relative(projectRoot, filePath)}]`);
  const content = fs.readFileSync(filePath, 'utf8');

  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  const services: ServiceDefinition[] = [];
  const classCount = { value: 0 };

  visitServiceDefinitions(sourceFile, staticNames, services, classCount);

  if (classCount.value === 0) {
    log.debug(`No class declarations found in file`);
  }

  log.debug(`File yielded ${services.length} service definition(s)`);

  return services;
};

/**
 * Converts a list of service definitions into a flat list of directed edges
 * for the dependency graph.
 *
 * Each `assembleDep` on a service produces an edge with `action = 'assemble'`
 * and each `startDep` produces an edge with `action = 'start'`, both directed
 * from the dependent service towards the dependency.
 *
 * @param services - The deduplicated list of service definitions to process.
 * @returns An array of {@link Edge} objects representing every dependency
 *   relationship found across all services.
 */
const buildEdges = (services: ServiceDefinition[]): Edge[] => {
  const edges: Edge[] = [];

  for (const service of services) {
    for (const dep of service.assembleDeps) {
      edges.push({ from: service.name, to: dep, action: 'assemble' });
    }

    for (const dep of service.startDeps) {
      edges.push({ from: service.name, to: dep, action: 'start' });
    }
  }

  return edges;
};

/**
 * Serializes a list of services and edges into a Graphviz DOT language string
 * representing the full service dependency graph.
 *
 * Services that have no edges (neither as a source nor as a target) are
 * emitted as standalone node declarations so that isolated services are
 * included in the graph rather than silently omitted.
 *
 * Graph settings:
 * - Layout direction: left-to-right (`rankdir=LR`).
 * - Node shape: box.
 * - `assemble` edges are colored orange; `start` edges are colored blue.
 *
 * @param serviceNames - The full list of known service names, used to detect
 *   isolated nodes that have no edges.
 * @param edges - The list of directed dependency edges to render.
 * @returns A DOT-format string ready to be written to a `.dot` file or passed
 *   to a Graphviz renderer.
 */
const generateDot = (serviceNames: string[], edges: Edge[]): string => {
  const lines: string[] = [];

  lines.push('digraph ServiceDependencies {');
  lines.push('  rankdir=LR;');
  lines.push('  node [shape=box];');
  lines.push('');

  const coveredNodes = new Set<string>(edges.flatMap((e) => [e.from, e.to]));

  for (const name of serviceNames) {
    if (!coveredNodes.has(name)) {
      lines.push(`  "${name}";`);
    }
  }

  for (const edge of edges) {
    const color = edge.action === 'assemble' ? 'orange' : 'blue';
    lines.push(
      `  "${edge.from}" -> "${edge.to}" [label="${edge.action}", color="${color}"];`,
    );
  }

  lines.push('}');

  return lines.join('\n');
};

/**
 * Entry point for the dependency-graph command.
 *
 * Discovers all TypeScript files under `options.projectRoot` (excluding
 * `node_modules`, `dist`, and `build`), parses each one for service class
 * definitions, deduplicates them by name, builds a directed dependency graph,
 * and writes one or more output files into the current working directory,
 * one per requested format.
 *
 * @param options - Configuration for the graph generation run.
 * @param options.projectRoot - Absolute (or resolvable) path to the root of
 *   the project to scan.
 * @param options.dependencyFilter - When provided, restricts the graph to only
 *   `'assemble'` or only `'start'` dependency edges.
 * @param options.serviceFilter - When provided, limits the graph to all edges
 *   that directly involve the named service (as source or target).
 * @param options.outputName - Base name (without extension) for the generated
 *   output files. Defaults to `'graph'`.
 * @param options.formats - Output formats to generate. Supported values are
 *   `'svg'` and `'dot'`. Defaults to `['svg']`.
 */
export const generateDependencyGraph = async (
  options: DependencyGraphOptions,
): Promise<void> => {
  const {
    projectRoot,
    dependencyFilter,
    serviceFilter,
    outputName = 'graph',
    formats = ['svg'],
    verbose: verboseOption = false,
  } = options;

  verbose = verboseOption;

  const outputDir = process.cwd();

  log.info(`Starting service dependency graph generation`);
  log.info(`Project root: ${projectRoot}`);
  log.info(`Output(s): ${formats.map((f) => `${outputName}.${f}`).join(', ')}`);
  log.info(`Dependency filter: ${dependencyFilter ?? 'none'}`);
  log.info(`Service filter: ${serviceFilter ?? 'none'}`);

  const files = await fg(
    ['**/*.ts', '!node_modules/**', '!dist/**', '!build/**'],
    { cwd: projectRoot, absolute: true },
  );

  log.info(`Discovered ${files.length} TypeScript file(s)`);

  const services: ServiceDefinition[] = [];
  const staticNames = collectStaticNames(files, projectRoot);

  for (const file of files) {
    try {
      services.push(...parseFile(file, staticNames, projectRoot));
    } catch (err) {
      log.warn(`Failed to parse ${path.relative(projectRoot, file)}: ${err}`);
    }
  }

  log.info(
    `Parsed ${services.length} service definition(s) (pre-deduplication)`,
  );

  const deduplicated = new Map<string, ServiceDefinition>();

  for (const service of services) {
    if (deduplicated.has(service.name)) {
      log.warn(`Overwriting duplicate service definition: ${service.name}`);
    }
    deduplicated.set(service.name, service);
  }

  log.debug(`${deduplicated.size} unique service(s) after deduplication`);

  const allEdges = buildEdges([...deduplicated.values()]);

  log.debug(`Built ${allEdges.length} edge(s)`);

  const edges = dependencyFilter
    ? allEdges.filter((e) => e.action === dependencyFilter)
    : allEdges;

  if (dependencyFilter) {
    log.debug(
      `Filtered to '${dependencyFilter}' edges: ${edges.length} edge(s) remaining`,
    );
  }

  const filteredEdges = serviceFilter
    ? edges.filter((e) => e.from === serviceFilter || e.to === serviceFilter)
    : edges;

  if (serviceFilter) {
    log.debug(
      `Filtered to service '${serviceFilter}': ${filteredEdges.length} edge(s) remaining`,
    );
  }

  const visibleNodes = serviceFilter
    ? [
        ...new Set([
          serviceFilter,
          ...filteredEdges.flatMap((e) => [e.from, e.to]),
        ]),
      ]
    : [...deduplicated.keys()];

  const dot = generateDot(visibleNodes, filteredEdges);

  if (formats.includes('dot')) {
    const dotPath = path.join(outputDir, `${outputName}.dot`);
    fs.writeFileSync(dotPath, dot);
    log.success(`Generated file: ${outputName}.dot`);
  }

  if (formats.includes('svg')) {
    log.debug(`Rendering SVG via Graphviz`);
    const graphviz = await Graphviz.load();
    const svg = await graphviz.layout(dot, 'svg', 'dot');

    const svgPath = path.join(outputDir, `${outputName}.svg`);
    fs.writeFileSync(svgPath, svg);
    log.success(`Generated file: ${outputName}.svg`);
  }

  log.success(`Done`);
};
