import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './no-cjs-exports';

const valids = [
  { code: 'export = {}', filename: 'test.ts' },
  { code: 'exports.a = {}', filename: 'test.js' },
  { code: 'module.exports.a = {}', filename: 'test.js' },
];

const invalids = [
  { code: 'exports.a = {}', filename: 'test.ts' },
  { code: 'module.exports.a = {}', filename: 'test.ts' },
];

ruleTester.run(RULE_NAME, rule as any, {
  valid: valids,
  invalid: invalids.map((i) => ({
    ...i,
    errors: [{ messageId: 'noCjsExports' }],
  })),
});
