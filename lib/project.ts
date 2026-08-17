import type { Address } from "./types";
import { ACTIVE_CHAIN_ID, CANONICAL_TBA_REGISTRY } from "./chain";

export const DEMO_OWNER: Address =
  "0x8421f4ca1fb44b1dd8516cf4c6f2e2e7c91af91a";
export const DEMO_CREATOR: Address =
  "0x8a21f4ca1fb44b1dd8516cf4c6f2e2e7c91af91a";

/** Mock catalog listings only. Live mint/account use LIVE_* below. */
export const SHOWCASE_NFT =
  "0x71f3a91b4c2d8e9a7b6c5d4e3f2a1b0c9d8e7f6a" as Address;
export const SHOWCASE_TOKEN =
  "0xa5e1c0de1234567890abcdef1234567890abcdef" as Address;

/** Robinhood testnet (46630). Public addresses, safe to bake into the static export. */
export const LIVE_NFT =
  "0xdcbC12c8ebe5cD0E24B414F51283F7afE0d35cA5" as Address;
export const LIVE_TOKEN =
  "0x3EE8c0c19f6622e6a62f9F04a79cB92444719f71" as Address;
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
  nftContract: envAddress(process.env.NEXT_PUBLIC_NFT, LIVE_NFT),
  tokenContract: envAddress(process.env.NEXT_PUBLIC_TOKEN, LIVE_TOKEN),
  tbaImplementation: envAddress(
    process.env.NEXT_PUBLIC_TBA_IMPLEMENTATION,
    LIVE_TBA_IMPL,
  ),
  tbaRegistry: envAddress(
    process.env.NEXT_PUBLIC_TBA_REGISTRY,
    CANONICAL_TBA_REGISTRY,
  ),
  treasury: "0x7ea5a1a0de7ea5a1a0de7ea5a1a0de7ea5a1a0de" as Address,
  creator: DEMO_CREATOR,
  supply: 10000,
  holders: 1842,
  mintPriceEth: liveContracts ? 0 : 0.08,
  maxPerWallet: 5,
  claimPerNft: 2000,
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
    website: "https://example.com",
    x: "https://x.com",
    discord: "https://discord.com",
  },
  live: liveContracts,
};

export function tokenLabel() {
  return `$${project.tokenSymbol}`;
}
