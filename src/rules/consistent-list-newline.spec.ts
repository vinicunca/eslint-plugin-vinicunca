import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './consistent-list-newline';

ruleTester.run(RULE_NAME, rule as any, {
  valid: [
    'const a = { foo: "bar", bar: 2 }',

    `
      const a = {
        foo: "bar",
        bar: 2
      }
    `,

    'const a = [1, 2, 3]',

    `
      const a = [
        1,
        2,
        3
      ]
    `,

    'import { foo, bar } from "foo"',

    `
      import {
        foo,
        bar
      } from "foo"
    `,

    `const a = [\`

    \`, \`

    \`]`,

    'log(a, b)',

    `log(
      a,
      b
      )`,

    'function foo(a, b) {}',

    `function foo(
      a,
      b
      ) {}`,

    `const foo = (a, b) => {

    }`,

    `const foo = (a, b): {a:b} => {

    }`,

    'interface Foo { a: 1, b: 2 }',

    `interface Foo {
      a: 1
      b: 2
    }`,

    `a
    .filter(items => {

    })`,

    'new Foo(a, b)',

    `new Foo(
      a,
      b
      )`,

    `function foo<T = {
      a: 1,
      b: 2
    }>(a, b) {}`,
  ],
  invalid: [
    {
      errors: [
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
      ],
      code: `
const a = {
foo: "bar",bar: 2}
`,
      output: `
const a = {
foo: "bar",
bar: 2
}
`,
    },
    {
      errors: [
        { messageId: 'shouldNotWrap' },
        { messageId: 'shouldNotWrap' },
      ],
      code: 'const a = {foo: "bar", \nbar: 2\n}',
      output: 'const a = {foo: "bar", bar: 2}',
    },
    {
      errors: [
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
      ],
      code: 'const a = [\n1,2,3\n]',
      output: 'const a = [\n1,\n2,\n3\n]',
    },
    {
      errors: [
        { messageId: 'shouldNotWrap' },
        { messageId: 'shouldNotWrap' },
      ],
      code: 'const a = [1, \n2, 3\n]',
      output: 'const a = [1, 2, 3]',
    },
    {
      errors: [
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
      ],
      code: 'import {\nfoo,bar } from "foo"',
      output: 'import {\nfoo,\nbar\n } from "foo"',
    },
    {
      errors: [
        { messageId: 'shouldNotWrap' },
      ],
      code: 'import { foo, \nbar } from "foo"',
      output: 'import { foo, bar } from "foo"',
    },
    {
      errors: [
        { messageId: 'shouldNotWrap' },
        { messageId: 'shouldNotWrap' },
      ],
      code: 'const a = {foo: "bar", \r\nbar: 2\r\n}',
      output: 'const a = {foo: "bar", bar: 2}',
    },
    {
      errors: [
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
      ],
      code: 'log(\na,b)',
      output: 'log(\na,\nb\n)',
    },
    {
      errors: [
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
      ],
      code: 'function foo(\na,b) {}',
      output: 'function foo(\na,\nb\n) {}',
    },
    {
      errors: [
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
      ],
      code: 'const foo = (\na,b) => {}',
      output: 'const foo = (\na,\nb\n) => {}',
    },
    {
      errors: [
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
      ],
      code: 'const foo = (\na,b): {\na:b} => {}',
      output: 'const foo = (\na,\nb\n): {\na:b\n} => {}',
    },
    {
      errors: [
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
      ],
      code: 'const foo = (\na,b): {a:b} => {}',
      output: 'const foo = (\na,\nb\n): {a:b} => {}',
    },
    {
      errors: [
        { messageId: 'shouldWrap' },
      ],
      code: 'interface Foo {\na: 1,b: 2\n}',
      output: 'interface Foo {\na: 1,\nb: 2\n}',
    },
    {
      errors: [
        { messageId: 'shouldWrap' },
      ],
      code: 'type Foo = {\na: 1,b: 2\n}',
      output: 'type Foo = {\na: 1,\nb: 2\n}',
    },
    {
      errors: [
        { messageId: 'shouldNotWrap' },
      ],
      code: 'type Foo = [1,2,\n3]',
      output: 'type Foo = [1,2,3]',
    },
    {
      errors: [
        { messageId: 'shouldNotWrap' },
      ],
      code: 'new Foo(1,2,\n3)',
      output: 'new Foo(1,2,3)',
    },
    {
      errors: [
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
      ],
      code: 'new Foo(\n1,2,\n3)',
      output: 'new Foo(\n1,\n2,\n3\n)',
    },
    {
      errors: [
        { messageId: 'shouldWrap' },
      ],
      code: 'foo(\n()=>bar(),\n()=>\nbaz())',
      output: 'foo(\n()=>bar(),\n()=>\nbaz()\n)',
    },
    {
      errors: [
        { messageId: 'shouldNotWrap' },
      ],
      code: 'foo(()=>bar(),\n()=>\nbaz())',
      output: 'foo(()=>bar(),()=>\nbaz())',
    },
    {
      errors: [
        { messageId: 'shouldNotWrap' },
      ],
      code: 'foo<X,\nY>()',
      output: 'foo<X,Y>()',
    },
    {
      errors: [
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
      ],
      code: 'function foo<\nX,Y>() {}',
      output: 'function foo<\nX,\nY\n>() {}',
    },
  ],
});
