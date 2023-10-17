import { type ESLint, type Linter } from 'eslint';
import { version } from '../package.json';
import consistentListNewline from './rules/consistent-list-newline';
import cognitiveComplexity from './rules/cognitive-complexity';
import genericSpacing from './rules/generic-spacing';
import ifNewline from './rules/if-newline';
import importDedupe from './rules/import-dedupe';
import namedTupleSpacing from './rules/named-tuple-spacing';
import noAllDuplicatedBranches from './rules/no-all-duplicated-branches';
import noCjsExports from './rules/no-cjs-exports';
import noCollapsibleIf from './rules/no-collapsible-if';
import noEmptyCollection from './rules/no-empty-collection';
import noIdenticalConditions from './rules/no-identical-conditions';
import noIdenticalExpressions from './rules/no-identical-expressions';
import noIdenticalFunctions from './rules/no-identical-functions';
import noIgnoredReturn from './rules/no-ignored-return';
import noImportNodeModulesByPath from './rules/no-import-node-modules-by-path';
import noNestedTemplateLiterals from './rules/no-nested-template-literals';
import noRedundantBoolean from './rules/no-redundant-boolean';
import noRedundantJump from './rules/no-redundant-jump';
import noUnusedCollection from './rules/no-unused-collection';
import noTsExportEqual from './rules/no-ts-export-equal';
import noUseOfEmptyReturnValue from './rules/no-use-of-empty-return-value';
import preferImmediateReturn from './rules/prefer-immediate-return';
import preferInlineTypeImport from './rules/prefer-inline-type-import';
import preferSingleBooleanReturn from './rules/prefer-single-boolean-return';
import topLevelFunction from './rules/top-level-function';

const plugin = {
  meta: {
    name: 'vinicunca',
    version,
  },

  rules: {
    'consistent-list-newline': consistentListNewline,
    'cognitive-complexity': cognitiveComplexity,
    'generic-spacing': genericSpacing,
    'if-newline': ifNewline,
    'import-dedupe': importDedupe,
    'named-tuple-spacing': namedTupleSpacing,
    'no-all-duplicated-branches': noAllDuplicatedBranches,
    'no-collapsible-if': noCollapsibleIf,
    'no-cjs-exports': noCjsExports,
    'no-empty-collection': noEmptyCollection,
    'no-identical-conditions': noIdenticalConditions,
    'no-identical-expressions': noIdenticalExpressions,
    'no-identical-functions': noIdenticalFunctions,
    'no-ignored-return': noIgnoredReturn,
    'no-import-node-modules-by-path': noImportNodeModulesByPath,
    'no-nested-template-literals': noNestedTemplateLiterals,
    'no-redundant-boolean': noRedundantBoolean,
    'no-redundant-jump': noRedundantJump,
    'no-unused-collection': noUnusedCollection,
    'no-ts-export-equal': noTsExportEqual,
    'no-use-of-empty-return-value': noUseOfEmptyReturnValue,
    'prefer-immediate-return': preferImmediateReturn,
    'prefer-inline-type-import': preferInlineTypeImport,
    'prefer-single-boolean-return': preferSingleBooleanReturn,
    'top-level-function': topLevelFunction,
  },
} satisfies ESLint.Plugin;

export default plugin;

type RuleDefinitations = typeof plugin['rules'];

export type RuleOptions = {
  [K in keyof RuleDefinitations]: RuleDefinitations[K]['defaultOptions']
};

export type Rules = {
  [K in keyof RuleOptions]: Linter.RuleEntry<RuleOptions[K]>
};
