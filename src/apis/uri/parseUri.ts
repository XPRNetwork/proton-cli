import zlib from 'pako'
import {
	SigningRequest,
	PlaceholderName,
	PlaceholderPermission,
	ResolvedSigningRequest,
	ResolvedCallback,
	SigningRequestEncodingOptions,
} from '@proton/signing-request'
import { Authority } from '@proton/api'
import { ABI, Name } from '@greymass/eosio'
import { Key } from '@proton/js'
import { fetchWithTimeout } from './fetch'
import { network } from '../../storage/networks'
import { ProtonLinkSessionManager, ProtonLinkSessionManagerSession } from '../esr'
import passwordManager from '../../storage/passwordManager'

const SUPPORTED_SCHEMES = ['proton', 'proton-dev', 'esr']
const WALLET_NAME = 'Proton CLI'

function detectPlaceholders(req: any) {
	const [reqType, reqData] = req
	switch (reqType) {
		case 'action': {
			const matching = reqData.authorization.filter(
				(auth: any) =>
					auth.actor === PlaceholderName || auth.permission === PlaceholderPermission,
			)

			return matching.length > 0
		}
		case 'action[]': {
			const matching = reqData.filter(
				(r: any) =>
					r.authorization.filter(
						(auth: any) =>
							auth.actor === PlaceholderName ||
							auth.permission === PlaceholderPermission,
					).length > 0,
			)

			return matching.length > 0
		}
		case 'transaction': {
			const matching = reqData.actions.filter(
				(r: any) =>
					r.authorization.filter(
						(auth: any) =>
							auth.actor === PlaceholderName ||
							auth.permission === PlaceholderPermission,
					).length > 0,
			)

			return matching.length > 0
		}
		case 'identity': {
			// for now, always allow placeholders for identity
			return true
		}
		default: {
			throw new Error('unrecognized request type')
		}
	}
}

export async function callbackURIWithError(url: string, error = 'Unknown error') {
	if (!url) {
		return
	}

	try {
		await fetchWithTimeout(url, {
			method: 'POST',
			body: JSON.stringify({
				rejected: error,
			}),
			timeout: 3000,
		})
	} catch (e) {
		console.error(e)
	}
}

export async function callbackURIWithProcessed(callback: ResolvedCallback) {
	const { background, payload, url } = callback

	// If it's not a background call, return to state
	if (!background) {
		return
	}

	// Otherwise execute background call
	try {
		await fetchWithTimeout(url, {
			method: 'POST',
			body: JSON.stringify(payload),
			timeout: 3000,
		})
	} catch (e) {
		console.error(e)
	}
}

export async function parseURI(
	uri: string,
	authorization: Authority
) {
	if (!uri) {
		throw new Error('No handleable URI')
	}

	let [scheme] = uri.split(':')
	if (!SUPPORTED_SCHEMES.includes(scheme)) {
		throw new Error(`Scheme must be ${SUPPORTED_SCHEMES.join(' or ')}`)
	}

	try {
		// Setup decompression
		const opts = {
			zlib,
			scheme: scheme as SigningRequestEncodingOptions['scheme'],
			abiProvider: {
				getAbi: async (account: Name) => {
					const { abi } = await network.rpc.get_abi(account.toString())
					return ABI.from(abi)
				}
			},
		}

		// Interpret the Signing Request
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const request = SigningRequest.from(uri, opts)

		// Retrieve ABIs for this request
		const abis = await request.fetchAbis()

		// Resolve the transaction
		let transactionHeader = {}
		if (!request.isIdentity()) {
			transactionHeader = await network.api.generateTapos(
                undefined,
                // @ts-ignore
                {},
                300,
                false,
                3000,
            )
		}

		if (request.isMultiChain()) {
			throw new Error('Multichain not supported')
		}

		const resolved = request.resolve(abis, authorization, transactionHeader)

		// Placeholders
		const req = JSON.parse(JSON.stringify(request.data.req))
		const placeholders = detectPlaceholders(req)

		// Get the requested chain(s)
		const chainId = request.getChainId().toString()

		return {
			request,
			req,
			resolved,
			placeholders,
			chainId,
			scheme,
		}
	} catch (e) {
		console.error('parseURI', e)
		throw e
	}
}

export async function signRequest(
	chainId: string,
	resolved: ResolvedSigningRequest,
	scheme: string,
    sessionManager: ProtonLinkSessionManager,
	callbackUrl?: string,
) {
	try {
		if (!resolved || !resolved.request) {
			throw new Error('No resolved request found')
		}

        const signatureProvider = await network.getSignatureProvider()
		const requiredKeys = await network.api.authorityProvider.getRequiredKeys({
			transaction: resolved.transaction,
			availableKeys: await passwordManager.getPublicKeys()
		});

		const signed = await signatureProvider.sign({
			chainId,
			requiredKeys,
			serializedTransaction: resolved.serializedTransaction,
		})

		let broadcasted
		if (resolved.request.shouldBroadcast()) {
			broadcasted = await network.api.pushSignedTransaction(signed)
		}

		const callbackParams = resolved.getCallback(
			signed.signatures,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			broadcasted ? broadcasted.processed.block_num : 0,
		)

		if (callbackParams) {
			if (resolved.request.isIdentity()) {
				const { info } = resolved.request.data
				const isLinkSession = info.some((i) => i.key === 'link')

				if (isLinkSession) {
					const session = ProtonLinkSessionManagerSession.fromIdentityRequest(
						chainId, // CHAIN ID
						callbackParams.payload.sa, // actor
						callbackParams.payload.sp, // permission
						resolved.request.toString(), // payload
						{
							scheme: scheme as SigningRequestEncodingOptions['scheme'], // scheme
						},
					)

					sessionManager.addSession(session)

					if (sessionManager.storage.requestKey && sessionManager.storage.linkId) {
						callbackParams.payload = {
							...callbackParams.payload,
							link_ch: `https://${sessionManager.storage.linkUrl}/${sessionManager.storage.linkId}`,
							link_key: Key.PrivateKey.fromString(sessionManager.storage.requestKey.toString())
								.getPublicKey()
								.toString(),
							link_name: WALLET_NAME,
						}
					}
				}
			}

			callbackURIWithProcessed(callbackParams)
		}

		// Handle info
		// const returnPath = resolved.request.getInfoKey('return_path')
		// if (returnPath && !(await isIosAppOnMac())) {
		// 	Linking.openURL(returnPath)
		// }
	} catch (err) {
		console.error(err)
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
        callbackURIWithError(callbackUrl, 'Request cancelled from WebAuth.com Wallet')
	}
}
