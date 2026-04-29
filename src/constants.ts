export const networks = [
  {
    chain: "proton",
    endpoints: [
      "https://rpc.api.mainnet.metalx.com",
      "https://proton.cryptolions.io",
      "https://proton.eosusa.io",
    ],
  },
  {
    chain: "proton-test",
    endpoints: [
      "https://rpc.api.testnet.metalx.com",
      "https://proton-testnet.eoscafeblock.com",
      "https://test.proton.eosusa.io",
    ],
  },
];

export type ChainDiscoveryService = {
  chain: string;
  service_url: string;
};

export const EP_DISCOVERY: ChainDiscoveryService[] = [
  {
    chain: "proton",
    service_url: "https://danemarkbp.com/apis/get_json_mainnet.php?type=ssl",
  },

  {
    chain: "proton-test",
    service_url: "https://danemarkbp.com/apis/get_json_testnet.php?type=ssl",
  },
];
