import type { TSESTree } from '@typescript-eslint/utils';

import { ancestorsChain } from '../utils';
import { createEslintRule } from '../utils/rule';

export const RULE_NAME = 'no-nested-template-literals';
export type MessageIds = 'nestedTemplateLiterals';
export type Options = [];

export default createEslintRule<Options, MessageIds>({
  create(context) {
    return {
      'TemplateLiteral TemplateLiteral': (node: TSESTree.Node) => {
        const ancestors = ancestorsChain(node, new Set(['TemplateLiteral']));
        const nestingTemplate = ancestors[ancestors.length - 1];

        const { end: nestingEnd, start: nestingStart } = nestingTemplate.loc;
        const { end: nestedEnd, start: nestedStart } = node.loc;

        if (nestedStart.line === nestingStart.line || nestedEnd.line === nestingEnd.line) {
          context.report({
            messageId: 'nestedTemplateLiterals',
            node,
          });
        }
      },
    };
  },

  defaultOptions: [],

  meta: {
    docs: {
      description: 'Template literals should not be nested',
      recommended: 'recommended',
    },
    messages: {
      nestedTemplateLiterals: 'Refactor this code to not use nested template literals.',
    },
    schema: [],
    type: 'suggestion',
  },

  name: RULE_NAME,
});
