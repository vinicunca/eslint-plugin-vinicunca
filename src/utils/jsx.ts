import { type TSESTree } from '@typescript-eslint/utils';

export function getJsxShortCircuitNodes(logicalExpression: TSESTree.LogicalExpression) {
  if (logicalExpression.parent?.type !== 'JSXExpressionContainer') {
    return null;
  } else {
    return flattenJsxShortCircuitNodes(logicalExpression, logicalExpression);
  }
}

function flattenJsxShortCircuitNodes(
  root: TSESTree.LogicalExpression,
  node: TSESTree.Node,
): TSESTree.LogicalExpression[] | null {
  if (
    node.type === 'ConditionalExpression'
    || (node.type === 'LogicalExpression' && node.operator !== root.operator)
  ) {
    return null;
  } else if (node.type !== 'LogicalExpression') {
    return [];
  } else {
    const leftNodes = flattenJsxShortCircuitNodes(root, node.left);
    const rightNodes = flattenJsxShortCircuitNodes(root, node.right);
    if (leftNodes == null || rightNodes == null) {
      return null;
    }
    return [...leftNodes, node, ...rightNodes];
  }
}
