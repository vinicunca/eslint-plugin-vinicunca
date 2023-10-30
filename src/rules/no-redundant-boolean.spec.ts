import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './no-redundant-boolean';

ruleTester.run(RULE_NAME, rule as any, {
  invalid: [
    {
      code: 'if (x == true) {}',
      errors: [{ column: 10, endColumn: 14, messageId: 'removeUnnecessaryBoolean' }],
    },
    {
      code: 'if (x == false) {}',
      errors: [{ column: 10, endColumn: 15, messageId: 'removeUnnecessaryBoolean' }],
    },
    {
      code: 'if (x || false) {}',
      errors: [{ column: 10, endColumn: 15, messageId: 'removeUnnecessaryBoolean' }],
    },
    {
      code: 'if (x && false) {}',
      errors: [{ column: 10, endColumn: 15, messageId: 'removeUnnecessaryBoolean' }],
    },

    {
      code: 'x || false ? 1 : 2',
      errors: [{ column: 6, endColumn: 11, messageId: 'removeUnnecessaryBoolean' }],
    },

    {
      code: 'fn(!false)',
      errors: [{ column: 5, endColumn: 10, messageId: 'removeUnnecessaryBoolean' }],
    },

    {
      code: 'a == true == b;',
      errors: [{ column: 6, endColumn: 10, messageId: 'removeUnnecessaryBoolean' }],
    },
    {
      code: 'a == b == false;',
      errors: [{ column: 11, endColumn: 16, messageId: 'removeUnnecessaryBoolean' }],
    },
    {
      code: 'a == (true == b) == b;',
      errors: [{ column: 7, endColumn: 11, messageId: 'removeUnnecessaryBoolean' }],
    },

    {
      code: '!(true);',
      errors: [{ column: 3, endColumn: 7, messageId: 'removeUnnecessaryBoolean' }],
    },
    {
      code: 'a == (false);',
      errors: [{ column: 7, endColumn: 12, messageId: 'removeUnnecessaryBoolean' }],
    },

    {
      code: 'true && a;',
      errors: [{ column: 1, endColumn: 5, messageId: 'removeUnnecessaryBoolean' }],
    },
  ],
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
});
