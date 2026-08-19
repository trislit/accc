import { createPublicClient, defineChain, http } from "viem";

export const ROBINHOOD_CHAIN_ID = 4663;
export const ROBINHOOD_TESTNET_ID = 46630;

export const CANONICAL_TBA_REGISTRY =
  "0x000000006551c19487814612e58FE06813775758" as const;

export const ACTIVE_CHAIN_ID = ROBINHOOD_TESTNET_ID;

const TESTNET_RPC = "https://rpc.testnet.chain.robinhood.com";
const MAINNET_RPC = "https://rpc.mainnet.chain.robinhood.com";

/** Orbit reports 0 priority fee; wallets then sign maxFeePerGas = 10 wei. */
const MIN_BASE_FEE_WEI = BigInt(10_000_000);

function orbitFees() {
  return {
    baseFeeMultiplier: 2 as const,
    maxPriorityFeePerGas: BigInt(1_000_000),
  };
}

export const robinhoodChain = defineChain({
  id: ROBINHOOD_CHAIN_ID,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [MAINNET_RPC] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://robinhoodchain.blockscout.com" },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167020862bE2a173976CA11",
    },
  },
  fees: orbitFees(),
});

export const robinhoodTestnet = defineChain({
  id: ROBINHOOD_TESTNET_ID,
  name: "Robinhood Chain Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [TESTNET_RPC] },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.testnet.chain.robinhood.com",
    },
  },
  contracts: {
    multicall3: {
      address: "0xa432504b6F04Cafe775b09D8AA92e8dbe41Ec7a8",
    },
  },
  testnet: true,
  fees: orbitFees(),
});

export const activeChain = robinhoodTestnet;
export const isTestnet = true;

/** Always testnet HTTP. Do not follow the wallet's current network. */
export const acccPublicClient = createPublicClient({
  chain: robinhoodTestnet,
  transport: http(TESTNET_RPC),
});

/** Fees wallets will actually accept on Robinhood (base fee ~0.01 gwei). */
export async function acccTxFees() {
  const [gasPrice, block] = await Promise.all([
    acccPublicClient.getGasPrice(),
    acccPublicClient.getBlock({ blockTag: "latest" }),
  ]);
  const base =
    block.baseFeePerGas && block.baseFeePerGas > BigInt(0)
      ? block.baseFeePerGas
      : gasPrice;
  const safe = base > MIN_BASE_FEE_WEI ? base : MIN_BASE_FEE_WEI;
  const maxPriorityFeePerGas =
    safe / BigInt(10) > BigInt(0) ? safe / BigInt(10) : BigInt(1);
  return {
    maxFeePerGas: safe * BigInt(3) + maxPriorityFeePerGas,
    maxPriorityFeePerGas,
  };
}

export function explorerAddressUrl(address: string) {
  return `${activeChain.blockExplorers.default.url}/address/${address}`;
}

export function explorerTxUrl(hash: string) {
  return `${activeChain.blockExplorers.default.url}/tx/${hash}`;
}
