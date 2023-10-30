import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './no-identical-expressions';

ruleTester.run(RULE_NAME, rule as any, {
  invalid: [
    {
      code: 'a == b && a == b',
      errors: [
        {
          column: 1,
          data: {
            operator: '&&',
          },
          endColumn: 17,
          messageId: 'correctIdenticalSubExpressions',
        },
      ],
    },
    {
      code: 'a == b || a == b',
      errors: [
        {
          data: {
            operator: '||',
          },
          messageId: 'correctIdenticalSubExpressions',
        },
      ],
    },
    {
      code: `a == b || a == b
      //     ^^^^^^>   ^^^^^^`,
      errors: [
        {
          column: 11,
          data: {
            operator: '||',
            vinicuncaRuntimeData: JSON.stringify({
              message:
                'Correct one of the identical sub-expressions on both sides of operator "||"',
              secondaryLocations: [
                {
                  column: 0,
                  endColumn: 6,
                  endLine: 1,
                  line: 1,
                  message: '',
                },
              ],
            }),
          },
          endColumn: 17,
          endLine: 1,
          line: 1,
          messageId: 'vinicuncaRuntime',
        },
      ],
      options: ['vinicunca-runtime'],
    },
    {
      code: 'a > a',
      errors: [
        {
          data: {
            operator: '>',
          },
          messageId: 'correctIdenticalSubExpressions',
        },
      ],
    },
    {
      code: 'a >= a',
      errors: [
        {
          data: {
            operator: '>=',
          },
          messageId: 'correctIdenticalSubExpressions',
        },
      ],
    },
    {
      code: 'a < a',
      errors: [
        {
          data: {
            operator: '<',
          },
          messageId: 'correctIdenticalSubExpressions',
        },
      ],
    },
    {
      code: 'a <= a',
      errors: [
        {
          data: {
            operator: '<=',
          },
          messageId: 'correctIdenticalSubExpressions',
        },
      ],
    },
    {
      code: '5 / 5',
      errors: [
        {
          data: {
            operator: '/',
          },
          messageId: 'correctIdenticalSubExpressions',
        },
      ],
    },
    {
      code: '5 - 5',
      errors: [
        {
          data: {
            operator: '-',
          },
          messageId: 'correctIdenticalSubExpressions',
        },
      ],
    },
    {
      code: 'a << a',
      errors: [
        {
          data: {
            operator: '<<',
          },
          messageId: 'correctIdenticalSubExpressions',
        },
      ],
    },
    {
      code: 'a << a',
      errors: [
        {
          data: {
            operator: '<<',
          },
          messageId: 'correctIdenticalSubExpressions',
        },
      ],
    },
    {
      code: 'a >> a',
      errors: [
        {
          data: {
            operator: '>>',
          },
          messageId: 'correctIdenticalSubExpressions',
        },
      ],
    },
    {
      code: '1 >> 1',
      errors: [
        {
          data: {
            operator: '>>',
          },
          messageId: 'correctIdenticalSubExpressions',
        },
      ],
    },
    {
      code: '5 << 5',
      errors: [
        {
          data: {
            operator: '<<',
          },
          messageId: 'correctIdenticalSubExpressions',
        },
      ],
    },
    {
      code: 'obj.foo() == obj.foo()',
      errors: [
        {
          data: {
            operator: '==',
          },
          messageId: 'correctIdenticalSubExpressions',
        },
      ],
    },
    {
      code: 'foo(/*comment*/() => doSomething()) === foo(() => doSomething())',
      errors: [
        {
          data: {
            operator: '===',
          },
          messageId: 'correctIdenticalSubExpressions',
        },
      ],
    },
    {
      code: '(a == b) == (a == b)',
      errors: [
        {
          data: {
            operator: '==',
          },
          messageId: 'correctIdenticalSubExpressions',
        },
      ],
    },
    {
      code: 'if (+a !== +a);',
      errors: [
        {
          data: {
            operator: '!==',
          },
          messageId: 'correctIdenticalSubExpressions',
        },
      ],
    },
  ],
  valid: [
    { code: '1 << 1;' },
    { code: 'foo(), foo();' },
    { code: 'if (Foo instanceof Foo) { }' },
    {
      code: 'name === "any" || name === "string" || name === "number" || name === "boolean" || name === "never"',
    },
    { code: 'a != a;' },
    { code: 'a === a;' },
    { code: 'a !== a;' },

    { code: 'node.text === "eval" || node.text === "arguments";' },
    { code: 'nodeText === \'"use strict"\' || nodeText === "\'use strict\'";' },
    { code: 'name.charCodeAt(0) === CharacterCodes._ && name.charCodeAt(1) === CharacterCodes._;' },
    { code: 'if (+a !== +b) { }' },
    { code: 'first(`const`) || first(`var`);' },
    {
      // eslint-disable-next-line no-template-curly-in-string
      code: 'window[`${prefix}CancelAnimationFra  me`] || window[`${prefix}CancelRequestAnimationFrame`];',
    },
    { code: '' },

    { code: 'dirPath.match(/localhost:\d+/) || dirPath.match(/localhost:\d+\s/);' },
    { code: 'a == b || a == c;' },
    { code: 'a == b;' },
  ],
});
