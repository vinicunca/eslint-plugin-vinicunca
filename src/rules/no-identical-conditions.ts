import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { areEquivalent } from '../utils/equivalence';
import { issueLocation, report } from '../utils/locations';
import { createEslintRule } from '../utils/rule';

export const RULE_NAME = 'no-identical-conditions';
export type MessageIds = 'duplicatedCase' | 'duplicatedCondition' | 'vinicuncaRuntime';
type Options = [];

const duplicatedConditionMessage = 'This condition is covered by the one on line {{line}}';
const duplicatedCaseMessage = 'This case duplicates the one on line {{line}}';

const splitByOr = splitByLogicalOperator.bind(null, '||');
const splitByAnd = splitByLogicalOperator.bind(null, '&&');

export default createEslintRule<Options, MessageIds>({
  create(context) {
    const sourceCode = context.getSourceCode();
    return {
      IfStatement(node: TSESTree.Node) {
        const { test } = node as TSESTree.IfStatement;
        const conditionsToCheck
          = test.type === 'LogicalExpression' && test.operator === '&&'
            ? [test, ...splitByAnd(test)]
            : [test];

        let current = node;
        let operandsToCheck = conditionsToCheck.map((c) => splitByOr(c).map(splitByAnd));
        while (current.parent?.type === 'IfStatement' && current.parent.alternate === current) {
          current = current.parent;

          const currentOrOperands = splitByOr(current.test).map(splitByAnd);
          operandsToCheck = operandsToCheck.map((orOperands) => orOperands.filter(
            (orOperand) => !currentOrOperands.some((currentOrOperand) => isSubset(currentOrOperand, orOperand, sourceCode)),
          ));

          if (operandsToCheck.some((orOperands) => orOperands.length === 0)) {
            report(
              context,
              {
                data: { line: current.test.loc.start.line },
                messageId: 'duplicatedCondition',
                node: test,
              },
              [issueLocation(current.test.loc, current.test.loc, 'Covering')],
              duplicatedConditionMessage,
            );
            break;
          }
        }
      },
      SwitchStatement(node: TSESTree.Node) {
        const switchStmt = node as TSESTree.SwitchStatement;
        const previousTests: TSESTree.Expression[] = [];
        for (const switchCase of switchStmt.cases) {
          if (switchCase.test) {
            const { test } = switchCase;
            const duplicateTest = previousTests.find((previousTest) => areEquivalent(test, previousTest, sourceCode));
            if (duplicateTest) {
              report(
                context,
                {
                  data: {
                    line: duplicateTest.loc.start.line,
                  },
                  messageId: 'duplicatedCase',
                  node: test,
                },
                [issueLocation(duplicateTest.loc, duplicateTest.loc, 'Original')],
                duplicatedCaseMessage,
              );
            } else {
              previousTests.push(test);
            }
          }
        }
      },
    };
  },

  defaultOptions: [],

  meta: {
    docs: {
      description:
        'Related "if-else-if" and "switch-case" statements should not have the same condition',
      recommended: 'recommended',
    },
    messages: {
      duplicatedCase: duplicatedCaseMessage,
      duplicatedCondition: duplicatedConditionMessage,
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

function splitByLogicalOperator(
  operator: '&&' | '??' | '||',
  node: TSESTree.Node,
): TSESTree.Node[] {
  if (node.type === 'LogicalExpression' && node.operator === operator) {
    return [
      ...splitByLogicalOperator(operator, node.left),
      ...splitByLogicalOperator(operator, node.right),
    ];
  }
  return [node];
}

function isSubset(
  first: TSESTree.Node[],
  second: TSESTree.Node[],
  sourceCode: TSESLint.SourceCode,
): boolean {
  return first.every((fst) => second.some((snd) => isSubsetOf(fst, snd, sourceCode)));

  function isSubsetOf(
    first: TSESTree.Node,
    second: TSESTree.Node,
    sourceCode: TSESLint.SourceCode,
  ): boolean {
    if (first.type !== second.type) {
      return false;
    }

    if (first.type === 'LogicalExpression') {
      const second1 = second as TSESTree.LogicalExpression;
      if (
        (first.operator === '||' || first.operator === '&&')
        && first.operator === second1.operator
      ) {
        return (
          (isSubsetOf(first.left, second1.left, sourceCode)
            && isSubsetOf(first.right, second1.right, sourceCode))
          || (isSubsetOf(first.left, second1.right, sourceCode)
            && isSubsetOf(first.right, second1.left, sourceCode))
        );
      }
    }

    return areEquivalent(first, second, sourceCode);
  }
}
