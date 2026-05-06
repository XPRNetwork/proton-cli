import { Command, Args } from '@oclif/core'
import { ux } from '../../utils/ux'

import { green, red } from 'colors'
import { ProtonLinkSessionManager } from '../../apis/esr/manager'
import { IProtonLinkSessionManagerSessionExtended } from '../../apis/esr/session'
import { ProtonLinkSessionManagerStorage, ProtonLinkSessionManagerStorageOptions } from '../../apis/esr/storage'
import { v4 as uuid } from 'uuid'
import { PrivateKey } from '@greymass/eosio'

import { network } from '../../storage/networks'
import { signUri } from '../../apis/uri/signUri'

const DEFAULT_SERVICE = 'cb.anchor.link'

export default class CreateSession extends Command {
  static description = 'Create Session'

  static args = {
    uri: Args.string({
      required: true,
    }),
  }

  async run() {
    const {args} = await this.parse(CreateSession)

    // Parse URI
    const uri = args.uri
    
    // Get account
    const promptAccount = await ux.prompt('Enter account to login with (e.g. account@active)', { required: true })
    const [actor, permission] = promptAccount.split('@')
    const auth = { actor, permission }

    // Create storage
    let localData: ProtonLinkSessionManagerStorageOptions = {
      linkId: uuid(),
      linkUrl: DEFAULT_SERVICE,
      requestKey: PrivateKey.generate('K1').toWif(),
			sessions: [],
		}
    
    const storage: ProtonLinkSessionManagerStorage = new ProtonLinkSessionManagerStorage(
      localData,
        async (storage: ProtonLinkSessionManagerStorageOptions) => {
          localData = storage
        },
        () => localData.sessions
    )

    // Create session manager
    const sessionManager = new ProtonLinkSessionManager({
      handler: {
          onIncomingRequest: async (uri: string, session: IProtonLinkSessionManagerSessionExtended) => {
            // console.log('onIncomingRequest')
            await signUri(uri, auth, sessionManager, session)
          },
          onSocketEvent: (type: string, event: any) => {
            // console.log(type, event)
          }
      },
      storage
    })
    await sessionManager.connect()
    
    // Account key
    const account = await network.rpc.get_account(actor)
    const perm = account.permissions.find(_ => _.perm_name === permission)
    if (!perm) {
      throw new Error(`No permission found for ${actor}@${permission}`)
    }

    await signUri(uri, auth, sessionManager)
    await ux.log(`${green('Success:')} TX Signed`)

    // Prevent it from dying
    setTimeout(() => {}, 1000 * 60 * 60 * 24)
  }

  async catch(e: Error) {
    ux.error(red(e.message))
  }
}
