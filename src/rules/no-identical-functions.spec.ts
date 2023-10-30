import type { TSESLint } from '@typescript-eslint/utils';

import type { IssueLocation } from '../utils/locations';

import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './no-identical-functions';

ruleTester.run(RULE_NAME, rule as any, {
  invalid: [
    {
      // basic case
      code: `
      function foo() {
        console.log("Hello");
        console.log("World");
        return 42;
      }

      function bar() {
        console.log("Hello");
        console.log("World");
        return 42;
      }`,
      errors: [message(2, 8)],
    },
    {
      // different kinds of functions
      code: `
      function foo() {
        console.log("Hello");
        console.log("World");
        return 42;
      }

      let funcExpression = function () { // Noncompliant
        console.log("Hello");
        console.log("World");
        return 42;
      }

      let arrowFunction = () => { // Noncompliant
        console.log("Hello");
        console.log("World");
        return 42;
      }

      class A {
        constructor() { // Noncompliant
          console.log("Hello");
          console.log("World");
          return 42;
        }

        method() { // Noncompliant
          console.log("Hello");
          console.log("World");
          return 42;
        }

        set setter(p) { // Noncompliant
          console.log("Hello");
          console.log("World");
          return 42;
        }

        get getter() { // Noncompliant
          console.log("Hello");
          console.log("World");
          return 42;
        }
      }

      async function asyncFunction() { // Noncompliant
        console.log("Hello");
        console.log("World");
        return 42;
      }

      let asyncExpression = async function () { // Noncompliant
        console.log("Hello");
        console.log("World");
        return 42;
      }`,
      errors: [
        // prettier-ignore
        message(2, 8),
        message(2, 14),
        {
          column: 9,
          data: {
            line: 2,
          },
          endColumn: 20,
          line: 21,
          messageId: 'identicalFunctions',
        }, // constructor
        {
          column: 9,
          data: {
            line: 2,
          },
          endColumn: 15,
          line: 27,
          messageId: 'identicalFunctions',
        }, // method
        {
          column: 13,
          data: {
            line: 2,
          },
          endColumn: 19,
          line: 33,
          messageId: 'identicalFunctions',
        }, // setter
        {
          column: 13,
          data: {
            line: 2,
          },
          endColumn: 19,
          line: 39,
          messageId: 'identicalFunctions',
        }, // getter
        {
          column: 22,
          data: {
            line: 2,
          },
          endColumn: 35,
          line: 46,
          messageId: 'identicalFunctions',
        }, // async declaration
        {
          column: 35,
          data: {
            line: 2,
          },
          endColumn: 43,
          line: 52,
          messageId: 'identicalFunctions',
        }, // async expression
      ],
    },
    {
      code: `
        function foo(a, b) {
          a += b; b -= a; return {
            b
          };
        }
        function bar(a, b) {
          a += b; b -= a; return {
            b
          };
        }
      `,
      errors: [
        encodedMessage(2, 7, [
          { column: 17, endColumn: 20, endLine: 2, line: 2, message: 'Original implementation' },
        ]),
      ],
      options: [3, 'vinicunca-runtime'],
    },
    {
      code: `
        function foo(a) {
          try {
            return a;
          } catch {
            return 2 * a;
          }
        }
        function bar(a) {
          try {
            return a;
          } catch {
            return 2 * a;
          }
        }
      `,
      errors: [
        encodedMessage(2, 9, [
          { column: 17, endColumn: 20, endLine: 2, line: 2, message: 'Original implementation' },
        ]),
      ],
      options: [3, 'vinicunca-runtime'],
    },
    {
      code: `
        class Foo {
          foo() {
            console.log("Hello");
            console.log("World");
            return 42;
          }
          bar() {
            console.log("Hello");
            console.log("World");
            return 42;
          }
        }
      `,
      errors: [message(3, 8)],
    },
    {
      code: `
        const foo = () => {
          console.log("Hello");
          console.log("World");
          return 42;
        };
        const bar = () => {
          console.log("Hello");
          console.log("World");
          return 42;
        };
      `,
      errors: [message(2, 7)],
    },
  ],
  valid: [
    {
      // different body
      code: `
      function foo() {
        console.log("Hello");
        console.log("World");
        return 42;
      }

      function bar() {
        if (x) {
          console.log("Hello");
        }
        return 42;
      }`,
    },
    {
      // few lines
      code: `
      function foo() {
        console.log("Hello");
        return 42;
      }

      function bar() {
        console.log("Hello");
        return 42;
      }`,
    },
    {
      code: `
      let foo = (a, b) => {
        [
          a,
          b
        ]
      }

      let bar = (a, b) => (
        [
          a,
          b
        ]
      )
      `,
    },
    {
      code: `
      class Foo {
        foo() {
          console.log("Hello");
          console.log("World");
          return 42;
        }
        bar() {
          console.log("Hello");
          console.log("World");
          return 42;
        }
      }`,
      options: [4],
    },
  ],
});

function message(originalLine: number, duplicationLine: number): TSESLint.TestCaseError<string> {
  return {
    data: {
      line: originalLine,
    },
    endLine: duplicationLine,
    line: duplicationLine,
    messageId: 'identicalFunctions',
  };
}

function encodedMessage(
  originalLine: number,
  duplicationLine: number,
  secondaries: IssueLocation[],
): TSESLint.TestCaseError<string> {
  return {
    data: {
      line: originalLine,
      vinicuncaRuntimeData: JSON.stringify({
        message: `Update this function so that its implementation is not identical to the one on line ${originalLine}.`,
        secondaryLocations: secondaries,
      }),
    },
    endLine: duplicationLine,
    line: duplicationLine,
    messageId: 'vinicuncaRuntime',
  };
}
