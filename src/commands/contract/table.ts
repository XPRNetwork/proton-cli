import { CliUx, Command, Flags } from '@oclif/core'
import ts from "typescript";
import * as path from 'path';
import * as fs from 'fs';
import globby from 'globby';
import { green } from 'colors';

import { destinationFolder } from '../../core/flags';
import { buildContractFileName, checkFileExists, createFolderContent, IFilePreprocess, validateName, writeFile } from '../../utils';

import { contractAddTableTransformerFactory, tableBasicImportTransformerFactory, tableExtendTransformerFactory, tableTemplateTransformerFactory } from '../../core/transformers';

export const tableClass = Flags.string({
  char: 't',
  description: 'The name of Typescript class for the table',
});

export const isSingleton = Flags.boolean({
  char: 's',
  description: 'Create a singleton table?',
  default: false
});

export const contractName = Flags.string({
  char: 'c',
  description: 'The name of the contract for table. 1-12 chars, only lowercase a-z and numbers 1-5 are possible',
});

export default class ContractTableCreateCommand extends Command {
  static args = [
    {
      name: 'tableName',
      required: true,
      description: 'The name of the contract\'s table. 1-12 chars, only lowercase a-z and numbers 1-5 are possible',
    },
  ]

  static flags = {
    class: tableClass,
    singleton: isSingleton,
    output: destinationFolder(),
    contract: contractName,
  }

  async run() {
    const { flags, args } = await this.parse(ContractTableCreateCommand);

    if (!validateName(args.tableName)) {
      return this.error(`The provided table name ${args.tableName} is wrong. Check --help information for more info`);
    }

    if (flags.contract && !validateName(flags.contract)) {
      return this.error(`The provided contract name ${flags.contract} is wrong. Check --help information for more info`);
    }

    const CURR_DIR = process.cwd();

    const targetPath = path.join(CURR_DIR, flags.output || '');
    let contractFilePath = '';
    let contractName = '';

    if (flags.contract) {
      contractName = flags.contract;
      const contractFileName = buildContractFileName(contractName);
      contractFilePath = path.join(targetPath, contractFileName);
      if (!checkFileExists(contractFilePath)) {
        return this.error(`The contract file ${contractFileName} does not exits. May be you forgot to create the contract first?`);
      }
    } else {
      const paths = await globby([path.join(targetPath, '*.contract.ts')])
      if (!paths.length) {
        return this.error(`The contract file is not found. May be you forgot to create the contract first?`);
      }
      if (paths.length > 1) {
        return this.error(`Several contracts are found. Please provide a contract name explicitly. Check --help information for more info`);
      }
      contractFilePath = paths[0];
      const res = contractFilePath.match(/^.+\/(.+)?\.contract\.ts$/);
      if (res) {
        contractName = res[1];
      }
    }

    const data = {
      tableName: args.tableName,
      contractName: contractName,
      className: flags.class || args.tableName,
      isSingleton: flags.singleton,
      tableFileName: `${contractName}.tables`,
      tableFileNameWithExt: `${contractName}.tables.ts`,
      tablesAlreadyExists: false
    }
    data.className = data.className.charAt(0).toUpperCase() + data.className.slice(1);

    const tableFilePath = path.join(targetPath, data.tableFileNameWithExt);

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

            if (checkFileExists(tableFilePath)) {
              let content = fs.readFileSync(tableFilePath, 'utf8');
              const sourceExisting = ts.createSourceFile(file.fileName, content, ts.ScriptTarget.Latest);
              if (sourceExisting) {
                data.tablesAlreadyExists = true;
                const result = ts.transform(sourceExisting, [tableExtendTransformerFactory(transformedSourceFile)]);
                const fullFile = result.transformed[0];
                file.content = printer.printFile(fullFile);
              }
            } else {
              const result = ts.transform(transformedSourceFile, [tableBasicImportTransformerFactory()]);
              const newTableSourceFile = result.transformed[0];
              file.content = printer.printFile(newTableSourceFile);
            }
          }
        }
        return file
      },
    });
    CliUx.ux.log(`Table ${args.tableName} successfully created`);
    CliUx.ux.log(`Adding the table to the contract ${contractName}`);

    // Adding table to contract file
    const program = ts.createProgram([contractFilePath], {});
    const source = program.getSourceFile(contractFilePath);
    if (source) {
      const result = ts.transform(source, [contractAddTableTransformerFactory(data)]);
      writeFile(contractFilePath, printer.printFile(result.transformed[0]))
    }

    CliUx.ux.log(green(`Contract ${contractName} was successfully updated`));
  }
}
