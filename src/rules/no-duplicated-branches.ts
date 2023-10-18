import { type TSESTree } from '@typescript-eslint/utils';
import { createEslintRule } from '../utils/rule';
import { isBlockStatement, isIfStatement } from '../utils/nodes';
import { areEquivalent } from '../utils/equivalence';
import { collectIfBranches, collectSwitchBranches, takeWithoutBreak } from '../utils/conditions';
import { issueLocation, report } from '../utils/locations';

export const RULE_NAME = 'no-duplicated-branches';
export type MessageIds = 'sameConditionalBlock' | 'vinicuncaRuntime';
export type Options = [];

const message
  = 'This {{type}}\'s code block is the same as the block for the {{type}} on line {{line}}.';

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,

  meta: {
    messages: {
      sameConditionalBlock: message,
      vinicuncaRuntime: '{{vinicuncaRuntimeData}}',
    },
    type: 'problem',
    docs: {
      description:
        'Two branches in a conditional structure should not have exactly the same implementation',
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
      IfStatement(node: TSESTree.Node) {
        visitIfStatement(node as TSESTree.IfStatement);
      },
      SwitchStatement(node: TSESTree.Node) {
        visitSwitchStatement(node as TSESTree.SwitchStatement);
      },
    };

    function visitIfStatement(ifStmt: TSESTree.IfStatement) {
      if (isIfStatement(ifStmt.parent)) {
        return;
      }
      const { branches, endsWithElse } = collectIfBranches(ifStmt);

      if (allEquivalentWithoutDefault(branches, endsWithElse)) {
        branches.slice(1).forEach((branch, i) => {
          reportIssue(branch, branches[i], 'branch');
        });
        return;
      }

      for (let i = 1; i < branches.length; i++) {
        if (hasRequiredSize([branches[i]])) {
          for (let j = 0; j < i; j++) {
            if (compareIfBranches(branches[i], branches[j])) {
              break;
            }
          }
        }
      }
    }

    function visitSwitchStatement(switchStmt: TSESTree.SwitchStatement) {
      const { cases } = switchStmt;
      const { endsWithDefault } = collectSwitchBranches(switchStmt);
      const nonEmptyCases = cases.filter(
        (c) => takeWithoutBreak(expandSingleBlockStatement(c.consequent)).length > 0,
      );
      const casesWithoutBreak = nonEmptyCases.map((c) => takeWithoutBreak(expandSingleBlockStatement(c.consequent)));

      if (allEquivalentWithoutDefault(casesWithoutBreak, endsWithDefault)) {
        nonEmptyCases
          .slice(1)
          .forEach((caseStmt, i) => {
            reportIssue(caseStmt, nonEmptyCases[i], 'case');
          });
        return;
      }

      for (let i = 1; i < cases.length; i++) {
        const firstClauseWithoutBreak = takeWithoutBreak(
          expandSingleBlockStatement(cases[i].consequent),
        );

        if (hasRequiredSize(firstClauseWithoutBreak)) {
          for (let j = 0; j < i; j++) {
            const secondClauseWithoutBreak = takeWithoutBreak(
              expandSingleBlockStatement(cases[j].consequent),
            );

            if (
              areEquivalent(
                firstClauseWithoutBreak,
                secondClauseWithoutBreak,
                context.getSourceCode(),
              )
            ) {
              reportIssue(cases[i], cases[j], 'case');
              break;
            }
          }
        }
      }
    }

    function hasRequiredSize(nodes: TSESTree.Statement[]) {
      if (nodes.length > 0) {
        const tokens = [
          ...context.getSourceCode().getTokens(nodes[0]),
          ...context.getSourceCode().getTokens(nodes[nodes.length - 1]),
        ].filter((token) => token.value !== '{' && token.value !== '}');
        return (
          tokens.length > 0 && tokens[tokens.length - 1].loc.end.line > tokens[0].loc.start.line
        );
      }
      return false;
    }

    function compareIfBranches(a: TSESTree.Statement, b: TSESTree.Statement) {
      const equivalent = areEquivalent(a, b, context.getSourceCode());
      if (equivalent && b.loc) {
        reportIssue(a, b, 'branch');
      }
      return equivalent;
    }

    function expandSingleBlockStatement(nodes: TSESTree.Statement[]) {
      if (nodes.length === 1) {
        const node = nodes[0];
        if (isBlockStatement(node)) {
          return node.body;
        }
      }
      return nodes;
    }

    function allEquivalentWithoutDefault(
      branches: Array<TSESTree.Node | TSESTree.Node[]>,
      endsWithDefault: boolean,
    ) {
      return (
        !endsWithDefault
        && branches.length > 1
        && branches
          .slice(1)
          .every((branch, index) => areEquivalent(branch, branches[index], context.getSourceCode()))
      );
    }

    function reportIssue(node: TSESTree.Node, equivalentNode: TSESTree.Node, type: string) {
      const equivalentNodeLoc = equivalentNode.loc as TSESTree.SourceLocation;
      report(
        context,
        {
          messageId: 'sameConditionalBlock',
          data: { type, line: String(equivalentNode.loc.start.line) },
          node,
        },
        [issueLocation(equivalentNodeLoc, equivalentNodeLoc, 'Original')],
        message,
      );
    }
  },
});

