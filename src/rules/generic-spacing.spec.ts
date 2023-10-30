import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './generic-spacing';

const invalids = [
  ['type Foo<T=true> = T', 'type Foo<T = true> = T'],
  ['type Foo<T,K> = T', 'type Foo<T, K> = T'],
  ['type Foo<T=false,K=1|2> = T', 'type Foo<T = false, K = 1|2> = T', 3],
  ['function foo <T>() {}', 'function foo<T>() {}'],
  [`interface Log {
  foo <T>(name: T): void
}`, `interface Log {
  foo<T>(name: T): void
}`],
] as const;

ruleTester.run(RULE_NAME, rule as any, {
  invalid: invalids.map((i) => ({
    code: i[0],
    errors: Array.from({ length: i[2] || 1 }, () => ({ messageId: 'genericSpacingMismatch' })),
    output: i[1].trim(),
  })),
  valid: [
    'type Foo<T = true> = T',
    'type Foo<T extends true = true> = T',
    `
      type Foo<
        T = true,
        K = false
      > = T
    `,
    `function foo<
      T
    >() {}`,
    {
      code: 'const foo = <T>(name: T) => name',
      parserOptions: {
        ecmaFeatures: {
          jsx: false,
        },
      },
    },
    `interface Log {
      foo<T>(name: T): void
    }`,
    `interface Log {
      <T>(name: T): void
    }`,
    `interface Foo {
      foo?: <T>(name: T) => void
    }`,
    'type Foo<\r\nT = true,\r\nK = false,\r\n> = T',
    'const toSortedImplementation = Array.prototype.toSorted || function <T>(name: T): void {}',
  ],
});
