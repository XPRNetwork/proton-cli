import { CliUx, Command, Flags } from '@oclif/core';
import { validateName, createRootFolder, createFolderContent, IFilePreprocess } from '../../utils';
import * as path from 'path';
import { green } from 'colors';

export const contractClass = Flags.build({
  char: 'c',
  description: 'The name of Typescript class for the contract',
});

export const destinationFolder = Flags.build({
  char: 'o',
  description: 'The relative path to folder the the contract should be created. Current folder by default.',
  default: ''
});

export default class ContractCreateCommand extends Command {
  static args = [
    {
      name: 'contractName',
      required: true,
      description: 'The name of the contract. 1-12 chars, only lowercase a-z and numbers 1-5 are possible',
    },
  ]

  static flags = {
    class: contractClass(),
    output: destinationFolder(),
  }

  async run() {
    const { flags, args } = await this.parse(ContractCreateCommand);

    if (!validateName(args.contractName)) {
      return this.error(`The provided contract name ${args.contractName} is wrong. Check --help information for more info`);
    }

    const data = {
      contractName: args.contractName,
      className: flags.class || args.contractName
    }

    const CURR_DIR = process.cwd();

    const templatePath = path.join(__dirname, '../..', 'templates', 'contract');

    //@ts-ignore
    const targetPath = path.join(CURR_DIR, flags.output);

    createRootFolder(targetPath);

    createFolderContent(templatePath, targetPath, {
      data,
      filePreprocess: (file: IFilePreprocess) => {
        if (file.fileName === 'contract.ts') {
          file.fileName = `${args.contractName}.${file.fileName}`;
        }
        return file
      }
    });
    CliUx.ux.log(green(`Contract ${args.contractName} successfully created!`));
  }
}
