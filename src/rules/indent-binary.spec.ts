import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './indent-binary';

ruleTester.run(RULE_NAME, rule as any, {
  invalid: [
    {
      code: `
      if (
        a && (
          a.b ||
            a.c
        ) &&
          a.d
      ) {}
      `,
      errors: [
        { messageId: 'space' },
        { messageId: 'space' },
      ],

      output: `
      if (
        a && (
          a.b ||
          a.c
        ) &&
        a.d
      ) {}
      `,
    },
    {
      code: `
      const a =
      x +
         y * z
      `,
      errors: [
        { messageId: 'space' },
      ],

      output: `
      const a =
      x +
      y * z
      `,
    },
    {
      code: `
      if (
        aaaaaa >
      bbbbb
      ) {}
      `,
      errors: [
        { messageId: 'space' },
      ],

      output: `
      if (
        aaaaaa >
        bbbbb
      ) {}
      `,
    },
    {
      code: `
      function foo() {
        if (a
        || b
            || c || d
              || (d && b)
        ) {
          foo()
        }
      }
      `,
      errors: [
        { messageId: 'space' },
        { messageId: 'space' },
        { messageId: 'space' },
      ],

      output: `
      function foo() {
        if (a
          || b
        || c || d
            || (d && b)
        ) {
          foo()
        }
      }
      `,
    },
    {
      code: `
  function isNamedFunction(node:
  | Tree.ArrowFunctionExpression
  | Tree.FunctionDeclaration
  | Tree.FunctionExpression,
  ) {
    if (node.id)
      return true

    const parent = node.parent

    return parent.type === 'MethodDefinition'
              || (parent.type === 'Property'
                  && (
                    parent.kind === 'get'
                      || parent.kind === 'set'
                      || parent.method
                  )
              )
  }
`,
      errors: [
        { messageId: 'space' },
        { messageId: 'space' },
        { messageId: 'space' },
        { messageId: 'space' },
        { messageId: 'space' },
        { messageId: 'space' },
      ],

      output: `
  function isNamedFunction(node:
    | Tree.ArrowFunctionExpression
    | Tree.FunctionDeclaration
    | Tree.FunctionExpression,
  ) {
    if (node.id)
      return true

    const parent = node.parent

    return parent.type === 'MethodDefinition'
      || (parent.type === 'Property'
      && (
                    parent.kind === 'get'
                    || parent.kind === 'set'
                      || parent.method
                  )
              )
  }
`,
    },
    {
      code: `
type Foo = A | B
| C | D
  | E
`,
      errors: [
        { messageId: 'space' },
      ],

      output: `
type Foo = A | B
  | C | D
  | E
`,
    },
    {
      code: `
type Foo = 
  | A | C
    | B
`,
      errors: [
        { messageId: 'space' },
      ],

      output: `
type Foo = 
  | A | C
  | B
`,
    },
    {
      code: `
type T = 
  a 
  | b 
    | c
`,
      errors: [
        { messageId: 'space' },
      ],

      output: `
type T = 
  a 
  | b 
  | c
`,
    },
    {
      code: `
type T =
& A
  & (B
  | A
  | D)
`,
      errors: [
        { messageId: 'space' },
      ],

      output: `
type T =
  & A
  & (B
  | A
  | D)
`,
    },
    {
      code: `
type Foo = Merge<
    A 
  & B
    & C
>
`,
      errors: [
        { messageId: 'space' },
        { messageId: 'space' },
      ],

      output: `
type Foo = Merge<
  A 
  & B
  & C
>
`,
    },
    {
      code: `
function TSPropertySignatureToProperty(
  node: 
  | TSESTree.TSEnumMember
    | TSESTree.TSPropertySignature
  | TSESTree.TypeElement,
  type: 
  | AST_NODE_TYPES.Property
    | AST_NODE_TYPES.PropertyDefinition = AST_NODE_TYPES.Property,
): TSESTree.Node | null {}
`,
      errors: [
        { messageId: 'space' },
        { messageId: 'space' },
        { messageId: 'space' },
      ],

      output: `
function TSPropertySignatureToProperty(
  node: 
    | TSESTree.TSEnumMember
    | TSESTree.TSPropertySignature
    | TSESTree.TypeElement,
  type: 
    | AST_NODE_TYPES.Property
    | AST_NODE_TYPES.PropertyDefinition = AST_NODE_TYPES.Property,
): TSESTree.Node | null {}
`,
    },
  ],

  valid: [
    `type a = {
      [K in keyof T]: T[K] extends Date
        ? Date | string
        : T[K] extends (Date | null)
          ? Date | string | null
          : T[K];
    }`,
    `type Foo =
      | A
    `,
  ],
});
