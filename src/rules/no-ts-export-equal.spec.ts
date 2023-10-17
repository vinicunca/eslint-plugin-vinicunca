import { ruleTester } from '../rule-tester';
import rule, { RULE_NAME } from './no-ts-export-equal';

const valids = [
  { code: 'export default {}', filename: 'test.ts' },
  { code: 'export = {}', filename: 'test.js' },
];

const invalids = [
  { code: 'export = {}', filename: 'test.ts' },
];

ruleTester.run(RULE_NAME, rule as any, {
  valid: valids,
  invalid: invalids.map((i) => ({
    ...i,
    errors: [{ messageId: 'noTsExportEqual' }],
  })),
});
