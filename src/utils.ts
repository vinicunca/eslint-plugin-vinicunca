import { RuleCreator } from '@typescript-eslint/utils/eslint-utils';

export const createEslintRule = RuleCreator(
  (ruleName) => `https://eslint.vinicunca.dev/plugin-vinicunca/${ruleName}`,
);
