import { type TSESTree } from '@typescript-eslint/utils';
import { createEslintRule } from '../utils/rule';
import { areEquivalent } from '../utils/equivalence';
import { type IssueLocation } from '../utils/locations';
import { issueLocation, report } from '../utils/locations';
import { isIdentifier, isLiteral } from '../utils/node';

export const RULE_NAME = 'no-identical-expressions';
export type MessageIds = 'correctIdenticalSubExpressions' | 'vinicuncaRuntime';
type Options = (number | 'vinicunca-runtime')[];

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
  name: RULE_NAME,

  meta: {
    messages: {
      correctIdenticalSubExpressions: message,
      vinicuncaRuntime: '{{vinicuncaRuntimeData}}',
    },
    type: 'problem',
    docs: {
      description: 'Identical expressions should not be used on both sides of a binary operator',
      recommended: 'recommended',
    },
    schema: [
      {
        // internal parameter
        enum: ['vinicunca-runtime'],
      } as any,
    ],
  },

  defaultOptions: [],

  create(context) {
    return {
      LogicalExpression(node: TSESTree.Node) {
        check(node as TSESTree.LogicalExpression);
      },
      BinaryExpression(node: TSESTree.Node) {
        check(node as TSESTree.BinaryExpression);
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
            messageId: 'correctIdenticalSubExpressions',
            data: {
              operator: expr.operator,
            },
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
