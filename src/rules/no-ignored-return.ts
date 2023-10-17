import { type TSESLint, type TSESTree } from '@typescript-eslint/utils';
import { createEslintRule } from '../utils/rule';
import { type TypeServices } from '../utils/parser-service';
import { hasTypeServices } from '../utils/parser-service';
import { getTypeFromTreeNode } from '../utils/node';

export const RULE_NAME = 'no-ignored-return';
export type MessageIds = 'useForEach' | 'returnValueMustBeUsed';
export type Options = [];

const METHODS_WITHOUT_SIDE_EFFECTS: { [index: string]: Set<string> } = {
  array: new Set([
    'concat',
    'includes',
    'join',
    'slice',
    'indexOf',
    'lastIndexOf',
    'entries',
    'filter',
    'findIndex',
    'keys',
    'map',
    'values',
    'find',
    'reduce',
    'reduceRight',
    'toString',
    'toLocaleString',
  ]),
  date: new Set([
    'getDate',
    'getDay',
    'getFullYear',
    'getHours',
    'getMilliseconds',
    'getMinutes',
    'getMonth',
    'getSeconds',
    'getTime',
    'getTimezoneOffset',
    'getUTCDate',
    'getUTCDay',
    'getUTCFullYear',
    'getUTCHours',
    'getUTCMilliseconds',
    'getUTCMinutes',
    'getUTCMonth',
    'getUTCSeconds',
    'getYear',
    'toDateString',
    'toISOString',
    'toJSON',
    'toGMTString',
    'toLocaleDateString',
    'toLocaleTimeString',
    'toTimeString',
    'toUTCString',
    'toString',
    'toLocaleString',
  ]),
  math: new Set([
    'abs',
    'E',
    'LN2',
    'LN10',
    'LOG2E',
    'LOG10E',
    'PI',
    'SQRT1_2',
    'SQRT2',
    'abs',
    'acos',
    'acosh',
    'asin',
    'asinh',
    'atan',
    'atanh',
    'atan2',
    'cbrt',
    'ceil',
    'clz32',
    'cos',
    'cosh',
    'exp',
    'expm1',
    'floor',
    'fround',
    'hypot',
    'imul',
    'log',
    'log1p',
    'log10',
    'log2',
    'max',
    'min',
    'pow',
    'random',
    'round',
    'sign',
    'sin',
    'sinh',
    'sqrt',
    'tan',
    'tanh',
    'trunc',
  ]),
  number: new Set(['toExponential', 'toFixed', 'toPrecision', 'toLocaleString', 'toString']),
  regexp: new Set(['test', 'toString']),
  string: new Set([
    'charAt',
    'charCodeAt',
    'codePointAt',
    'concat',
    'includes',
    'endsWith',
    'indexOf',
    'lastIndexOf',
    'localeCompare',
    'match',
    'normalize',
    'padEnd',
    'padStart',
    'repeat',
    'replace',
    'search',
    'slice',
    'split',
    'startsWith',
    'substr',
    'substring',
    'toLocaleLowerCase',
    'toLocaleUpperCase',
    'toLowerCase',
    'toUpperCase',
    'trim',
    'length',
    'toString',
    'valueOf',

    // HTML wrapper methods
    'anchor',
    'big',
    'blink',
    'bold',
    'fixed',
    'fontcolor',
    'fontsize',
    'italics',
    'link',
    'small',
    'strike',
    'sub',
    'sup',
  ]),
};

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,

  meta: {
    messages: {
      useForEach: 'Consider using "forEach" instead of "map" as its return value is not being used here.',
      returnValueMustBeUsed: 'The return value of "{{methodName}}" must be used.',
    },
    schema: [],
    type: 'problem',
    docs: {
      description: 'Return values from functions without side effects should not be ignored',
      recommended: 'recommended',
    },
  },

  defaultOptions: [],

  create(context: TSESLint.RuleContext<string, string[]>) {
    if (!hasTypeServices(context.parserServices)) {
      return {};
    }

    const services = context.parserServices;

    return {
      CallExpression: (node: TSESTree.Node) => {
        const call = node as TSESTree.CallExpression;
        const { callee } = call;
        if (callee.type === 'MemberExpression') {
          const { parent } = node;
          if (parent && parent.type === 'ExpressionStatement') {
            const methodName = context.getSourceCode().getText(callee.property);
            const objectType = services.getTypeAtLocation(callee.object);
            if (
              !hasSideEffect(methodName, objectType, services)
              && !isReplaceWithCallback(methodName, call.arguments, services)
            ) {
              context.report(reportDescriptor(methodName, node));
            }
          }
        }
      },
    };
  },
});

function isReplaceWithCallback(
  methodName: string,
  callArguments: Array<TSESTree.Expression | TSESTree.SpreadElement>,
  services: TypeServices,
) {
  if (methodName === 'replace' && callArguments.length > 1) {
    const type = getTypeFromTreeNode(callArguments[1], services);
    const typeNode = services.program.getTypeChecker().typeToTypeNode(type, undefined, undefined);
    // dynamically import 'typescript' as classic 'import' will fail if project not using 'typescript' parser
    // we are sure it's available as 'RequiredParserServices' are available here
    // eslint-disable-next-line ts/no-var-requires, ts/no-require-imports
    const ts = require('typescript');
    return typeNode && ts.isFunctionTypeNode(typeNode);
  }
  return false;
}

function reportDescriptor(
  methodName: string,
  node: TSESTree.Node,
): TSESLint.ReportDescriptor<string> {
  if (methodName === 'map') {
    return {
      messageId: 'useForEach',
      node,
    };
  } else {
    return {
      messageId: 'returnValueMustBeUsed',
      node,
      data: { methodName },
    };
  }
}

function hasSideEffect(methodName: string, objectType: any, services: TypeServices) {
  const typeAsString = typeToString(objectType, services);
  if (typeAsString !== null) {
    const methods = METHODS_WITHOUT_SIDE_EFFECTS[typeAsString];
    return !(methods && methods.has(methodName));
  }
  return true;
}

function typeToString(tp: any, services: TypeServices): string | null {
  const typechecker = services.program.getTypeChecker();

  const baseType = typechecker.getBaseTypeOfLiteralType(tp);
  const typeAsString = typechecker.typeToString(baseType);
  if (typeAsString === 'number' || typeAsString === 'string') {
    return typeAsString;
  }

  const symbol = tp.getSymbol();
  if (symbol) {
    const name = symbol.getName();
    switch (name) {
      case 'Array':
      case 'Date':
      case 'Math':
      case 'RegExp':
        return name.toLowerCase();
    }
  }

  return null;
}
