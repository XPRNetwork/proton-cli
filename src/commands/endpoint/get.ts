import { Command } from '@oclif/core'
import { ux } from '../../utils/ux'

import { network } from "../../storage/networks";
import { config } from "../../storage/config";

export default class GetNetwork extends Command {
  static description = "Get Current enpoint";

  static aliases = ["endpoint"];

  async run() {
    const chain = config.get("currentChain");
    ux.log(`Current Endpoint for ${chain}:`);
    ux.styledJSON(network.network.endpoints);
  }

  async catch(e: Error) {
    ux.styledJSON(e);
  }
}
