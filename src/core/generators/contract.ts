import { ClassDeclaration, MethodDeclaration } from 'ts-morph';
import { prompt } from 'inquirer'
import { promptName, validateName } from '../../utils';

export interface IContractAction {
  methodName: string;
  name: string;
}

export function contractGetActions(contractClass: ClassDeclaration): IContractAction[] {
  const existingActions = contractClass.getMethods()
    .filter((method) => method.getDecorator('action'))
    .map((method) => {
      let name = method.getDecorator('action')?.getArguments()[0].getText() || method.getName();
      name = name.replace(/['"]/g, '');
      return {
        methodName: method.getName(),
        name: name
      }
    });

  return existingActions;
}

export function contractIsActionExists(actionName: string, existingActions: IContractAction[] = []): boolean {
  return existingActions.some((action) => action.methodName === actionName || action.name === actionName);
}

export async function contractPromptAction(actionsToAdd: string[], existingActions: IContractAction[] = []) {
  return promptName('action', {
    validate: (input) => {
      if (validateName(input)) {
        if (
          actionsToAdd.indexOf(input) < 0
          && !contractIsActionExists(input, existingActions)
        ) {
          return true;
        }
        return `Action with this name was already added previously. Try another name.`;
      }
      return `The provided action name is wrong. 1-12 chars, only lowercase a-z and numbers 1-5 are possible`;
    }
  });
}

export async function contractAddActions(contractClass: ClassDeclaration) {
  const existingActions = contractGetActions(contractClass);

  const actionsToAdd: string[] = [];
  let stop = false
  while (!stop) {
    const name = await contractPromptAction(actionsToAdd, existingActions);
    actionsToAdd.push(name);

    const { next } = await prompt<{ next: boolean }>([
      {
        name: 'next',
        type: 'confirm',
        message: 'Do you want to add one more action?',
        default: false,
      },
    ]);
    stop = !next;
  }

  if (actionsToAdd.length > 0) {
    actionsToAdd.forEach((action) => {
      contractAddAction(contractClass, action);
    });
  }

  return actionsToAdd.length > 0
}

export function contractAddAction(contractClass: ClassDeclaration, actionName: string): MethodDeclaration {
  const existingActions = contractGetActions(contractClass);
  const methods = contractClass.getMethods();
  if (contractIsActionExists(actionName, existingActions)) {
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
    name: 'action',
    arguments: [`"${actionName}"`]
  });

  if (methods.length === 0) {
    method.prependWhitespace(writer => writer.newLine());
  }

  return method;
}
