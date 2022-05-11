import { ConstructorDeclaration, ParameterDeclaration, Scope } from 'ts-morph';

export interface IConstructorParameter {
  name: string;
  type: string;
  isNullable?: boolean;
  isArray?: boolean;
}

export const CONSTRUCTOR_PARAMETER_TYPES = new Map([
  ['Name', {
    initializer: 'new Name()',
  }],
  ['string', {
    initializer: '""',
  }],
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
  }]
]);

export function constructorAddParameter(
  contructor: ConstructorDeclaration,
  parameter: IConstructorParameter
): ParameterDeclaration {
  const fixedType = fixParameterType(parameter.type);

  const paramType = CONSTRUCTOR_PARAMETER_TYPES.get(fixedType);
  const type = `${fixedType}${parameter.isArray ? '[]' : ''}${parameter.isNullable ? ' | null' : ''}`;
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

  const hasParameters = contructor.getParameters().length > 0;
  const result = contructor.addParameter({
    name: parameter.name,
    type,
    scope: Scope.Public,
    initializer
  });
  result.prependWhitespace(writer => writer.newLine());
  if (!hasParameters) {
    result.appendWhitespace(writer => writer.newLine());
  }
  return result;
}

export function fixParameterType(type: string): string {
  if (!CONSTRUCTOR_PARAMETER_TYPES.has(type)) {
    return 'u64';
  }
  return type;
}
