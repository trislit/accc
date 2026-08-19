import type { Address } from "./types";
import { ACTIVE_CHAIN_ID, CANONICAL_TBA_REGISTRY } from "./chain";

/** Robinhood testnet (46630). Public addresses, safe to bake into the static export. */
export const LIVE_NFT =
  "0xdcbC12c8ebe5cD0E24B414F51283F7afE0d35cA5" as Address;
export const LIVE_TOKEN =
  "0xc153e32f7f0dBe3131FECcC598a1EA57C64c5A99" as Address;
export const LIVE_DISTRIBUTOR =
  "0x56deD1a8d70893113Cff4289e204B142d4ce5eDA" as Address;
export const LIVE_ARCADE =
  "0x50a79A2f412a84f82EDF49379192eD266E6a3Eae" as Address;
const LIVE_TBA_IMPL =
  "0x8A0455E86536F57323866ed13c26febAb8ae3049" as Address;

function envAddress(value: string | undefined, fallback: Address): Address {
  return value && /^0x[a-fA-F0-9]{40}$/.test(value)
    ? (value as Address)
    : fallback;
}

export const liveContracts = true;

export const project = {
  name: "ACCC",
  fullName: "Anti-Cabal Cabal Club",
  tagline: "Anti-Cabal Cabal Club on Robinhood Chain.",
  description:
    "ACCC is the Anti-Cabal Cabal Club. Mint a membership NFT. Each one has an NFT Account that can hold $ACCC.",
  collectionName: "Anti-Cabal Cabal Club",
  collectionId: "accc",
  nftSymbol: "ACCC",
  nftPrefix: "ACCC",
  tokenName: "ACCC",
  tokenSymbol: "ACCC",
  chainId: ACTIVE_CHAIN_ID,
  nftContract: LIVE_NFT,
  tokenContract: LIVE_TOKEN,
  arcadeContract: envAddress(process.env.NEXT_PUBLIC_ARCADE, LIVE_ARCADE),
  tbaImplementation: envAddress(
    process.env.NEXT_PUBLIC_TBA_IMPLEMENTATION,
    LIVE_TBA_IMPL,
  ),
  tbaRegistry: envAddress(
    process.env.NEXT_PUBLIC_TBA_REGISTRY,
    CANONICAL_TBA_REGISTRY,
  ),
  treasury: LIVE_NFT as Address,
  creator: LIVE_NFT,
  supply: 10000,
  holders: 1842,
  mintPriceEth: liveContracts ? 0 : 0.08,
  maxPerWallet: 5,
  claimPerNft: 1000,
  floorEth: 0.72,
  volume24hEth: 48.2,
  tokenPriceUsd: 0.084,
  tokenChange24h: 4.82,
  tokenSupply: 100_000_000,
  tokenMarketCapUsd: 8_400_000,
  tokenVolume24hUsd: 420_000,
  tokenLiquidityUsd: 1_300_000,
  tokenHolders: 3904,
  logoArtId: "parallel-logo",
  bannerArtId: "parallel-banner",
  videos: {
    hero: "/media/accc-6.mp4",
    collection: "/media/accc-2.mp4",
    mint: "/media/accc-5.mp4",
  },
  links: {
    website: process.env.NEXT_PUBLIC_WEBSITE ?? "",
    x: process.env.NEXT_PUBLIC_X ?? "",
    discord: process.env.NEXT_PUBLIC_DISCORD ?? "",
    telegram: process.env.NEXT_PUBLIC_TELEGRAM ?? "",
    tokensmart:
      process.env.NEXT_PUBLIC_TOKENSMART || "https://desktop.tokensmart.co",
  },
  live: liveContracts,
};

export function tokenLabel() {
  return `$${project.tokenSymbol}`;
}
