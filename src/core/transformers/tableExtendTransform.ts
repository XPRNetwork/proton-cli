import ts from 'typescript';

export function tableExtendTransformerFactory(sourceWithClass: ts.SourceFile) {
  const transformer: ts.TransformerFactory<ts.SourceFile> = context => {
    return sourceFile => {
      const visitor = (node: ts.Node): ts.Node => {
        if (ts.isSourceFile(node)) {
          return handleTableInsert(node, sourceWithClass);
        }
        return ts.visitEachChild(node, visitor, context);
      };
      return ts.visitNode(sourceFile, visitor);
    };
  };
  return transformer;
}

export function tableBasicImportTransformerFactory() {
  const transformer: ts.TransformerFactory<ts.SourceFile> = context => {
    return sourceFile => {
      const visitor = (node: ts.Node): ts.Node => {
        if (ts.isSourceFile(node)) {
          return handleBasicImports(node);
        } else {
          return ts.visitEachChild(node, visitor, context);
        }
      };
      return ts.visitNode(sourceFile, visitor);
    };
  }

  return transformer;
};

function handleTableInsert(node: ts.SourceFile, sourceWithClass: ts.SourceFile) {
  const classToAdd = getClassDeclaration(sourceWithClass);
  if (classToAdd) {
    node.statements = ts.createNodeArray([
      ...node.statements,
      classToAdd
    ]);
  }

  return node;
}

function getClassDeclaration(sourceFile: ts.SourceFile) {
  return sourceFile.statements.find((node) => ts.isClassDeclaration(node));
}

function handleBasicImports(node: ts.SourceFile) {

  node.statements = ts.createNodeArray([
    ts.createImportDeclaration(
      undefined,
      undefined,
      ts.createImportClause(
        undefined,
        ts.createNamedImports([
          ts.createImportSpecifier(
            undefined,
            ts.createIdentifier('ExtendedAsset')
          ),
          ts.createImportSpecifier(undefined, ts.createIdentifier('Name')),
          ts.createImportSpecifier(undefined, ts.createIdentifier('Table')),
          ts.createImportSpecifier(undefined, ts.createIdentifier('TableStore'))
        ])
      ),
      ts.createStringLiteral('proton-tsc')
    ),
    ...node.statements
  ]);
  return node;
}
