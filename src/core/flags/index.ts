import { Flags } from '@oclif/core'

// In oclif v4, Flags.build was removed. The replacement is to define a
// flag-builder closure that returns a fully-configured flag.
export const destinationFolder = (overrides: Record<string, unknown> = {}) =>
  Flags.string({
    char: 'o',
    description: 'The relative path to folder where the contract should be located. Current folder by default.',
    default: '',
    ...overrides,
  })
