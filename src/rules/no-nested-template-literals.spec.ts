/* eslint-disable no-template-curly-in-string */
import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './no-nested-template-literals';

ruleTester.run(RULE_NAME, rule as any, {
  valid: [
    {
      code: 'let nestedMessage = `${count} ${color}`;',
    },
    {
      code: 'let message = `I have ${color ? nestedMessage : count} apples`;',
    },
    { code: 'let message = `I have \n${color ? `${count} ${color}` : count} \napples`;' },
  ],
  invalid: [
    {
      code: 'let message = `I have ${color ? `${x ? `indeed 0` : count} ${color}` : count} apples`;',
      errors: [
        {
          messageId: 'nestedTemplateLiterals',
          line: 1,
          endLine: 1,
          column: 33,
          endColumn: 69,
        },
        {
          messageId: 'nestedTemplateLiterals',
          line: 1,
          endLine: 1,
          column: 40,
          endColumn: 50,
        },
      ],
    },
    {
      code: 'let message = `I have ${color ? `${count} ${color}` : count} apples`;',
      errors: [
        {
          messageId: 'nestedTemplateLiterals',
          line: 1,
          endLine: 1,
          column: 33,
          endColumn: 52,
        },
      ],
    },
    {
      code: 'let message = `I have ${color ? `${x ? `indeed ${0}` : count} ${color}` : count} apples`;',
      errors: [
        {
          messageId: 'nestedTemplateLiterals',
          line: 1,
          endLine: 1,
          column: 33,
          endColumn: 72,
        },
        {
          messageId: 'nestedTemplateLiterals',
          line: 1,
          endLine: 1,
          column: 40,
          endColumn: 53,
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
          messageId: 'nestedTemplateLiterals',
          line: 2,
          endLine: 2,
          column: 37,
          endColumn: 56,
        },
        {
          messageId: 'nestedTemplateLiterals',
          line: 3,
          endLine: 3,
          column: 40,
          endColumn: 59,
        },
      ],
    },
    {
      code: 'let message = `I have ${color ? `${count} ${color}` : `this is ${count}`} apples`;',
      errors: [
        {
          messageId: 'nestedTemplateLiterals',
          line: 1,
          endLine: 1,
          column: 33,
          endColumn: 52,
        },
        {
          messageId: 'nestedTemplateLiterals',
          line: 1,
          endLine: 1,
          column: 55,
          endColumn: 73,
        },
      ],
    },
    {
      code: 'let message = `I have ${`${count} ${color}`} ${`this is ${count}`} apples`;',
      errors: [
        {
          messageId: 'nestedTemplateLiterals',
          line: 1,
          endLine: 1,
          column: 25,
          endColumn: 44,
        },
        {
          messageId: 'nestedTemplateLiterals',
          line: 1,
          endLine: 1,
          column: 48,
          endColumn: 66,
        },
      ],
    },
    {
      code: 'let message = `I have \n${color ? `${count} ${color}` : count} apples`;',
      errors: [{ messageId: 'nestedTemplateLiterals' }],
    },
  ],
});
