import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import {
  ancestorsChain,
  findFirstMatchingAncestor,
  isIdentifier,
  isReferenceTo,
} from '../utils';
import { collectionConstructor } from '../utils/collections';
import { createEslintRule } from '../utils/rule';

export const RULE_NAME = 'no-empty-collection';
export type MessageIds = 'reviewUsageOfIdentifier';
type Options = [];

// Methods that mutate the collection but can't add elements
const nonAdditiveMutatorMethods = [
  // array methods
  'copyWithin',
  'pop',
  'reverse',
  'shift',
  'sort',
  // map, set methods
  'clear',
  'delete',
];
const accessorMethods = [
  // array methods
  'concat',
  'flat',
  'flatMap',
  'includes',
  'indexOf',
  'join',
  'lastIndexOf',
  'slice',
  'toSource',
  'toString',
  'toLocaleString',
  // map, set methods
  'get',
  'has',
];
const iterationMethods = [
  'entries',
  'every',
  'filter',
  'find',
  'findIndex',
  'forEach',
  'keys',
  'map',
  'reduce',
  'reduceRight',
  'some',
  'values',
];

const strictlyReadingMethods = new Set([
  ...nonAdditiveMutatorMethods,
  ...accessorMethods,
  ...iterationMethods,
]);

export default createEslintRule<Options, MessageIds>({
  create(context) {
    return {
      'Program:exit': () => {
        reportEmptyCollectionsUsage(context.getScope(), context);
      },
    };
  },

  defaultOptions: [],

  meta: {
    docs: {
      description: 'Empty collections should not be accessed or iterated',
      recommended: 'recommended',
    },
    messages: {
      reviewUsageOfIdentifier:
        'Review this usage of "{{identifierName}}" as it can only be empty here.',
    },
    schema: [],
    type: 'problem',
  },

  name: RULE_NAME,
});

function reportEmptyCollectionsUsage(
  scope: TSESLint.Scope.Scope,
  context: TSESLint.RuleContext<string, string[]>,
) {
  if (scope.type !== 'global') {
    scope.variables.forEach((v) => {
      reportEmptyCollectionUsage(v, context);
    });
  }

  scope.childScopes.forEach((childScope) => {
    reportEmptyCollectionsUsage(childScope, context);
  });
}

function reportEmptyCollectionUsage(
  variable: TSESLint.Scope.Variable,
  context: TSESLint.RuleContext<string, string[]>,
) {
  if (variable.references.length <= 1) {
    return;
  }

  if (variable.defs.some((d) => d.type === 'Parameter' || d.type === 'ImportBinding')) {
    // Bound value initialized elsewhere, could be non-empty.
    return;
  }

  const readingUsages = [];
  let hasAssignmentOfEmptyCollection = false;

  for (const ref of variable.references) {
    if (ref.isWriteOnly()) {
      if (isReferenceAssigningEmptyCollection(ref)) {
        hasAssignmentOfEmptyCollection = true;
      } else {
        // There is at least one operation that might make the collection non-empty.
        // We ignore the order of usages, and consider all reads to be safe.
        return;
      }
    } else if (isReadingCollectionUsage(ref)) {
      readingUsages.push(ref);
    } else {
      // some unknown operation on the collection.
      // To avoid any FPs, we assume that it could make the collection non-empty.
      return;
    }
  }

  if (hasAssignmentOfEmptyCollection) {
    readingUsages.forEach((ref) => {
      context.report({
        data: {
          identifierName: ref.identifier.name,
        },
        messageId: 'reviewUsageOfIdentifier',
        node: ref.identifier,
      });
    });
  }
}

function isReferenceAssigningEmptyCollection(ref: TSESLint.Scope.Reference) {
  const declOrExprStmt = findFirstMatchingAncestor(
    ref.identifier as TSESTree.Node,
    (n) => n.type === 'VariableDeclarator' || n.type === 'ExpressionStatement',
  ) as TSESTree.Node;
  if (declOrExprStmt) {
    if (declOrExprStmt.type === 'VariableDeclarator' && declOrExprStmt.init) {
      return isEmptyCollectionType(declOrExprStmt.init);
    }

    if (declOrExprStmt.type === 'ExpressionStatement') {
      const { expression } = declOrExprStmt;
      return (
        expression.type === 'AssignmentExpression'
        && isReferenceTo(ref, expression.left)
        && isEmptyCollectionType(expression.right)
      );
    }
  }
  return false;
}

function isEmptyCollectionType(node: TSESTree.Node) {
  if (node && node.type === 'ArrayExpression') {
    return node.elements.length === 0;
  } else if (node && (node.type === 'CallExpression' || node.type === 'NewExpression')) {
    return isIdentifier(node.callee, ...collectionConstructor) && node.arguments.length === 0;
  }
  return false;
}

function isReadingCollectionUsage(ref: TSESLint.Scope.Reference) {
  return isStrictlyReadingMethodCall(ref) || isForIterationPattern(ref) || isElementRead(ref);
}

function isStrictlyReadingMethodCall(usage: TSESLint.Scope.Reference) {
  const { parent } = usage.identifier as TSESTree.Node;
  if (parent && parent.type === 'MemberExpression') {
    const memberExpressionParent = parent.parent;
    if (memberExpressionParent && memberExpressionParent.type === 'CallExpression') {
      return isIdentifier(parent.property as TSESTree.Node, ...strictlyReadingMethods);
    }
  }
  return false;
}

function isForIterationPattern(ref: TSESLint.Scope.Reference) {
  const forInOrOfStatement = findFirstMatchingAncestor(
    ref.identifier as TSESTree.Node,
    (n) => n.type === 'ForOfStatement' || n.type === 'ForInStatement',
  ) as TSESTree.ForInStatement | TSESTree.ForOfStatement;

  return forInOrOfStatement && forInOrOfStatement.right === ref.identifier;
}

function isElementRead(ref: TSESLint.Scope.Reference) {
  const { parent } = ref.identifier as TSESTree.Node;
  return parent && parent.type === 'MemberExpression' && parent.computed && !isElementWrite(parent);
}

function isElementWrite(memberExpression: TSESTree.MemberExpression) {
  const ancestors = ancestorsChain(memberExpression, new Set());
  const assignment = ancestors.find(
    (n) => n.type === 'AssignmentExpression',
  ) as TSESTree.AssignmentExpression;
  if (assignment && assignment.operator === '=') {
    return [...ancestors, memberExpression].includes(assignment.left);
  }
  return false;
}
