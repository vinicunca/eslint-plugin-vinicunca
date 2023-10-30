import { RuleTester } from '@typescript-eslint/rule-tester';
import path from 'node:path';

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
  invalid: [
    {
      code: `
      function methodsOnMath() {
        let x = -42;
        Math.abs(x);
      }`,
      errors: [
        {
          column: 9,
          data: { methodName: 'abs' },
          endColumn: 20,
          endLine: 4,
          line: 4,
          messageId: 'returnValueMustBeUsed',
        },
      ],
      filename,
    },
    {
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
      filename,
    },
    {
      code: `
      function methodsOnArray(arr1: any[]) {
        let arr = [1, 2, 3];

        arr.slice(0, 2);

        arr1.join(",");
      }`,
      errors: [
        {
          column: 9,
          data: { methodName: 'slice' },
          endColumn: 24,
          endLine: 5,
          line: 5,
          messageId: 'returnValueMustBeUsed',
        },
        {
          column: 9,
          data: { methodName: 'join' },
          endColumn: 23,
          endLine: 7,
          line: 7,
          messageId: 'returnValueMustBeUsed',
        },
      ],
      filename,
    },
    {
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
          column: 9,
          data: { methodName: 'concat' },
          endColumn: 24,
          endLine: 4,
          line: 4,
          messageId: 'returnValueMustBeUsed',
        },
        {
          column: 9,
          data: { methodName: 'concat' },
          endColumn: 28,
          endLine: 5,
          line: 5,
          messageId: 'returnValueMustBeUsed',
        },
        {
          column: 9,
          data: { methodName: 'charCodeAt' },
          endColumn: 42,
          endLine: 6,
          line: 6,
          messageId: 'returnValueMustBeUsed',
        },
        {
          column: 9,
          data: { methodName: 'replace' },
          endColumn: 33,
          endLine: 7,
          line: 7,
          messageId: 'returnValueMustBeUsed',
        },
      ],
      filename,
    },
    {
      code: `
      function methodsOnNumbers() {
        var num = 43 * 53;
        num.toExponential();
      }`,
      errors: [
        {
          column: 9,
          data: { methodName: 'toExponential' },
          endColumn: 28,
          endLine: 4,
          line: 4,
          messageId: 'returnValueMustBeUsed',
        },
      ],
      filename,
    },
    {
      code: `
      function methodsOnRegexp() {
        var regexp = /abc/;
        regexp.test("my string");
      }`,
      errors: [
        {
          column: 9,
          data: { methodName: 'test' },
          endColumn: 33,
          endLine: 4,
          line: 4,
          messageId: 'returnValueMustBeUsed',
        },
      ],
      filename,
    },
  ],
  valid: [
    {
      code: `
      function returnIsNotIgnored() {
        var x = "abc".concat("bcd");

        if ([1, 2, 3].lastIndexOf(42)) {
          return true;
        }
      }`,
      filename,
    },
    {
      code: `
      function noSupportForUserTypes() {
        class A {
          methodWithoutSideEffect() {
            return 42;
          }
        }

        (new A()).methodWithoutSideEffect(); // OK
      }`,
      filename,
    },
    {
      code: `
      function unknownType(x: any) {
        x.foo();
      }`,
      filename,
    },
    {
      code: `
      function computedPropertyOnDestructuring(source: any, property: string) { // OK, used as computed property name
        const { [property]: _, ...rest } = source;
        return rest;
      }`,
      filename,
    },
    {
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
      filename,
    },
    {
      code: `
      function methodsOnString() {
        // "replace" with callback is OK
        "abc".replace(/ab/, () => "");
        "abc".replace(/ab/, function() {return ""});
      }`,
      filename,
    },
    {
      code: `
      function myCallBack() {}
      function methodsOnString() {
        // "replace" with callback is OK
        "abc".replace(/ab/, myCallBack);
      }`,
      filename,
    },
  ],
});
