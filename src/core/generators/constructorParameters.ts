import { ConstructorDeclaration, ParameterDeclaration, Scope } from 'ts-morph';
import { fixParameterType, IParameter } from './common';
import { parameterAdd, parametersCollect, parameterToDeclaration } from './parameters';

export const CONSTRUCTOR_PARAMETER_TYPES = new Map([
  ['u64', {
    initializer: '0',
  }],
  ['i32', {
    initializer: '0',
  }],
  ['u32', {
    initializer: '0',
  }],
  ['u8', {
    initializer: '0',
  }],
  ['i8', {
    initializer: '0',
  }],
  ['Name', {
    initializer: 'new Name()',
  }],
  ['string', {
    initializer: '""',
  }],
]);

export async function constructorAddParameters(tableContructor: ConstructorDeclaration, existingParameters: IParameter[] = []) {
  const parametersToAdd: IParameter[] = await parametersCollect(existingParameters);

  if (parametersToAdd.length > 0) {
    parametersToAdd.forEach((property) => {
      constructorAddParameter(tableContructor, property);
    });
  }

  return parametersToAdd.length > 0
}

export function constructorAddParameter(
  contructor: ConstructorDeclaration,
  parameter: IParameter
): ParameterDeclaration {
  const fixedType = fixParameterType(parameter.type);

  const declaration = parameterToDeclaration(parameter);

  const paramType = CONSTRUCTOR_PARAMETER_TYPES.get(fixedType);
  let initializer = '';
  if (paramType) {
    if (parameter.isNullable) {
      initializer = 'null';
    } else if (parameter.isArray) {
      initializer = '[]';
    } else {
      initializer = paramType.initializer;
    }
  }

  const result = parameterAdd(contructor, {
    ...declaration,
    scope: Scope.Public,
    initializer
  });
  return result;
}

