import { ux } from '../../utils/ux'

import { Flags, Command, Args } from '@oclif/core'
import { network } from "../../storage/networks";
import { green } from "colors";

export default class SetEnpoint extends Command {
  static description = "Restore default enpoint";

  static args = {
    endpoint: Args.string({
      required: false,
      description: "Restore default endpoints",
    }),
  };

  async run() {
    network.resetEndpoint();
    ux.log(`${green("Success:")} Endpoints restored to default`);
  }

  async catch(e: Error) {
    ux.error(e);
  }
}
