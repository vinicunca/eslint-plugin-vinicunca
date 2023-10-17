import { type TSESTree } from '@typescript-eslint/utils';
import { createEslintRule } from '../utils/rule';
import { areEquivalent } from '../utils/equivalence';
import { getMainFunctionTokenLocation, issueLocation, report } from '../utils/locations';

export const RULE_NAME = 'no-identical-functions';
export type MessageIds = 'identicalFunctions' | 'vinicuncaRuntime';
type Options = (number | 'vinicunca-runtime')[];

const DEFAULT_MIN_LINES = 3;

type FunctionNode =
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.ArrowFunctionExpression;

const message
  = 'Update this function so that its implementation is not identical to the one on line {{line}}.';

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,

  meta: {
    messages: {
      identicalFunctions: message,
      vinicuncaRuntime: '{{vinicuncaRuntimeData}}',
    },
    type: 'problem',
    docs: {
      description: 'Functions should not have identical implementations',
      recommended: 'recommended',
    },
    schema: [
      { type: 'integer', minimum: 3 },
      {
        enum: ['vinicunca-runtime'],
      } as any,
    ],
  },

  defaultOptions: [],

  create(context) {
    const functions: Array<{ function: FunctionNode; parent: TSESTree.Node | undefined }> = [];
    const minLines: number
      = typeof context.options[0] === 'number' ? context.options[0] : DEFAULT_MIN_LINES;

    return {
      FunctionDeclaration(node: TSESTree.Node) {
        visitFunction(node as TSESTree.FunctionDeclaration);
      },
      'VariableDeclarator > FunctionExpression, MethodDefinition > FunctionExpression': (
        node: TSESTree.Node,
      ) => {
        visitFunction(node as TSESTree.FunctionExpression);
      },
      'VariableDeclarator > ArrowFunctionExpression, MethodDefinition > ArrowFunctionExpression': (
        node: TSESTree.Node,
      ) => {
        visitFunction(node as TSESTree.ArrowFunctionExpression);
      },

      'Program:exit': function() {
        processFunctions();
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
                messageId: 'identicalFunctions',
                data: {
                  line: originalFunction.loc.start.line,
                },
                loc,
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
});
