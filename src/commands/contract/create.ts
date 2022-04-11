import { CliUx, Command, Flags } from '@oclif/core';
import * as path from 'path';
import { green, red } from 'colors';
import * as shell from 'shelljs';

import { validateName, createRootFolder, createFolderContent, IFilePreprocess } from '../../utils';
import { destinationFolder } from '../../core/flags';

export const contractClass = Flags.build({
  char: 'c',
  description: 'The name of Typescript class for the contract',
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
    const targetPath = path.join(CURR_DIR, flags.output || args.contractName);

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
    if (!postProcessNode(targetPath)) {
      CliUx.ux.log(red('Failed to install dependencies. Try to install manually.'));
    }
    CliUx.ux.log(green(`Contract ${args.contractName} successfully created!`));
  }
}

function postProcessNode(targetPath: string) {
  shell.cd(targetPath);

  let cmd = '';

  if (shell.which('yarn')) {
    cmd = 'yarn';
  } else if (shell.which('npm')) {
    cmd = 'npm install';
  }

  if (cmd) {
    const result = shell.exec(cmd);

    if (result.code !== 0) {
      return false;
    }
  } else {
    CliUx.ux.log(red('No yarn or npm found. Cannot run installation.'));
  }

  return true;
}
