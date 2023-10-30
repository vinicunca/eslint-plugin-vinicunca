import type { TSESLint } from '@typescript-eslint/utils';

import type { IssueLocation } from '../utils/locations';

import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './cognitive-complexity';

ruleTester.run(RULE_NAME, rule as any, {
  invalid: [
    // if
    {
      code: `function single_if() {
        if (x) {} // +1
      }`,
      errors: [message(1, { column: 10, endColumn: 19, line: 1 })],
      options: [0],
    },
    {
      code: `
      function if_else_complexity() {
        if (condition) {        // +1
        } else if (condition) { // +1
        } else {}               // +1
      }`,
      errors: [message(3)],
      options: [0],
    },
    {
      code: `
      function else_nesting() {
        if (condition) {      // +1
        } else {              // +1 (nesting level +1)
            if (condition) {} // +2
        }
      }`,
      errors: [message(4)],
      options: [0],
    },
    {
      code: `
      function else_nested() {
        if (condition) {      // +1 (nesting level +1)
          if (condition) {    // +2
          } else {}           // +1
        }
      }`,
      errors: [message(4)],
      options: [0],
    },
    {
      code: `
      function if_nested() {
        if (condition)          // +1 (nesting level +1)
          if (condition)        // +2 (nesting level +1)
            if (condition) {}   // +3
      }`,
      errors: [message(6)],
      options: [0],
    },
    {
      code: `
      function else_if_nesting() {
        if (condition) {         // +1
        } else if (condition) {  // +1 (nesting level +1)
          if (condition) {}      // +2
        }
      }`,
      errors: [message(4)],
      options: [0],
    },

    // loops
    {
      code: `
      function loops_complexity() {
        while (condition) {                 // +1 (nesting level +1)
          if (condition) {}                 // +2
        }

        do {                                // +1 (nesting level +1)
          if (condition) {}                 // +2
        } while (condition)

        for (i = 0; i < length; i++) {      // +1 (nesting level +1)
          if (condition) {}                 // +2

          for (i = 0; i < length; i++) {}  // +2
        }

        for (x in obj) {                    // +1 (nesting level +1)
          if (condition) {}                 // +2
        }

        for (x of obj) {                    // +1 (nesting level +1)
          if (condition) {}                 // +2
        }
      }`,
      errors: [message(17)],
      options: [0],
    },

    // switch
    {
      code: `
      function switch_complexity() {
        if (condition) {                 // +1 (nesting level +1)
          switch (expr) {                // +2 (nesting level +1)
            case "1":
              if (condition) {}          // +3
              break;
            case "2":
              break;
            default:
              foo();
          }
        }
      }`,
      errors: [message(6)],
      options: [0],
    },

    // continue & break
    {
      code: `
      function jump_statements_no_complexity() {
        if (condition)           // +1
          return;
        else if (condition)      // +1
          return 42;

        label:
        while (condition) {      // +1 (nesting level +1)
          if (condition)         // +2
            break;
          else if (condition)    // +1
            continue;
        }
      }`,
      errors: [message(6)],
      options: [0],
    },
    {
      code: `
      function break_continue_with_label() {
        label:
        while (condition) {      // +1
          break label;           // +1
          continue label;        // +1
        }
      }`,
      errors: [message(3)],
      options: [0],
    },

    // try-catch-finally
    {
      code: `
      function try_catch() {
        try {
          if (condition) {}      // +1
        } catch (someError) {    // +1 (nesting level +1)
          if (condition)  {}     // +2
        } finally {
          if (condition) {}      // +1
        }
      }`,
      errors: [message(5)],
      options: [0],
    },
    {
      code: `
      function try_finally() {
        try {
          if (condition) {}      // +1
        } finally {
          if (condition) {}      // +1
        }
      }`,
      errors: [message(2)],
      options: [0],
    },
    testCaseWithVinicuncaRuntime(
      `
      function check_secondaries() {
        if (condition) {       // +1 "if"
          if (condition) {} else {} // +2 "if", +1 "else"
          try {}
          catch (someError) {} // +2 "catch"
        } else { // +1
        }

        foo:
        while (cond) { // +1 "while"
          break foo; // +1 "break"
        }

        a ? 1 : 2; // +1 "?"

        switch (a) {} // +1 "switch"

        return foo(a && b) && c; // +1 "&&", +1 "&&"
      }`,
      [
        { column: 8, endColumn: 10, endLine: 3, line: 3, message: '+1' }, // if
        { column: 10, endColumn: 14, endLine: 7, line: 7, message: '+1' }, // else
        {
          column: 10,
          endColumn: 12,
          endLine: 4,
          line: 4,
          message: '+2 (incl. 1 for nesting)',
        }, // if
        { column: 28, endColumn: 32, endLine: 4, line: 4, message: '+1' }, // else
        {
          column: 10,
          endColumn: 15,
          endLine: 6,
          line: 6,
          message: '+2 (incl. 1 for nesting)',
        }, // catch
        { column: 8, endColumn: 13, endLine: 11, line: 11, message: '+1' }, // while
        { column: 10, endColumn: 15, endLine: 12, line: 12, message: '+1' }, // break
        { column: 10, endColumn: 11, endLine: 15, line: 15, message: '+1' }, // ?
        { column: 8, endColumn: 14, endLine: 17, line: 17, message: '+1' }, // switch
        { column: 27, endColumn: 29, endLine: 19, line: 19, message: '+1' }, // &&
        { column: 21, endColumn: 23, endLine: 19, line: 19, message: '+1' }, // &&
      ],
      13,
    ),

    // expressions
    testCaseWithVinicuncaRuntime(
      `
      function and_or_locations() {
        foo(1 && 2 || 3 && 4);
      }`,
      [
        { column: 14, endColumn: 16, endLine: 3, line: 3, message: '+1' }, // &&
        { column: 19, endColumn: 21, endLine: 3, line: 3, message: '+1' }, // ||
        { column: 24, endColumn: 26, endLine: 3, line: 3, message: '+1' }, // &&
      ],
    ),
    {
      code: `
      function and_or() {
        foo(1 && 2 && 3 && 4); // +1
        foo((1 && 2) && (3 && 4)); // +1
        foo(((1 && 2) && 3) && 4); // +1
        foo(1 && (2 && (3 && 4))); // +1
        foo(1 || 2 || 3 || 4); // +1
        foo(1 && 2 || 3 || 4); // +2
        foo(1 && 2 || 3 && 4); // +3
        foo(1 && 2 && !(3 && 4)); // +2
      }`,
      errors: [message(12)],
      options: [0],
    },
    {
      code: `
      function conditional_expression() {
        return condition ? trueValue : falseValue;
      }`,
      errors: [message(1)],
      options: [0],
    },
    {
      code: `
      function nested_conditional_expression() {
        x = condition1 ? (condition2 ? trueValue2 : falseValue2) : falseValue1 ; // +3
        x = condition1 ? trueValue1 : (condition2 ? trueValue2 : falseValue2)  ; // +3
        x = condition1 ? (condition2 ? trueValue2 : falseValue2) : (condition3 ? trueValue3 : falseValue3); // +5
      }`,
      errors: [message(11)],
      options: [0],
    },
    {
      code: `
      function complexity_in_conditions(a, b) {
        if (a && b) {                            // +1(if) +1(&&)
          a && b;                                // +1 (no nesting)
        }
        while (a && b) {}                        // +1(while) +1(&&)
        do {} while (a && b)                     // +1(do) +1(&&)
        for (var i = a && b; a && b; a && b) {}  // +1(for) +1(&&)  +1(&&)  +1(&&)
      }`,
      errors: [message(11)],
      options: [0],
    },

    // different function types
    {
      code: 'var arrowFunction = (a, b) => a && b;',
      errors: [message(1, { column: 28, endColumn: 30, endLine: 1, line: 1 })],
      options: [0],
    },
    {
      code: 'var functionExpression = function(a, b) { return a && b; }',
      errors: [message(1, { column: 26, endColumn: 34, endLine: 1, line: 1 })],
      options: [0],
    },
    {
      code: `
      class A {
        method() {
          if (condition) {  // +1
            class B {}
          }
        }
      }`,
      errors: [message(1, { column: 9, endColumn: 15, endLine: 3, line: 3 })],
      options: [0],
    },
    {
      code: `
      class A {
        constructor() {
          if (condition) {}  // +1
        }
      }`,
      errors: [message(1, { column: 9, endColumn: 20, endLine: 3, line: 3 })],
      options: [0],
    },
    {
      code: `
      class A {
        set foo(x) {
          if (condition) {}  // +1
        }
        get foo() {
          if (condition) {}  // +1
        }
      }`,
      errors: [
        message(1, { column: 13, endColumn: 16, endLine: 3, line: 3 }),
        message(1, { column: 13, endColumn: 16, endLine: 6, line: 6 }),
      ],
      options: [0],
    },
    {
      code: `
      class A {
        ['foo']() {
          if (condition) {}  // +1
        }
      }`,
      errors: [message(1, { column: 10, endColumn: 15, endLine: 3, line: 3 })],
      options: [0],
    },
    {
      // here function is a function declaration, but it has no name (despite of the @types/estree definition)
      code: `
      export default function() {
        if (options) {}
      }`,
      errors: [message(1, { column: 22, endColumn: 30, endLine: 2, line: 2 })],
      options: [0],
    },

    // nested functions
    {
      code: `
      function nesting_func_no_complexity() {
        function nested_func() { // Noncompliant
          if (condition) {}      // +1
        }
      }`,
      errors: [message(1, { line: 3 })],
      options: [0],
    },
    {
      code: `
      function nesting_func_with_complexity() {  // Noncompliant
        if (condition) {}          // +1
        function nested_func() {   // (nesting level +1)
          if (condition) {}        // +2
        }
      }`,
      errors: [message(3, { line: 2 })],
      options: [0],
    },
    {
      code: `
      function nesting_func_with_not_structural_complexity() {  // Noncompliant
        return a && b;             // +1
        function nested_func() {   // Noncompliant
          if (condition) {}        // +1
        }
      }`,
      errors: [message(1, { line: 2 }), message(1, { line: 4 })],
      options: [0],
    },
    {
      code: `
      function two_level_function_nesting() {
        function nested1() {      // Noncompliant
          function nested2() {    // (nesting +1)
            if (condition) {}     // +2
          }
        }
      }`,
      errors: [message(2, { line: 3 })],
      options: [0],
    },
    {
      code: `
      function two_level_function_nesting_2() {
        function nested1() {     // Noncompliant
          if (condition) {}      // +1
          function nested2() {   // (nesting +1)
            if (condition) {}    // +2
          }
        }
      }`,
      errors: [message(3, { line: 3 })],
      options: [0],
    },
    {
      code: `
      function with_complexity_after_nested_function() { // Noncompliant
        function nested_func() {   // (nesting level +1)
          if (condition) {}        // +2
        }
        if (condition) {}          // +1
      }`,
      errors: [message(3, { line: 2 })],
      options: [0],
    },
    {
      code: `
      function nested_async_method() {
        class X {
          async method() {
            if (condition) {}      // +1
          }
        }
      }`,
      errors: [message(1, { column: 17, endColumn: 23, line: 4 })],
      options: [0],
    },

    // spaghetti
    {
      code: `
      (function(a) {  // Noncompliant
        if (cond) {}
        return a;
      })(function(b) {return b + 1})(0);`,
      errors: [message(1)],
      options: [0],
    },

    // ignore React functional components
    {
      code: `
      function Welcome() {
        const handleSomething = () => {
          if (x) {} // +1
        }
        if (x) {} // +1
        return <h1>Hello, world</h1>;
      }`,
      errors: [message(1, { line: 2 }), message(1, { line: 3 })],
      options: [0],
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    {
      code: `
      const Welcome = () => {
        const handleSomething = () => {
          if (x) {} // +1
        }
        if (x) {} // +1
        return <h1>Hello, world</h1>;
      }`,
      errors: [message(1, { line: 2 }), message(1, { line: 3 })],
      options: [0],
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    {
      code: `
      const Welcome = () => {
        const handleSomething = () => {
          if (x) {} // +1
        }
        if (x) {} // +1
        return (
          <>
            <h1>Hello, world</h1>
            <p>cat</p>
          </>
        );
      }`,
      errors: [message(1, { line: 2 }), message(1, { line: 3 })],
      options: [0],
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    testCaseWithVinicuncaRuntime(
      `
      function Component(obj) {
        return (
          <>
            <span title={ obj.user?.name ?? (obj.isDemo ? 'demo' : 'none') }>Text</span>
          </>
        );
      }`,
      [
        { column: 41, endColumn: 43, endLine: 5, line: 5, message: '+1' }, // ??
        { column: 56, endColumn: 57, endLine: 5, line: 5, message: '+1' }, // ?:
      ],
    ),
    testCaseWithVinicuncaRuntime(
      `
      function Component(obj) {
        return (
          <>
            { obj.isUser && (obj.name || obj.surname) }
          </>
        );
      }`,
      [
        { column: 25, endColumn: 27, endLine: 5, line: 5, message: '+1' }, // &&
        { column: 38, endColumn: 40, endLine: 5, line: 5, message: '+1' }, // ||
      ],
    ),
    testCaseWithVinicuncaRuntime(
      `
      function Component(obj) {
        return (
          <>
            { obj.isUser && (obj.isDemo ? <strong>Demo</strong> : <em>None</em>) }
          </>
        );
      }`,
      [
        { column: 25, endColumn: 27, endLine: 5, line: 5, message: '+1' }, // &&
        { column: 40, endColumn: 41, endLine: 5, line: 5, message: '+1' }, // ||
      ],
    ),
  ],
  valid: [
    { code: 'function zero_complexity() {}', options: [0] },
    {
      code: `
      function Component(obj) {
        return (
          <span>{ obj.title?.text }</span>
        );
      }`,
      options: [0],
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    {
      code: `
      function Component(obj) {
        return (
          <>
              { obj.isFriendly && <strong>Welcome</strong> }
          </>
        );
      }`,
      options: [0],
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    {
      code: `
      function Component(obj) {
        return (
          <>
              { obj.isFriendly && obj.isLoggedIn && <strong>Welcome</strong> }
          </>
        );
      }`,
      options: [0],
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    {
      code: `
      function Component(obj) {
        return (
          <>
              { obj.x && obj.y && obj.z && <strong>Welcome</strong> }
          </>
        );
      }`,
      options: [0],
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    {
      code: `
      function Component(obj) {
        return (
          <span title={ obj.title || obj.disclaimer }>Text</span>
        );
      }`,
      options: [0],
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    {
      code: `
      function Component(obj) {
        return (
          <button type="button" disabled={ obj.user?.isBot ?? obj.isDemo }>Logout</button>
        );
      }`,
      options: [0],
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  ],
});

ruleTester.run(`${RULE_NAME} 15`, rule as any, {
  invalid: [
    {
      code: `
      function foo() {
        if (a) {             // +1 (nesting level +1)
          if (b) {           // +2 (nesting level +1)
            if (c) {         // +3 (nesting level +1)
              if (d) {       // +4 (nesting level +1)
                if (e) {     // +5 (nesting level +1)
                  if (f) {}  // +6 (nesting level +1)
                }
              }
            }
          }
        }
      }`,
      errors: [
        {
          data: {
            complexityAmount: 21,
            threshold: 15,
          },
          messageId: 'refactorFunction',
        },
      ],
    },
  ],
  valid: [
    {
      code: `
      function foo() {
        if (a) {             // +1 (nesting level +1)
          if (b) {           // +2 (nesting level +1)
            if (c) {         // +3 (nesting level +1)
              if (d) {       // +4 (nesting level +1)
                if (e) {}    // +5 (nesting level +1)
              }
            }
          }
        }
      }`,
    },
  ],
});

ruleTester.run('file-cognitive-complexity', rule as any, {
  invalid: [
    {
      code: `
      a; // Noncompliant [[id=1]] {{25}}
function foo() {
  x && y;
//S ^^ 1 {{+1}}
  function foo1() {
    if (x) {}
//S ^^ 1 {{+1}}
  }
}

function bar() {
    if (x) {}
//S ^^ 1 {{+1}}
    function bar1() {
      if (x) {}
//S   ^^ 1 {{+2 (incl. 1 for nesting)}}
    }
}

    if (x) {
//S ^^ 1 {{+1}}
      function zoo() {
       x && y;
//S      ^^ 1 {{+1}}
       function zoo2() {
         if (x) {}
//S      ^^ 1 {{+2 (incl. 1 for nesting)}}
       }
      }

      function zoo1() {
        if (x) {}
//S     ^^ 1 {{+2 (incl. 1 for nesting)}}
      }

    }

x   && y;
//S ^^ 1 {{+1}}

    if (x) {
//S ^^ 1
      if (y) {
//S   ^^ 1
        function nested() {
          if (z) {}
//S       ^^ 1
          x && y;
//S         ^^ 1
        }
      }

      class NestedClass {

        innerMethod() {
          if (x) {}
//S       ^^ 1 {{+2 (incl. 1 for nesting)}}
        }

      }

    }

class TopLevel {

  someMethod() {
    if (x) {
//S ^^ 1 {{+1}}
      class ClassInClass {

        innerMethod() {
          if (x) {}
//S       ^^ 1 {{+3 (incl. 2 for nesting)}}
        }
      }
    }
  }
}
      `,
      errors: [{ data: { complexityAmount: 25 }, messageId: 'fileComplexity' }],
      options: [0, 'metric'],
    },
  ],
  valid: [],
});

function testCaseWithVinicuncaRuntime(
  code: string,
  secondaryLocations: IssueLocation[],
  complexity?: number,
): TSESLint.InvalidTestCase<string, ('vinicunca-runtime' | number)[]> {
  const cost = complexity ?? secondaryLocations.length;
  const message = `Refactor this function to reduce its Cognitive Complexity from ${cost} to the 0 allowed.`;
  const vinicuncaRuntimeData = JSON.stringify({ cost, message, secondaryLocations });
  return {
    code,
    errors: [
      {
        data: {
          threshold: 0,
          vinicuncaRuntimeData,
        },
        messageId: 'vinicuncaRuntime',
      },
    ],
    options: [0, 'vinicunca-runtime'],
    parserOptions: { ecmaFeatures: { jsx: true } },
  };
}

function message(complexityAmount: number, other: Partial<TSESLint.TestCaseError<string>> = {}) {
  return {
    data: { complexityAmount, threshold: 0 },
    messageId: 'refactorFunction',
    ...other,
  };
}
