import { RuleCreator, type RuleWithMetaAndName } from '@typescript-eslint/utils/eslint-utils';
import { type Rule } from 'eslint';

export interface RuleModule<T extends readonly unknown[]> extends Rule.RuleModule {
  defaultOptions: T;
}

export const createEslintRule = RuleCreator(
  (ruleName) => `https://eslint.vinicunca.dev/plugin-vinicunca/${ruleName}`,
) as any as <TOptions extends readonly unknown[], TMessageIds extends string>({ name, meta, ...rule }: Readonly<RuleWithMetaAndName<TOptions, TMessageIds>>) => RuleModule<TOptions>;
