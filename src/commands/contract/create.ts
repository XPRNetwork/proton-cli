import { CliUx, Command } from '@oclif/core';
import * as path from 'path';
import { green, red } from 'colors';
import * as shell from 'shelljs';
import { render } from 'ejs';
import { Project, PropertyAccessExpression, ScriptTarget, SyntaxKind } from "ts-morph";

import { validateName, createRootFolder, createFolderContent, IFilePreprocess } from '../../utils';
import { destinationFolder } from '../../core/flags';
import { addNamedImports, contractAddActions, FORMAT_SETTINGS } from '../../core/generators';

export default class ContractCreateCommand extends Command {
  static args = [
    {
      name: 'contractName',
      required: true,
      description: 'The name of the contract. 1-12 chars, only lowercase a-z and numbers 1-5 are possible',
    },
  ]

  static flags = {
    output: destinationFolder(),
  }

  async run() {
    const { flags, args } = await this.parse(ContractCreateCommand);

    if (!validateName(args.contractName)) {
      return this.error(`The provided contract name ${args.contractName} is wrong. Check --help information for more info`);
    }

    const data = {
      contractName: args.contractName
    }

    const CURR_DIR = process.cwd();

    const templatePath = path.join(__dirname, '../..', 'templates', 'contract');

    //@ts-ignore
    const targetPath = path.join(CURR_DIR, flags.output || args.contractName);

    const project = new Project({
      compilerOptions: {
        target: ScriptTarget.Latest
      },
    });

    createRootFolder(targetPath);

    await createFolderContent(templatePath, targetPath, {
      filePreprocess: async (file: IFilePreprocess) => {
        if (file.fileName === 'contract.ts') {
          file.fileName = `${args.contractName}.${file.fileName}`;

          const sourceFile = project.createSourceFile(file.fileName, "");

          const contract = sourceFile.addClass({
            name: data.contractName,
            isExported: true,
            extends: 'Contract',
          });

          contract.addDecorator({
            name: "contract"
          });

          addNamedImports(sourceFile, 'proton-tsc', ["Contract"]);

          CliUx.ux.log("Let's add some actions to the class");

          await contractAddActions(contract)

          sourceFile.formatText(FORMAT_SETTINGS);
          file.content = sourceFile.getText();
        } else if (file.fileName === 'playground.ts') {
          const sourceFile = project.createSourceFile(file.fileName, file.content);
          const mainFunction = sourceFile.getFunction('main');
          if (mainFunction) {
            mainFunction.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((item) => {
              const child = item.getFirstDescendant((item) => item.getKind() === SyntaxKind.PropertyAccessExpression)
              if (child && (child as PropertyAccessExpression).getName() === 'createContract') {
                item.getArguments().forEach((arg, idx) => {
                  if (idx === 0) {
                    arg.replaceWithText(`'${data.contractName}'`)
                  } else if (idx === 1) {
                    arg.replaceWithText(`'target/${data.contractName}.contract'`)
                  }
                });
              }
            });

            mainFunction.addStatements([
              `await contract.actions.action([]).send('${data.contractName}@active');`
            ]);
          }
          sourceFile.formatText(FORMAT_SETTINGS);
          file.content = sourceFile.getText();
        } else {
          file.content = render(file.content, data);
        }
        return file
      }
    });
    if (!postProcessNode(targetPath)) {
      return this.error(red('Failed to install dependencies. Try to install manually.'));
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
