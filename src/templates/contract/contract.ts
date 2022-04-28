import { Contract } from 'proton-tsc'

@contract
export class ContractTemplate extends Contract {

  @action("action1")
  action1(): void {
    // Add here a code of your contract
  }
}
