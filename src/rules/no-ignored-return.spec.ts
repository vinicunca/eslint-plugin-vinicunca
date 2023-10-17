import path from 'node:path';

import { RuleTester } from '../../vendor/rule-tester/src/RuleTester';
import rule, { RULE_NAME } from './no-ignored-return';

const filename = path.resolve(__dirname, '..', 'tests', 'resources', 'file.ts');
const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    project: path.resolve(__dirname, '..', 'tests', 'resources', 'tsconfig.json'),
  },
});

ruleTester.run(RULE_NAME, rule as any, {
  valid: [
    {
      filename,
      code: `
      function returnIsNotIgnored() {
        var x = "abc".concat("bcd");

        if ([1, 2, 3].lastIndexOf(42)) {
          return true;
        }
      }`,
    },
    {
      filename,
      code: `
      function noSupportForUserTypes() {
        class A {
          methodWithoutSideEffect() {
            return 42;
          }
        }

        (new A()).methodWithoutSideEffect(); // OK
      }`,
    },
    {
      filename,
      code: `
      function unknownType(x: any) {
        x.foo();
      }`,
    },
    {
      filename,
      code: `
      function computedPropertyOnDestructuring(source: any, property: string) { // OK, used as computed property name
        const { [property]: _, ...rest } = source;
        return rest;
      }`,
    },
    {
      filename,
      code: `
      // "some" and "every" are sometimes used to provide early termination for loops
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
      [1, 2, 3].some(function(el) {
        return el === 2;
      });

      [1,2,3].every(function(el) {
        return ! el !== 2;
      });
            `,
    },
    {
      filename,
      code: `
      function methodsOnString() {
        // "replace" with callback is OK
        "abc".replace(/ab/, () => "");
        "abc".replace(/ab/, function() {return ""});
      }`,
    },
    {
      filename,
      code: `
      function myCallBack() {}
      function methodsOnString() {
        // "replace" with callback is OK
        "abc".replace(/ab/, myCallBack);
      }`,
    },
  ],
  invalid: [
    {
      filename,
      code: `
      function methodsOnMath() {
        let x = -42;
        Math.abs(x);
      }`,
      errors: [
        {
          messageId: 'returnValueMustBeUsed',
          data: { methodName: 'abs' },
          line: 4,
          endLine: 4,
          column: 9,
          endColumn: 20,
        },
      ],
    },
    {
      filename,
      code: `
      function mapOnArray() {
        let arr = [1, 2, 3];
        arr.map(function(x){ });
      }`,
      errors: [
        {
          messageId: 'useForEach',
        },
      ],
    },
    {
      filename,
      code: `
      function methodsOnArray(arr1: any[]) {
        let arr = [1, 2, 3];

        arr.slice(0, 2);

        arr1.join(",");
      }`,
      errors: [
        {
          messageId: 'returnValueMustBeUsed',
          data: { methodName: 'slice' },
          line: 5,
          column: 9,
          endLine: 5,
          endColumn: 24,
        },
        {
          messageId: 'returnValueMustBeUsed',
          data: { methodName: 'join' },
          line: 7,
          column: 9,
          endLine: 7,
          endColumn: 23,
        },
      ],
    },
    {
      filename,
      code: `
      function methodsOnString() {
        let x = "abc";
        x.concat("abc");
        "abc".concat("bcd");
        "abc".concat("bcd").charCodeAt(2);
        "abc".replace(/ab/, "d");
      }`,
      errors: [
        {
          messageId: 'returnValueMustBeUsed',
          data: { methodName: 'concat' },
          line: 4,
          column: 9,
          endLine: 4,
          endColumn: 24,
        },
        {
          messageId: 'returnValueMustBeUsed',
          data: { methodName: 'concat' },
          line: 5,
          column: 9,
          endLine: 5,
          endColumn: 28,
        },
        {
          messageId: 'returnValueMustBeUsed',
          data: { methodName: 'charCodeAt' },
          line: 6,
          column: 9,
          endLine: 6,
          endColumn: 42,
        },
        {
          messageId: 'returnValueMustBeUsed',
          data: { methodName: 'replace' },
          line: 7,
          column: 9,
          endLine: 7,
          endColumn: 33,
        },
      ],
    },
    {
      filename,
      code: `
      function methodsOnNumbers() {
        var num = 43 * 53;
        num.toExponential();
      }`,
      errors: [
        {
          messageId: 'returnValueMustBeUsed',
          data: { methodName: 'toExponential' },
          line: 4,
          column: 9,
          endLine: 4,
          endColumn: 28,
        },
      ],
    },
    {
      filename,
      code: `
      function methodsOnRegexp() {
        var regexp = /abc/;
        regexp.test("my string");
      }`,
      errors: [
        {
          messageId: 'returnValueMustBeUsed',
          data: { methodName: 'test' },
          line: 4,
          column: 9,
          endLine: 4,
          endColumn: 33,
        },
      ],
    },
  ],
});
