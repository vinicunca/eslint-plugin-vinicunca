import { type TSESTree } from '@typescript-eslint/utils';
import { createEslintRule } from '../utils/rule';
import { isArrowFunctionExpression, isBlockStatement, isFunctionExpression } from '../utils/nodes';

export const RULE_NAME = 'no-use-of-empty-return-value';
export type Options = [];
export type MessageIds = 'removeUseOfOutput';

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,

  meta: {
    messages: {
      removeUseOfOutput:
        'Remove this use of the output from "{{name}}"; "{{name}}" doesn\'t return anything.',
    },
    schema: [],
    type: 'problem',
    docs: {
      description: 'The output of functions that don\'t return anything should not be used',
      recommended: 'recommended',
    },
  },

  defaultOptions: [],

  create: (context) => {
    const callExpressionsToCheck: Map<
    TSESTree.Identifier | TSESTree.JSXIdentifier,
    TSESTree.FunctionLike
    > = new Map();
    const functionsWithReturnValue: Set<TSESTree.FunctionLike> = new Set();

    return {
      CallExpression(node: TSESTree.Node) {
        const callExpr = node as TSESTree.CallExpression;
        if (!isReturnValueUsed(callExpr)) {
          return;
        }
        const scope = context.getScope();
        const reference = scope.references.find((ref) => ref.identifier === callExpr.callee);
        if (reference && reference.resolved) {
          const variable = reference.resolved;
          if (variable.defs.length === 1) {
            const definition = variable.defs[0];
            if (definition.type === 'FunctionName') {
              callExpressionsToCheck.set(reference.identifier, definition.node);
            } else if (definition.type === 'Variable') {
              const { init } = definition.node;
              if (init && (isFunctionExpression(init) || isArrowFunctionExpression(init))) {
                callExpressionsToCheck.set(reference.identifier, init);
              }
            }
          }
        }
      },

      ReturnStatement(node: TSESTree.Node) {
        const returnStmt = node as TSESTree.ReturnStatement;
        if (returnStmt.argument) {
          const ancestors = [...context.getAncestors()].reverse();
          const functionNode = ancestors.find(
            (node) => node.type === 'FunctionExpression'
              || node.type === 'FunctionDeclaration'
              || node.type === 'ArrowFunctionExpression',
          );

          functionsWithReturnValue.add(functionNode as TSESTree.FunctionLike);
        }
      },

      ArrowFunctionExpression(node: TSESTree.Node) {
        const arrowFunc = node as TSESTree.ArrowFunctionExpression;
        if (arrowFunc.expression) {
          functionsWithReturnValue.add(arrowFunc);
        }
      },

      ':function': function(node: TSESTree.Node) {
        const func = node as
          | TSESTree.FunctionExpression
          | TSESTree.FunctionDeclaration
          | TSESTree.ArrowFunctionExpression;
        if (
          func.async
          || func.generator
          || (isBlockStatement(func.body) && func.body.body.length === 0)
        ) {
          functionsWithReturnValue.add(func);
        }
      },

      'Program:exit': function() {
        callExpressionsToCheck.forEach((functionDeclaration, callee) => {
          if (!functionsWithReturnValue.has(functionDeclaration)) {
            context.report({
              messageId: 'removeUseOfOutput',
              node: callee,
              data: { name: callee.name },
            });
          }
        });
      },
    };
  },
});

function isReturnValueUsed(callExpr: TSESTree.Node) {
  const { parent } = callExpr;
  if (!parent) {
    return false;
  }

  if (parent.type === 'LogicalExpression') {
    return parent.left === callExpr;
  }

  if (parent.type === 'SequenceExpression') {
    return parent.expressions[parent.expressions.length - 1] === callExpr;
  }

  if (parent.type === 'ConditionalExpression') {
    return parent.test === callExpr;
  }

  return (
    parent.type !== 'ExpressionStatement'
    && parent.type !== 'ArrowFunctionExpression'
    && parent.type !== 'UnaryExpression'
    && parent.type !== 'AwaitExpression'
    && parent.type !== 'ReturnStatement'
    && parent.type !== 'ThrowStatement'
  );
}
