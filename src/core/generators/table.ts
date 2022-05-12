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
      statements: [paramType.getPrimary(parameter.name)],
    });
    result.addDecorator({
      name: 'primary'
    });
    return result;
  }
  return undefined;
}

export function tableAddGetStorageMethod(table: ClassDeclaration): void {
  const decorator = table.getDecorator('table');
  const className = table.getName();
  if (className && decorator) {
    const args = decorator.getArguments();
    const name = args[0].getText();
    const isSingleton = args.length == 2 && args[1].getText() === 'singleton';
    if (isSingleton) {
      tableAddGetSingletonMethod(table, className, name);
    } else {
      tableAddGetTableMethod(table, className, name);
    }
  }
}

function tableAddGetTableMethod(table: ClassDeclaration, className: string, storageName: string): void {
  table.addMethod({
    name: 'getTable',
    parameters: [
      {
        name: 'code',
        type: 'Name'
      }
    ],
    isStatic: true,
    returnType: `TableStore<${className}>`,
    statements: [`return new TableStore<${className}>(code, code, Name.fromString(${storageName}));`],
  });
}

function tableAddGetSingletonMethod(table: ClassDeclaration, className: string, storageName: string): void {
  table.addMethod({
    name: 'getSingleton',
    parameters: [
      {
        name: 'code',
        type: 'Name'
      }
    ],
    isStatic: true,
    returnType: `Singleton<${className}>`,
    statements: [`return new Singleton<${className}>(code, code, Name.fromString(${storageName}));`],
  });
}
