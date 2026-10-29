import { ux } from '../../utils/ux'
import { Authority } from "@proton/api"

import { green } from "colors"
import { IProtonLinkSessionManagerSessionExtended, ProtonLinkSessionManager } from "../esr"
import { handleURI } from "./handleUri"
import { signRequest } from "./parseUri"

export const signUri = async (uri: string, auth: Authority, sessionManager: ProtonLinkSessionManager, session?: IProtonLinkSessionManagerSessionExtended) => {
    const res = await handleURI(uri, auth, session)
    await ux.log(green('Transaction Request:'))
    await ux.styledJSON(res!.resolved.resolvedTransaction)
    const accept = await ux.confirm('Would you like to sign this transaction?')
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