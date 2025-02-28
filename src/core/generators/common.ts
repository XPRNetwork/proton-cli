export interface IParameter {
  name: string;
  type: string;
  isNullable?: boolean;
  isArray?: boolean;
}

export const PARAMETER_TYPES: Readonly<string[]> = ['u64', 'i32', 'u32', 'u8', 'i8','string', 'Name' ,'Asset','Symbol'];

export const PARAMETER_TYPES_TO_IMPORT: Set<string> = new Set<string>(['Name','Asset','Symbol']);

export function fixParameterType(type: string): string {
  if (PARAMETER_TYPES.indexOf(type) < 0) {
    return 'u64';
  }
  return type;
}
