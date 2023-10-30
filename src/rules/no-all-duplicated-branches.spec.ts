import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './no-all-duplicated-branches';

ruleTester.run(`${RULE_NAME} if`, rule as any, {
  invalid: [
    {
      code: 'if (a) { first(); } else { first(); }',
      errors: [
        {
          column: 1,
          endColumn: 38,
          line: 1,
          messageId: 'removeOrEditConditionalStructure',
        },
      ],
    },
    {
      code: 'if (a) { first(); } else if (b) { first(); } else { first(); }',
      errors: [
        {
          column: 1,
          endColumn: 63,
          line: 1,
          messageId: 'removeOrEditConditionalStructure',
        },
      ],
    },
    {
      code: 'if (a) { first(); second(); } else { first(); second(); }',
      errors: [
        {
          column: 1,
          endColumn: 58,
          line: 1,
          messageId: 'removeOrEditConditionalStructure',
        },
      ],
    },
    {
      code: 'if (a) { first(); second(); } else if (b) { first(); second(); } else { first(); second(); }',
      errors: [
        {
          column: 1,
          endColumn: 93,
          line: 1,
          messageId: 'removeOrEditConditionalStructure',
        },
      ],
    },
  ],
  valid: [
    { code: 'if (a) { first(\'const\'); } else { first(\'var\'); }' },
    { code: 'if (a) { first(); } else { second(); }' },
    { code: 'if (a) { first(); } else if (b) { first(); }' }, // ok, no `else`
    { code: 'if (a) { first(); } else if (b) { second(); }' },
    { code: 'if (a) { second(); } else if (b) { first(); } else { first(); }' },
    { code: 'if (a) { first(); } else if (b) { second(); } else { first(); }' },
    { code: 'if (a) { first(); } else if (b) { first(); } else { second(); }' },
    { code: 'if (a) { first(); second(); } else { second(); first(); }' },
    { code: 'if (a) { first(); second(); } else { first(); third(); }' },
    { code: 'if (a) { first(); second(); } else { first(); }' },
    {
      code: 'if (a) { first(); second(); } else if (b) { first(); second(); } else { first(); third(); }',
    },
    {
      code: `
      function render() {
        if (a) {
          return <p>foo</p>;
        } else {
          return <p>bar</p>;
        }
      }`,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  ],
});

ruleTester.run(`${RULE_NAME} switch`, rule as any, {
  invalid: [
    {
      code: `
      switch (a) {
        case 1:
          first();
          second();
          break;
        default:
          first();
          second();
      }`,
      errors: [
        {
          column: 7,
          endColumn: 8,
          endLine: 10,
          line: 2,
          messageId: 'removeOrEditConditionalStructure',
        },
      ],
    },
    {
      code: `
      switch (a) {
        case 1:
          first();
          second();
          break;
        case 2:
          first();
          second();
          break;
        default:
          first();
          second();
      }`,
      errors: [
        {
          column: 7,
          endColumn: 8,
          endLine: 14,
          line: 2,
          messageId: 'removeOrEditConditionalStructure',
        },
      ],
    },
    {
      code: `
      switch (a) {
        case 1:
          first();
          break;
        case 2:
          first();
          break;
        default:
          first();
      }`,
      errors: [
        {
          column: 7,
          endColumn: 8,
          endLine: 11,
          line: 2,
          messageId: 'removeOrEditConditionalStructure',
        },
      ],
    },
    {
      code: `
      switch (a) {
        case 1:
        case 2:
          first();
          second();
          break;
        case 3:
          first();
          second();
          break;
        default:
          first();
          second();
      }`,
      errors: [
        {
          column: 7,
          endColumn: 8,
          endLine: 15,
          line: 2,
          messageId: 'removeOrEditConditionalStructure',
        },
      ],
    },
  ],
  valid: [
    {
      // Ok, no default
      code: `
      switch (a) {
        case 1:
          first();
          second();
          break;
        case 2:
        case 3:
          first();
          second();
      }`,
    },
    {
      code: `
      switch (a) {
        case 1:
          first();
          second();
          break;
        case 3:
          first();
          second();
          break;
        default:
          third();
      }`,
    },
    {
      code: `
      switch (a) {
        case 1:
          first();
          second();
          break;
        case 2:
          first();
          second();
          break;
        default:
      }`,
    },
  ],
});

ruleTester.run(`${RULE_NAME} conditional`, rule as any, {
  invalid: [
    {
      code: 'a ? first : first;',
      errors: [
        {
          column: 1,
          endColumn: 18,
          line: 1,
          messageId: 'returnsTheSameValue',
        },
      ],
    },
  ],
  valid: [{ code: 'a ? first : second;' }],
});
