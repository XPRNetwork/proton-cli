import * as path from 'path';
import globby from 'globby';

import { buildContractFileName, checkFileExists } from './fileManagement';

export async function extractContract(targetPath: string, contract?: string): Promise<string[]> {
  let contractName = '';
  let contractFilePath = '';
  if (contract) {
    contractName = contract;
    const contractFileName = buildContractFileName(contractName);
    contractFilePath = path.join(targetPath, contractFileName);
    if (!checkFileExists(contractFilePath)) {
      throw `The contract file ${contractFileName} does not exits. May be you forgot to create the contract first?`;
    }
  } else {
    const paths = await globby([path.join(targetPath, '*.contract.ts')])
    if (!paths.length) {
      throw `The contract file is not found. May be you forgot to create the contract first?`;
    }
    if (paths.length > 1) {
      throw `Several contracts are found. Please provide a contract name explicitly. Check --help information for more info`;
    }
    contractFilePath = paths[0];
    const res = contractFilePath.match(/^.+\/(.+)?\.contract\.ts$/);
    if (res) {
      contractName = res[1];
    }
  }
  return [contractName, contractFilePath];
}
