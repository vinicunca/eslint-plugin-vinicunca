import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './no-collapsible-if';

ruleTester.run(RULE_NAME, rule as any, {
  invalid: [
    {
      code: `
      if (x) {
    //^^ > {{Merge this if statement with the nested one.}}
        if (y) {}
      //^^ {{Nested "if" statement.}}
      }`,
      errors: [
        {
          column: 7,
          data: {
            vinicuncaRuntimeData: JSON.stringify({
              message: 'Merge this if statement with the nested one.',
              secondaryLocations: [
                {
                  column: 8,
                  endColumn: 10,
                  endLine: 4,
                  line: 4,
                  message: 'Nested "if" statement.',
                },
              ],
            }),
          },
          endColumn: 9,
          endLine: 2,
          line: 2,
          messageId: 'vinicuncaRuntime',
        },
      ],
      options: ['vinicunca-runtime'],
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
});
