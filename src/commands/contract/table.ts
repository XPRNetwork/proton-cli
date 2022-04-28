import { CliUx, Command, Flags } from '@oclif/core'
import * as path from 'path';
import globby from 'globby';
import { green, red } from 'colors';

import { destinationFolder } from '../../core/flags';
import { buildContractFileName, checkFileExists, validateName } from '../../utils';

import { Project, ScriptTarget, SourceFile } from 'ts-morph';
import { FORMAT_SETTINGS, tableAddGetStorageMethod, tableAddParameter, tableAddPrimaryParameter } from '../../core/generators';

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

    this.data = {
      tableName: args.tableName,
      contractName: contractName,
      className: flags.class || args.tableName,
      isSingleton: flags.singleton,
      tableFileName: `${contractName}.tables`,
      tableFileNameWithExt: `${contractName}.tables.ts`
    }
    this.data.className = this.data.className.charAt(0).toUpperCase() + this.data.className.slice(1);

    const tableFilePath = path.join(targetPath, this.data.tableFileNameWithExt);

    this.project = new Project({
      compilerOptions: {
        target: ScriptTarget.Latest
      },
    });

    try {
      this.createTable(tableFilePath);
    } catch (e: any) {
      return this.error(red(e));
    }

    try {
      this.updateContract(contractFilePath);
    } catch (e: any) {
      return this.error(red(e));
    }
  }

  private createTable(tableFilePath: string) {
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

          // TODO Extend this part with fields that user prompts

          tableAddParameter(tableContructor, {
            name: 'account',
            type: 'Name'
          });

          tableAddPrimaryParameter(table, {
            name: 'account',
            type: 'Name'
          });

          tableAddGetStorageMethod(table);

          const protonImports = sourceTables.getImportDeclaration('proton-tsc');
          if (protonImports) {
            const importToAdd = (this.data.isSingleton ? "Singleton" : "TableStore")
            const importExists = protonImports.getNamedImports().find((item) => item.getText() === importToAdd);
            if (!importExists) {
              protonImports.addNamedImport(importToAdd);
            }
          } else {
            sourceTables.addImportDeclaration({
              namedImports: ["Name", "Table", (this.data.isSingleton ? "Singleton" : "TableStore")],
              moduleSpecifier: "proton-tsc",
            });
          }

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
        const importProton = contractSource.getImportDeclaration('proton-tsc');
        if (importProton) {
          const importExists = importProton.getNamedImports().find((item) => item.getText() === protonImportClass);
          if (!importExists) {
            importProton.addNamedImports([protonImportClass]);
          }
        }

        const importTable = contractSource.getImportDeclaration(`./${this.data.tableFileName}`);
        if (importTable) {
          const importExists = importTable.getNamedImports().find((item) => item.getText() === this.data.className);
          if (!importExists) {
            importTable.addNamedImport(this.data.className);
          }
        } else {
          contractSource.addImportDeclaration({
            namedImports: [this.data.className],
            moduleSpecifier: `./${this.data.tableFileName}`,
          });
        }
        const contractClass = contractSource.getClass(this.data.contractName);
        if (contractClass) {
          let methodSuffix = 'Table';
          if (this.data.isSingleton) {
            methodSuffix = 'Singleton';
          }
          const methodName = `${this.data.className.toLowerCase()}${methodSuffix}`;
          const methodExists = contractClass.getProperty(methodName);
          if (!methodExists) {
            const maxIdx = contractClass.getProperties().length;
            contractClass.insertProperty(maxIdx, {
              name: methodName,
              type: `${protonImportClass}<${this.data.className}>`,
              initializer: `${this.data.className}.get${methodSuffix}(this.receiver)`
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
