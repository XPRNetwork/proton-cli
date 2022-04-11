import { contract, action, Contract } from 'as-chain'

@contract
export class <%= className %> extends Contract {
  @action("action")
  doAction(): void {
    // Add here a code of your contract
  }
}
