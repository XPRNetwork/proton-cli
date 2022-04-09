import { Authority } from "@bloks/api"
import { CliUx } from "@oclif/core"
import { green } from "colors"
import { IProtonLinkSessionManagerSessionExtended, ProtonLinkSessionManager } from "../esr"
import { handleURI } from "./handleUri"
import { signRequest } from "./parseUri"

export const signUri = async (uri: string, auth: Authority, sessionManager: ProtonLinkSessionManager, session?: IProtonLinkSessionManagerSessionExtended) => {
    const res = await handleURI(uri, auth, session)
    await CliUx.ux.log(green('Transaction Request:'))
    await CliUx.ux.styledJSON(res!.resolved.resolvedTransaction)
    const accept = await CliUx.ux.confirm('Would you like to sign this transaction?')
    if (accept) {
        await signRequest(
            res!.chainId,
            res!.resolved,
            res!.scheme,
            sessionManager,
            res!.callback,
        )
    }
}