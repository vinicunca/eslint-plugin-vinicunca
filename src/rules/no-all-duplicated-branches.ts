import { type TSESTree } from '@typescript-eslint/utils';
import { createEslintRule } from '../utils/rule';
import { isIfStatement } from '../utils/nodes';
import { areEquivalent } from '../utils/equivalence';
import { collectIfBranches, collectSwitchBranches } from '../utils/conditions';

export const RULE_NAME = 'no-all-duplicated-branches';
export type MessageIds = 'removeOrEditConditionalStructure' | 'returnsTheSameValue';
type Options = [];

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,

  meta: {
    messages: {
      removeOrEditConditionalStructure:
        'Remove this conditional structure or edit its code blocks so that they\'re not all the same.',
      returnsTheSameValue:
        'This conditional operation returns the same value whether the condition is "true" or "false".',
    },
    schema: [],
    type: 'problem',
    docs: {
      description:
        'All branches in a conditional structure should not have exactly the same implementation',
      recommended: 'recommended',
    },
  },

  defaultOptions: [],

  create(context) {
    return {
      IfStatement(node: TSESTree.Node) {
        const ifStmt = node as TSESTree.IfStatement;

        // don't visit `else if` statements
        if (!isIfStatement(node.parent)) {
          const { branches, endsWithElse } = collectIfBranches(ifStmt);
          if (endsWithElse && allDuplicated(branches)) {
            context.report({ messageId: 'removeOrEditConditionalStructure', node: ifStmt });
          }
        }
      },

      SwitchStatement(node: TSESTree.Node) {
        const switchStmt = node as TSESTree.SwitchStatement;
        const { branches, endsWithDefault } = collectSwitchBranches(switchStmt);
        if (endsWithDefault && allDuplicated(branches)) {
          context.report({ messageId: 'removeOrEditConditionalStructure', node: switchStmt });
        }
      },

      ConditionalExpression(node: TSESTree.Node) {
        const conditional = node as TSESTree.ConditionalExpression;
        const branches = [conditional.consequent, conditional.alternate];
        if (allDuplicated(branches)) {
          context.report({ messageId: 'returnsTheSameValue', node: conditional });
        }
      },
    };

    function allDuplicated(branches: Array<TSESTree.Node | TSESTree.Node[]>) {
      return (
        branches.length > 1
        && branches.slice(1).every((branch, index) => {
          return areEquivalent(branch, branches[index], context.getSourceCode());
        })
      );
    }
  },
});
