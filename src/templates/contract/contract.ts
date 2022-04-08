import { contract, action, Contract } from 'as-chain'

@contract("<%= contractName %>")
export class <%= className %> extends Contract {
  @action("action")
  action(): void {
    // Add here a code of your contract
  }
}
