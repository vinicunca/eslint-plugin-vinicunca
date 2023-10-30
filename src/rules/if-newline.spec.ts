import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './if-newline';

const valids = [
  `if (true)
  console.log('hello')
`,
  `if (true) {
  console.log('hello')
}`,
];
const invalids = [
  ['if (true) console.log(\'hello\')', 'if (true) \nconsole.log(\'hello\')'],
];

ruleTester.run(RULE_NAME, rule as any, {
  invalid: invalids.map((i) => ({
    code: i[0],
    errors: [{ messageId: 'missingIfNewline' }],
    output: i[1],
  })),
  valid: valids,
});
