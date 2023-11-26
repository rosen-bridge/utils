/**
 * extracts default values from a schema
 *
 * @param {*} schema
 * @return {*} object of default values
 */
export const generateDefault = (schema: any) => {
  const valueTree = Object.create(null);

  const stack: {
    subschema: any;
    parent: any;
    name: string;
    children: string[];
  }[] = [
    {
      subschema: schema,
      parent: undefined,
      name: '',
      children: Object.keys(schema).reverse(),
    },
  ];

  while (stack.length > 0) {
    const { subschema, parent, name, children } = stack.at(-1)!;
    if (children.length === 0) {
      if (parent != undefined && Object.keys(parent[name]).length === 0) {
        delete parent[name];
      }
      stack.pop();
      continue;
    }
    const child = children.pop()!;
    const value = parent != undefined ? parent[name] : valueTree;
    if (subschema[child]['type'] === 'object') {
      value[child] = Object.create(null);
      stack.push({
        subschema: subschema[child]['children'],
        parent: value,
        name: child,
        children: Object.keys(subschema[child]['children']).reverse(),
      });
    } else if (subschema[child]['default'] != undefined) {
      value[child] = subschema[child]['default'];
    }
  }

  return valueTree;
};
