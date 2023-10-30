import { createEslintRule } from '../utils/rule';

export const RULE_NAME = 'named-tuple-spacing';
export type MessageIds = 'expectedSpaceAfter' | 'unexpectedSpaceBefore' | 'unexpectedSpaceBetween';
export type Options = [];

const RE = /^([\w_$]+)(\s*)(\?\s*)?:(\s*)(.*)$/;

export default createEslintRule<Options, MessageIds>({
  create: (context) => {
    const sourceCode = context.getSourceCode();
    return {
      TSNamedTupleMember: (node: any) => {
        const code = sourceCode.text.slice(node.range[0], node.range[1]);

        const match = code.match(RE);
        if (!match) {
          return;
        };

        const labelName = node.label.name;
        const spaceBeforeColon = match[2];
        const optionalMark = match[3];
        const spacesAfterColon = match[4];
        const elementType = match[5];

        function getReplaceValue() {
          let ret = labelName;
          if (node.optional) {
            ret += '?';
          };
          ret += ': ';
          ret += elementType;
          return ret;
        }

        if (optionalMark?.length > 1) {
          context.report({
            *fix(fixer) {
              yield fixer.replaceTextRange(node.range, code.replace(RE, getReplaceValue()));
            },
            messageId: 'unexpectedSpaceBetween',
            node,
          });
        }

        if (spaceBeforeColon?.length) {
          context.report({
            *fix(fixer) {
              yield fixer.replaceTextRange(node.range, code.replace(RE, getReplaceValue()));
            },
            messageId: 'unexpectedSpaceBefore',
            node,
          });
        }

        if (spacesAfterColon != null && spacesAfterColon.length !== 1) {
          context.report({
            *fix(fixer) {
              yield fixer.replaceTextRange(node.range, code.replace(RE, getReplaceValue()));
            },
            messageId: 'expectedSpaceAfter',
            node,
          });
        }
      },
    };
  },
  defaultOptions: [],
  meta: {
    docs: {
      description: 'Expect space before type declaration in named tuple',
      recommended: 'stylistic',
    },
    fixable: 'whitespace',
    messages: {
      expectedSpaceAfter: 'Expected a space after the \':\'.',
      unexpectedSpaceBefore: 'Unexpected space before the \':\'.',
      unexpectedSpaceBetween: 'Unexpected space between \'?\' and the \':\'.',
    },
    schema: [],
    type: 'layout',
  },
  name: RULE_NAME,
});
