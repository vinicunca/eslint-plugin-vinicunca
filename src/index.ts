import { type ESLint, type Linter } from 'eslint';
import { version } from '../package.json';
import consistentListNewline from './rules/consistent-list-newline';
import genericSpacing from './rules/generic-spacing';
import ifNewline from './rules/if-newline';
import importDedupe from './rules/import-dedupe';
import namedTupleSpacing from './rules/named-tuple-spacing';
import noCjsExports from './rules/no-cjs-exports';
import noImportNodeModulesByPath from './rules/no-import-node-modules-by-path';
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
    'generic-spacing': genericSpacing,
    'if-newline': ifNewline,
    'import-dedupe': importDedupe,
    'named-tuple-spacing': namedTupleSpacing,
    'no-cjs-exports': noCjsExports,
    'no-import-node-modules-by-path': noImportNodeModulesByPath,
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
