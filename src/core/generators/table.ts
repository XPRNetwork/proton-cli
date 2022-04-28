import { ClassDeclaration, ConstructorDeclaration, GetAccessorDeclaration, ParameterDeclaration, Scope } from 'ts-morph';

export interface ITableConstructorParameter {
  name: string;
  type: string;
  isNullable?: boolean;
  isArray?: boolean;
}

export const TABLE_PARAMETER_TYPES = new Map([
  ['Name', {
    initializer: 'new Name()',
    getPrimary: (paramName: string) => {
      return `this.${paramName}.N`;
    }
  }],
  ['string', {
    initializer: '""',
    getPrimary: (paramName: string) => {
      return `this.${paramName}`;
    }
  }],
  ['u64', {
    initializer: '0',
    getPrimary: (paramName: string) => {
      return `this.${paramName}`;
    }
  }],
  ['i32', {
    initializer: '0',
    getPrimary: (paramName: string) => {
      return `<u64>(this.${paramName})`;
    }
  }],
  ['u32', {
    initializer: '0',
    getPrimary: (paramName: string) => {
      return `<u64>(this.${paramName})`;
    }
  }],
  ['u8', {
    initializer: '0',
    getPrimary: (paramName: string) => {
      return `<u64>(this.${paramName})`;
    }
  }],
  ['i8', {
    initializer: '0',
    getPrimary: (paramName: string) => {
      return `<u64>(this.${paramName})`;
    }
  }]
])

export function tableAddParameter(contructor: ConstructorDeclaration, parameter: ITableConstructorParameter): ParameterDeclaration {
  const fixedType = fixParameterType(parameter.type);

  const paramType = TABLE_PARAMETER_TYPES.get(fixedType);
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

export function tableAddPrimaryParameter(table: ClassDeclaration, parameter: ITableConstructorParameter): GetAccessorDeclaration | undefined {
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

function fixParameterType(type: string): string {
  if (!TABLE_PARAMETER_TYPES.has(type)) {
    return 'u64';
  }
  return type;
}
