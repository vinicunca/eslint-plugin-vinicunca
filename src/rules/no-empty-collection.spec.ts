import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './no-empty-collection';

ruleTester.run(RULE_NAME, rule as any, {
  valid: [
  ],
  invalid: [
    {
      code: `const array : number[] = [];
              export function testElementAccessRead() {
                console.log(array[2]);
              }`,
      errors: [
        {
          messageId: 'reviewUsageOfIdentifier',
          data: {
            identifierName: 'array',
          },
          line: 3,
          endLine: 3,
          column: 29,
          endColumn: 34,
        },
      ],
    },
  ],
});
