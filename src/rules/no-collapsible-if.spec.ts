import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './no-collapsible-if';

ruleTester.run(RULE_NAME, rule as any, {
  valid: [
    {
      code: `
      if (x) {
        console.log(x);
      }`,
    },
    {
      code: `
      if (x) {
        if (y) {}
          console.log(x);
      }`,
    },
    {
      code: `
      if (x) {
        console.log(x);
        if (y) {}
      }`,
    },
    {
      code: `
      if (x) {
        if (y) {}
      } else {}`,
    },
    {
      code: `
      if (x) {
        if (y) {} else {}
      }`,
    },
  ],

  invalid: [
    {
      code: `
      if (x) {
    //^^ > {{Merge this if statement with the nested one.}}
        if (y) {}
      //^^ {{Nested "if" statement.}}
      }`,
      options: ['vinicunca-runtime'],
      errors: [
        {
          messageId: 'vinicuncaRuntime',
          data: {
            vinicuncaRuntimeData: JSON.stringify({
              secondaryLocations: [
                {
                  line: 4,
                  column: 8,
                  endLine: 4,
                  endColumn: 10,
                  message: 'Nested "if" statement.',
                },
              ],
              message: 'Merge this if statement with the nested one.',
            }),
          },
          line: 2,
          column: 7,
          endLine: 2,
          endColumn: 9,
        },
      ],
    },
    {
      code: `
      if (x)
        if(y) {}`,
      errors: [{ messageId: 'mergeNestedIfStatement' }],
    },
    {
      code: `
      if (x) {
        if(y) {
          if(z) {
          }
        }
      }`,
      errors: [{ messageId: 'mergeNestedIfStatement' }, { messageId: 'mergeNestedIfStatement' }],
    },
  ],
});
