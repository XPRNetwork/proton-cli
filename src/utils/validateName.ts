export function validateName(value: string): boolean {
  return /^[a-z1-5]{1,12}$/.test(value);
}
