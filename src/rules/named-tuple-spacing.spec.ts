import { ruleTester } from '../tests/rule-tester';
import rule, { RULE_NAME } from './named-tuple-spacing';

const valids = [
  'type T = [i: number]',
  'type T = [i?: number]',
  'type T = [i: number, j: number]',
  'type T = [i: number, j: () => string]',
  `const emit = defineEmits<{
    change: [id: number]
    update: [value: string]
  }>()`,
];

ruleTester.run(RULE_NAME, rule as any, {
  invalid: [
    {
      code: 'type T = [i:number]',
      errors: [{ messageId: 'expectedSpaceAfter' }],
      output: 'type T = [i: number]',
    },
    {
      code: 'type T = [i:  number]',
      errors: [{ messageId: 'expectedSpaceAfter' }],
      output: 'type T = [i: number]',
    },
    {
      code: 'type T = [i?:number]',
      errors: [{ messageId: 'expectedSpaceAfter' }],
      output: 'type T = [i?: number]',
    },
    {
      code: 'type T = [i?   :number]',
      errors: [{ messageId: 'unexpectedSpaceBetween' }, { messageId: 'expectedSpaceAfter' }],
      output: 'type T = [i?: number]',
    },
    {
      code: 'type T = [i : number]',
      errors: [{ messageId: 'unexpectedSpaceBefore' }],
      output: 'type T = [i: number]',
    },
    {
      code: 'type T = [i  : number]',
      errors: [{ messageId: 'unexpectedSpaceBefore' }],
      output: 'type T = [i: number]',
    },
    {
      code: 'type T = [i  ?  : number]',
      errors: [{ messageId: 'unexpectedSpaceBetween' }, { messageId: 'unexpectedSpaceBefore' }],
      output: 'type T = [i?: number]',
    },
    {
      code: 'type T = [i:number, j:number]',
      errors: [{ messageId: 'expectedSpaceAfter' }, { messageId: 'expectedSpaceAfter' }],
      output: 'type T = [i: number, j: number]',
    },
    {
      code: 'type T = [i:()=>void, j:number]',
      errors: [{ messageId: 'expectedSpaceAfter' }, { messageId: 'expectedSpaceAfter' }],
      output: 'type T = [i: ()=>void, j: number]',
    },
    {
      code: `
        const emit = defineEmits<{
          change: [id:number]
          update: [value:string]
        }>()
        `,
      errors: [{ messageId: 'expectedSpaceAfter' }, { messageId: 'expectedSpaceAfter' }],
      output: `
        const emit = defineEmits<{
          change: [id: number]
          update: [value: string]
        }>()
        `,
    },
    {
      code: `
        const emit = defineEmits<{
          change: [id? :number]
          update: [value:string]
        }>()
        `,
      errors: [{ messageId: 'unexpectedSpaceBetween' }, { messageId: 'expectedSpaceAfter' }, { messageId: 'expectedSpaceAfter' }],
      output: `
        const emit = defineEmits<{
          change: [id?: number]
          update: [value: string]
        }>()
        `,
    },
  ],
  valid: valids,
});
