import { type TSESTree } from '@typescript-eslint/utils';
import { createEslintRule } from '../utils/rule';
import { isBooleanLiteral, isConditionalExpression, isIfStatement } from '../utils/nodes';

export const RULE_NAME = 'no-redundant-boolean';
export type Options = [];
export type MessageIds = 'removeUnnecessaryBoolean';

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,

  meta: {
    messages: {
      removeUnnecessaryBoolean: 'Refactor the code to avoid using this boolean literal.',
    },
    schema: [],
    type: 'suggestion',
    docs: {
      description: 'Boolean literals should not be redundant',
      recommended: 'recommended',
    },
  },

  defaultOptions: [],

  create: (context) => {
    return {
      BinaryExpression(node: TSESTree.Node) {
        const expression = node as TSESTree.BinaryExpression;
        if (expression.operator === '==' || expression.operator === '!=') {
          checkBooleanLiteral(expression.left);
          checkBooleanLiteral(expression.right);
        }
      },

      LogicalExpression(node: TSESTree.Node) {
        const expression = node as TSESTree.LogicalExpression;
        checkBooleanLiteral(expression.left);

        if (expression.operator === '&&') {
          checkBooleanLiteral(expression.right);
        }

        // ignore `x || true` and `x || false` expressions outside of conditional expressions and `if` statements
        const { parent } = node;
        if (
          expression.operator === '||'
          && ((isConditionalExpression(parent) && parent.test === expression) || isIfStatement(parent))
        ) {
          checkBooleanLiteral(expression.right);
        }
      },

      UnaryExpression(node: TSESTree.Node) {
        const unaryExpression = node as TSESTree.UnaryExpression;
        if (unaryExpression.operator === '!') {
          checkBooleanLiteral(unaryExpression.argument);
        }
      },
    };

    function checkBooleanLiteral(expression: TSESTree.Expression | TSESTree.PrivateIdentifier) {
      if (isBooleanLiteral(expression)) {
        context.report({ messageId: 'removeUnnecessaryBoolean', node: expression });
      }
    }
  },
});
