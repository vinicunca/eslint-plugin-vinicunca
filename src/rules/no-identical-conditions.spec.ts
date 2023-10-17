import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './no-identical-conditions';

const VINICUNCA_RUNTIME = 'vinicunca-runtime';

ruleTester.run(RULE_NAME, rule as any, {
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
  invalid: [
    {
      code: `
        if (a) {}
        else if (a) {}
      `,
      errors: [
        {
          messageId: 'duplicatedCondition',
          data: {
            line: 2,
          },
          line: 3,
          column: 18,
          endColumn: 19,
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
      options: [VINICUNCA_RUNTIME],
      errors: [
        {
          messageId: 'vinicuncaRuntime',
          data: {
            line: 2,
            vinicuncaRuntimeData: JSON.stringify({
              secondaryLocations: [
                {
                  line: 2,
                  column: 12,
                  endLine: 2,
                  endColumn: 13,
                  message: 'Covering',
                },
              ],
              message: 'This condition is covered by the one on line 2',
            }),
          },
        },
      ],
    },
    {
      code: `
        if (b) {}
        else if (a) {}
        else if (a) {}
      `,
      errors: [
        {
          messageId: 'duplicatedCondition',
          data: {
            line: 3,
          },
          line: 4,
          column: 18,
          endColumn: 19,
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
          messageId: 'duplicatedCondition',
          data: {
            line: 2,
          },
          line: 4,
          column: 18,
          endColumn: 19,
        },
      ],
    },
    {
      code: `
        if (a || b) {}
        // >^^^^^^
        else if (a) {}
        //       ^`,
      options: [VINICUNCA_RUNTIME],
      errors: [
        {
          messageId: 'vinicuncaRuntime',
          line: 4,
          column: 18,
          endLine: 4,
          endColumn: 19,
          data: {
            line: 2,
            vinicuncaRuntimeData: JSON.stringify({
              secondaryLocations: [
                {
                  line: 2,
                  column: 12,
                  endLine: 2,
                  endColumn: 18,
                  message: 'Covering',
                },
              ],
              message: 'This condition is covered by the one on line 2',
            }),
          },
        },
      ],
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
      options: [VINICUNCA_RUNTIME],
      errors: [
        {
          messageId: 'vinicuncaRuntime',
          data: {
            line: 9,
            column: 15,
            endColumn: 16,
            vinicuncaRuntimeData: JSON.stringify({
              secondaryLocations: [
                {
                  line: 3,
                  column: 15,
                  endLine: 3,
                  endColumn: 16,
                  message: 'Original',
                },
              ],
              message: 'This case duplicates the one on line 3',
            }),
          },
        },
      ],
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
          messageId: 'duplicatedCase',
          data: {
            line: 3,
          },
          line: 9,
          column: 16,
          endColumn: 17,
        },
        {
          messageId: 'duplicatedCase',
          data: {
            line: 3,
          },
          line: 12,
          column: 16,
          endColumn: 17,
        },
      ],
    },
  ],
});
