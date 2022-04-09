/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { Bytes, PrivateKey, PublicKey, Serializer } from '@greymass/eosio'
import { SealedMessage } from '@proton/link'
import { IProtonLinkSessionManagerSessionExtended } from '@/types'

import RobustWebSocket from './websocket'
import { ProtonLinkSessionManagerSession } from './session'
import { ProtonLinkSessionManagerStorage } from './storage'
import { unsealMessage } from './utils'

export interface ProtonLinkSessionManagerEventHander {
	onIncomingRequest(payload: string, session: IProtonLinkSessionManagerSessionExtended): void
	onSocketEvent?(type: string, event: any): void
}

export interface ProtonLinkSessionManagerOptions {
	handler: ProtonLinkSessionManagerEventHander
	storage: ProtonLinkSessionManagerStorage
}

export class ProtonLinkSessionManager {
	private handler: ProtonLinkSessionManagerEventHander
	public storage: ProtonLinkSessionManagerStorage

	private socket?: RobustWebSocket

	public constructor(options: ProtonLinkSessionManagerOptions) {
		this.handler = options.handler
		this.storage = options.storage
	}

	public addSession(session: ProtonLinkSessionManagerSession) {
		this.storage.add(session)
	}

	public clearSessions() {
		this.storage.clear()
	}

	public removeSession(session: ProtonLinkSessionManagerSession) {
		this.storage.remove(session)
	}

	public updateLastUsed(publicKey: PublicKey) {
		this.storage.updateLastUsed(publicKey)
	}

	public connect() {
		return new Promise((resolve, reject) => {
			const linkUrl = `wss://${this.storage.linkUrl}/${this.storage.linkId}`
			const ws = new RobustWebSocket(linkUrl)

			const onSocketEvent = (type: string, event: any) => {
				try {
					if (this.handler && this.handler.onSocketEvent) {
						this.handler.onSocketEvent(type, event)
					}
				} catch (e) {
					console.error(type, event)

					reject(e)
				}
			}

			ws.addEventListener('open', (event: any) => {
				onSocketEvent('onopen', event)
				resolve(this.socket)
			})

			ws.addEventListener('message', (event: any) => {
				onSocketEvent('onmessage', event)
				this.handleRequest(event.data)
			})

			ws.addEventListener('error', (event: any) => {
				onSocketEvent('onerror', event)
			})

			ws.addEventListener('close', (event: any) => {
				console.log('onclose')
				onSocketEvent('onclose', event)
			})

			ws.addEventListener('ping', (event: any) => {
				onSocketEvent('onping', event)
				this.socket?.send('pong')
			})

			this.socket = ws
		}).catch((error) => {
			console.error(
				'SessionManager connect: caught error in promise',
				error.message,
				error.code,
			)
		})
	}

	public async disconnect() {
		console.error('SessionManager disconnect')
		this.socket?.close(1000)
	}

	public handleRequest(encoded: Bytes): string {
		// Decode the incoming message
		const message = Serializer.decode({
			type: SealedMessage,
			data: encoded,
		})

		// Unseal the message using the session managers request key
		const unsealed = unsealMessage(
			message.ciphertext,
			PrivateKey.from(this.storage.requestKey),
			message.from,
			message.nonce,
		)

		// Ensure an active session for this key exists in storage
		const session = this.storage.getByPublicKey(message.from)
		if (!session) {
			throw new Error(`Unknown session using ${message.from}`)
		}

		// Updating session lastUsed timestamp
		this.updateLastUsed(message.from)

		// Fire callback for onIncomingRequest defined by client application
		this.handler.onIncomingRequest(unsealed, session)

		// Return the unsealed message
		return unsealed
	}
}
