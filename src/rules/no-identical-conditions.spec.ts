import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './no-identical-conditions';

const VINICUNCA_RUNTIME = 'vinicunca-runtime';

ruleTester.run(RULE_NAME, rule as any, {
  invalid: [
    {
      code: `
        if (a) {}
        else if (a) {}
      `,
      errors: [
        {
          column: 18,
          data: {
            line: 2,
          },
          endColumn: 19,
          line: 3,
          messageId: 'duplicatedCondition',
        },
      ],
    },
    {
      code: `
        if (a) {}
        //  ^>
        else if (a) {}
        //       ^
      `,
      errors: [
        {
          data: {
            line: 2,
            vinicuncaRuntimeData: JSON.stringify({
              message: 'This condition is covered by the one on line 2',
              secondaryLocations: [
                {
                  column: 12,
                  endColumn: 13,
                  endLine: 2,
                  line: 2,
                  message: 'Covering',
                },
              ],
            }),
          },
          messageId: 'vinicuncaRuntime',
        },
      ],
      options: [VINICUNCA_RUNTIME],
    },
    {
      code: `
        if (b) {}
        else if (a) {}
        else if (a) {}
      `,
      errors: [
        {
          column: 18,
          data: {
            line: 3,
          },
          endColumn: 19,
          line: 4,
          messageId: 'duplicatedCondition',
        },
      ],
    },
    {
      code: `
        if (a) {}
        else if (b) {}
        else if (a) {}
      `,
      errors: [
        {
          column: 18,
          data: {
            line: 2,
          },
          endColumn: 19,
          line: 4,
          messageId: 'duplicatedCondition',
        },
      ],
    },
    {
      code: `
        if (a || b) {}
        // >^^^^^^
        else if (a) {}
        //       ^`,
      errors: [
        {
          column: 18,
          data: {
            line: 2,
            vinicuncaRuntimeData: JSON.stringify({
              message: 'This condition is covered by the one on line 2',
              secondaryLocations: [
                {
                  column: 12,
                  endColumn: 18,
                  endLine: 2,
                  line: 2,
                  message: 'Covering',
                },
              ],
            }),
          },
          endColumn: 19,
          endLine: 4,
          line: 4,
          messageId: 'vinicuncaRuntime',
        },
      ],
      options: [VINICUNCA_RUNTIME],
    },
    {
      code: 'if (a || b) {} else if (b) {}',
      errors: [{ messageId: 'duplicatedCondition' }],
    },
    {
      code: 'if ((a === b && fn(c)) || d) {} else if (a === b && fn(c)) {}',
      errors: [{ messageId: 'duplicatedCondition' }],
    },
    {
      code: 'if (a) {} else if (a && b) {}',
      errors: [{ messageId: 'duplicatedCondition' }],
    },
    {
      code: 'if (a && b) ; else if (b && a) {}',
      errors: [{ messageId: 'duplicatedCondition' }],
    },
    {
      code: 'if (a) {} else if (b) {} else if (c && a || b) {}',
      errors: [{ messageId: 'duplicatedCondition' }],
    },
    {
      code: 'if (a) {} else if (b) {} else if (c && (a || b)) {}',
      errors: [{ messageId: 'duplicatedCondition' }],
    },
    {
      code: 'if (a) {} else if (b && c) {} else if (d && (a || e && c && b)) {}',
      errors: [{ messageId: 'duplicatedCondition' }],
    },
    {
      code: 'if (a || b && c) {} else if (b && c && d) {}',
      errors: [{ messageId: 'duplicatedCondition' }],
    },
    {
      code: 'if (a || b) {} else if (b && c) {}',
      errors: [{ messageId: 'duplicatedCondition' }],
    },
    {
      code: 'if (a) {} else if (b) {} else if ((a || b) && c) {}',
      errors: [{ messageId: 'duplicatedCondition' }],
    },
    {
      code: 'if ((a && (b || c)) || d) {} else if ((c || b) && e && a) {}',
      errors: [{ messageId: 'duplicatedCondition' }],
    },
    {
      code: 'if (a && b || b && c) {} else if (a && b && c) {}',
      errors: [{ messageId: 'duplicatedCondition' }],
    },
    {
      code: 'if (a) {} else if (b && c) {} else if (d && (c && e && b || a)) {}',
      errors: [{ messageId: 'duplicatedCondition' }],
    },
    {
      code: 'if (a || (b && (c || d))) {} else if ((d || c) && b) {}',
      errors: [{ messageId: 'duplicatedCondition' }],
    },
    {
      code: 'if (a || b) {} else if ((b || a) && c) {}',
      errors: [{ messageId: 'duplicatedCondition' }],
    },
    {
      code: 'if (a || b) {} else if (c) {} else if (d) {} else if (b && (a || c)) {}',
      errors: [{ messageId: 'duplicatedCondition' }],
    },
    {
      code: 'if (a || b || c) {} else if (a || (b && d) || (c && e)) {}',
      errors: [{ messageId: 'duplicatedCondition' }],
    },
    {
      code: 'if (a || (b || c)) {} else if (a || (b && c)) {}',
      errors: [{ messageId: 'duplicatedCondition' }],
    },
    {
      code: 'if (a || b) {} else if (c) {} else if (d) {} else if ((a || c) && (b || d)) {}',
      errors: [{ messageId: 'duplicatedCondition' }],
    },
    {
      code: 'if (a) {} else if (b) {} else if (c && (a || d && b)) {}',
      errors: [{ messageId: 'duplicatedCondition' }],
    },
    {
      code: 'if (a) {} else if (a || a) {}',
      errors: [{ messageId: 'duplicatedCondition' }],
    },
    {
      code: 'if (a) {} else if (a && a) {}',
      errors: [{ messageId: 'duplicatedCondition' }],
    },
    {
      code: `
        switch (a) {
          case 1:
            f();
            break;
          case 2:
            g();
            break;
          case 1:
            h();
            break;
        }
      `,
      errors: [
        {
          data: {
            column: 15,
            endColumn: 16,
            line: 9,
            vinicuncaRuntimeData: JSON.stringify({
              message: 'This case duplicates the one on line 3',
              secondaryLocations: [
                {
                  column: 15,
                  endColumn: 16,
                  endLine: 3,
                  line: 3,
                  message: 'Original',
                },
              ],
            }),
          },
          messageId: 'vinicuncaRuntime',
        },
      ],
      options: [VINICUNCA_RUNTIME],
    },
    {
      code: `
        switch (a) {
          case 1:
            f();
            break;
          case 2:
            g();
            break;
          case 1:
            h();
            break;
          case 1:
            i();
            break;
        }
      `,
      errors: [
        {
          column: 16,
          data: {
            line: 3,
          },
          endColumn: 17,
          line: 9,
          messageId: 'duplicatedCase',
        },
        {
          column: 16,
          data: {
            line: 3,
          },
          endColumn: 17,
          line: 12,
          messageId: 'duplicatedCase',
        },
      ],
    },
  ],
  valid: [
    {
      code: 'if (a) {} else if (b) {}',
    },
    {
      code: 'if (a) {} else {}',
    },
    {
      code: 'if (a && b) {} else if (a) {}',
    },
    {
      code: 'if (a && b) {} else if (c && d) {}',
    },
    {
      code: 'if (a || b) {} else if (c || d) {}',
    },
    {
      code: 'if (a ?? b) {} else if (c) {}',
    },
    {
      code: `
      switch (a) {
        case 1:  break;
        case 2:  break;
        case 3:  break;
        default: break;
      }
      `,
    },
  ],
});
