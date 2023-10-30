import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { isBlockStatement, isBooleanLiteral, isIfStatement, isReturnStatement } from '../utils/nodes';
import { createEslintRule } from '../utils/rule';

export const RULE_NAME = 'prefer-single-boolean-return';
export type Options = [];
export type MessageIds = 'replaceIfThenElseByReturn' | 'suggest' | 'suggestBoolean' | 'suggestCast';

export default createEslintRule<Options, MessageIds>({
  create: (context) => {
    return {
      IfStatement(node) {
        if (
          // ignore `else if`
          !isIfStatement(node.parent)
          && returnsBoolean(node.consequent)
          && alternateReturnsBoolean(node)
        ) {
          const messageId = 'replaceIfThenElseByReturn';
          const shouldNegate = isReturningFalse(node.consequent);
          const shouldCast = !isBooleanExpression(node.test);
          const testText = context.getSourceCode().getText(node.test);

          if (shouldNegate) {
            context.report({
              messageId,
              node,
              suggest: [{ fix: getFix(`!(${testText})`), messageId: 'suggest' }],
            });
          } else if (!shouldCast) {
            context.report({
              messageId,
              node,
              suggest: [{ fix: getFix(testText), messageId: 'suggest' }],
            });
          } else {
            context.report({
              messageId,
              node,
              suggest: [
                { fix: getFix(`!!(${testText})`), messageId: 'suggestCast' },
                { fix: getFix(testText), messageId: 'suggestBoolean' },
              ],
            });
          }

          function getFix(condition: string) {
            return (fixer: TSESLint.RuleFixer) => {
              const singleReturn = `return ${condition};`;
              if (node.alternate) {
                return fixer.replaceText(node, singleReturn);
              } else {
                const parent = node.parent as TSESTree.BlockStatement;
                const ifStmtIndex = parent.body.findIndex((stmt) => stmt === node);
                const returnStmt = parent.body[ifStmtIndex + 1];
                const range: [number, number] = [node.range[0], returnStmt.range[1]];
                return fixer.replaceTextRange(range, singleReturn);
              }
            };
          }
        }
      },
    };

    function alternateReturnsBoolean(node: TSESTree.IfStatement) {
      if (node.alternate) {
        return returnsBoolean(node.alternate);
      }

      const { parent } = node;
      if (parent?.type === 'BlockStatement') {
        const ifStmtIndex = parent.body.findIndex((stmt) => stmt === node);
        return isSimpleReturnBooleanLiteral(parent.body[ifStmtIndex + 1]);
      }

      return false;
    }

    function returnsBoolean(statement: TSESTree.Statement | undefined) {
      return (
        statement !== undefined
        && (isBlockReturningBooleanLiteral(statement) || isSimpleReturnBooleanLiteral(statement))
      );
    }

    function isBlockReturningBooleanLiteral(statement: TSESTree.Statement) {
      return (
        isBlockStatement(statement)
        && statement.body.length === 1
        && isSimpleReturnBooleanLiteral(statement.body[0])
      );
    }

    function isSimpleReturnBooleanLiteral(statement: TSESTree.Node) {
      // `statement.argument` can be `null`, replace it with `undefined` in this case
      return isReturnStatement(statement) && isBooleanLiteral(statement.argument || undefined);
    }

    function isReturningFalse(stmt: TSESTree.Statement): boolean {
      const returnStmt = (
        stmt.type === 'BlockStatement' ? stmt.body[0] : stmt
      ) as TSESTree.ReturnStatement;
      return (returnStmt.argument as TSESTree.Literal).value === false;
    }

    function isBooleanExpression(expr: TSESTree.Expression) {
      return (
        (expr.type === 'UnaryExpression' || expr.type === 'BinaryExpression')
        && ['!', '!=', '!==', '<', '<=', '==', '===', '>', '>=', 'in', 'instanceof'].includes(
          expr.operator,
        )
      );
    }
  },

  defaultOptions: [],

  meta: {
    docs: {
      description:
        'Return of boolean expressions should not be wrapped into an "if-then-else" statement',
      recommended: 'recommended',
    },
    hasSuggestions: true,
    messages: {
      replaceIfThenElseByReturn: 'Replace this if-then-else flow by a single return statement.',
      suggest: 'Replace with single return statement',
      suggestBoolean:
        'Replace with single return statement without cast (condition should be boolean!)',
      suggestCast: 'Replace with single return statement using "!!" cast',
    },
    schema: [],
    type: 'suggestion',
  },

  name: RULE_NAME,
});
