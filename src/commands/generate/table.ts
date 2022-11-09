import { CliUx, Command, Flags } from '@oclif/core'
import * as path from 'path';
import { green, red } from 'colors';
import { prompt } from 'inquirer'

import { destinationFolder } from '../../core/flags';
import { checkFileExists, extractContract, validateName } from '../../utils';

import { Project, ScriptTarget, SourceFile } from 'ts-morph';
import {
  addNamedImports, constructorAddParameter, FORMAT_SETTINGS,
  IParameter, tableAddPrimaryParameter,
  constructorAddParameters, parameterPrompt, parametersExtractImports
} from '../../core/generators';

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

  static description = 'Add table for the smart contract';

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

  private data: any = {}
  private project?: Project;

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
    try {
      [contractName, contractFilePath] = await extractContract(targetPath, flags.contract);
    } catch (err: any) {
      return this.error(red(err));
    }

    this.data = {
      tableName: args.tableName,
      contractName: contractName,
      className: flags.class || args.tableName,
      isSingleton: false,
      tableFileName: `${contractName}.tables`,
      tableFileNameWithExt: `${contractName}.tables.ts`
    }

    CliUx.ux.log(green(`Starting to generate a table '${this.data.tableName}' for contract`));
    CliUx.ux.log(green(`Let's collect some properties:`));

    if (!flags.class) {
      this.data.className = this.data.className.charAt(0).toUpperCase() + this.data.className.slice(1)
      const { tableClass } = await prompt<{ tableClass: string; }>({
        name: 'tableClass',
        type: 'input',
        message: `Enter the name of Typescript class for the table:`,
        default: this.data.className,
      });
      this.data.className = tableClass;
    }

    if (!flags.singleton) {
      const { isSingleton } = await prompt<{ isSingleton: boolean }>([
        {
          name: 'isSingleton',
          type: 'confirm',
          message: 'Is the table singleton?',
          default: false,
        },
      ]);
      this.data.isSingleton = isSingleton;
    }

    const tableFilePath = path.join(targetPath, this.data.tableFileNameWithExt);

    this.project = new Project({
      compilerOptions: {
        target: ScriptTarget.Latest
      },
    });

    try {
      await this.createTable(tableFilePath);
    } catch (e: any) {
      return this.error(red(e));
    }

    try {
      this.updateContract(contractFilePath);
    } catch (e: any) {
      return this.error(red(e));
    }
  }

  private async createTable(tableFilePath: string) {
    let sourceTables: SourceFile | undefined;
    if (this.project) {
      if (checkFileExists(tableFilePath)) {
        this.project.addSourceFilesAtPaths([tableFilePath]);
        sourceTables = this.project.getSourceFile(tableFilePath);
      } else {
        sourceTables = this.project.createSourceFile(tableFilePath);
      }

      if (sourceTables) {
        const classExists = sourceTables.getClass(this.data.className);
        if (!classExists) {

          const table = sourceTables.addClass({
            name: this.data.className,
            isExported: true,
            extends: 'Table',
          });

          const decorator = table.addDecorator({
            name: "table"
          });
          decorator.addArgument(`"${this.data.tableName}"`);

          if (this.data.isSingleton) {
            decorator.addArgument('singleton');
          }

          const tableContructor = table.addConstructor(
            {
              statements: ['super()']
            }
          );

          const namedImports = ["Name", "Table"];

          CliUx.ux.log(`Let's add a primary parameter for the table`);

          const primaryProperty = await parameterPrompt(
            [],
            {
              preset: {
                isArray: false,
                isNullable: false
              },
              type: 'primary parameter'
            }
          );

          const typesToImport = parametersExtractImports([primaryProperty]);
          if (typesToImport.length > 0) {
            namedImports.push(...typesToImport);
          }

          constructorAddParameter(tableContructor, primaryProperty);
          tableAddPrimaryParameter(table, primaryProperty);

          CliUx.ux.log(`————————————`);

          const { addMore } = await prompt<{ addMore: boolean }>([
            {
              name: 'addMore',
              type: 'confirm',
              message: 'Do you want to one more parameter?',
              default: false,
            },
          ]);

          if (addMore) {
            const existingProperties: IParameter[] = [primaryProperty];
            const extraImports = await constructorAddParameters(tableContructor, existingProperties);
            if (extraImports.length > 0) {
              namedImports.push(...extraImports);
            }
          }

          addNamedImports(sourceTables, 'proton-tsc', namedImports);

          sourceTables.formatText(FORMAT_SETTINGS);
          sourceTables.saveSync();
          CliUx.ux.log(`Table ${this.data.tableName} successfully created`);
        } else {
          throw `The table ${this.data.className} already exists. Try changing the name.`;
        }
      }
    }
  }

  private updateContract(contractFilePath: string) {
    CliUx.ux.log(`Adding the table to the contract ${this.data.contractName}`);
    if (this.project) {
      this.project.addSourceFilesAtPaths([contractFilePath])
      const contractSource = this.project.getSourceFile(contractFilePath);
      if (contractSource) {
        const protonImportClass = this.data.isSingleton ? 'Singleton' : 'TableStore';

        addNamedImports(contractSource, 'proton-tsc', [protonImportClass])
        addNamedImports(contractSource, `./${this.data.tableFileName}`, [this.data.className])

        const contractClass = contractSource.getClass(this.data.contractName);
        if (contractClass) {
          const methodName = `${this.data.className.toLowerCase()}${protonImportClass}`;
          const methodExists = contractClass.getProperty(methodName);
          if (!methodExists) {
            const maxIdx = contractClass.getProperties().length;
            contractClass.insertProperty(maxIdx, {
              name: methodName,
              type: `${protonImportClass}<${this.data.className}>`,
              initializer: `new ${protonImportClass}<${this.data.className}>(this.receiver)`
            });
          }
        }

        contractSource.formatText(FORMAT_SETTINGS);
        contractSource.saveSync();
        CliUx.ux.log(green(`Contract ${this.data.contractName} was successfully updated`));
      } else {
        throw `Not contract ${this.data.contractName} found`;
      }
    }
  }
}
