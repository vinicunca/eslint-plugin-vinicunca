import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './no-empty-collection';

ruleTester.run(RULE_NAME, rule as any, {
  invalid: [
    {
      code: `const array : number[] = [];
              export function testElementAccessRead() {
                console.log(array[2]);
              }`,
      errors: [
        {
          column: 29,
          data: {
            identifierName: 'array',
          },
          endColumn: 34,
          endLine: 3,
          line: 3,
          messageId: 'reviewUsageOfIdentifier',
        },
      ],
    },
  ],
  valid: [
  ],
});
