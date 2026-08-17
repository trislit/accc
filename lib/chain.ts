import { defineChain } from "viem";

export const ROBINHOOD_CHAIN_ID = 4663;
export const ROBINHOOD_TESTNET_ID = 46630;

export const CANONICAL_TBA_REGISTRY =
  "0x000000006551c19487814612e58FE06813775758" as const;

export const ACTIVE_CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_CHAIN_ID ?? String(ROBINHOOD_TESTNET_ID),
);

const MULTICALL3 = {
  address: "0xcA11bde05977b3631167020862bE2a173976CA11" as const,
} as const;

export const robinhoodChain = defineChain({
  id: ROBINHOOD_CHAIN_ID,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_RPC_URL && ACTIVE_CHAIN_ID === ROBINHOOD_CHAIN_ID
          ? process.env.NEXT_PUBLIC_RPC_URL
          : "https://rpc.mainnet.chain.robinhood.com",
      ],
    },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://robinhoodchain.blockscout.com" },
  },
  contracts: { multicall3: MULTICALL3 },
});

export const robinhoodTestnet = defineChain({
  id: ROBINHOOD_TESTNET_ID,
  name: "Robinhood Chain Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_RPC_URL && ACTIVE_CHAIN_ID === ROBINHOOD_TESTNET_ID
          ? process.env.NEXT_PUBLIC_RPC_URL
          : "https://rpc.testnet.chain.robinhood.com",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.testnet.chain.robinhood.com",
    },
  },
  contracts: { multicall3: MULTICALL3 },
});

export const activeChain =
  ACTIVE_CHAIN_ID === ROBINHOOD_CHAIN_ID ? robinhoodChain : robinhoodTestnet;

export const isTestnet = activeChain.id === ROBINHOOD_TESTNET_ID;

export function explorerAddressUrl(address: string) {
  return `${activeChain.blockExplorers.default.url}/address/${address}`;
}

export function explorerTxUrl(hash: string) {
  return `${activeChain.blockExplorers.default.url}/tx/${hash}`;
}
