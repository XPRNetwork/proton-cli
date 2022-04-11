import { Flags } from '@oclif/core';



export const destinationFolder = Flags.build({
  char: 'o',
  description: 'The relative path to folder the the contract should be located. Current folder by default.',
  default: ''
});
