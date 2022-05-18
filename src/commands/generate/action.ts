import { CliUx, Command, Flags } from '@oclif/core'
import * as path from 'path';
import { green, red } from 'colors';

import { destinationFolder } from '../../core/flags';
import { extractContract, validateName } from '../../utils';

import { Project, ScriptTarget } from 'ts-morph';
import { addNamedImports, contractAddActions, FORMAT_SETTINGS } from '../../core/generators';

export const contractName = Flags.string({
  char: 'c',
  description: 'The name of the contract for table. 1-12 chars, only lowercase a-z and numbers 1-5 are possible',
});

export default class ContractActionsAddCommand extends Command {

  static description = 'Add extra actions to the smart contract';

  static flags = {
    output: destinationFolder(),
    contract: contractName,
  }

  private project?: Project;

  async run() {
    const { flags } = await this.parse(ContractActionsAddCommand);

    if (flags.contract && !validateName(flags.contract)) {
      return this.error(`The provided contract name ${flags.contract} is wrong. Check --help information for more info`);
    }

    const CURR_DIR = process.cwd();

    const targetPath = path.join(CURR_DIR, flags.output || '');

    let contractFilePath = '';
    let contractName = '';
    try {
      [contractName, contractFilePath] = await extractContract(targetPath, flags.contract);
    } catch (err: any) {
      return this.error(red(err));
    }

    this.project = new Project({
      compilerOptions: {
        target: ScriptTarget.Latest
      },
    });

    const contractSource = this.project.addSourceFileAtPath(contractFilePath);
    const contractClass = contractSource.getClass(contractName)
    if (contractClass) {
      const extraImports = await contractAddActions(contractClass);

      if (extraImports.length > 0) {
        addNamedImports(contractSource, 'proton-tsc', extraImports);
      }

      contractSource.formatText(FORMAT_SETTINGS);
      contractSource.saveSync();

      CliUx.ux.log(green(`Actions were successfully added`));

    }
  }
}
