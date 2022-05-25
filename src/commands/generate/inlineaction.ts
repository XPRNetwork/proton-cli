import { CliUx, Command, Flags } from '@oclif/core'
import * as path from 'path';
import { red } from 'colors';

import { destinationFolder } from '../../core/flags';
import { checkFileExists, extractContract, validateName } from '../../utils';

import { Project, ScriptTarget, SourceFile } from 'ts-morph';
import { addNamedImports, constructorAddParameters, FORMAT_SETTINGS } from '../../core/generators';

export const contractName = Flags.string({
  char: 'c',
  description: 'The name of the contract for table. 1-12 chars, only lowercase a-z and numbers 1-5 are possible',
});

export default class ContractInlineActionCreateCommand extends Command {

  static description = 'Add inline action for the smart contract';

  static args = [
    {
      name: 'actionName',
      required: true,
      description: 'The name of the inline action\'s class.',
    },
  ]

  static flags = {
    output: destinationFolder(),
    contract: contractName,
  }

  private data: any = {}
  private project?: Project;

  async run() {
    const { flags, args } = await this.parse(ContractInlineActionCreateCommand);

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

    this.data = {
      actionName: args.actionName,
      contractName: contractName,
      className: args.actionName,
      inlineFileName: `${contractName}.inline`,
      inlineFileNameWithExt: `${contractName}.inline.ts`
    }
    this.data.className = this.data.className.charAt(0).toUpperCase() + this.data.className.slice(1);

    const inlineFilePath = path.join(targetPath, this.data.inlineFileNameWithExt);

    this.project = new Project({
      compilerOptions: {
        target: ScriptTarget.Latest
      },
    });

    try {
      await this.createInlineAction(inlineFilePath);
    } catch (e: any) {
      return this.error(red(e));
    }
  }

  private async createInlineAction(inlineFilePath: string) {
    let sourceInlineActions: SourceFile | undefined;
    if (this.project) {
      if (checkFileExists(inlineFilePath)) {
        this.project.addSourceFilesAtPaths([inlineFilePath]);
        sourceInlineActions = this.project.getSourceFile(inlineFilePath);
      } else {
        sourceInlineActions = this.project.createSourceFile(inlineFilePath);
      }

      if (sourceInlineActions) {
        const classExists = sourceInlineActions.getClass(this.data.className);
        if (!classExists) {

          const inlineAction = sourceInlineActions.addClass({
            name: this.data.className,
            isExported: true,
            extends: 'InlineAction',
          });

          inlineAction.addDecorator({
            name: "packer"
          });

          const inlineActionContructor = inlineAction.addConstructor(
            {
              statements: ['super()']
            }
          );

          const extraImports = await constructorAddParameters(inlineActionContructor);

          const namedImports = ["InlineAction", "Name"];

          if (extraImports.length > 0) {
            namedImports.push(...extraImports);
          }

          addNamedImports(sourceInlineActions, 'proton-tsc', namedImports);

          sourceInlineActions.formatText(FORMAT_SETTINGS);
          sourceInlineActions.saveSync();
          CliUx.ux.log(`Inline action ${this.data.actionName} successfully created`);
        } else {
          throw `The inline action ${this.data.actionName} already exists. Try changing the name.`;
        }
      }
    }
  }

}
