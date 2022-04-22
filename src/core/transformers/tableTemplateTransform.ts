import ts from 'typescript';

const TABLE_NAME_TEMPLATE = 'table_template';
const TABLE_CLASS_TEMPLATE = 'TableTemplate';

export function tableTemplateTransformerFactory(data: any) {
  const transformer: ts.TransformerFactory<ts.SourceFile> = context => {
    return sourceFile => {
      const visitor = (node: ts.Node): ts.Node => {
        if (ts.isDecorator(node) && isTableDecorator(node)) {
          return handleTableDecorator(node, data);
        } else if (ts.isIdentifier(node) && isTableIdentifier(node)) {
          return handleTableIdentifier(node, data);
        } else if (ts.isCallExpression(node) && isNameExpression(node)) {
          return handleNameExpression(node, data);
        }
        return ts.visitEachChild(node, visitor, context);
      };
      return ts.visitNode(sourceFile, visitor);
    };
  };
  return transformer;
}

function handleTableDecorator(node: ts.Decorator, data: any) {
  const expr = node.expression;
  if (!ts.isCallExpression(expr))
    return node;

  const args = expr.arguments;
  if (args.length !== 1)
    return node;

  const arg = args[0];
  if (!ts.isToken(arg))
    return node;

  const nToken = ts.createStringLiteral(data.tableName);
  const newArgs: ts.Expression[] = [nToken]

  if (data.isSingleton) {
    newArgs.push(ts.createIdentifier('singleton'));
  }

  expr.arguments = ts.createNodeArray(newArgs);
  return node;
}

function handleTableIdentifier(node: ts.Identifier, data: any) {
  return ts.createIdentifier(data.className);
}

function handleNameExpression(node: ts.CallExpression, data: any) {
  const args = node.arguments;
  if (args.length !== 1)
    return node;

  const arg = args[0];
  if (!ts.isStringLiteral(arg) || arg.text !== TABLE_NAME_TEMPLATE)
    return node;

  node.arguments = ts.createNodeArray([ts.createStringLiteral(data.tableName)]);

  return node;
}

function isTableDecorator(node: ts.Decorator) {
  const expr = node.expression;
  if (!ts.isCallExpression(expr))
    return false;

  if (!ts.isIdentifier(expr.expression))
    return false;

  return expr.expression.escapedText === "table";
}

function isTableIdentifier(node: ts.Identifier) {
  return node.escapedText === TABLE_CLASS_TEMPLATE;
}

function isNameExpression(node: ts.CallExpression) {
  if (!ts.isPropertyAccessExpression(node.expression)) {
    return false;
  }
  const expr = node.expression;
  if (
    !(ts.isIdentifier(expr.expression) && expr.expression.escapedText === 'Name' &&
      ts.isIdentifier(expr.name) && expr.name.escapedText === 'fromString')
  )
    return false
  return true
}
