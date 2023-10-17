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

export function isThrowStatement(node: TSESTree.Node | undefined): node is TSESTree.ThrowStatement {
  return node !== undefined && node.type === 'ThrowStatement';
}

export function isIdentifier(node: TSESTree.Node | undefined): node is TSESTree.Identifier {
  return node !== undefined && node.type === 'Identifier';
}

export function isVariableDeclaration(
  node: TSESTree.Node | undefined,
): node is TSESTree.VariableDeclaration {
  return node !== undefined && node.type === 'VariableDeclaration';
}

export function isFunctionExpression(
  node: TSESTree.Node | undefined,
): node is TSESTree.FunctionExpression {
  return node !== undefined && node.type === 'FunctionExpression';
}

export function isArrowFunctionExpression(
  node: TSESTree.Node | undefined,
): node is TSESTree.ArrowFunctionExpression {
  return node !== undefined && node.type === 'ArrowFunctionExpression';
}

export function isConditionalExpression(
  node: TSESTree.Node | undefined,
): node is TSESTree.ConditionalExpression {
  return node !== undefined && node.type === 'ConditionalExpression';
}

export function ancestorsChain(node: TSESTree.Node, boundaryTypes: Set<string>) {
  const chain: TSESTree.Node[] = [];

  let currentNode = node.parent;
  while (currentNode) {
    chain.push(currentNode);
    if (boundaryTypes.has(currentNode.type)) {
      break;
    }
    currentNode = currentNode.parent;
  }
  return chain;
}
