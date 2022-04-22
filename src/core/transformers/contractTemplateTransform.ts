import ts from 'typescript';

const CONTRACT_CLASS_TEMPLATE = 'ContractTemplate';

export interface IContractTemplateData {
  contractName: string;
}

export function contractTemplateTransformerFactory(data: IContractTemplateData) {
  const transformer: ts.TransformerFactory<ts.SourceFile> = context => {
    return sourceFile => {
      const visitor = (node: ts.Node): ts.Node => {
        if (ts.isIdentifier(node) && isContractIdentifier(node)) {
          return handleTableIdentifier(node, data);
        }
        return ts.visitEachChild(node, visitor, context);
      };
      return ts.visitNode(sourceFile, visitor);
    };
  };
  return transformer;
}

function handleTableIdentifier(node: ts.Identifier, data: IContractTemplateData) {
  return ts.createIdentifier(data.contractName);
}

function isContractIdentifier(node: ts.Identifier) {
  return node.escapedText === CONTRACT_CLASS_TEMPLATE;
}
