import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './consistent-list-newline';

ruleTester.run(RULE_NAME, rule as any, {
  invalid: [
    {
      code: `const a = {
foo: "bar", bar: 2 }`,
      errors: [
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
      ],
      output: `const a = {
foo: "bar", 
bar: 2
 }`,
    },
    {
      code: `const a = {foo: "bar", 
bar: 2
}`,
      errors: [
        { messageId: 'shouldNotWrap' },
        { messageId: 'shouldNotWrap' },
      ],
      output: 'const a = {foo: "bar", bar: 2}',
    },
    {
      code: 'const a = [\n1, 2, 3\n]',
      errors: [
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
      ],
      output: `const a = [
1, 
2, 
3
]`,
    },
    {
      code: 'const a = [1, \n2, 3\n]',
      errors: [
        { messageId: 'shouldNotWrap' },
        { messageId: 'shouldNotWrap' },
      ],
      output: 'const a = [1, 2, 3]',
    },
    {
      code: 'import {\nfoo, bar } from "foo"',
      errors: [
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
      ],
      output: `import {
foo, 
bar
 } from "foo"`,
    },
    {
      code: 'import { foo, \nbar } from "foo"',
      errors: [
        { messageId: 'shouldNotWrap' },
      ],
      output: 'import { foo, bar } from "foo"',
    },
    {
      code: 'const a = {foo: "bar", \r\nbar: 2\r\n}',
      errors: [
        { messageId: 'shouldNotWrap' },
        { messageId: 'shouldNotWrap' },
      ],
      output: 'const a = {foo: "bar", bar: 2}',
    },
    {
      code: 'log(\na, b)',
      errors: [
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
      ],
      output: `log(
a, 
b
)`,
    },
    {
      code: 'function foo(\na, b) {}',
      errors: [
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
      ],
      output: `function foo(
a, 
b
) {}`,
    },
    {
      code: 'const foo = (\na, b) => {}',
      errors: [
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
      ],
      output: `const foo = (
a, 
b
) => {}`,
    },
    {
      code: 'const foo = (\na, b): {\na:b} => {}',
      errors: [
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
      ],
      output: `const foo = (
a, 
b
): {
a:b
} => {}`,
    },
    {
      code: 'const foo = (\na, b): {a:b} => {}',
      errors: [
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
      ],
      output: `const foo = (
a, 
b
): {a:b} => {}`,
    },
    {
      code: 'interface Foo {\na: 1,b: 2\n}',
      errors: [
        { messageId: 'shouldWrap' },
      ],
      output: `interface Foo {
a: 1,
b: 2
}`,
    },
    {
      code: 'type Foo = {\na: 1,b: 2\n}',
      errors: [
        { messageId: 'shouldWrap' },
      ],
      output: 'type Foo = {\na: 1,\nb: 2\n}',
    },
    {
      code: 'type Foo = [1,2,\n3]',
      errors: [
        { messageId: 'shouldNotWrap' },
      ],
      output: 'type Foo = [1,2,3]',
    },
    {
      code: 'new Foo(1,2,\n3)',
      errors: [
        { messageId: 'shouldNotWrap' },
      ],
      output: 'new Foo(1,2,3)',
    },
    {
      code: 'new Foo(\n1,2,\n3)',
      errors: [
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
      ],
      output: 'new Foo(\n1,\n2,\n3\n)',
    },
    {
      code: 'foo(\n()=>bar(),\n()=>\nbaz())',
      errors: [
        { messageId: 'shouldWrap' },
      ],
      output: 'foo(\n()=>bar(),\n()=>\nbaz()\n)',
    },
    {
      code: 'foo(()=>bar(),\n()=>\nbaz())',
      errors: [
        { messageId: 'shouldNotWrap' },
      ],
      output: 'foo(()=>bar(),()=>\nbaz())',
    },
    {
      code: 'foo<X,\nY>(1, 2)',
      errors: [
        { messageId: 'shouldNotWrap' },
      ],
      output: 'foo<X,Y>(1, 2)',
    },
    {
      code: 'foo<\nX,Y>(\n1, 2)',
      errors: [
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
      ],
      output: `foo<
X,
Y
>(
1, 
2
)`,
    },
    {
      code: 'function foo<\nX,Y>() {}',
      errors: [
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
      ],
      output: `function foo<
X,
Y
>() {}`,
    },
    {
      code: 'const {a,\nb\n} = c',
      errors: [
        { messageId: 'shouldNotWrap' },
        { messageId: 'shouldNotWrap' },
      ],
      output: 'const {a,b} = c',
    },
    {
      code: 'const [\na,b] = c',
      errors: [
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
      ],
      output: `const [
a,
b
] = c`,
    },
    {
      code: 'foo(([\na,b]) => {})',
      errors: [
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
      ],
      output: `foo(([
a,
b
]) => {})`,
    },
    {
      code: `
const a = (
  <div>
    {text.map((
      item, index) => (
      <p>
      </p>
    ))}
  </div>
)`,
      errors: [
        { messageId: 'shouldWrap' },
        { messageId: 'shouldWrap' },
      ],
      output: `
const a = (
  <div>
    {text.map((
      item, 
index
) => (
      <p>
      </p>
    ))}
  </div>
)`,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  ],
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
    `export const getTodoList = request.post<
      Params,
      ResponseData,
    >('/api/todo-list')
    `,
    {
      code: `
function TodoList() {
  const { data, isLoading } = useSwrInfinite(
    (page) => ['/api/todo/list', { page }],
    ([, params]) => getToDoList(params),
  )
  return <div></div>
}`,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  `
  bar(
    foo => foo
      ? ''
      : ''
  )`,
  `
  bar(
    (ruleName, foo) => foo
      ? ''
      : ''
  )`,
  ],
});
