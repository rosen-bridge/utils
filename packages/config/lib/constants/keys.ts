/**
 * Keys every type node accepts. A type class adds the keys of its own
 * (`[...TYPE_KEYS, 'items']`).
 */
export const TYPE_KEYS = ['type', 'label', 'description', 'secret', 'rules'];

/**
 * Keys every inline rule accepts (besides `message`, and `when` when the rule
 * allows it). A rule class adds the keys of its parameters
 * (`[...RULE_KEYS, 'bound']`).
 */
export const RULE_KEYS = ['kind'];

/**
 * Keys every condition accepts. A condition class adds the keys of its
 * operands (`[...CONDITION_KEYS, 'operand']`).
 */
export const CONDITION_KEYS = ['kind'];

/**
 * Names a schema cannot give a property, a defined type or a defined rule:
 * as keys of a plain object they reach or replace its prototype, so a
 * configuration read with them could change other objects.
 */
export const UNSAFE_NAMES = ['__proto__', 'constructor', 'prototype'];
