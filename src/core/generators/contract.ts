import { ClassDeclaration, MethodDeclaration } from 'ts-morph';

export function contractAddAction(contractClass: ClassDeclaration, actionName: string): MethodDeclaration {
  const methods = contractClass.getMethods();
  const actionExists = methods.some((classMethod) => {
    const methodActionName = classMethod.getDecorator('action')?.getArguments()[0].getText();
    return classMethod.getName() === actionName || methodActionName === actionName;
  });

  if (actionExists) {
    throw `Method with the name ${actionName} already exists in the class`;
  }
  const method = contractClass.addMethod({
    name: actionName,
    parameters: [],
    returnType: 'void',
  });

  method.addStatements([writer =>
    writer.writeLine('// Add here a code of your contract')
  ]);

  method.addDecorator({
    name: actionName,
    arguments: [`"${actionName}"`]
  });

  if (methods.length === 0) {
    method.prependWhitespace(writer => writer.newLine());
  }

  return method;
}
