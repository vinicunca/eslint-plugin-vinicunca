import type { TSESTree } from '@typescript-eslint/utils';

import { createEslintRule } from '../utils/rule';

export const RULE_NAME = 'indent-binary';
export type MessageIds = 'space';
export type Options = [{
  indent?: 'tab' | number;
}];

export default createEslintRule<Options, MessageIds>({
  create: (context, options) => {
    const { sourceCode } = context;

    const indentStr = options[0]?.indent === 'tab' ? '\t' : ' '.repeat(options[0]?.indent ?? 2);

    const indentCache = new Map<number, string>();
    function getIndentOfLine(line: number) {
      if (indentCache.has(line)) {
        return indentCache.get(line)!;
      }

      return sourceCode.lines[line - 1].match(/^\s*/)?.[0] ?? '';
    }

    function firstTokenOfLine(line: number) {
      return sourceCode.tokensAndComments.find((token) => token.loc.start.line === line);
    }

    function lastTokenOfLine(line: number) {
      return [...sourceCode.tokensAndComments].reverse().find((token) => token.loc.end.line === line);
    }

    function handler(node: TSESTree.Node, right: TSESTree.Node) {
      if (node.loc.start.line === node.loc.end.line) {
        return;
      }

      let tokenRight = sourceCode.getFirstToken(right)!;
      let tokenOperator = sourceCode.getTokenBefore(tokenRight)!;
      while (tokenOperator.value === '(') {
        tokenRight = tokenOperator;
        tokenOperator = sourceCode.getTokenBefore(tokenRight)!;
        if (tokenOperator.range[0] <= right.parent!.range[0]) {
          return;
        }
      }
      const tokenLeft = sourceCode.getTokenBefore(tokenOperator)!;

      const isMultiline = tokenRight.loc.start.line !== tokenLeft.loc.start.line;
      if (!isMultiline) {
        return;
      }

      // If the first token of the line is a keyword (`if`, `return`, etc)
      const firstTokenOfLineLeft = firstTokenOfLine(tokenLeft.loc.start.line);
      const lastTokenOfLineLeft = lastTokenOfLine(tokenLeft.loc.start.line);
      const needAdditionIndent = firstTokenOfLineLeft?.type === 'Keyword'
        || (firstTokenOfLineLeft?.type === 'Identifier' && firstTokenOfLineLeft.value === 'type')
        || lastTokenOfLineLeft?.value === ':'
        || lastTokenOfLineLeft?.value === '['
        || lastTokenOfLineLeft?.value === '('
        || lastTokenOfLineLeft?.value === '<';

      const indentTarget = getIndentOfLine(tokenLeft.loc.start.line) + (needAdditionIndent ? indentStr : '');
      const indentRight = getIndentOfLine(tokenRight.loc.start.line);
      if (indentTarget !== indentRight) {
        const start = {
          column: 0,
          line: tokenRight.loc.start.line,
        };
        const end = {
          column: indentRight.length,
          line: tokenRight.loc.start.line,
        };
        context.report({
          fix(fixer) {
            return fixer.replaceTextRange(
              [sourceCode.getIndexFromLoc(start), sourceCode.getIndexFromLoc(end)],
              indentTarget,
            );
          },
          loc: {
            end,
            start,
          },
          messageId: 'space',
        });
        indentCache.set(tokenRight.loc.start.line, indentTarget);
      }
    }

    return {
      BinaryExpression(node) {
        handler(node, node.right);
      },
      LogicalExpression(node) {
        handler(node, node.right);
      },
      TSIntersectionType(node) {
        if (node.types.length > 1) {
          node.types.forEach((type) => {
            handler(node, type);
          });
        }
      },
      TSUnionType(node) {
        if (node.types.length > 1) {
          node.types.forEach((type) => {
            handler(node, type);
          });
        }
      },
    };
  },
  defaultOptions: [{ indent: 2 }],
  meta: {
    docs: {
      description: 'Indentation for binary operators',
      recommended: 'stylistic',
    },
    fixable: 'whitespace',
    messages: {
      space: 'Expect indentation to be consistent',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          indent: {
            anyOf: [
              {
                minimum: 0,
                type: 'integer',
              },
              {
                enum: ['tab'],
                type: 'string',
              },
            ],
          },
          warn: {
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    type: 'layout',
  },
  name: RULE_NAME,
});
