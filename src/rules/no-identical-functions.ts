import type { TSESTree } from '@typescript-eslint/utils';

import { areEquivalent } from '../utils/equivalence';
import { getMainFunctionTokenLocation, issueLocation, report } from '../utils/locations';
import { createEslintRule } from '../utils/rule';

export const RULE_NAME = 'no-identical-functions';
export type MessageIds = 'identicalFunctions' | 'vinicuncaRuntime';
type Options = ('vinicunca-runtime' | number)[];

const DEFAULT_MIN_LINES = 3;

type FunctionNode =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression;

const message
  = 'Update this function so that its implementation is not identical to the one on line {{line}}.';

export default createEslintRule<Options, MessageIds>({
  create(context) {
    const functions: Array<{ function: FunctionNode; parent: TSESTree.Node | undefined }> = [];
    const minLines: number
      = typeof context.options[0] === 'number' ? context.options[0] : DEFAULT_MIN_LINES;

    return {
      FunctionDeclaration(node: TSESTree.Node) {
        visitFunction(node as TSESTree.FunctionDeclaration);
      },
      'Program:exit': function() {
        processFunctions();
      },
      'VariableDeclarator > ArrowFunctionExpression, MethodDefinition > ArrowFunctionExpression': (
        node: TSESTree.Node,
      ) => {
        visitFunction(node as TSESTree.ArrowFunctionExpression);
      },

      'VariableDeclarator > FunctionExpression, MethodDefinition > FunctionExpression': (
        node: TSESTree.Node,
      ) => {
        visitFunction(node as TSESTree.FunctionExpression);
      },
    };

    function visitFunction(node: FunctionNode) {
      if (isBigEnough(node.body)) {
        functions.push({ function: node, parent: node.parent });
      }
    }

    function processFunctions() {
      for (let i = 1; i < functions.length; i++) {
        const duplicatingFunction = functions[i].function;

        for (let j = 0; j < i; j++) {
          const originalFunction = functions[j].function;

          if (
            areEquivalent(
              duplicatingFunction.body,
              originalFunction.body,
              context.getSourceCode(),
            )
            && originalFunction.loc
          ) {
            const loc = getMainFunctionTokenLocation(
              duplicatingFunction,
              functions[i].parent,
              context,
            );
            const originalFunctionLoc = getMainFunctionTokenLocation(
              originalFunction,
              functions[j].parent,
              context,
            );
            const secondaryLocations = [
              issueLocation(originalFunctionLoc, originalFunctionLoc, 'Original implementation'),
            ];
            report(
              context,
              {
                data: {
                  line: originalFunction.loc.start.line,
                },
                loc,
                messageId: 'identicalFunctions',
              },
              secondaryLocations,
              message,
            );
            break;
          }
        }
      }
    }

    function isBigEnough(node: TSESTree.Node) {
      const tokens = context.getSourceCode().getTokens(node);

      if (tokens.length > 0 && tokens[0].value === '{') {
        tokens.shift();
      }

      if (tokens.length > 0 && tokens[tokens.length - 1].value === '}') {
        tokens.pop();
      }

      if (tokens.length > 0) {
        const firstLine = tokens[0].loc.start.line;
        const lastLine = tokens[tokens.length - 1].loc.end.line;

        return lastLine - firstLine + 1 >= minLines;
      }

      return false;
    }
  },

  defaultOptions: [],

  meta: {
    docs: {
      description: 'Functions should not have identical implementations',
      recommended: 'recommended',
    },
    messages: {
      identicalFunctions: message,
      vinicuncaRuntime: '{{vinicuncaRuntimeData}}',
    },
    schema: [
      { minimum: 3, type: 'integer' },
      {
        enum: ['vinicunca-runtime'],
      } as any,
    ],
    type: 'problem',
  },

  name: RULE_NAME,
});
