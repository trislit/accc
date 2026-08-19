export type Address = `0x${string}`;

export type Trait = {
  trait_type: string;
  value: string;
};

export type Listing = {
  priceEth: number;
  seller: Address;
};

export type Offer = {
  priceEth: number;
  bidder: Address;
};

export type Sale = {
  priceEth: number;
  from: Address;
  to: Address;
  at: string;
};

export type TokenAsset = {
  kind: "token";
  symbol: string;
  name: string;
  contract: Address;
  balance: number;
  estimatedValueUsd: number;
};

export type NftAsset = {
  kind: "nft";
  name: string;
  collection: string;
  contract: Address;
  tokenId: string;
  estimatedValueUsd: number;
  artId: string;
};

export type Asset = TokenAsset | NftAsset;

export type NftAccount = {
  address: Address;
  nft: {
    contract: Address;
    tokenId: string;
  };
  controller: Address;
  assets: Asset[];
  estimatedTokenValue: number;
  estimatedNftValue: number;
  estimatedTotalValue: number;
};

export type CollectionNFT = {
  chainId: number;
  contract: Address;
  tokenId: string;
  collectionId: string;
  collectionName: string;
  verified: boolean;
  owner: Address;
  name: string;
  description?: string;
  artId: string;
  listed: boolean;
  traits: Trait[];
  arcadeWallpaper?: number;
  market?: {
    listing?: Listing;
    bestOffer?: Offer;
    lastSale?: Sale;
  };
  nftAccount?: NftAccount;
};

export type ActivityItem = {
  id: string;
  type:
    | "Mint"
    | "Sale"
    | "Listing"
    | "Offer"
    | "Transfer"
    | "Token deposit"
    | "Token withdrawal"
    | "NFT deposit"
    | "NFT withdrawal"
    | "Token claim"
    | "Arcade";
  title: string;
  from?: Address;
  to?: Address;
  amount?: string;
  at: string;
  href?: string;
};

export type Holding = {
  id: string;
  owner: Address;
  dropId: string;
  mintedAt: string;
  mintPriceEth: number;
  claimEligible: number;
  claimed: boolean;
  claimSymbol?: string;
  claimName?: string;
  claimContract?: Address;
  nft: CollectionNFT;
};

export type DropStatus = "live" | "upcoming" | "completed";

export type Drop = {
  id: string;
  name: string;
  status: DropStatus;
  priceEth: number;
  supply: number;
  minted: number;
  maxPerWallet: number;
  startsAt?: string;
  artId: string;
  video?: string;
  includes: {
    nftLabel: string;
    nftAccount: boolean;
    tokenClaim: number;
    tokenSymbol: string;
  };
};
