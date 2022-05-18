import { CliUx } from '@oclif/core';
import { prompt } from 'inquirer'
import { OptionalKind, ParameterDeclarationStructure, ParameteredNode } from 'ts-morph';
import { promptChoices, promptName } from '../../utils';
import { fixParameterType, IParameter, PARAMETER_TYPES, PARAMETER_TYPES_TO_IMPORT } from './common';

export async function parameterPrompt(existingParameters: IParameter[],
  opts: {
    preset?: Partial<IParameter>,
    type?: string
  } = {}
): Promise<IParameter> {
  if (!opts.type) {
    opts.type = 'parameter';
  }
  const parameterName = await promptName((opts.type as string), {
    validate: (input) => {
      if (!existingParameters.some((prop) => prop.name === input)) {
        return true;
      }
      return `Parameter with this name was already added previously. Try another name.`;
    }
  });

  const types = PARAMETER_TYPES.slice();

  const parameterType = await promptChoices(
    'Choose parameter type:',
    types,
    'u64');

  let isArray: boolean = false;
  if (opts.preset?.isArray !== undefined) {
    isArray = opts.preset.isArray;
  } else {

    const { isArrayPrompt } = await prompt<{ isArrayPrompt: boolean }>([
      {
        name: 'isArrayPrompt',
        type: 'confirm',
        message: 'Is the parameter an array?',
        default: false,
      },
    ]);

    isArray = isArrayPrompt;
  }
  let isNullable: boolean = false;
  if (opts.preset?.isNullable !== undefined) {
    isNullable = opts.preset.isNullable;
  } else {
    const { isNullablePrompt } = await prompt<{ isNullablePrompt: boolean }>([
      {
        name: 'isNullablePrompt',
        type: 'confirm',
        message: 'Can the parameter be nullable?',
        default: false,
      },
    ]);
    isNullable = isNullablePrompt;
  }

  return {
    name: parameterName,
    type: parameterType,
    isNullable: isNullable,
    isArray: isArray
  };
}

export function parametersExtractImports(parameters: IParameter[]): string[] {
  return parameters.reduce((accum: string[], param) => {
    if (PARAMETER_TYPES_TO_IMPORT.has(param.type)) {
      accum.push(param.type);
    }
    return accum;
  }, []);
}

export async function parametersCollect(existingParameters: IParameter[] = []) {
  const parametersToAdd: IParameter[] = [];
  let stop = false
  while (!stop) {
    const property = await parameterPrompt(existingParameters);
    existingParameters.push(property);
    parametersToAdd.push(property);

    CliUx.ux.log(`————————————`);

    const { next } = await prompt<{ next: boolean }>([
      {
        name: 'next',
        type: 'confirm',
        message: 'Do you want to add one more parameter?',
        default: false,
      },
    ]);
    stop = !next;
  }

  return parametersToAdd;
}

export function parameterAdd(node: ParameteredNode, declaration: OptionalKind<ParameterDeclarationStructure>) {
  const hasParameters = node.getParameters().length > 0;
  const result = node.addParameter(declaration);
  result.prependWhitespace(writer => writer.newLine());
  if (!hasParameters) {
    result.appendWhitespace(writer => writer.newLine());
  }
  return result;
}

export function parameterToDeclaration(param: IParameter): OptionalKind<ParameterDeclarationStructure> {
  const fixedType = fixParameterType(param.type);
  const type = `${fixedType}${param.isArray ? '[]' : ''}${param.isNullable ? ' | null' : ''}`;
  return {
    name: param.name,
    type,
  }
}
