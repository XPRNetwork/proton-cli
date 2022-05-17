import { ClassDeclaration, MethodDeclaration } from 'ts-morph';
import { prompt } from 'inquirer'
import { promptName, validateName } from '../../utils';
import { IParameter } from './common';
import { parameterAdd, parametersCollect, parameterToDeclaration } from './parameters';
import { CliUx } from '@oclif/core';

export interface IContractAction {
  methodName: string;
  name: string;
}

export interface IContractActionToAdd {
  name: string;
  parameters: IParameter[];
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

  const actionsToAdd: IContractActionToAdd[] = [];
  const actionsNamesToAdd: string[] = [];
  let stop = false
  while (!stop) {
    const name = await contractPromptAction(actionsNamesToAdd, existingActions);
    actionsNamesToAdd.push(name);

    const { addParameters } = await prompt<{ addParameters: boolean }>([
      {
        name: 'addParameters',
        type: 'confirm',
        message: 'Do you want to add parameters to the action?',
        default: false,
      },
    ]);
    let parametersToAdd: IParameter[] = []
    if (addParameters) {
      parametersToAdd = await parametersCollect();
    }
    CliUx.ux.log(`————————————`);

    actionsToAdd.push({
      name: name,
      parameters: parametersToAdd
    });

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

  return actionsNamesToAdd.length > 0
}

export function contractAddAction(contractClass: ClassDeclaration, action: IContractActionToAdd): MethodDeclaration {
  const existingActions = contractGetActions(contractClass);
  const methods = contractClass.getMethods();
  if (contractIsActionExists(action.name, existingActions)) {
    throw `Method with the name ${action.name} already exists in the class`;
  }

  const method = contractClass.addMethod({
    name: action.name,
    parameters: [],
    returnType: 'void',
  });

  action.parameters.map((param) => parameterToDeclaration(param)).forEach((declaration) => {
    parameterAdd(method, declaration);
  });

  method.addStatements([writer =>
    writer.writeLine('// Add here a code of your contract')
  ]);

  method.addDecorator({
    name: 'action',
    arguments: [`"${action.name}"`]
  });

  if (methods.length === 0) {
    method.prependWhitespace(writer => writer.newLine());
  }

  return method;
}
