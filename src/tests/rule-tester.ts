import { RuleTester } from '../../vendor/rule-tester/src/RuleTester';

export const ruleTester: RuleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});
