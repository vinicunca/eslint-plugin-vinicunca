import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { isIdentifier, isReturnStatement, isThrowStatement, isVariableDeclaration } from '../utils/nodes';
import { createEslintRule } from '../utils/rule';

export const RULE_NAME = 'prefer-immediate-return';
export type Options = [];
export type MessageIds = 'doImmediateAction';

export default createEslintRule<Options, MessageIds>({
  create: (context) => {
    return {
      BlockStatement(node) {
        processStatements((node).body);
      },
      SwitchCase(node) {
        processStatements((node).consequent);
      },
    };

    function processStatements(statements: TSESTree.Statement[]) {
      if (statements.length > 1) {
        const last = statements[statements.length - 1];
        const returnedIdentifier = getOnlyReturnedVariable(last);

        const lastButOne = statements[statements.length - 2];
        const declaredIdentifier = getOnlyDeclaredVariable(lastButOne);

        if (returnedIdentifier && declaredIdentifier) {
          const sameVariable = getVariables(context).find((variable) => {
            return (
              variable.references.find((ref) => ref.identifier === returnedIdentifier)
                !== undefined
              && variable.references.find((ref) => ref.identifier === declaredIdentifier.id)
                !== undefined
            );
          });

          // there must be only one "read" - in `return` or `throw`
          if (sameVariable && sameVariable.references.filter((ref) => ref.isRead()).length === 1) {
            context.report({
              data: {
                action: isReturnStatement(last) ? 'return' : 'throw',
                variable: returnedIdentifier.name,
              },
              fix: (fixer) => {
                const expressionText = context.getSourceCode().getText(declaredIdentifier.init);
                const rangeToRemoveStart = lastButOne.range[0];
                const commentsBetweenStatements = context.getSourceCode().getCommentsAfter(lastButOne);
                const rangeToRemoveEnd = commentsBetweenStatements.length > 0
                  ? commentsBetweenStatements[0].range[0]
                  : last.range[0];

                return [
                  fixer.removeRange([rangeToRemoveStart, rangeToRemoveEnd]),
                  fixer.replaceText(returnedIdentifier, expressionText),
                ];
              },
              messageId: 'doImmediateAction',
              node: declaredIdentifier.init,
            });
          }
        }
      }
    }

    function getOnlyReturnedVariable(node: TSESTree.Statement) {
      return (isReturnStatement(node) || isThrowStatement(node))
        && node.argument
        && isIdentifier(node.argument)
        ? node.argument
        : undefined;
    }

    function getOnlyDeclaredVariable(node: TSESTree.Statement) {
      if (isVariableDeclaration(node) && node.declarations.length === 1) {
        const { id, init } = node.declarations[0];
        if (isIdentifier(id) && init && !id.typeAnnotation) {
          return { id, init };
        }
      }
      return undefined;
    }

    function getVariables(context: TSESLint.RuleContext<string, string[]>) {
      const { variableScope, variables: currentScopeVariables } = context.getScope();
      if (variableScope === context.getScope()) {
        return currentScopeVariables;
      } else {
        return currentScopeVariables.concat(variableScope.variables);
      }
    }
  },

  defaultOptions: [],

  meta: {
    docs: {
      description: 'Local variables should not be declared and then immediately returned or thrown',
      recommended: 'recommended',
    },
    fixable: 'code',
    messages: {
      doImmediateAction:
        'Immediately {{action}} this expression instead of assigning it to the temporary variable "{{variable}}".',
    },
    schema: [],
    type: 'suggestion',
  },

  name: RULE_NAME,
});
