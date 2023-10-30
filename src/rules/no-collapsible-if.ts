import type { TSESTree } from '@typescript-eslint/utils';

import { issueLocation, report } from '../utils/locations';
import { isBlockStatement, isIfStatement } from '../utils/nodes';
import { createEslintRule } from '../utils/rule';

export const RULE_NAME = 'no-collapsible-if';
export type MessageIds = 'mergeNestedIfStatement' | 'vinicuncaRuntime';
type Options = [];

const message = 'Merge this if statement with the nested one.';

export default createEslintRule<Options, MessageIds>({
  create(context) {
    return {
      IfStatement(node: TSESTree.Node) {
        let { consequent } = node as TSESTree.IfStatement;
        if (isBlockStatement(consequent) && consequent.body.length === 1) {
          consequent = consequent.body[0];
        }
        if (isIfStatementWithoutElse(node) && isIfStatementWithoutElse(consequent)) {
          const ifKeyword = context.getSourceCode().getFirstToken(consequent);
          const enclosingIfKeyword = context.getSourceCode().getFirstToken(node);
          if (ifKeyword && enclosingIfKeyword) {
            report(
              context,
              {
                loc: enclosingIfKeyword.loc,
                messageId: 'mergeNestedIfStatement',
              },
              [issueLocation(ifKeyword.loc, ifKeyword.loc, 'Nested "if" statement.')],
              message,
            );
          }
        }
      },
    };

    function isIfStatementWithoutElse(node: TSESTree.Node): node is TSESTree.IfStatement {
      return isIfStatement(node) && !node.alternate;
    }
  },

  defaultOptions: [],
  meta: {
    docs: {
      description: 'Collapsible "if" statements should be merged',
      recommended: 'recommended',
    },
    messages: {
      mergeNestedIfStatement: message,
      vinicuncaRuntime: '{{vinicuncaRuntimeData}}',
    },
    schema: [
      {
        // internal parameter
        enum: ['vinicunca-runtime'],
      } as any,
    ],
    type: 'suggestion',
  },
  name: RULE_NAME,
});
