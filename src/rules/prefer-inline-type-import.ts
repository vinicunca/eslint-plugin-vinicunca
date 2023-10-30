// Ported from https://github.com/gajus/eslint-plugin-canonical/blob/master/src/rules/preferInlineTypeImport.js
// by Gajus Kuizinas https://github.com/gajus
import type { TSESTree } from '@typescript-eslint/utils';
import type { RuleFixer, SourceCode } from '@typescript-eslint/utils/ts-eslint';

import { createEslintRule } from '../utils/rule';

export const RULE_NAME = 'prefer-inline-type-import';
export type MessageIds = 'preferInlineTypeImport';
export type Options = [];

export default createEslintRule<Options, MessageIds>({
  create: (context) => {
    const sourceCode = context.getSourceCode();
    return {
      ImportDeclaration: (node) => {
        // ignore bare type imports
        if (node.specifiers.length === 1 && ['ImportDefaultSpecifier', 'ImportNamespaceSpecifier'].includes(node.specifiers[0].type)) {
          return;
        };
        if (node.importKind === 'type' && node.specifiers.length > 0) {
          context.report({
            *fix(fixer) {
              yield * removeTypeSpecifier(fixer, sourceCode, node);

              for (const specifier of node.specifiers) {
                yield fixer.insertTextBefore(specifier, 'type ');
              };
            },
            loc: node.loc,
            messageId: 'preferInlineTypeImport',
            node,
          });
        }
      },
    };
  },
  defaultOptions: [],
  meta: {
    docs: {
      description: 'Inline type import',
    },
    fixable: 'code',
    messages: {
      preferInlineTypeImport: 'Prefer inline type import',
    },
    schema: [],
    type: 'suggestion',
  },
  name: RULE_NAME,
});

function * removeTypeSpecifier(fixer: RuleFixer, sourceCode: Readonly<SourceCode>, node: TSESTree.ImportDeclaration) {
  const importKeyword = sourceCode.getFirstToken(node);
  if (!importKeyword) {
    return;
  };

  const typeIdentifier = sourceCode.getTokenAfter(importKeyword);
  if (!typeIdentifier) {
    return;
  };

  yield fixer.remove(typeIdentifier);

  if (importKeyword.loc.end.column + 1 === typeIdentifier.loc.start.column) {
    yield fixer.removeRange([
      importKeyword.range[1],
      importKeyword.range[1] + 1,
    ]);
  }
}
