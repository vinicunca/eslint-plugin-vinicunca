import { type TSESTree } from '@typescript-eslint/utils';

export function isIfStatement(node: TSESTree.Node | undefined): node is TSESTree.IfStatement {
  return node !== undefined && node.type === 'IfStatement';
}

export function isLiteral(node: TSESTree.Node | undefined): node is TSESTree.Literal {
  return node !== undefined && node.type === 'Literal';
}

export function isBlockStatement(node: TSESTree.Node | undefined): node is TSESTree.BlockStatement {
  return node !== undefined && node.type === 'BlockStatement';
}

export function isBooleanLiteral(node: TSESTree.Node | undefined): node is TSESTree.Literal {
  return isLiteral(node) && typeof node.value === 'boolean';
}

export function isReturnStatement(
  node: TSESTree.Node | undefined,
): node is TSESTree.ReturnStatement {
  return node !== undefined && node.type === 'ReturnStatement';
}
