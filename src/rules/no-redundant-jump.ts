import { type TSESTree } from '@typescript-eslint/utils';
import { createEslintRule } from '../utils/rule';

export const RULE_NAME = 'no-redundant-jump';
export type Options = [];
export type MessageIds = 'removeRedundantJump' | 'suggestJumpRemoval';

const loops = 'WhileStatement, ForStatement, DoWhileStatement, ForInStatement, ForOfStatement';

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,

  meta: {
    messages: {
      removeRedundantJump: 'Remove this redundant jump.',
      suggestJumpRemoval: 'Remove this redundant jump',
    },
    schema: [],
    type: 'suggestion',
    hasSuggestions: true,
    docs: {
      description: 'Jump statements should not be redundant',
      recommended: 'recommended',
    },
  },

  defaultOptions: [],

  create: (context) => {
    function reportIfLastStatement(node: TSESTree.ContinueStatement | TSESTree.ReturnStatement) {
      const withArgument = node.type === 'ContinueStatement' ? !!node.label : !!node.argument;
      if (!withArgument) {
        const block = node.parent as TSESTree.BlockStatement;
        if (block.body[block.body.length - 1] === node && block.body.length > 1) {
          const previousComments = context.getSourceCode().getCommentsBefore(node);
          const previousToken
            = previousComments.length === 0
              ? context.getSourceCode().getTokenBefore(node)!
              : previousComments[previousComments.length - 1];

          context.report({
            messageId: 'removeRedundantJump',
            node,
            suggest: [
              {
                messageId: 'suggestJumpRemoval',
                fix: (fixer) => fixer.removeRange([previousToken.range[1], node.range[1]]),
              },
            ],
          });
        }
      }
    }

    function reportIfLastStatementInsideIf(
      node: TSESTree.ContinueStatement | TSESTree.ReturnStatement,
    ) {
      const ancestors = context.getAncestors();
      const ifStatement = ancestors[ancestors.length - 2];
      const upperBlock = ancestors[ancestors.length - 3] as TSESTree.BlockStatement;
      if (upperBlock.body[upperBlock.body.length - 1] === ifStatement) {
        reportIfLastStatement(node);
      }
    }

    return {
      [`:matches(${loops}) > BlockStatement > ContinueStatement`]: (node: TSESTree.Node) => {
        reportIfLastStatement(node as TSESTree.ContinueStatement);
      },

      [`:matches(${loops}) > BlockStatement > IfStatement > BlockStatement > ContinueStatement`]: (
        node: TSESTree.Node,
      ) => {
        reportIfLastStatementInsideIf(node as TSESTree.ContinueStatement);
      },

      ':function > BlockStatement > ReturnStatement': (node: TSESTree.Node) => {
        reportIfLastStatement(node as TSESTree.ReturnStatement);
      },

      ':function > BlockStatement > IfStatement > BlockStatement > ReturnStatement': (
        node: TSESTree.Node,
      ) => {
        reportIfLastStatementInsideIf(node as TSESTree.ReturnStatement);
      },
    };
  },
});
