import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './prefer-inline-type-import';

const valids = [
  'import { type Foo } from \'foo\'',
  'import type Foo from \'foo\'',
  'import type * as Foo from \'foo\'',
  'import type {} from \'foo\'',
];
const invalids = [
  ['import type { Foo } from \'foo\'', 'import { type Foo } from \'foo\''],
];

ruleTester.run(RULE_NAME, rule as any, {
  invalid: invalids.map((i) => ({
    code: i[0],
    errors: [{ messageId: 'preferInlineTypeImport' }],
    output: i[1].trim(),
  })),
  valid: valids,
});
