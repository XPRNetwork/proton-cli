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
				endpoint: {
					type: JST.String,
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
	networks: { chain: string, endpoint: string }[],
	currentChain: string
}>({
    schema,
    configName: 'proton-cli',
    projectVersion: '0.0.0',
	defaults: {
		privateKeys: [],
		tryKeychain: false,
		isLocked: false,
		networks,
		currentChain: networks[0].chain
	},
    migrations: {
		// '1.0.0': (store: Conf) => {
		// 	store.delete('debugPhase');
		// 	store.set('phase', '1.0.0');
		// }
	},
});