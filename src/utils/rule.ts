import type { RuleListener, RuleWithMeta, RuleWithMetaAndName } from '@typescript-eslint/utils/eslint-utils';
import type { RuleContext } from '@typescript-eslint/utils/ts-eslint';
import type { Rule } from 'eslint';

export interface RuleModule<
  T extends readonly unknown[],
> extends Rule.RuleModule {
  defaultOptions: T;
}

export const createEslintRule = RuleCreator(
  (ruleName) => `https://eslint.vinicunca.dev/plugin-vinicunca/${ruleName}`,
) as any as <TOptions extends readonly unknown[], TMessageIds extends string>({ meta, name, ...rule }: Readonly<RuleWithMetaAndName<TOptions, TMessageIds>>) => RuleModule<TOptions>;

function RuleCreator(urlCreator: (ruleName: string) => string) {
  return function createNamedRule<
    TOptions extends readonly unknown[],
    TMessageIds extends string,
  >({
    meta,
    name,
    ...rule
  }: Readonly<RuleWithMetaAndName<TOptions, TMessageIds>>): RuleModule<TOptions> {
    return createRule<TOptions, TMessageIds>({
      meta: {
        ...meta,
        docs: {
          ...meta.docs,
          url: urlCreator(name),
        },
      },
      ...rule,
    });
  };
}

function createRule<
  TOptions extends readonly unknown[],
  TMessageIds extends string,
>({
  create,
  defaultOptions,
  meta,
}: Readonly<RuleWithMeta<TOptions, TMessageIds>>): RuleModule<TOptions> {
  return {
    create: ((
      context: Readonly<RuleContext<TMessageIds, TOptions>>,
    ): RuleListener => {
      const optionsWithDefault = context.options.map((options, index) => {
        return {
          ...defaultOptions[index] || {},
          ...options || {},
        };
      }) as unknown as TOptions;
      return create(context, optionsWithDefault);
    }) as any,
    defaultOptions,
    meta: meta as any,
  };
}
