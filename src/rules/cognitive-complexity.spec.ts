import { type TSESLint } from '@typescript-eslint/utils';
import { ruleTester } from '../tests/rule-tester';
import { type IssueLocation } from '../utils/locations';
import rule, { RULE_NAME } from './cognitive-complexity';

ruleTester.run(RULE_NAME, rule as any, {
  valid: [
    { code: 'function zero_complexity() {}', options: [0] },
    {
      code: `
      function Component(obj) {
        return (
          <span>{ obj.title?.text }</span>
        );
      }`,
      parserOptions: { ecmaFeatures: { jsx: true } },
      options: [0],
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
      parserOptions: { ecmaFeatures: { jsx: true } },
      options: [0],
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
      parserOptions: { ecmaFeatures: { jsx: true } },
      options: [0],
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
      parserOptions: { ecmaFeatures: { jsx: true } },
      options: [0],
    },
    {
      code: `
      function Component(obj) {
        return (
          <span title={ obj.title || obj.disclaimer }>Text</span>
        );
      }`,
      parserOptions: { ecmaFeatures: { jsx: true } },
      options: [0],
    },
    {
      code: `
      function Component(obj) {
        return (
          <button type="button" disabled={ obj.user?.isBot ?? obj.isDemo }>Logout</button>
        );
      }`,
      parserOptions: { ecmaFeatures: { jsx: true } },
      options: [0],
    },
  ],
  invalid: [
    // if
    {
      code: `function single_if() {
        if (x) {} // +1
      }`,
      options: [0],
      errors: [message(1, { line: 1, column: 10, endColumn: 19 })],
    },
    {
      code: `
      function if_else_complexity() {
        if (condition) {        // +1
        } else if (condition) { // +1
        } else {}               // +1
      }`,
      options: [0],
      errors: [message(3)],
    },
    {
      code: `
      function else_nesting() {
        if (condition) {      // +1
        } else {              // +1 (nesting level +1)
            if (condition) {} // +2
        }
      }`,
      options: [0],
      errors: [message(4)],
    },
    {
      code: `
      function else_nested() {
        if (condition) {      // +1 (nesting level +1)
          if (condition) {    // +2
          } else {}           // +1
        }
      }`,
      options: [0],
      errors: [message(4)],
    },
    {
      code: `
      function if_nested() {
        if (condition)          // +1 (nesting level +1)
          if (condition)        // +2 (nesting level +1)
            if (condition) {}   // +3
      }`,
      options: [0],
      errors: [message(6)],
    },
    {
      code: `
      function else_if_nesting() {
        if (condition) {         // +1
        } else if (condition) {  // +1 (nesting level +1)
          if (condition) {}      // +2
        }
      }`,
      options: [0],
      errors: [message(4)],
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
      options: [0],
      errors: [message(17)],
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
      options: [0],
      errors: [message(6)],
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
      options: [0],
      errors: [message(6)],
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
      options: [0],
      errors: [message(3)],
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
      options: [0],
      errors: [message(5)],
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
      options: [0],
      errors: [message(2)],
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
        { line: 3, column: 8, endLine: 3, endColumn: 10, message: '+1' }, // if
        { line: 7, column: 10, endLine: 7, endColumn: 14, message: '+1' }, // else
        {
          line: 4,
          column: 10,
          endLine: 4,
          endColumn: 12,
          message: '+2 (incl. 1 for nesting)',
        }, // if
        { line: 4, column: 28, endLine: 4, endColumn: 32, message: '+1' }, // else
        {
          line: 6,
          column: 10,
          endLine: 6,
          endColumn: 15,
          message: '+2 (incl. 1 for nesting)',
        }, // catch
        { line: 11, column: 8, endLine: 11, endColumn: 13, message: '+1' }, // while
        { line: 12, column: 10, endLine: 12, endColumn: 15, message: '+1' }, // break
        { line: 15, column: 10, endLine: 15, endColumn: 11, message: '+1' }, // ?
        { line: 17, column: 8, endLine: 17, endColumn: 14, message: '+1' }, // switch
        { line: 19, column: 27, endLine: 19, endColumn: 29, message: '+1' }, // &&
        { line: 19, column: 21, endLine: 19, endColumn: 23, message: '+1' }, // &&
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
        { line: 3, column: 14, endLine: 3, endColumn: 16, message: '+1' }, // &&
        { line: 3, column: 19, endLine: 3, endColumn: 21, message: '+1' }, // ||
        { line: 3, column: 24, endLine: 3, endColumn: 26, message: '+1' }, // &&
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
      options: [0],
      errors: [message(12)],
    },
    {
      code: `
      function conditional_expression() {
        return condition ? trueValue : falseValue;
      }`,
      options: [0],
      errors: [message(1)],
    },
    {
      code: `
      function nested_conditional_expression() {
        x = condition1 ? (condition2 ? trueValue2 : falseValue2) : falseValue1 ; // +3
        x = condition1 ? trueValue1 : (condition2 ? trueValue2 : falseValue2)  ; // +3
        x = condition1 ? (condition2 ? trueValue2 : falseValue2) : (condition3 ? trueValue3 : falseValue3); // +5
      }`,
      options: [0],
      errors: [message(11)],
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
      options: [0],
      errors: [message(11)],
    },

    // different function types
    {
      code: 'var arrowFunction = (a, b) => a && b;',
      options: [0],
      errors: [message(1, { line: 1, endLine: 1, column: 28, endColumn: 30 })],
    },
    {
      code: 'var functionExpression = function(a, b) { return a && b; }',
      options: [0],
      errors: [message(1, { line: 1, endLine: 1, column: 26, endColumn: 34 })],
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
      options: [0],
      errors: [message(1, { line: 3, endLine: 3, column: 9, endColumn: 15 })],
    },
    {
      code: `
      class A {
        constructor() {
          if (condition) {}  // +1
        }
      }`,
      options: [0],
      errors: [message(1, { line: 3, endLine: 3, column: 9, endColumn: 20 })],
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
      options: [0],
      errors: [
        message(1, { line: 3, endLine: 3, column: 13, endColumn: 16 }),
        message(1, { line: 6, endLine: 6, column: 13, endColumn: 16 }),
      ],
    },
    {
      code: `
      class A {
        ['foo']() {
          if (condition) {}  // +1
        }
      }`,
      options: [0],
      errors: [message(1, { line: 3, endLine: 3, column: 10, endColumn: 15 })],
    },
    {
      // here function is a function declaration, but it has no name (despite of the @types/estree definition)
      code: `
      export default function() {
        if (options) {}
      }`,
      options: [0],
      errors: [message(1, { line: 2, endLine: 2, column: 22, endColumn: 30 })],
    },

    // nested functions
    {
      code: `
      function nesting_func_no_complexity() {
        function nested_func() { // Noncompliant
          if (condition) {}      // +1
        }
      }`,
      options: [0],
      errors: [message(1, { line: 3 })],
    },
    {
      code: `
      function nesting_func_with_complexity() {  // Noncompliant
        if (condition) {}          // +1
        function nested_func() {   // (nesting level +1)
          if (condition) {}        // +2
        }
      }`,
      options: [0],
      errors: [message(3, { line: 2 })],
    },
    {
      code: `
      function nesting_func_with_not_structural_complexity() {  // Noncompliant
        return a && b;             // +1
        function nested_func() {   // Noncompliant
          if (condition) {}        // +1
        }
      }`,
      options: [0],
      errors: [message(1, { line: 2 }), message(1, { line: 4 })],
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
      options: [0],
      errors: [message(2, { line: 3 })],
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
      options: [0],
      errors: [message(3, { line: 3 })],
    },
    {
      code: `
      function with_complexity_after_nested_function() { // Noncompliant
        function nested_func() {   // (nesting level +1)
          if (condition) {}        // +2
        }
        if (condition) {}          // +1
      }`,
      options: [0],
      errors: [message(3, { line: 2 })],
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
      options: [0],
      errors: [message(1, { line: 4, column: 17, endColumn: 23 })],
    },

    // spaghetti
    {
      code: `
      (function(a) {  // Noncompliant
        if (cond) {}
        return a;
      })(function(b) {return b + 1})(0);`,
      options: [0],
      errors: [message(1)],
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
      parserOptions: { ecmaFeatures: { jsx: true } },
      options: [0],
      errors: [message(1, { line: 2 }), message(1, { line: 3 })],
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
      parserOptions: { ecmaFeatures: { jsx: true } },
      options: [0],
      errors: [message(1, { line: 2 }), message(1, { line: 3 })],
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
      parserOptions: { ecmaFeatures: { jsx: true } },
      options: [0],
      errors: [message(1, { line: 2 }), message(1, { line: 3 })],
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
        { line: 5, column: 41, endLine: 5, endColumn: 43, message: '+1' }, // ??
        { line: 5, column: 56, endLine: 5, endColumn: 57, message: '+1' }, // ?:
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
        { line: 5, column: 25, endLine: 5, endColumn: 27, message: '+1' }, // &&
        { line: 5, column: 38, endLine: 5, endColumn: 40, message: '+1' }, // ||
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
        { line: 5, column: 25, endLine: 5, endColumn: 27, message: '+1' }, // &&
        { line: 5, column: 40, endLine: 5, endColumn: 41, message: '+1' }, // ||
      ],
    ),
  ],
});

ruleTester.run(`${RULE_NAME} 15`, rule as any, {
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
          messageId: 'refactorFunction',
          data: {
            complexityAmount: 21,
            threshold: 15,
          },
        },
      ],
    },
  ],
});

ruleTester.run('file-cognitive-complexity', rule as any, {
  valid: [],
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
      options: [0, 'metric'],
      errors: [{ messageId: 'fileComplexity', data: { complexityAmount: 25 } }],
    },
  ],
});

function testCaseWithVinicuncaRuntime(
  code: string,
  secondaryLocations: IssueLocation[],
  complexity?: number,
): TSESLint.InvalidTestCase<string, (number | 'vinicunca-runtime')[]> {
  const cost = complexity ?? secondaryLocations.length;
  const message = `Refactor this function to reduce its Cognitive Complexity from ${cost} to the 0 allowed.`;
  const vinicuncaRuntimeData = JSON.stringify({ secondaryLocations, message, cost });
  return {
    code,
    parserOptions: { ecmaFeatures: { jsx: true } },
    options: [0, 'vinicunca-runtime'],
    errors: [
      {
        messageId: 'vinicuncaRuntime',
        data: {
          threshold: 0,
          vinicuncaRuntimeData,
        },
      },
    ],
  };
}

function message(complexityAmount: number, other: Partial<TSESLint.TestCaseError<string>> = {}) {
  return {
    messageId: 'refactorFunction',
    data: { complexityAmount, threshold: 0 },
    ...other,
  };
}
