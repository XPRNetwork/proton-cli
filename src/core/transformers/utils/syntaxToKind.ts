import ts from 'typescript';

export function syntaxToKind(kind: ts.Node["kind"]) {
  return ts.SyntaxKind[kind];
};
