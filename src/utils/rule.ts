import type { Rule } from 'eslint';

import { RuleCreator, type RuleWithMetaAndName } from '@typescript-eslint/utils/eslint-utils';

export interface RuleModule<
  T extends readonly unknown[],
> extends Rule.RuleModule {
  defaultOptions: T;
}

export const createEslintRule = RuleCreator(
  (ruleName) => `https://eslint.vinicunca.dev/plugin-vinicunca/${ruleName}`,
) as any as <TOptions extends readonly unknown[], TMessageIds extends string>({ meta, name, ...rule }: Readonly<RuleWithMetaAndName<TOptions, TMessageIds>>) => RuleModule<TOptions>;
