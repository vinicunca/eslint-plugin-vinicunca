import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './import-dedupe';

const valids = [
  'import { a } from \'foo\'',
];
const invalids = [
  [
    'import { a, b, a, a, c, a } from \'foo\'',
    'import { a, b,   c,  } from \'foo\'',
  ],
];

ruleTester.run(RULE_NAME, rule as any, {
  invalid: invalids.map((i) => ({
    code: i[0],
    errors: [{ messageId: 'importDedupe' }, { messageId: 'importDedupe' }, { messageId: 'importDedupe' }],
    output: i[1],
  })),
  valid: valids,
});
