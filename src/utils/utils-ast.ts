import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

export function isIdentifier(
  node: TSESTree.Node,
  ...values: string[]
): node is TSESTree.Identifier {
  return node.type === 'Identifier' && values.includes(node.name);
}

export function isReferenceTo(ref: TSESLint.Scope.Reference, node: TSESTree.Node) {
  return node.type === 'Identifier' && node === ref.identifier;
}
