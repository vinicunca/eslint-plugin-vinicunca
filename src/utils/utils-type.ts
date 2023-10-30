import type { TSESTree } from '@typescript-eslint/utils';

import type { TypeServices } from './parser-services';

export function getTypeFromTreeNode(node: TSESTree.Node, services: TypeServices) {
  const checker = services.program.getTypeChecker();
  return checker.getTypeAtLocation(services.esTreeNodeToTSNodeMap.get(node));
}
