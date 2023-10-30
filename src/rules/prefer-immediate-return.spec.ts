import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './prefer-immediate-return';

ruleTester.run(RULE_NAME, rule as any, {
  invalid: [
    {
      code: `
        function var_returned() {
          var x = 42;
          return x;
        }`,
      errors: [
        {
          column: 19,
          data: {
            action: 'return',
            variable: 'x',
          },
          endColumn: 21,
          line: 3,
          messageId: 'doImmediateAction',
        },
      ],
      output: `
        function var_returned() {
          return 42;
        }`,
    },
    {
      code: `
        function let_returned() {
          let x = 42;
          return x;
        }
      `,
      errors: [
        {
          column: 19,
          data: {
            action: 'return',
            variable: 'x',
          },
          endColumn: 21,
          line: 3,
          messageId: 'doImmediateAction',
        },
      ],
      output: `
        function let_returned() {
          return 42;
        }
      `,
    },
    {
      code: `
        function const_returned() {
          const x = 42;
          return x;
        }
      `,
      errors: [
        {
          column: 21,
          data: {
            action: 'return',
            variable: 'x',
          },
          endColumn: 23,
          line: 3,
          messageId: 'doImmediateAction',
        },
      ],
      output: `
        function const_returned() {
          return 42;
        }
      `,
    },
    {
      code: `
        function code_before_declaration() {
          foo();
          var x = 42;
          return x;
        }
      `,
      errors: [
        {
          column: 19,
          data: {
            action: 'return',
            variable: 'x',
          },
          endColumn: 21,
          line: 4,
          messageId: 'doImmediateAction',
        },
      ],
      output: `
        function code_before_declaration() {
          foo();
          return 42;
        }
      `,
    },
    {
      code: `
        function thrown_nok() {
          const x = new Error();
          throw x;
        }`,
      errors: [
        {
          column: 21,
          data: {
            action: 'throw',
            variable: 'x',
          },
          endColumn: 32,
          line: 3,
          messageId: 'doImmediateAction',
        },
      ],
      output: `
        function thrown_nok() {
          throw new Error();
        }`,
    },
    {
      code: `
        function different_blocks() {
          if (foo) {
            let x = foo();
            return x;
          }

          try {
            let x = foo();
            return x;
          } catch (e) {
            let x = foo();
            return x;
          } finally {
            let x = foo();
            return x;
          }
        }
      `,
      errors: [
        {
          column: 21,
          data: {
            action: 'return',
            variable: 'x',
          },
          endColumn: 26,
          line: 4,
          messageId: 'doImmediateAction',
        },
        {
          column: 21,
          data: {
            action: 'return',
            variable: 'x',
          },
          endColumn: 26,
          line: 9,
          messageId: 'doImmediateAction',
        },
        {
          column: 21,
          data: {
            action: 'return',
            variable: 'x',
          },
          endColumn: 26,
          line: 12,
          messageId: 'doImmediateAction',
        },
        {
          column: 21,
          data: {
            action: 'return',
            variable: 'x',
          },
          endColumn: 26,
          line: 15,
          messageId: 'doImmediateAction',
        },
      ],
      output: `
        function different_blocks() {
          if (foo) {
            return foo();
          }

          try {
            return foo();
          } catch (e) {
            return foo();
          } finally {
            return foo();
          }
        }
      `,
    },
    {
      code: `
        function two_declarations(a) {
          if (a) {
            let x = foo();
            return x;
          } else {
            let x = bar();
            return x + 42;
          }
        }
      `,
      errors: [
        {
          column: 21,
          data: {
            action: 'return',
            variable: 'x',
          },
          endColumn: 26,
          line: 4,
          messageId: 'doImmediateAction',
        },
      ],
      output: `
        function two_declarations(a) {
          if (a) {
            return foo();
          } else {
            let x = bar();
            return x + 42;
          }
        }
      `,
    },
    {
      code: `
        function homonymous_is_used() {
          const bar = {
            doSomethingElse(p) {
              var bar = 2;
              return p + bar;
            },
            doSomething() {
              return this.doSomethingElse(1);
            },
          };
          return bar;
        }
      `,
      errors: [
        {
          column: 23,
          data: {
            action: 'return',
            variable: 'bar',
          },
          endColumn: 12,
          endLine: 11,
          line: 3,
          messageId: 'doImmediateAction',
        },
      ],
      output: `
        function homonymous_is_used() {
          return {
            doSomethingElse(p) {
              var bar = 2;
              return p + bar;
            },
            doSomething() {
              return this.doSomethingElse(1);
            },
          };
        }
      `,
    },
    {
      code: `
        function inside_switch(x) {
          switch (x) {
            case 1:
              const y = 3;
              return y;
            default:
              const z = 2;
              return z;
          }
        }
      `,
      errors: [
        {
          column: 25,
          data: {
            action: 'return',
            variable: 'y',
          },
          endColumn: 26,
          line: 5,
          messageId: 'doImmediateAction',
        },
        {
          column: 25,
          data: {
            action: 'return',
            variable: 'z',
          },
          endColumn: 26,
          line: 8,
          messageId: 'doImmediateAction',
        },
      ],
      output: `
        function inside_switch(x) {
          switch (x) {
            case 1:
              return 3;
            default:
              return 2;
          }
        }
      `,
    },
    {
      code: `
        function var_returned() {
          var x = 42;
          return x
        }`,
      errors: [
        {
          column: 19,
          data: {
            action: 'return',
            variable: 'x',
          },
          endColumn: 21,
          line: 3,
          messageId: 'doImmediateAction',
        },
      ],
      output: `
        function var_returned() {
          return 42
        }`,
    },
    {
      // hoisted variables
      code: `
      function foo() {
        if (cond) {
          var x = 42;
          return x;
      }
      }
      `,
      errors: [
        {
          data: {
            action: 'return',
            variable: 'x',
          },
          messageId: 'doImmediateAction',
        },
      ],
      output: `
      function foo() {
        if (cond) {
          return 42;
      }
      }
      `,
    },
    {
      code: `
        function var_returned() {
          // comment1
          var x /* commentInTheMiddle1 */ = 42; // commentOnTheLine1
          // comment2
          return /* commentInTheMiddle2 */ x;   // commentOnTheLine2
          // comment3
        }`,
      errors: [
        {
          column: 45,
          data: {
            action: 'return',
            variable: 'x',
          },
          endColumn: 47,
          line: 4,
          messageId: 'doImmediateAction',
        },
      ],
      output: `
        function var_returned() {
          // comment1
          // commentOnTheLine1
          // comment2
          return /* commentInTheMiddle2 */ 42;   // commentOnTheLine2
          // comment3
        }`,
    },
  ],
  valid: [
    {
      code: `
        function thrown_ok() {
          throw new Error();
        }
      `,
    },
    {
      code: `
        function thrown_expression() {
          const x = new Error();
          throw foo(x);
        }
      `,
    },
    {
      code: `
        function thrown_different_variable(y) {
          const x = new Error();
          throw y;
        }
      `,
    },
    {
      code: `
        function code_between_declaration_and_return() {
          let x = 42;
          foo();
          return x;
        }
      `,
    },
    {
      code: `
        function return_expression() {
          let x = 42;
          return x + 5;
        }
      `,
    },
    {
      code: `
        function return_without_value() {
          let x = 42;
          return;
        }
      `,
    },
    {
      code: `
        function not_return_statement() {
          let x = 42;
          foo(x);
        }
      `,
    },
    {
      code: `
        function no_init_value() {
          let x;
          return x;
        }
      `,
    },
    {
      code: `
        function pattern_declared() {
          let { x } = foo();
          return x;
        }
      `,
    },
    {
      code: `
        function two_variables_declared() {
          let x = 42,
            y;
          return x;
        }
      `,
    },
    {
      code: `
        function different_variable_returned(y) {
          let x = 42;
          return y;
        }
      `,
    },
    {
      code: `
        function only_return() {
          return 42;
        }
      `,
    },
    {
      code: `
        function one_statement() {
          foo();
        }
      `,
    },
    {
      code: `
        function empty_block() {}
      `,
    },
    {
      code: `
        let arrow_function_ok = (a, b) => {
          return a + b;
        };
      `,
    },
    {
      code: `
        let arrow_function_no_block = (a, b) => a + b;
      `,
    },
    {
      code: `
        function variable_has_type_annotation() {
          let foo: number = 1;
          return foo;
        }
      `,
    },
    {
      code: `
        function variable_is_used() {
          var bar = {
            doSomethingElse(p) {},
            doSomething() {
              bar.doSomethingElse(1);
            },
          };
          return bar;
        }
      `,
    },
  ],
});
