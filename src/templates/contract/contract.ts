import { Contract } from 'as-chain'

@contract
export class <%= className %> extends Contract {
  @action("action1")
  action1(): void {
    // Add here a code of your contract
  }
}
