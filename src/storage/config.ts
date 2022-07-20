import Conf from 'conf'
import { JSONSchemaType as JST } from 'json-schema-typed'
import { networks } from '../constants';

const schema = {
	privateKeys: {
		type: JST.Array,
        items: {
            type: JST.String
        }
	},
	isLocked: {
		type: JST.Boolean,
	},
	tryKeychain: {
		type: JST.Boolean,
	},
	networks: {
		type: JST.Array,
		items: {
			type: JST.Object,
			properties: {
				chain: {
					type: JST.String,
				},
				endpoints: {
					type: JST.Array,
					items: {
						type: JST.String
					}
				}
			}
		}
	},
	currentChain: {
		type: JST.String,
	}
};

export const config = new Conf<{
	privateKeys: string[],
	isLocked: boolean,
	tryKeychain: boolean,
	networks: { chain: string, endpoints: string[] }[],
	currentChain: string
}>({
    schema,
    configName: 'proton-cli',
    projectVersion: '0.0.2',
	defaults: {
		privateKeys: [],
		tryKeychain: false,
		isLocked: false,
		networks,
		currentChain: networks[0].chain
	},
    migrations: {
		'0.0.1': store => {
			const networks = store.get('networks')
			store.set('networks', networks)
		}
	},
});