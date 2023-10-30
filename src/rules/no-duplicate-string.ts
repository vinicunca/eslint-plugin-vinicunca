import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { issueLocation, report } from '../utils/locations';
import { createEslintRule } from '../utils/rule';

export const RULE_NAME = 'no-duplicate-string';
export type MessageIds = 'defineConstant' | 'vinicuncaRuntime';

// Number of times a literal must be duplicated to trigger an issue
const DEFAULT_THRESHOLD = 3;
const DEFAULT_IGNORE_STRINGS = 'application/json';
const MIN_LENGTH = 10;
const NO_SEPARATOR_REGEXP = /^\w*$/;
const EXCLUDED_CONTEXTS = [
  'ImportDeclaration',
  'ImportExpression',
  'JSXAttribute',
  'ExportAllDeclaration',
  'ExportNamedDeclaration',
];
const message = 'Define a constant instead of duplicating this literal {{times}} times.';

type Options =
  | [{ ignoreStrings?: string; threshold?: number } | undefined, 'vinicunca-runtime']
  | [{ ignoreStrings?: string; threshold?: number } | undefined];
type Context = TSESLint.RuleContext<string, Options>;

export default createEslintRule<Options, MessageIds>({
  create(context) {
    const literalsByValue: Map<string, TSESTree.Literal[]> = new Map();
    const { ignoreStrings, threshold } = extractOptions(context);
    const whitelist = ignoreStrings.split(',');
    return {
      'Literal': (node: TSESTree.Node) => {
        const literal = node as TSESTree.Literal;
        const { parent } = literal;
        if (
          typeof literal.value === 'string'
          && parent
          && !['ExpressionStatement', 'TSLiteralType'].includes(parent.type)
        ) {
          const stringContent = literal.value.trim();

          if (
            !whitelist.includes(literal.value)
            && !isExcludedByUsageContext(context, literal)
            && stringContent.length >= MIN_LENGTH
            && !stringContent.match(NO_SEPARATOR_REGEXP)
          ) {
            const sameStringLiterals = literalsByValue.get(stringContent) || [];
            sameStringLiterals.push(literal);
            literalsByValue.set(stringContent, sameStringLiterals);
          }
        }
      },

      'Program:exit': function() {
        literalsByValue.forEach((literals) => {
          if (literals.length >= threshold) {
            const [primaryNode, ...secondaryNodes] = literals;
            const secondaryIssues = secondaryNodes.map((node) => issueLocation(node.loc, node.loc, 'Duplication'));
            report(
              context,
              {
                data: { times: literals.length.toString() },
                messageId: 'defineConstant',
                node: primaryNode,
              },
              secondaryIssues,
              message,
            );
          }
        });
      },
    };
  },

  defaultOptions: [{ ignoreStrings: DEFAULT_IGNORE_STRINGS, threshold: DEFAULT_THRESHOLD }],
  meta: {
    docs: {
      description: 'String literals should not be duplicated',
      recommended: 'recommended',
    },
    messages: {
      defineConstant: message,
      vinicuncaRuntime: '{{vinicuncaRuntimeData}}',
    },
    schema: [
      {
        properties: {
          ignoreStrings: { default: DEFAULT_IGNORE_STRINGS, type: 'string' },
          threshold: { minimum: 2, type: 'integer' },
        },
        type: 'object',
      },
      {
        enum: ['vinicunca-runtime'] /* internal parameter for rules having secondary locations */,
      } as any,
    ],
    type: 'suggestion',
  },
  name: RULE_NAME,
});

function isExcludedByUsageContext(context: Context, literal: TSESTree.Literal) {
  const parent = literal.parent;
  const parentType = parent.type;

  return (
    EXCLUDED_CONTEXTS.includes(parentType)
    || isRequireContext(parent, context)
    || isObjectPropertyKey(parent, literal)
  );
}

function isRequireContext(parent: TSESTree.Node, context: Context) {
  return (
    parent.type === 'CallExpression' && context.getSourceCode().getText(parent.callee) === 'require'
  );
}

function isObjectPropertyKey(parent: TSESTree.Node, literal: TSESTree.Literal) {
  return parent.type === 'Property' && parent.key === literal;
}

function extractOptions(context: Context) {
  let threshold: number = DEFAULT_THRESHOLD;
  let ignoreStrings: string = DEFAULT_IGNORE_STRINGS;
  const options = context.options[0];
  if (typeof options?.threshold === 'number') {
    threshold = options.threshold;
  }
  if (typeof options?.ignoreStrings === 'string') {
    ignoreStrings = options.ignoreStrings;
  }
  return { ignoreStrings, threshold };
}

