import { type TSESLint } from '@typescript-eslint/utils';
import { ruleTester } from '../tests/rule-tester';
import { type IssueLocation } from '../utils/locations';
import rule, { RULE_NAME } from './no-identical-functions';

ruleTester.run(RULE_NAME, rule as any, {
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
          messageId: 'identicalFunctions',
          data: {
            line: 2,
          },
          line: 21,
          column: 9,
          endColumn: 20,
        }, // constructor
        {
          messageId: 'identicalFunctions',
          data: {
            line: 2,
          },
          line: 27,
          column: 9,
          endColumn: 15,
        }, // method
        {
          messageId: 'identicalFunctions',
          data: {
            line: 2,
          },
          line: 33,
          column: 13,
          endColumn: 19,
        }, // setter
        {
          messageId: 'identicalFunctions',
          data: {
            line: 2,
          },
          line: 39,
          column: 13,
          endColumn: 19,
        }, // getter
        {
          messageId: 'identicalFunctions',
          data: {
            line: 2,
          },
          line: 46,
          column: 22,
          endColumn: 35,
        }, // async declaration
        {
          messageId: 'identicalFunctions',
          data: {
            line: 2,
          },
          line: 52,
          column: 35,
          endColumn: 43,
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
      options: [3, 'vinicunca-runtime'],
      errors: [
        encodedMessage(2, 7, [
          { line: 2, column: 17, endLine: 2, endColumn: 20, message: 'Original implementation' },
        ]),
      ],
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
      options: [3, 'vinicunca-runtime'],
      errors: [
        encodedMessage(2, 9, [
          { line: 2, column: 17, endLine: 2, endColumn: 20, message: 'Original implementation' },
        ]),
      ],
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
});

function message(originalLine: number, duplicationLine: number): TSESLint.TestCaseError<string> {
  return {
    messageId: 'identicalFunctions',
    data: {
      line: originalLine,
    },
    line: duplicationLine,
    endLine: duplicationLine,
  };
}

function encodedMessage(
  originalLine: number,
  duplicationLine: number,
  secondaries: IssueLocation[],
): TSESLint.TestCaseError<string> {
  return {
    messageId: 'vinicuncaRuntime',
    data: {
      line: originalLine,
      vinicuncaRuntimeData: JSON.stringify({
        secondaryLocations: secondaries,
        message: `Update this function so that its implementation is not identical to the one on line ${originalLine}.`,
      }),
    },
    line: duplicationLine,
    endLine: duplicationLine,
  };
}
