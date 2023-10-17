import { ruleTester } from '../rule-tester';
import rule, { RULE_NAME } from './no-redundant-boolean';

ruleTester.run(RULE_NAME, rule as any, {
  valid: [
    { code: 'a === false;' },
    { code: 'a === true;' },
    { code: 'a !== false;' },
    { code: 'a !== true;' },
    { code: 'a == foo(true);' },
    { code: 'true < 0;' },
    { code: '~true;' },
    { code: '!foo;' },
    { code: 'if (foo(mayBeSomething || false)) {}' },
    { code: 'x ? y || false : z' },
  ],
  invalid: [
    {
      code: 'if (x == true) {}',
      errors: [{ messageId: 'removeUnnecessaryBoolean', column: 10, endColumn: 14 }],
    },
    {
      code: 'if (x == false) {}',
      errors: [{ messageId: 'removeUnnecessaryBoolean', column: 10, endColumn: 15 }],
    },
    {
      code: 'if (x || false) {}',
      errors: [{ messageId: 'removeUnnecessaryBoolean', column: 10, endColumn: 15 }],
    },
    {
      code: 'if (x && false) {}',
      errors: [{ messageId: 'removeUnnecessaryBoolean', column: 10, endColumn: 15 }],
    },

    {
      code: 'x || false ? 1 : 2',
      errors: [{ messageId: 'removeUnnecessaryBoolean', column: 6, endColumn: 11 }],
    },

    {
      code: 'fn(!false)',
      errors: [{ messageId: 'removeUnnecessaryBoolean', column: 5, endColumn: 10 }],
    },

    {
      code: 'a == true == b;',
      errors: [{ messageId: 'removeUnnecessaryBoolean', column: 6, endColumn: 10 }],
    },
    {
      code: 'a == b == false;',
      errors: [{ messageId: 'removeUnnecessaryBoolean', column: 11, endColumn: 16 }],
    },
    {
      code: 'a == (true == b) == b;',
      errors: [{ messageId: 'removeUnnecessaryBoolean', column: 7, endColumn: 11 }],
    },

    {
      code: '!(true);',
      errors: [{ messageId: 'removeUnnecessaryBoolean', column: 3, endColumn: 7 }],
    },
    {
      code: 'a == (false);',
      errors: [{ messageId: 'removeUnnecessaryBoolean', column: 7, endColumn: 12 }],
    },

    {
      code: 'true && a;',
      errors: [{ messageId: 'removeUnnecessaryBoolean', column: 1, endColumn: 5 }],
    },
  ],
});
