import { ClassDeclaration, GetAccessorDeclaration } from 'ts-morph';
import { fixParameterType, IParameter } from './common';

export const TABLE_PARAMETER_TYPES = new Map([
  ['Name', {
    getPrimary: (paramName: string) => {
      return `this.${paramName}.N`;
    }
  }],
  ['string', {
    getPrimary: (paramName: string) => {
      return `this.${paramName}`;
    }
  }],
  ['u64', {
    getPrimary: (paramName: string) => {
      return `this.${paramName}`;
    }
  }],
  ['i32', {
    getPrimary: (paramName: string) => {
      return `<u64>(this.${paramName})`;
    }
  }],
  ['u32', {
    getPrimary: (paramName: string) => {
      return `<u64>(this.${paramName})`;
    }
  }],
  ['u8', {
    getPrimary: (paramName: string) => {
      return `<u64>(this.${paramName})`;
    }
  }],
  ['i8', {
    getPrimary: (paramName: string) => {
      return `<u64>(this.${paramName})`;
    }
  }]
])

export function tableAddPrimaryParameter(table: ClassDeclaration, parameter: IParameter): GetAccessorDeclaration | undefined {
  const fixedType = fixParameterType(parameter.type);
  const paramType = TABLE_PARAMETER_TYPES.get(fixedType);
  if (paramType) {
    const result = table.addGetAccessor({
      name: 'primary',
      returnType: 'u64',
      statements: [`return ${paramType.getPrimary(parameter.name)}`],
    });
    result.addDecorator({
      name: 'primary'
    });
    return result;
  }
  return undefined;
}
