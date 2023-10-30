import type { ESLint, Linter } from 'eslint';

import { version } from '../package.json';
import cognitiveComplexity from './rules/cognitive-complexity';
import consistentListNewline from './rules/consistent-list-newline';
import genericSpacing from './rules/generic-spacing';
import ifNewline from './rules/if-newline';
import importDedupe from './rules/import-dedupe';
import namedTupleSpacing from './rules/named-tuple-spacing';
import noAllDuplicatedBranches from './rules/no-all-duplicated-branches';
import noCjsExports from './rules/no-cjs-exports';
import noCollapsibleIf from './rules/no-collapsible-if';
import noDuplicateString from './rules/no-duplicate-string';
import noDuplicatedBranches from './rules/no-duplicated-branches';
import noEmptyCollection from './rules/no-empty-collection';
import noIdenticalConditions from './rules/no-identical-conditions';
import noIdenticalExpressions from './rules/no-identical-expressions';
import noIdenticalFunctions from './rules/no-identical-functions';
import noIgnoredReturn from './rules/no-ignored-return';
import noImportNodeModulesByPath from './rules/no-import-node-modules-by-path';
import noNestedTemplateLiterals from './rules/no-nested-template-literals';
import noRedundantBoolean from './rules/no-redundant-boolean';
import noRedundantJump from './rules/no-redundant-jump';
import noTsExportEqual from './rules/no-ts-export-equal';
import noUnusedCollection from './rules/no-unused-collection';
import noUseOfEmptyReturnValue from './rules/no-use-of-empty-return-value';
import preferImmediateReturn from './rules/prefer-immediate-return';
import preferInlineTypeImport from './rules/prefer-inline-type-import';
import preferSingleBooleanReturn from './rules/prefer-single-boolean-return';
import topLevelFunction from './rules/top-level-function';

const plugin = {
  configs: {
    recommended: {
      rules: {
        'vinicunca/cognitive-complexity': 'error',
        'vinicunca/no-all-duplicated-branches': 'error',
        'vinicunca/no-collapsible-if': 'error',
        'vinicunca/no-duplicate-string': 'error',
        'vinicunca/no-duplicated-branches': 'error',
        'vinicunca/no-empty-collection': 'error',
        'vinicunca/no-identical-conditions': 'error',
        'vinicunca/no-identical-expressions': 'error',
        'vinicunca/no-identical-functions': 'error',
        'vinicunca/no-ignored-return': 'error',
        'vinicunca/no-nested-template-literals': 'error',
        'vinicunca/no-redundant-boolean': 'error',
        'vinicunca/no-redundant-jump': 'error',
        'vinicunca/no-unused-collection': 'error',
        'vinicunca/no-use-of-empty-return-value': 'error',
        'vinicunca/prefer-immediate-return': 'error',
        'vinicunca/prefer-single-boolean-return': 'error',
      },
    },
  },

  meta: {
    name: 'vinicunca',
    version,
  },

  rules: {
    'cognitive-complexity': cognitiveComplexity,
    'consistent-list-newline': consistentListNewline,
    'generic-spacing': genericSpacing,
    'if-newline': ifNewline,
    'import-dedupe': importDedupe,
    'named-tuple-spacing': namedTupleSpacing,
    'no-all-duplicated-branches': noAllDuplicatedBranches,
    'no-cjs-exports': noCjsExports,
    'no-collapsible-if': noCollapsibleIf,
    'no-duplicate-string': noDuplicateString,
    'no-duplicated-branches': noDuplicatedBranches,
    'no-empty-collection': noEmptyCollection,
    'no-identical-conditions': noIdenticalConditions,
    'no-identical-expressions': noIdenticalExpressions,
    'no-identical-functions': noIdenticalFunctions,
    'no-ignored-return': noIgnoredReturn,
    'no-import-node-modules-by-path': noImportNodeModulesByPath,
    'no-nested-template-literals': noNestedTemplateLiterals,
    'no-redundant-boolean': noRedundantBoolean,
    'no-redundant-jump': noRedundantJump,
    'no-ts-export-equal': noTsExportEqual,
    'no-unused-collection': noUnusedCollection,
    'no-use-of-empty-return-value': noUseOfEmptyReturnValue,
    'prefer-immediate-return': preferImmediateReturn,
    'prefer-inline-type-import': preferInlineTypeImport,
    'prefer-single-boolean-return': preferSingleBooleanReturn,
    'top-level-function': topLevelFunction,
  },
} satisfies ESLint.Plugin;

export default plugin;

type RuleDefinitions = typeof plugin['rules'];

export type RuleOptions = {
  [K in keyof RuleDefinitions]: RuleDefinitions[K]['defaultOptions']
};

export type Rules = {
  [K in keyof RuleOptions]: Linter.RuleEntry<RuleOptions[K]>
};
