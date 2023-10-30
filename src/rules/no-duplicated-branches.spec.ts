import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './no-duplicated-branches';

ruleTester.run(`${RULE_NAME} if`, rule as any, {
  invalid: [
    {
      code: `
      if (a) {
        first();
        second();
      } else {
        first();
        second();
      }`,
      errors: [
        {
          column: 14,
          data: {
            line: 2,
            type: 'branch',
          },
          endColumn: 8,
          endLine: 8,
          line: 5,
          messageId: 'sameConditionalBlock',
        },
      ],
    },
    {
      code: `
      if (a) {
        first();
        second();
      } else if (b) {
        first();
        second();
      }`,
      errors: [
        {
          data: {
            line: 2,
            type: 'branch',
            vinicuncaRuntimeData: JSON.stringify({
              message:
                'This branch\'s code block is the same as the block for the branch on line 2.',
              secondaryLocations: [
                {
                  column: 13,
                  endColumn: 7,
                  endLine: 5,
                  line: 2,
                  message: 'Original',
                },
              ],
            }),
          },
          line: 5,
          messageId: 'vinicuncaRuntime',
        },
      ],
      options: ['vinicunca-runtime'],
    },

    /**
     * message: JSON.stringify({
            secondaryLocations: [
              {
                line: 2,
                column: 13,
                endLine: 5,
                endColumn: 7,
                message: 'Original',
              },
            ],
            message,
          })
     */

    {
      code: `
      if (a) {
        first();
        second();
      } else if (b) {
        second();
        third();
      } else {
        first();
        second();
      }`,
      errors: [
        {
          data: {
            line: 2,
            type: 'branch',
          },
          line: 8,
          messageId: 'sameConditionalBlock',
        },
      ],
    },
    {
      code: `
      if(a == 1) {
        doSomething();
      } else if (a == 2) {
        doSomething();
      }`,
      errors: [
        {
          data: {
            line: 2,
            type: 'branch',
          },
          line: 4,
          messageId: 'sameConditionalBlock',
        },
      ],
    },
    {
      code: `
      if(a == 1) {
        doSomething();
      } else if (a == 2) {
        doSomething();
      } else if (a == 3) {
        doSomething();
      }`,
      errors: [
        {
          data: {
            line: 2,
            type: 'branch',
          },
          line: 4,
          messageId: 'sameConditionalBlock',
        },
        {
          data: {
            line: 4,
            type: 'branch',
          },
          line: 6,
          messageId: 'sameConditionalBlock',
        },
      ],
    },
  ],
  valid: [
    {
      code: `
      if (a) {
        first('const');
        first('foo');
      } else {
        first('var');
        first('foo');
      }`,
    },
    {
      // small branches
      code: `
      if (a) {
        first();
      } else {
        first();
      }`,
    },
    {
      code: `
      if (a) {
        first();
        first();
      } else {
        second();
        second();
      }`,
    },
    {
      code: `
      if (a) {
        first();
        second();
      } else {
        second();
        first();
      }`,
    },
    {
      code: `
      if (a) {
        first();
        second();
      } else {
        first();
        third();
      }`,
    },
    {
      code: `
      if (a) {
        first();
        second();
      } else {
        first();
      }`,
    },
    {
      code: `
      if(a == 1) {
        doSomething();  //no issue, usually this is done on purpose to increase the readability
      } else if (a == 2) {
        doSomethingElse();
      } else {
        doSomething();
      }`,
    },
  ],
});

ruleTester.run(`${RULE_NAME} switch`, rule as any, {
  invalid: [
    {
      code: `
      switch(a) {
        case 2:
        case 1:
          first();
          second();
          break;
        case 3:
          first();
          second();
          break;
      }`,
      errors: [
        {
          data: {
            line: '4',
            type: 'case',
          },
          line: 8,
          messageId: 'sameConditionalBlock',
        },
      ],
    },
    {
      code: `
      switch (a) {
        case 1:
          first();
          second();
          break;
        default:
          first();
          second();
      }`,
      errors: [
        {
          column: 9,
          data: {
            line: 3,
            type: 'case',
          },
          endColumn: 20,
          endLine: 9,
          line: 7,
          messageId: 'sameConditionalBlock',
        },
      ],
    },
    {
      code: `
      switch (a) {
        case 1:
          first();
          second();
          break;
        case 2:
          first();
          second();
          break;
      }`,
      errors: [
        {
          data: {
            line: '3',
            type: 'case',
            vinicuncaRuntimeData: JSON.stringify({
              message: 'This case\'s code block is the same as the block for the case on line 3.',
              secondaryLocations: [
                {
                  column: 8,
                  endColumn: 16,
                  endLine: 6,
                  line: 3,
                  message: 'Original',
                },
              ],
            }),
          },
          line: 7,
          messageId: 'vinicuncaRuntime',
        },
      ],
      options: ['vinicunca-runtime'],
    },
    {
      code: `
      switch (a) {
        case 1:
          first();
          first();
          break;
        case 2:
          second();
          second();
          break;
        case 3:
          first();
          first();
          break;
      }`,
      errors: [
        {
          data: {
            line: 3,
            type: 'case',
          },
          line: 11,
          messageId: 'sameConditionalBlock',
        },
      ],
    },
    {
      code: `
      switch (a) {
        case 1: {
          first();
          second();
          break;
        }
        default: {
          first();
          second();
        }
      }`,
      errors: [
        {
          data: {
            line: 3,
            type: 'case',
          },
          line: 8,
          messageId: 'sameConditionalBlock',
        },
      ],
    },
    {
      // check that for each branch we generate only one issue
      code: `
      switch (a) {
        case 1:
          first();
          second();
          break;
        case 2:
          first();
          second();
          break;
        case 3:
          first();
          second();
          break;
        case 4:
          first();
          second();
          break;
      }`,
      errors: [
        {
          data: {
            line: 3,
            type: 'case',
          },
          line: 7,
          messageId: 'sameConditionalBlock',
        },
        {
          data: {
            line: 7,
            type: 'case',
          },
          line: 11,
          messageId: 'sameConditionalBlock',
        },
        {
          data: {
            line: 11,
            type: 'case',
          },
          line: 15,
          messageId: 'sameConditionalBlock',
        },
      ],
    },
    {
      code: `
      switch(a) {
        case 1:
          doSomething();
          break;
        case 2:
          doSomething();
          break;
      }`,
      errors: [
        {
          data: {
            line: 3,
            type: 'case',
          },
          line: 6,
          messageId: 'sameConditionalBlock',
        },
      ],
    },
    {
      code: `
      switch(a) {
        case 0:
          foo();
          bar();
          break;
        case 2:
        case 1:
          first();
          second();
          break;
        case 3:
          first();
          second();
          break;
      }`,
      errors: [
        {
          data: {
            line: 8,
            type: 'case',
          },
          line: 12,
          messageId: 'sameConditionalBlock',
        },
      ],
    },
  ],
  valid: [
    {
      code: `
      function foo() {
        switch (a) {
          case 1:
            return first();
          default:
            return first();
        }
      }`,
    },
    {
      // small branches
      code: `
      switch (a) {
        case 1: {
          // comment
          break;
        }
        case 2: {
          // comment
          break;
        }
      }`,
    },
    {
      code: `
      switch (a) {
        case 1:
          first();
          second();
          break;
        default:
          second();
          first();
      }`,
    },
    {
      code: `
      switch (a) {
        case 1:
          first();
          second();
          break;
        case 2:
          third();
      }`,
    },
  ],
});
