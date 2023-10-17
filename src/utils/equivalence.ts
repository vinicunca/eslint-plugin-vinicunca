import { type TSESLint, type TSESTree } from '@typescript-eslint/utils';

/**
 * Equivalence is implemented by comparing node types and their tokens.
 * Classic implementation would recursively compare children,
 * but "estree" doesn't provide access to children when node type is unknown
 */
export function areEquivalent(
  first: TSESTree.Node | TSESTree.Node[],
  second: TSESTree.Node | TSESTree.Node[],
  sourceCode: TSESLint.SourceCode,
): boolean {
  if (Array.isArray(first) && Array.isArray(second)) {
    return (
      first.length === second.length
      && first.every((firstNode, index) => areEquivalent(firstNode, second[index], sourceCode))
    );
  } else if (!Array.isArray(first) && !Array.isArray(second)) {
    return (
      first.type === second.type
      && compareTokens(sourceCode.getTokens(first), sourceCode.getTokens(second))
    );
  }
  return false;
}

function compareTokens(firstTokens: TSESLint.AST.Token[], secondTokens: TSESLint.AST.Token[]) {
  return (
    firstTokens.length === secondTokens.length
    && firstTokens.every((firstToken, index) => firstToken.value === secondTokens[index].value)
  );
}
