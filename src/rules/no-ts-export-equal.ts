import { createEslintRule } from '../utils/rule';

export const RULE_NAME = 'no-ts-export-equal';
export type MessageIds = 'noTsExportEqual';
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
      TSExportAssignment(node) {
        context.report({
          messageId: 'noTsExportEqual',
          node,
        });
      },
    };
  },
  defaultOptions: [],
  meta: {
    docs: {
      description: 'Do not use `exports =`',
      recommended: 'recommended',
    },
    messages: {
      noTsExportEqual: 'Use ESM `export default` instead',
    },
    schema: [],
    type: 'problem',
  },
  name: RULE_NAME,
});
