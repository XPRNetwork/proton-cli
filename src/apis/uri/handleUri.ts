import { Authority } from '@proton/api'
import { IProtonLinkSessionManagerSessionExtended } from '../esr'
import { getProtonAvatar } from '../getProtonAvatar'
import { parseURI } from './parseUri'

export async function handleURI(
	uri: string,
    currentAuth: Authority,
	session?: IProtonLinkSessionManagerSessionExtended,
) {
    if (uri.indexOf('//link') !== -1) {
        return
    }

    const { request, chainId, resolved, scheme } = await parseURI(
        uri,
        {
            actor: currentAuth.actor,
            permission: currentAuth.permission,
        }
    )

    const isIdentity = request.isIdentity()
    const account = session
        ? session.requestAccount && session.requestAccount.toString()
        : resolved.request.getInfoKey('req_account')
    const dataCallback = request.data.callback
    const accInfo = !account ? null : await getProtonAvatar(account)

    return {
        isIdentity,
        chainId,
        resolved,
        scheme,
        account: account && accInfo ? account : undefined,
        avatar: accInfo?.avatar,
        name: accInfo?.name,
        callback: dataCallback,
    }
}
