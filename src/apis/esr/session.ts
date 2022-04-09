import {
	Checksum256,
	Checksum256Type,
	Name,
	NameType,
	PublicKey,
	PublicKeyType,
} from '@greymass/eosio'
import { LinkCreate } from '@proton/link'
import {
	DEFAULT_SCHEME,
	SigningRequest,
	SigningRequestEncodingOptions,
} from '@proton/signing-request'
import zlib from 'pako'

export interface IProtonLinkSessionManagerSessionExtended extends ProtonLinkSessionManagerSession {
	avatar?: string
	displayName?: string
}

export class ProtonLinkSessionManagerSession {
	public actor!: Name
	public permission!: Name
	public name!: Name
	public requestAccount!: Name
	public network!: Checksum256
	public publicKey!: PublicKey
	public created!: number
	public lastUsed!: number

	public constructor(
		network: Checksum256Type,
		actor: NameType,
		permission: NameType,
		publicKey: PublicKeyType,
		name: NameType,
		requestAccount: NameType,
		created?: number,
		lastUsed?: number,
	) {
		this.network = Checksum256.from(network)
		this.actor = Name.from(actor)
		this.permission = Name.from(permission)
		this.publicKey = PublicKey.from(publicKey)
		this.name = Name.from(name)
		this.requestAccount = Name.from(requestAccount)
		this.created = created || Date.now()
		this.lastUsed = lastUsed || Date.now()
	}

	public updateLastUsed(time: number) {
		this.lastUsed = time
	}

	public static fromIdentityRequest(
		network: Checksum256Type,
		actor: NameType,
		permission: NameType,
		payload: string,
		options: SigningRequestEncodingOptions = { scheme: DEFAULT_SCHEME },
	) {
		const requestOptions = {
			...options,
			zlib: options.zlib || zlib,
		}

		const request = SigningRequest.from(payload, requestOptions)

		if (!request.isIdentity()) {
			throw new Error('supplied request is not an identity request')
		}

		const linkInfo = request.getInfoKey('link', LinkCreate)

		if (!linkInfo || !linkInfo['request_key'] || !linkInfo['session_name']) {
			throw new Error('identity request does not contain link information')
		}

		return new ProtonLinkSessionManagerSession(
			network,
			actor,
			permission,
			String(linkInfo['request_key']),
			String(linkInfo['session_name']),
			request.getInfoKey('req_account'),
		)
	}
}
