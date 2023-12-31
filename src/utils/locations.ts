import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

type Writeable<T> = { -readonly [P in keyof T]: T[P] };
export type MutableReportDescriptor = Writeable<TSESLint.ReportDescriptor<string>>;

export interface IssueLocation {
  column: number;
  data?: Record<string, unknown>;
  endColumn: number;
  endLine: number;
  line: number;
  message?: string;
}

export interface EncodedMessage {
  cost?: number;
  message: string;
  secondaryLocations: IssueLocation[];
}

/**
 * Returns a location of the "main" function token:
 * - function name for a function declaration, method or accessor
 * - "function" keyword for a function expression
 * - "=>" for an arrow function
 */
export function getMainFunctionTokenLocation<T = string>(
  fn: TSESTree.FunctionLike,
  parent: TSESTree.Node | undefined,
  context: TSESLint.RuleContext<string, T[]>,
) {
  let location: TSESTree.SourceLocation | null | undefined;

  if (fn.type === 'FunctionDeclaration') {
    // `fn.id` can be null when it is `export default function` (despite of the @types/TSESTree definition)
    if (fn.id) {
      location = fn.id.loc;
    } else {
      const token = getTokenByValue(fn, 'function', context);
      location = token && token.loc;
    }
  } else if (fn.type === 'FunctionExpression') {
    if (parent && (parent.type === 'MethodDefinition' || parent.type === 'Property')) {
      location = parent.key.loc;
    } else {
      const token = getTokenByValue(fn, 'function', context);
      location = token && token.loc;
    }
  } else if (fn.type === 'ArrowFunctionExpression') {
    const token = context
      .getSourceCode()
      .getTokensBefore(fn.body)
      .reverse()
      .find((token) => token.value === '=>');

    location = token && token.loc;
  }

  return location!;
}

/**
 * Wrapper for `context.report`, supporting secondary locations and cost.
 * Encode those extra information in the issue message when rule is executed
 * in Vinicunca* environment.
 */
export function report<T = string>(
  context: TSESLint.RuleContext<string, T[]>,
  reportDescriptor: MutableReportDescriptor,
  secondaryLocations: IssueLocation[],
  message: string,
  cost?: number,
) {
  if ((context.options[context.options.length - 1] as unknown) !== 'vinicunca-runtime') {
    context.report(reportDescriptor);
    return;
  }

  const encodedMessage: EncodedMessage = {
    cost,
    message: expandMessage(message, reportDescriptor.data),
    secondaryLocations,
  };
  reportDescriptor.messageId = 'vinicuncaRuntime';

  if (reportDescriptor.data === undefined) {
    reportDescriptor.data = {};
  }

  (reportDescriptor.data as Record<string, unknown>).vinicuncaRuntimeData
    = JSON.stringify(encodedMessage);

  context.report(reportDescriptor);
}

function expandMessage(message: string, reportDescriptorData: Record<string, unknown> | undefined) {
  let expandedMessage = message;
  if (reportDescriptorData !== undefined) {
    for (const [key, value] of Object.entries(reportDescriptorData)) {
      expandedMessage = replaceAll(expandedMessage, `{{${key}}}`, (value as object).toString());
    }
  }

  return expandedMessage;
}

function replaceAll(target: string, search: string, replacement: string): string {
  return target.split(search).join(replacement);
}

/**
 * Converts `SourceLocation` range into `IssueLocation`
 */
export function issueLocation(
  startLoc: TSESTree.SourceLocation,
  endLoc: TSESTree.SourceLocation = startLoc,
  message = '',
  data: Record<string, unknown> = {},
): IssueLocation {
  const issueLocation: IssueLocation = {
    column: startLoc.start.column,
    endColumn: endLoc.end.column,
    endLine: endLoc.end.line,
    line: startLoc.start.line,
    message,
  };

  if (data !== undefined && Object.keys(data).length > 0) {
    issueLocation.data = data;
  }

  return issueLocation;
}

export function toSecondaryLocation(
  locationHolder: TSESLint.AST.Token | TSESTree.Node,
  message?: string,
): IssueLocation {
  const { loc } = locationHolder;
  return {
    column: loc.start.column,
    endColumn: loc.end.column,
    endLine: loc.end.line,
    line: loc.start.line,
    message,
  };
}

function getTokenByValue<T = string>(
  node: TSESTree.Node,
  value: string,
  context: TSESLint.RuleContext<string, T[]>,
) {
  return context
    .getSourceCode()
    .getTokens(node)
    .find((token) => token.value === value);
}

export function getFirstTokenAfter<T = string>(
  node: TSESTree.Node,
  context: TSESLint.RuleContext<string, T[]>,
): TSESLint.AST.Token | null {
  return context.getSourceCode().getTokenAfter(node);
}

export function getFirstToken<T = string>(
  node: TSESTree.Node,
  context: TSESLint.RuleContext<string, T[]>,
): TSESLint.AST.Token {
  return context.getSourceCode().getTokens(node)[0];
}
