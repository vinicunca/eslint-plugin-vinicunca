import type { TSESTree } from '@typescript-eslint/utils';
import type { RuleFixer, RuleListener } from '@typescript-eslint/utils/ts-eslint';

import { createEslintRule } from '../utils/rule';

export const RULE_NAME = 'consistent-list-newline';
export type MessageIds = 'shouldNotWrap' | 'shouldWrap';
export type Options = [{
  ArrayExpression?: boolean;
  ArrayPattern?: boolean;
  ArrowFunctionExpression?: boolean;
  CallExpression?: boolean;
  ExportNamedDeclaration?: boolean;
  FunctionDeclaration?: boolean;
  FunctionExpression?: boolean;
  ImportDeclaration?: boolean;
  NewExpression?: boolean;
  ObjectExpression?: boolean;
  ObjectPattern?: boolean;
  TSInterfaceDeclaration?: boolean;
  TSTupleType?: boolean;
  TSTypeLiteral?: boolean;
  TSTypeParameterDeclaration?: boolean;
  TSTypeParameterInstantiation?: boolean;
}];

export default createEslintRule<Options, MessageIds>({
  create: (context, [options = {}] = [{}]) => {
    function removeLines(fixer: RuleFixer, start: number, end: number) {
      const range = [start, end] as const;
      const code = context.sourceCode.text.slice(...range);
      return fixer.replaceTextRange(range, code.replace(/(\r\n|\n)/g, ''));
    }

    function check(
      node: TSESTree.Node,
      children: (TSESTree.Node | null)[],
      nextNode?: TSESTree.Node,
    ) {
      const items = children.filter(Boolean) as TSESTree.Node[];
      if (items.length === 0) {
        return;
      };

      const startToken = context.sourceCode.getTokenBefore(items[0]);
      const endToken = context.sourceCode.getTokenAfter(items[items.length - 1]);
      const startLine = startToken!.loc.start.line;

      if (startToken!.loc.start.line === endToken!.loc.end.line) {
        return;
      }

      let mode: 'inline' | 'newline' | null = null;
      let lastLine = startLine;

      items.forEach((item, idx) => {
        if (mode == null) {
          mode = item.loc.start.line === lastLine ? 'inline' : 'newline';
          lastLine = item.loc.end.line;
          return;
        }

        const currentStart = item.loc.start.line;

        if (mode === 'newline' && currentStart === lastLine) {
          context.report({
            data: {
              name: node.type,
            },
            *fix(fixer) {
              yield fixer.insertTextBefore(item, '\n');
            },
            messageId: 'shouldWrap',
            node: item,
          });
        } else if (mode === 'inline' && currentStart !== lastLine) {
          const lastItem = items[idx - 1];
          context.report({
            data: {
              name: node.type,
            },
            *fix(fixer) {
              yield removeLines(fixer, lastItem!.range[1], item.range[0]);
            },
            messageId: 'shouldNotWrap',
            node: item,
          });
        }

        lastLine = item.loc.end.line;
      });

      const endRange = nextNode
        ? Math.min(
          context.sourceCode.getTokenBefore(nextNode)!.range[0],
          node.range[1],
        )
        : node.range[1];
      const endLoc = context.sourceCode.getLocFromIndex(endRange);

      const lastItem = items[items.length - 1]!;
      if (mode === 'newline' && endLoc.line === lastLine) {
        context.report({
          data: {
            name: node.type,
          },
          *fix(fixer) {
            yield fixer.insertTextAfter(lastItem, '\n');
          },
          messageId: 'shouldWrap',
          node: lastItem,
        });
      } else if (mode === 'inline' && endLoc.line !== lastLine) {
        // If there is only one multiline item, we allow the closing bracket to be on the a different line
        if (items.length === 1 && items[0].loc.start.line !== items[1]?.loc.start.line) {
          return;
        };

        const content = context.sourceCode.text.slice(lastItem.range[1], endRange);
        if (content.includes('\n')) {
          context.report({
            data: {
              name: node.type,
            },
            *fix(fixer) {
              yield removeLines(fixer, lastItem.range[1], endRange);
            },
            messageId: 'shouldNotWrap',
            node: lastItem,
          });
        }
      }
    }

    const listener = {
      ArrayExpression: (node) => {
        check(node, node.elements);
      },
      ArrayPattern(node) {
        check(node, node.elements);
      },
      ArrowFunctionExpression: (node) => {
        if (node.params.length <= 1) {
          return;
        }

        check(
          node,
          node.params,
          node.returnType || node.body,
        );
      },
      CallExpression: (node) => {
        check(node, node.arguments);
      },
      ExportNamedDeclaration: (node) => {
        check(node, node.specifiers);
      },
      FunctionDeclaration: (node) => {
        check(
          node,
          node.params,
          node.returnType || node.body,
        );
      },
      FunctionExpression: (node) => {
        check(
          node,
          node.params,
          node.returnType || node.body,
        );
      },
      ImportDeclaration: (node) => {
        check(node, node.specifiers);
      },
      NewExpression: (node) => {
        check(node, node.arguments);
      },
      ObjectExpression: (node) => {
        check(node, node.properties);
      },
      ObjectPattern(node) {
        check(node, node.properties, node.typeAnnotation);
      },
      TSInterfaceDeclaration: (node) => {
        check(node, node.body.body);
      },
      TSTupleType: (node) => {
        check(node, node.elementTypes);
      },
      TSTypeLiteral: (node) => {
        check(node, node.members);
      },
      TSTypeParameterDeclaration(node) {
        check(node, node.params);
      },
      TSTypeParameterInstantiation(node) {
        check(node, node.params);
      },
    } satisfies RuleListener;

    type KeysListener = keyof typeof listener;

    type KeysOptions = keyof Options[0];

    // Type assertion to check if all keys are exported
    exportType<KeysListener, KeysOptions>();
    exportType<KeysOptions, KeysListener>();

    (Object.keys(options) as KeysOptions[]).forEach((key) => {
      if (options[key] === false) {
        // eslint-disable-next-line ts/no-dynamic-delete
        delete listener[key];
      };
    });

    return listener;
  },

  defaultOptions: [{}],

  meta: {
    docs: {
      description: 'Having line breaks styles to object, array and named imports',
      recommended: 'stylistic',
    },
    fixable: 'whitespace',
    messages: {
      shouldNotWrap: 'Should not have line breaks between items, in node {{name}}',
      shouldWrap: 'Should have line breaks between items, in node {{name}}',
    },
    schema: [{
      additionalProperties: false,
      properties: {
        ArrayExpression: { type: 'boolean' },
        ArrayPattern: { type: 'boolean' },
        ArrowFunctionExpression: { type: 'boolean' },
        CallExpression: { type: 'boolean' },
        ExportNamedDeclaration: { type: 'boolean' },
        FunctionDeclaration: { type: 'boolean' },
        FunctionExpression: { type: 'boolean' },
        ImportDeclaration: { type: 'boolean' },
        NewExpression: { type: 'boolean' },
        ObjectExpression: { type: 'boolean' },
        ObjectPattern: { type: 'boolean' },
        TSInterfaceDeclaration: { type: 'boolean' },
        TSTupleType: { type: 'boolean' },
        TSTypeLiteral: { type: 'boolean' },
        TSTypeParameterDeclaration: { type: 'boolean' },
        TSTypeParameterInstantiation: { type: 'boolean' },
      } satisfies Record<keyof Options[0], { type: 'boolean' }>,
      type: 'object',
    }],
    type: 'layout',
  },

  name: RULE_NAME,
});

// eslint-disable-next-line ts/no-unused-vars,unused-imports/no-unused-vars
function exportType<A, B extends A>() {}
