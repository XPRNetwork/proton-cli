import Conf from "conf";
import { JSONSchemaType as JST } from "json-schema-typed";
import { networks } from "../constants";

const schema = {
  privateKeys: {
    type: JST.Array,
    items: {
      type: JST.String,
    },
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
            type: JST.String,
          },
        },
      },
    },
  },
  currentChain: {
    type: JST.String,
  },
  revealPasswordHash: {
    type: JST.Object,
    properties: {
      salt: { type: JST.String, pattern: "^[0-9a-fA-F]+$" },
      hash: { type: JST.String, pattern: "^[0-9a-fA-F]+$" },
      N: { type: JST.Number, minimum: 1024, maximum: 1048576 },
      r: { type: JST.Number, minimum: 1, maximum: 32 },
      p: { type: JST.Number, minimum: 1, maximum: 16 },
      keyLen: { type: JST.Number, minimum: 16, maximum: 128 },
    },
    required: ["salt", "hash", "N", "r", "p", "keyLen"],
  },
};

export interface RevealPasswordHash {
  salt: string;
  hash: string;
  N: number;
  r: number;
  p: number;
  keyLen: number;
}

export const config = new Conf<{
  privateKeys: string[];
  isLocked: boolean;
  tryKeychain: boolean;
  networks: { chain: string; endpoints: string[] }[];
  currentChain: string;
  endpoints?: { chain: string; endpoints: string[] }[];
  revealPasswordHash?: RevealPasswordHash;
}>({
  schema,
  configName: "proton-cli",
  projectVersion: "0.0.2",
  defaults: {
    privateKeys: [],
    tryKeychain: false,
    isLocked: false,
    networks,
    currentChain: networks[0].chain,
  },
  migrations: {
    "0.0.1": (store) => {
      const networks = store.get("networks");
      store.set("networks", networks);
    },
  },
});
