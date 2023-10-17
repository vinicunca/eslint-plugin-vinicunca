import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './prefer-single-boolean-return';

ruleTester.run(RULE_NAME, rule as any, {
  valid: [
    {
      code: `
        function foo() {
          if (something) {
            return true;
          } else if (something) {
            return false;
          } else {
            return true;
          }
        }
      `,
    },
    {
      code: `
        function foo() {
          if (something) {
            return x;
          } else {
            return false;
          }
        }
      `,
    },
    {
      code: `
        function foo(y) {
          if (something) {
            return true;
          } else {
            return foo;
          }
        }
      `,
    },
    {
      code: `
        function foo() {
          if (something) {
            doSomething();
          } else {
            return true;
          }
        }
      `,
    },
    {
      code: `
        function foo() {
          if (something) {
            doSomething();
            return true;
          } else {
            return false;
          }
        }
      `,
    },
    {
      code: `
        function foo() {
          if (something) {
            return;
          } else {
            return true;
          }
        }
      `,
    },
    {
      code: `
        function foo() {
          if (something) {
            return true;
          }
        }
      `,
    },
    {
      code: `
        function foo() {
          if (something) {
            return foo(true);
          } else {
            return foo(false);
          }
        }
      `,
    },
    {
      code: `
        function foo() {
          if (something) {
            var x;
          } else {
            return false;
          }
        }
      `,
    },
    {
      code: `
        function foo() {
          if (something) {
            function f() {}
            return false;
          } else {
            return true;
          }
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        function foo() {
          if (something) {
            return true;
          } else {
            return false;
          }

          if (something) {
            return false;
          } else {
            return true;
          }

          if (something) return true;
          else return false;

          if (something) {
            return true;
          } else {
            return true;
          }
        }
      `,
      errors: [
        {
          messageId: 'replaceIfThenElseByReturn',
          line: 3,
          column: 11,
          endLine: 7,
          endColumn: 12,
        },
        { messageId: 'replaceIfThenElseByReturn', line: 9, column: 11, endLine: 13, endColumn: 12 },
        {
          messageId: 'replaceIfThenElseByReturn',
          line: 15,
          column: 11,
          endLine: 16,
          endColumn: 29,
        },
        {
          messageId: 'replaceIfThenElseByReturn',
          line: 18,
          column: 11,
          endLine: 22,
          endColumn: 12,
        },
      ],
    },
    {
      code: `
        function fn() {
          if (foo) {
            if (something) {
              return true
            }
            return false
          }

          if (bar) {
            if (something) {
              return false
            }
            return true
          }

          if (baz) {
            if (something) {
              return false
            }
          }
        }
      `,
      errors: [
        {
          messageId: 'replaceIfThenElseByReturn',
          line: 4,
          column: 13,
          endLine: 6,
          endColumn: 14,
        },
        {
          messageId: 'replaceIfThenElseByReturn',
          line: 11,
          column: 13,
          endLine: 13,
          endColumn: 14,
        },
      ],
    },
    {
      code: `
function foo() {
  if (bar()) {
    if (baz()) {
      return true;
    } else {
      return false;
    }
  }
  return qux();
}`,
      errors: [
        {
          messageId: 'replaceIfThenElseByReturn',
          suggestions: [
            {
              messageId: 'suggestCast',
              output: `
function foo() {
  if (bar()) {
    return !!(baz());
  }
  return qux();
}`,
            },
            {
              messageId: 'suggestBoolean',
              output: `
function foo() {
  if (bar()) {
    return baz();
  }
  return qux();
}`,
            },
          ],
        },
      ],
    },
    {
      code: `
function foo() {
  if (bar()) {
    if (baz()) {
      return true;
    }
    return false;
  }
  return qux();
}`,
      errors: [
        {
          messageId: 'replaceIfThenElseByReturn',
          suggestions: [
            {
              messageId: 'suggestCast',
              output: `
function foo() {
  if (bar()) {
    return !!(baz());
  }
  return qux();
}`,
            },
            {
              messageId: 'suggestBoolean',
              output: `
function foo() {
  if (bar()) {
    return baz();
  }
  return qux();
}`,
            },
          ],
        },
      ],
    },
    {
      code: `
function foo() {
  if (!bar()) {
    return true;
  } else {
    return false;
  }
}`,
      errors: [
        {
          messageId: 'replaceIfThenElseByReturn',
          suggestions: [
            {
              messageId: 'suggest',
              output: `
function foo() {
  return !bar();
}`,
            },
          ],
        },
      ],
    },
    {
      code: `
function foo() {
  if (bar() > 0) {
    return true;
  } else {
    return false;
  }
}`,
      errors: [
        {
          messageId: 'replaceIfThenElseByReturn',
          suggestions: [
            {
              messageId: 'suggest',
              output: `
function foo() {
  return bar() > 0;
}`,
            },
          ],
        },
      ],
    },
    {
      code: `
function foo() {
  if (baz() > 0) {
    return false;
  } else {
    return true;
  }
}`,
      errors: [
        {
          messageId: 'replaceIfThenElseByReturn',
          suggestions: [
            {
              messageId: 'suggest',
              output: `
function foo() {
  return !(baz() > 0);
}`,
            },
          ],
        },
      ],
    },
    {
      code: `
function foo() {
  if (baz()) {
    return false;
  } else {
    return true;
  }
}`,
      errors: [
        {
          messageId: 'replaceIfThenElseByReturn',
          suggestions: [
            {
              messageId: 'suggest',
              output: `
function foo() {
  return !(baz());
}`,
            },
          ],
        },
      ],
    },
  ],
});
