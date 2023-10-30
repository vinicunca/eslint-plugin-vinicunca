import type { TSESTree } from '@typescript-eslint/utils';

import type { IssueLocation } from '../utils/locations';

import { areEquivalent } from '../utils/equivalence';
import { issueLocation, report } from '../utils/locations';
import { isIdentifier, isLiteral } from '../utils/nodes';
import { createEslintRule } from '../utils/rule';

export const RULE_NAME = 'no-identical-expressions';
export type MessageIds = 'correctIdenticalSubExpressions' | 'vinicuncaRuntime';
type Options = [];

const EQUALITY_OPERATOR_TOKEN_KINDS = new Set(['==', '===', '!=', '!==']);

// consider only binary expressions with these operators
const RELEVANT_OPERATOR_TOKEN_KINDS = new Set([
  '&&',
  '||',
  '/',
  '-',
  '<<',
  '>>',
  '<',
  '<=',
  '>',
  '>=',
]);

const message
  = 'Correct one of the identical sub-expressions on both sides of operator "{{operator}}"';

export default createEslintRule<Options, MessageIds>({
  create(context) {
    return {
      BinaryExpression(node: TSESTree.Node) {
        check(node as TSESTree.BinaryExpression);
      },
      LogicalExpression(node: TSESTree.Node) {
        check(node as TSESTree.LogicalExpression);
      },
    };

    function check(expr: TSESTree.BinaryExpression | TSESTree.LogicalExpression) {
      if (
        hasRelevantOperator(expr)
        && !isOneOntoOneShifting(expr)
        && areEquivalent(expr.left, expr.right, context.getSourceCode())
      ) {
        const secondaryLocations: IssueLocation[] = [];
        if (expr.left.loc) {
          secondaryLocations.push(issueLocation(expr.left.loc));
        }
        report(
          context,
          {
            data: {
              operator: expr.operator,
            },
            messageId: 'correctIdenticalSubExpressions',
            node: isVinicuncaRuntime() ? expr.right : expr,
          },
          secondaryLocations,
          message,
        );
      }
    }

    function isVinicuncaRuntime() {
      return context.options[context.options.length - 1] === 'vinicunca-runtime';
    }
  },

  defaultOptions: [],

  meta: {
    docs: {
      description: 'Identical expressions should not be used on both sides of a binary operator',
      recommended: 'recommended',
    },
    messages: {
      correctIdenticalSubExpressions: message,
      vinicuncaRuntime: '{{vinicuncaRuntimeData}}',
    },
    schema: [
      {
        // internal parameter
        enum: ['vinicunca-runtime'],
      } as any,
    ],
    type: 'problem',
  },

  name: RULE_NAME,

});

function hasRelevantOperator(node: TSESTree.BinaryExpression | TSESTree.LogicalExpression) {
  return (
    RELEVANT_OPERATOR_TOKEN_KINDS.has(node.operator)
    || (EQUALITY_OPERATOR_TOKEN_KINDS.has(node.operator) && !hasIdentifierOperands(node))
  );
}

function hasIdentifierOperands(node: TSESTree.BinaryExpression | TSESTree.LogicalExpression) {
  return isIdentifier(node.left) && isIdentifier(node.right);
}

function isOneOntoOneShifting(node: TSESTree.BinaryExpression | TSESTree.LogicalExpression) {
  return node.operator === '<<' && isLiteral(node.left) && node.left.value === 1;
}
