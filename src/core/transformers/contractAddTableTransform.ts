import ts from 'typescript';

const TABLE_STORE_CLASS = 'TableStore'

export interface IContractAddTableData {
  tableName: string;
  tableFileName: string;
  className: string;
}

export function contractAddTableTransformerFactory(data: IContractAddTableData) {
  const transformer: ts.TransformerFactory<ts.SourceFile> = context => {
    return sourceFile => {
      const visitor = (node: ts.Node): ts.Node => {
        if (ts.isImportDeclaration(node) && isProtonImport(node)) {
          return handleImports(node, data) as ts.Node;
        } else if (ts.isClassDeclaration(node)) {
          return handleAddTable(node, data);
        }
        return ts.visitEachChild(node, visitor, context);
      };
      return ts.visitNode(sourceFile, visitor);
    };
  };
  return transformer;
}

function handleImports(node: ts.ImportDeclaration, data: IContractAddTableData) {
  if (!node.importClause || !ts.isImportClause(node.importClause))
    return node;
  if (node.importClause.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
    const hasTableStore = node.importClause.namedBindings.elements.find((element) => {
      return element.name.escapedText === TABLE_STORE_CLASS;
    });
    if (!hasTableStore) {
      node.importClause.namedBindings.elements = ts.createNodeArray([
        ...node.importClause.namedBindings.elements,
        ts.createImportSpecifier(undefined, ts.createIdentifier(TABLE_STORE_CLASS))
      ]);
    }
  }

  return [node,
    ts.createImportDeclaration(
      undefined,
      undefined,
      ts.createImportClause(
        undefined,
        ts.createNamedImports([
          ts.createImportSpecifier(undefined, ts.createIdentifier(data.className)),
        ])
      ),
      ts.createLiteral(`./${data.tableFileName}`)
    )
  ];
}

function handleAddTable(node: ts.ClassDeclaration, data: IContractAddTableData) {

  const tableProperty = ts.createProperty(
    undefined,
    undefined,
    ts.createIdentifier(`${data.className.toLowerCase()}Table`),
    undefined,
    ts.createTypeReferenceNode(
      ts.createIdentifier(TABLE_STORE_CLASS), [
      ts.createTypeReferenceNode(
        ts.createIdentifier(data.className),
        undefined
      )
    ]
    ), ts.createCall(
      ts.createPropertyAccess(
        ts.createIdentifier(data.className),
        ts.createIdentifier('getTable')
      ),
      undefined,
      [
        ts.createPropertyAccess(
          ts.createThis(),
          ts.createIdentifier('receiver')
        )
      ]
    )
  );

  node.members = ts.createNodeArray([
    tableProperty,
    ...node.members
  ])

  return node;
}

function isProtonImport(node: ts.ImportDeclaration) {
  return ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text === 'proton-tsc';
}
