import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './no-identical-expressions';

ruleTester.run(RULE_NAME, rule as any, {
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
    // eslint-disable-next-line no-useless-escape
    { code: 'dirPath.match(/localhost:\d+/) || dirPath.match(/localhost:\d+\s/);' },
    { code: 'a == b || a == c;' },
    { code: 'a == b;' },
  ],
  invalid: [
    {
      code: 'a == b && a == b',
      errors: [
        {
          messageId: 'correctIdenticalSubExpressions',
          data: {
            operator: '&&',
          },
          column: 1,
          endColumn: 17,
        },
      ],
    },
    {
      code: 'a == b || a == b',
      errors: [
        {
          messageId: 'correctIdenticalSubExpressions',
          data: {
            operator: '||',
          },
        },
      ],
    },
    {
      code: `a == b || a == b
      //     ^^^^^^>   ^^^^^^`,
      options: ['vinicunca-runtime'],
      errors: [
        {
          messageId: 'vinicuncaRuntime',
          data: {
            operator: '||',
            vinicuncaRuntimeData: JSON.stringify({
              secondaryLocations: [
                {
                  line: 1,
                  column: 0,
                  endLine: 1,
                  endColumn: 6,
                  message: '',
                },
              ],
              message:
                'Correct one of the identical sub-expressions on both sides of operator "||"',
            }),
          },
          line: 1,
          endLine: 1,
          column: 11,
          endColumn: 17,
        },
      ],
    },
    {
      code: 'a > a',
      errors: [
        {
          messageId: 'correctIdenticalSubExpressions',
          data: {
            operator: '>',
          },
        },
      ],
    },
    {
      code: 'a >= a',
      errors: [
        {
          messageId: 'correctIdenticalSubExpressions',
          data: {
            operator: '>=',
          },
        },
      ],
    },
    {
      code: 'a < a',
      errors: [
        {
          messageId: 'correctIdenticalSubExpressions',
          data: {
            operator: '<',
          },
        },
      ],
    },
    {
      code: 'a <= a',
      errors: [
        {
          messageId: 'correctIdenticalSubExpressions',
          data: {
            operator: '<=',
          },
        },
      ],
    },
    {
      code: '5 / 5',
      errors: [
        {
          messageId: 'correctIdenticalSubExpressions',
          data: {
            operator: '/',
          },
        },
      ],
    },
    {
      code: '5 - 5',
      errors: [
        {
          messageId: 'correctIdenticalSubExpressions',
          data: {
            operator: '-',
          },
        },
      ],
    },
    {
      code: 'a << a',
      errors: [
        {
          messageId: 'correctIdenticalSubExpressions',
          data: {
            operator: '<<',
          },
        },
      ],
    },
    {
      code: 'a << a',
      errors: [
        {
          messageId: 'correctIdenticalSubExpressions',
          data: {
            operator: '<<',
          },
        },
      ],
    },
    {
      code: 'a >> a',
      errors: [
        {
          messageId: 'correctIdenticalSubExpressions',
          data: {
            operator: '>>',
          },
        },
      ],
    },
    {
      code: '1 >> 1',
      errors: [
        {
          messageId: 'correctIdenticalSubExpressions',
          data: {
            operator: '>>',
          },
        },
      ],
    },
    {
      code: '5 << 5',
      errors: [
        {
          messageId: 'correctIdenticalSubExpressions',
          data: {
            operator: '<<',
          },
        },
      ],
    },
    {
      code: 'obj.foo() == obj.foo()',
      errors: [
        {
          messageId: 'correctIdenticalSubExpressions',
          data: {
            operator: '==',
          },
        },
      ],
    },
    {
      code: 'foo(/*comment*/() => doSomething()) === foo(() => doSomething())',
      errors: [
        {
          messageId: 'correctIdenticalSubExpressions',
          data: {
            operator: '===',
          },
        },
      ],
    },
    {
      code: '(a == b) == (a == b)',
      errors: [
        {
          messageId: 'correctIdenticalSubExpressions',
          data: {
            operator: '==',
          },
        },
      ],
    },
    {
      code: 'if (+a !== +a);',
      errors: [
        {
          messageId: 'correctIdenticalSubExpressions',
          data: {
            operator: '!==',
          },
        },
      ],
    },
  ],
});
