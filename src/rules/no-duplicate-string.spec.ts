import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './no-duplicate-string';

ruleTester.run(RULE_NAME, rule as any, {
  invalid: [
    {
      code: `
    console.log("some message");
    console.log("some message");
    console.log('some message');`,
      errors: [
        {
          column: 17,
          data: {
            times: 3,
          },
          endColumn: 31,
          messageId: 'defineConstant',
        },
      ],
    },
    {
      code: `
    console.log("some message");
    console.log('some message');`,
      errors: [
        {
          column: 17,
          data: {
            vinicuncaRuntimeData: JSON.stringify({
              message: 'Define a constant instead of duplicating this literal 2 times.',
              secondaryLocations: [
                {
                  column: 16,
                  endColumn: 30,
                  endLine: 3,
                  line: 3,
                  message: 'Duplication',
                },
              ],
            }),
          },
          endColumn: 31,
          endLine: 2,
          line: 2,
          messageId: 'vinicuncaRuntime',
        },
      ],
      options: [{ threshold: 2 }, 'vinicunca-runtime'],
    },
    {
      code: `
    <Foo bar="some string"></Foo>;
    <Foo bar="some string"></Foo>;
    <Foo bar="some string"></Foo>;
    let x = "some-string", y = "some-string", z = "some-string";
      `,
      errors: [
        {
          data: {
            times: 3,
          },
          line: 5,
          messageId: 'defineConstant',
        },
      ],
    },
    {
      code: `
    console.log("some message");
    console.log('some message');`,
      errors: [
        {
          data: {
            times: 2,
          },
          line: 2,
          messageId: 'defineConstant',
        },
      ],
      options: [{ threshold: 2 }],
    },
    {
      code: `
    const obj1 = {
      key: "some message"
    };
    const obj2 = {
      key: "some message"
    };
    const obj3 = {
      key: "some message"
    };`,
      errors: [
        {
          data: {
            times: 3,
          },
          line: 3,
          messageId: 'defineConstant',
        },
      ],
    },
  ],
  valid: [
    {
      code: `
    console.log("some message");
    console.log("some message");
    console.log('some message');`,
      options: [{ threshold: 4 }],
    },
    {
      code: ` // too small
    console.log("a&b");
    console.log("a&b");
    console.log("a&b");`,
    },
    {
      code: ` // too small
    console.log("a&b");
    console.log("a&b");
    console.log("a&b");`,
    },
    {
      code: ` // too small when trimmed
    // trimming allows to not raise issue for flowtype whitespaces
    // which are created as literals for some reason
    console.log("           a            ");
    console.log("           a            ");
    console.log("           a            ");`,
    },
    {
      code: ` // numbers
    console.log(12345.67890);
    console.log(12345.67890);
    console.log(12345.67890);`,
    },
    {
      code: `
    console.log("only 2 times");
    console.log("only 2 times");`,
    },
    {
      code: `// no separators
    console.log("stringstring");
    console.log("stringstring");
    console.log("stringstring");
    console.log("stringstring");`,
    },
    {
      code: `// ImportDeclaration
    import defaultExport1 from "module-name-long";
    import defaultExport2 from "module-name-long";
    import defaultExport3 from "module-name-long";
      `,
    },
    {
      code: ` // ImportDeclaration
    import * as name1 from "module-name-long";
    import * as name2 from "module-name-long";
    import * as name3 from "module-name-long";
      `,
    },
    {
      code: ` // ImportDeclaration
    import "module-name-long";
    import "module-name-long";
    import "module-name-long";
      `,
    },
    {
      code: ` // ImportExpression
    import("module-name-long");
    import("module-name-long");
    import("module-name-long");
      `,
    },
    {
      code: `// ExportAllDeclaration
    export * from "module-name-long";
    export * from "module-name-long";
    export * from "module-name-long";
      `,
    },
    {
      code: `// CallExpression 'require'
    const a = require("module-name-long").a;
    const b = require("module-name-long").b;
    const c = require("module-name-long").c;
      `,
    },
    {
      code: `// ExportNamedDeclaration
    export { a } from "module-name-long";
    export { b } from "module-name-long";
    export { c } from "module-name-long";
      `,
    },
    {
      code: ` // JSXAttribute
    <Foo bar="some string"></Foo>;
    <Foo bar="some string"></Foo>;
    <Foo bar="some string"></Foo>;
    <Foo className="some-string"></Foo>;
      `,
    },
    {
      code: `
    console.log(\`some message\`);
    console.log('some message');
    console.log("some message");`,
    },
    {
      code: `
    const obj1 = {
      "some property": 1
    };
    const obj2 = {
      "some property": 1
    };
    const obj3 = {
      "some property": 1
    };`,
    },
    {
      code: `
      'use strict';
      'use strict';
      'use strict';
      `,
    },
    {
      code: `
      let x: 'Hello world';
      function foo(arg: 'Hello world'): 'Hello world' {
        return 'Hello world';
      }
      `,
    },
    {
      code: `
      'application/json';
      'application/json';
      'application/json';;
      `,
    },
    {
      code: `
      console.log('Hello world!');
      console.log('Hello world!');
      console.log('Hello world!');
      `,
      options: [{ ignoreStrings: 'Hello world!', threshold: 2 }, 'vinicunca-runtime'],
    },
  ],
});
