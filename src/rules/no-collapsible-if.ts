import { type TSESTree } from '@typescript-eslint/utils';
import { createEslintRule } from '../utils/rule';
import { isBlockStatement, isIfStatement } from '../utils/nodes';
import { issueLocation, report } from '../utils/locations';

export const RULE_NAME = 'no-collapsible-if';
export type MessageIds = 'mergeNestedIfStatement' | 'vinicuncaRuntime';
type Options = [];

const message = 'Merge this if statement with the nested one.';

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,

  meta: {
    messages: {
      mergeNestedIfStatement: message,
      vinicuncaRuntime: '{{vinicuncaRuntimeData}}',
    },
    type: 'suggestion',
    docs: {
      description: 'Collapsible "if" statements should be merged',
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
                messageId: 'mergeNestedIfStatement',
                loc: enclosingIfKeyword.loc,
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
});
