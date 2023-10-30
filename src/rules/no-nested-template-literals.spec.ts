/* eslint-disable no-template-curly-in-string */
import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './no-nested-template-literals';

ruleTester.run(RULE_NAME, rule as any, {
  invalid: [
    {
      code: 'let message = `I have ${color ? `${x ? `indeed 0` : count} ${color}` : count} apples`;',
      errors: [
        {
          column: 33,
          endColumn: 69,
          endLine: 1,
          line: 1,
          messageId: 'nestedTemplateLiterals',
        },
        {
          column: 40,
          endColumn: 50,
          endLine: 1,
          line: 1,
          messageId: 'nestedTemplateLiterals',
        },
      ],
    },
    {
      code: 'let message = `I have ${color ? `${count} ${color}` : count} apples`;',
      errors: [
        {
          column: 33,
          endColumn: 52,
          endLine: 1,
          line: 1,
          messageId: 'nestedTemplateLiterals',
        },
      ],
    },
    {
      code: 'let message = `I have ${color ? `${x ? `indeed ${0}` : count} ${color}` : count} apples`;',
      errors: [
        {
          column: 33,
          endColumn: 72,
          endLine: 1,
          line: 1,
          messageId: 'nestedTemplateLiterals',
        },
        {
          column: 40,
          endColumn: 53,
          endLine: 1,
          line: 1,
          messageId: 'nestedTemplateLiterals',
        },
      ],
    },
    {
      code:
        'function tag(strings, ...keys) {console.log(strings[2]);}\n'
        + 'let message1 = tag`I have ${color ? `${count} ${color}` : count} apples`;\n'
        + 'let message2 = tag`I have ${color ? tag`${count} ${color}` : count} apples`;',
      errors: [
        {
          column: 37,
          endColumn: 56,
          endLine: 2,
          line: 2,
          messageId: 'nestedTemplateLiterals',
        },
        {
          column: 40,
          endColumn: 59,
          endLine: 3,
          line: 3,
          messageId: 'nestedTemplateLiterals',
        },
      ],
    },
    {
      code: 'let message = `I have ${color ? `${count} ${color}` : `this is ${count}`} apples`;',
      errors: [
        {
          column: 33,
          endColumn: 52,
          endLine: 1,
          line: 1,
          messageId: 'nestedTemplateLiterals',
        },
        {
          column: 55,
          endColumn: 73,
          endLine: 1,
          line: 1,
          messageId: 'nestedTemplateLiterals',
        },
      ],
    },
    {
      code: 'let message = `I have ${`${count} ${color}`} ${`this is ${count}`} apples`;',
      errors: [
        {
          column: 25,
          endColumn: 44,
          endLine: 1,
          line: 1,
          messageId: 'nestedTemplateLiterals',
        },
        {
          column: 48,
          endColumn: 66,
          endLine: 1,
          line: 1,
          messageId: 'nestedTemplateLiterals',
        },
      ],
    },
    {
      code: 'let message = `I have \n${color ? `${count} ${color}` : count} apples`;',
      errors: [{ messageId: 'nestedTemplateLiterals' }],
    },
  ],
  valid: [
    {
      code: 'let nestedMessage = `${count} ${color}`;',
    },
    {
      code: 'let message = `I have ${color ? nestedMessage : count} apples`;',
    },
    { code: 'let message = `I have \n${color ? `${count} ${color}` : count} \napples`;' },
  ],
});
