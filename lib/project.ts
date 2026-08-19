import type { Address } from "./types";
import { ACTIVE_CHAIN_ID, CANONICAL_TBA_REGISTRY } from "./chain";

/** Robinhood testnet (46630). Public addresses, safe to bake into the static export. */
export const LIVE_NFT =
  "0xB740c4bef629d15A4B3058368E6CBC807dbC0357" as Address;
export const LIVE_TOKEN =
  "0x9e73FB99E42C520A305b570159a6f7DD2B227Ac3" as Address;
export const LIVE_DISTRIBUTOR =
  "0x3448096b67f3459EE2458c3618Db57a47ca602cD" as Address;
export const LIVE_ARCADE =
  "0xc5bA7541CFB9d4F4f6e131d95acC8f246b86F77b" as Address;
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
  tagline:
    "An NFT that holds its own bag. What it earns and unlocks travel with it.",
  description:
    "ACCC is the Anti-Cabal Cabal Club. Mint a membership NFT. Each one has an account that can hold $ACCC and other NFTs. Spend into perks locked to that seat — they move when the NFT moves.",
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
