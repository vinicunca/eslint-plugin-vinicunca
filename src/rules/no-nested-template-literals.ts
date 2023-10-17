import { type TSESTree } from '@typescript-eslint/utils';
import { createEslintRule } from '../utils/rule';
import { ancestorsChain } from '../utils/node';

export const RULE_NAME = 'no-nested-template-literals';
export type MessageIds = 'nestedTemplateLiterals';
export type Options = [];

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,

  meta: {
    messages: {
      nestedTemplateLiterals: 'Refactor this code to not use nested template literals.',
    },
    schema: [],
    type: 'suggestion',
    docs: {
      description: 'Template literals should not be nested',
      recommended: 'recommended',
    },
  },

  defaultOptions: [],

  create(context) {
    return {
      'TemplateLiteral TemplateLiteral': (node: TSESTree.Node) => {
        const ancestors = ancestorsChain(node, new Set(['TemplateLiteral']));
        const nestingTemplate = ancestors[ancestors.length - 1];

        const { start: nestingStart, end: nestingEnd } = nestingTemplate.loc;
        const { start: nestedStart, end: nestedEnd } = node.loc;

        if (nestedStart.line === nestingStart.line || nestedEnd.line === nestingEnd.line) {
          context.report({
            messageId: 'nestedTemplateLiterals',
            node,
          });
        }
      },
    };
  },
});
