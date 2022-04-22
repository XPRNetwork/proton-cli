import { CliUx, Command, Flags } from '@oclif/core'
import ts from "typescript";
import * as path from 'path';
import { green, red } from 'colors';

import { destinationFolder } from '../../core/flags';
import { buildContractFileName, checkFileExists, createFolderContent, IFilePreprocess, validateName, writeFile } from '../../utils';

import { contractAddTableTransformerFactory, tableTemplateTransformerFactory } from '../../core/transformers';

export const tableClass = Flags.string({
  char: 't',
  description: 'The name of Typescript class for the table',
});

export const isSingleton = Flags.boolean({
  char: 's',
  description: 'Create a singleton table?',
  default: false
});

export default class ContractTableCreateCommand extends Command {
  static args = [
    {
      name: 'tableName',
      required: true,
      description: 'The name of the contract\'s table. 1-12 chars, only lowercase a-z and numbers 1-5 are possible',
    },
    {
      name: 'contractName',
      required: true,
      description: 'The name of the contract for table. 1-12 chars, only lowercase a-z and numbers 1-5 are possible',
    },
  ]

  static flags = {
    class: tableClass,
    singleton: isSingleton,
    output: destinationFolder(),
  }

  async run() {
    const { flags, args } = await this.parse(ContractTableCreateCommand);

    if (!validateName(args.tableName)) {
      return this.error(`The provided contract name ${args.contractName} is wrong. Check --help information for more info`);
    }

    if (!validateName(args.contractName)) {
      return this.error(`The provided contract name ${args.contractName} is wrong. Check --help information for more info`);
    }

    const CURR_DIR = process.cwd();

    const targetPath = path.join(CURR_DIR, flags.output || '');
    const contractFileName = buildContractFileName(args.contractName);


    const contractFilePath = path.join(targetPath, contractFileName);
    if (!checkFileExists(contractFilePath)) {
      return this.error(`The contract file ${contractFileName} does not exits. May be you forgot to create the contract first?`);
    }

    const data = {
      tableName: args.tableName,
      contractName: args.contractName,
      className: flags.class || args.tableName,
      isSingleton: flags.singleton,
      tableFileName: `${args.tableName}.table`,
      tableFileNameWithExt: `${args.tableName}.table.ts`
    }

    const tableFilePath = path.join(targetPath, data.tableFileNameWithExt);
    if (checkFileExists(tableFilePath)) {
      return this.error(red(`The table file ${tableFilePath} already exist.`));
    }

    data.className = data.className.charAt(0).toUpperCase() + data.className.slice(1);

    const templatePath = path.join(__dirname, '../..', 'templates', 'table');

    const printer = ts.createPrinter();

    createFolderContent(templatePath, targetPath, {
      filePreprocess: (file: IFilePreprocess) => {
        if (file.fileName === 'table.ts') {
          file.fileName = data.tableFileNameWithExt;

          const source = ts.createSourceFile(file.fileName, file.content, ts.ScriptTarget.Latest)

          if (source) {
            const result = ts.transform(source, [tableTemplateTransformerFactory(data)]);
            const transformedSourceFile = result.transformed[0];
            file.content = printer.printFile(transformedSourceFile);
          }
        }
        return file
      },
    });
    CliUx.ux.log(`Table ${args.tableName} successfully created`);
    CliUx.ux.log(`Adding the table to the contract ${args.contractName}`);

    // Adding table to contract file
    const program = ts.createProgram([contractFilePath], {});
    const source = program.getSourceFile(contractFilePath);
    if (source) {
      const result = ts.transform(source, [contractAddTableTransformerFactory(data)]);
      writeFile(contractFilePath, printer.printFile(result.transformed[0]))
    }

    CliUx.ux.log(green(`Contract ${args.contractName} was successfully updated`));
  }
}
