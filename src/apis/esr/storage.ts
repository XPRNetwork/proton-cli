import { Checksum256, Name, PrivateKeyType, PublicKeyType } from '@greymass/eosio'
import { IProtonLinkSessionManagerSessionExtended } from './session'
import { ProtonLinkSessionManagerSession } from './session'

export interface ProtonLinkSessionManagerStorageOptions {
	linkId: string
	linkUrl: string
	requestKey: PrivateKeyType
	sessions: ProtonLinkSessionManagerSession[]
}

type TSetSessionsSync = (storage: ProtonLinkSessionManagerStorageOptions) => Promise<void>
type TGetSessions = () => ProtonLinkSessionManagerSession[]

type TProtonLinkSessionManagerStorageOptions = Omit<
	ProtonLinkSessionManagerStorageOptions,
	'sessions'
>

export class ProtonLinkSessionManagerStorage {
	public linkId: string
	public linkUrl = 'cb.anchor.link'
	public requestKey: PrivateKeyType
	private setSessionsSync!: (storage: ProtonLinkSessionManagerStorageOptions) => Promise<void>
	private getSessions!: () => IProtonLinkSessionManagerSessionExtended[]

	private findSessionIndex(session: IProtonLinkSessionManagerSessionExtended) {
		return this.sessions.findIndex((s: IProtonLinkSessionManagerSessionExtended) => {
			const matchingNetwork = session.network.equals(s.network)
			const matchingActor = session.actor.equals(s.actor)
			const matchingPermissions = session.permission.equals(s.permission)
			const matchingRequestor = session.requestAccount.equals(s.requestAccount)
			const matchingAppName = session.name.equals(s.name)
			const matchingPublicKey = session.publicKey.equals(s.publicKey)

			return (
				matchingNetwork &&
				matchingActor &&
				matchingPermissions &&
				matchingRequestor &&
				matchingAppName &&
				matchingPublicKey
			)
		})
	}

	public constructor(
		options: TProtonLinkSessionManagerStorageOptions,
		setSessionsSync: TSetSessionsSync,
		getSessions: TGetSessions,
	) {
		this.linkId = options.linkId
		this.linkUrl = options.linkUrl
		this.requestKey = options.requestKey
		this.setSessionsSync = setSessionsSync
		this.getSessions = getSessions
	}

	public get sessions() {
		return this.getSessions()
	}

	public set sessions(sessions: IProtonLinkSessionManagerSessionExtended[]) {
		this.setSessionsSync({
			linkId: this.linkId,
			linkUrl: this.linkUrl,
			requestKey: this.requestKey,
			sessions,
		})
	}

	public add(session: IProtonLinkSessionManagerSessionExtended) {
		const newSessions = [...this.sessions]
		const existingIndex = this.findSessionIndex(session)

		if (existingIndex >= 0) {
			newSessions.splice(existingIndex, 1, session)
		} else {
			newSessions.push(session)
		}

		this.sessions = newSessions
	}

	public get(
		chainId: Checksum256,
		account: Name,
		permission: Name,
	): IProtonLinkSessionManagerSessionExtended | undefined {
		return this.sessions.find(
			(s: IProtonLinkSessionManagerSessionExtended) =>
				!(chainId === s.network && account === s.name && permission === s.permission),
		)
	}

	public updateLastUsed(publicKey: PublicKeyType): boolean {
		const session = this.getByPublicKey(publicKey)

		if (!session) {
			return false
		}

		try {
			const newSession = new ProtonLinkSessionManagerSession(
				session.network,
				session.actor,
				session.permission,
				session.publicKey,
				session.name,
				session.requestAccount,
				session.created,
				session.lastUsed,
			)

			newSession.updateLastUsed(Date.now())

			this.add(newSession)

			return true
		} catch (_) {
			return false
		}
	}

	public getByPublicKey(
		publicKey: PublicKeyType,
	): IProtonLinkSessionManagerSessionExtended | undefined {
		return this.sessions.find(
			(s: IProtonLinkSessionManagerSessionExtended) =>
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				publicKey.toString() === s.publicKey.toString(),
		)
	}

	public has(publicKey: PublicKeyType): boolean {
		return this.sessions.some(
			(s: IProtonLinkSessionManagerSessionExtended) =>
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				publicKey.toString() === s.publicKey.toString(),
		)
	}

	public clear() {
		this.sessions = []
	}

	public remove(session: IProtonLinkSessionManagerSessionExtended) {
		this.sessions = this.sessions.filter(
			(s: IProtonLinkSessionManagerSessionExtended) =>
				!(
					session.name.toString() === s.name.toString() &&
					session.publicKey.toString() === s.publicKey.toString() &&
					session.network.toString() === s.network.toString() &&
					session.actor.toString() === s.actor.toString() &&
					session.permission.toString() === s.permission.toString() &&
					session.requestAccount.toString() === s.requestAccount.toString()
				),
		)
	}

	public serialize(): string {
		return JSON.stringify({
			...this,
			sessions: this.sessions,
		})
	}

	public static unserialize(
		raw: string,
		setSessionsSync: TSetSessionsSync,
		getSessions: TGetSessions,
	): ProtonLinkSessionManagerStorage {
		const data = JSON.parse(raw)

		return new ProtonLinkSessionManagerStorage(data, setSessionsSync, getSessions)
	}
}
