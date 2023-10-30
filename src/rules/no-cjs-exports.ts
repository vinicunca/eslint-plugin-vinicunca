import { createEslintRule } from '../utils/rule';

export const RULE_NAME = 'no-cjs-exports';
export type MessageIds = 'noCjsExports';
export type Options = [];

export default createEslintRule<Options, MessageIds>({
  create: (context) => {
    const extension = context.getFilename().split('.').pop();
    if (!extension) {
      return {};
    };
    if (!['cts', 'mts', 'ts', 'tsx'].includes(extension)) {
      return {};
    };

    return {
      'MemberExpression[object.name="exports"]': function(node) {
        context.report({
          messageId: 'noCjsExports',
          node,
        });
      },
      'MemberExpression[object.name="module"][property.name="exports"]': function(node) {
        context.report({
          messageId: 'noCjsExports',
          node,
        });
      },
    };
  },
  defaultOptions: [],
  meta: {
    docs: {
      description: 'Do not use CJS exports',
    },
    messages: {
      noCjsExports: 'Use ESM export instead',
    },
    schema: [],
    type: 'problem',
  },
  name: RULE_NAME,
});
