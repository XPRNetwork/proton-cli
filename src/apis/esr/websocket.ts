/* eslint-disable @typescript-eslint/no-explicit-any */
import WebSocket from 'ws'

interface Options {
	timeout: number
	// eslint-disable-next-line no-use-before-define
	shouldReconnect: (event: any, ws: RobustWebSocket) => number | undefined
}

export default class RobustWebSocket {
	public realWs?: WebSocket
	public url: string
	public attempts = 0
	public reconnects = -1
	public explicitlyClosed = false
	public binaryType: BinaryType = 'arraybuffer'

	public pendingReconnect?: number = undefined
	public connectTimeout?: number = undefined

	public listeners: Record<string, any> = {
		open: [
			(event: any) => {
				console.log('Open WS: ' + this.url)

				if (this.connectTimeout) {
					clearTimeout(this.connectTimeout)
					this.connectTimeout = undefined
				}
				event.reconnects += 1
				event.attempts = this.attempts

				this.explicitlyClosed = false
				this.clearPendingReconnectIfNeeded()
			},
		],
		close: [(event: any) => this.reconnect(event)],
	}

	public opts: Options = {
		// the time to wait before a successful connection
		// before the attempt is considered to have timed out
		timeout: 4000,
		// Given a CloseEvent or OnlineEvent and the RobustWebSocket state,
		// should a reconnect be attempted? Return the number of milliseconds to wait
		// to reconnect (or null or undefined to not), rather than true or false
		shouldReconnect(event, ws) {
			if ([1000, 4001].includes(event.code)) {
				return undefined
			}
			if (event.type === 'online') {
				return 0
			}

			return Math.pow(1.5, ws.attempts) * 300
		}
	}

	public constructor(url: string, opts: Partial<Options> = {}) {
		this.url = url

		this.opts = {
			...this.opts,
			...opts,
		}

		if (typeof this.opts.timeout !== 'number') {
			throw new Error(
				'timeout must be the number of milliseconds to timeout a connection attempt',
			)
		}

		if (typeof this.opts.shouldReconnect !== 'function') {
			throw new Error(
				'shouldReconnect must be a function that returns the number of milliseconds to wait for a reconnect attempt, or null or undefined to not reconnect.',
			)
		}

		this.newWebSocket(this.url)
	}

	public newWebSocket(url: string) {
		this.pendingReconnect = undefined

		this.realWs = new WebSocket(url)
		this.realWs.binaryType = this.binaryType as any

		// Only add once per event e.g. onping for ping
		const onEvent = (stdEvent: string) => (event: { data: ArrayBuffer }) => {
			this.dispatchEvent(event)

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const cb = this[`on${stdEvent}`]
			if (typeof cb === 'function') {
				return cb(event)
			}
		}

		for (const stdEvent of ['open', 'close', 'message', 'error', 'ping']) {
			if (this.realWs) {
				this.realWs.addEventListener(stdEvent as any, onEvent(stdEvent) as any)
			}
		}

		this.attempts += 1
		this.dispatchEvent({
			type: 'connecting',
			attempts: this.attempts,
			reconnects: this.reconnects,
		})

		this.connectTimeout = setTimeout(() => {
			this.connectTimeout = undefined

			this.dispatchEvent({
				type: 'timeout',
				attempts: this.attempts,
				reconnects: this.reconnects,
			})
		}, this.opts.timeout) as unknown as number
	}

	public clearPendingReconnectIfNeeded() {
		if (this.pendingReconnect) {
			clearTimeout(this.pendingReconnect)
			this.pendingReconnect = undefined
		}
	}

	public send(data: any) {
		if (this.realWs) {
			return this.realWs.send(data)
		}
	}

	public close(code?: number, reason?: string) {
		console.log(
			'Close WS:' +
				`\n\tcode: ${code}` +
				`\n\reason:${reason}`
		)

		if (typeof code !== 'number') {
			reason = code
			code = 1000
		}

		this.clearPendingReconnectIfNeeded()
		this.explicitlyClosed = true

		if (this.realWs) {
			this.realWs.close(code, reason)

			return
		}
	}

	public reconnect(event: any) {
		console.log(
			'Reconnect WS:' +
				`\n\tcode: ${event.code}` +
				`\n\texplicitlyClosed:${this.explicitlyClosed}` +
				`\n\tdelay: ${this.opts.shouldReconnect(event, this)}`,
		)

		if (this.explicitlyClosed) {
			this.attempts = 0
			return
		}

		const delay = this.opts.shouldReconnect(event, this)
		if (typeof delay === 'number') {
			this.pendingReconnect = setTimeout(
				() => this.newWebSocket(this.url),
				delay,
			) as unknown as number
		}
	}

	// Taken from MDN https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
	public addEventListener(type: string, callback: any) {
		if (!this.listeners[type]) {
			this.listeners[type] = []
		}

		this.listeners[type].push(callback)
	}

	public removeEventListener(type: string, callback: any) {
		if (!this.listeners[type]) {
			return
		}
		const stack = this.listeners[type]
		for (let i = 0, l = stack.length; i < l; i += 1) {
			if (stack[i] === callback) {
				stack.splice(i, 1)

				return
			}
		}
	}

	public dispatchEvent(event: any) {
		if (!this.listeners[event.type]) {
			return
		}
		for (const listener of this.listeners[event.type]) {
			listener(event)
		}
	}
}
