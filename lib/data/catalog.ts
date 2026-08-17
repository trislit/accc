import { ROBINHOOD_CHAIN_ID } from "../chain";
import { DEMO_CREATOR, DEMO_OWNER, SHOWCASE_NFT, SHOWCASE_TOKEN, project } from "../project";
import type { ActivityItem, Address, CollectionNFT } from "../types";

export { DEMO_CREATOR, DEMO_OWNER };

const ITEM_775_ACCOUNT: Address =
  "0x71f842a1b2c3d4e5f67890abcdef12345678942a";

export function nftPath(nft: Pick<CollectionNFT, "chainId" | "contract" | "tokenId">) {
  return `/nft/${nft.chainId}/${nft.contract}/${nft.tokenId}/`;
}

export const nfts: CollectionNFT[] = [
  {
    chainId: ROBINHOOD_CHAIN_ID,
    contract: SHOWCASE_NFT,
    tokenId: "775",
    collectionId: project.collectionId,
    collectionName: project.collectionName,
    verified: true,
    owner: DEMO_OWNER,
    name: `${project.nftPrefix} #775`,
    description: `${project.nftPrefix} #775 from ${project.collectionName}.`,
    artId: "wanderer-775",
    listed: true,
    traits: [
      { trait_type: "Layer", value: "Ash" },
      { trait_type: "Class", value: "Scout" },
      { trait_type: "Mark", value: "Split Moon" },
    ],
    market: {
      listing: { priceEth: 0.72, seller: DEMO_OWNER },
      bestOffer: {
        priceEth: 0.6,
        bidder: "0x7710a91af91af91af91af91af91af91af91af91a",
      },
      lastSale: {
        priceEth: 0.51,
        from: "0x812032f0812032f0812032f0812032f0812032f0",
        to: DEMO_OWNER,
        at: "2 days ago",
      },
    },
    nftAccount: {
      address: ITEM_775_ACCOUNT,
      nft: { contract: SHOWCASE_NFT, tokenId: "775" },
      controller: DEMO_OWNER,
      assets: [
        {
          kind: "token",
          symbol: project.tokenSymbol,
          name: project.tokenName,
          contract: SHOWCASE_TOKEN,
          balance: 18420,
          estimatedValueUsd: 1547,
        },
        {
          kind: "nft",
          name: `${project.nftPrefix} #12`,
          collection: project.collectionName,
          contract: SHOWCASE_NFT,
          tokenId: "12",
          estimatedValueUsd: 310,
          artId: "gate-12",
        },
      ],
      estimatedTokenValue: 1547,
      estimatedNftValue: 310,
      estimatedTotalValue: 1857,
    },
  },
  {
    chainId: ROBINHOOD_CHAIN_ID,
    contract: SHOWCASE_NFT,
    tokenId: "8812",
    collectionId: project.collectionId,
    collectionName: project.collectionName,
    verified: true,
    owner: DEMO_CREATOR,
    name: `${project.nftPrefix} #8812`,
    artId: "wanderer-8812",
    listed: true,
    traits: [
      { trait_type: "Layer", value: "Iron" },
      { trait_type: "Class", value: "Warden" },
    ],
    market: {
      listing: { priceEth: 0.8, seller: DEMO_CREATOR },
      bestOffer: { priceEth: 0.61, bidder: DEMO_OWNER },
    },
    nftAccount: {
      address: "0x8812acc08812acc08812acc08812acc08812acc0",
      nft: { contract: SHOWCASE_NFT, tokenId: "8812" },
      controller: DEMO_CREATOR,
      assets: [
        {
          kind: "token",
          symbol: project.tokenSymbol,
          name: project.tokenName,
          contract: SHOWCASE_TOKEN,
          balance: 2400,
          estimatedValueUsd: 202,
        },
      ],
      estimatedTokenValue: 202,
      estimatedNftValue: 0,
      estimatedTotalValue: 202,
    },
  },
  {
    chainId: ROBINHOOD_CHAIN_ID,
    contract: SHOWCASE_NFT,
    tokenId: "12",
    collectionId: project.collectionId,
    collectionName: project.collectionName,
    verified: true,
    owner: DEMO_OWNER,
    name: `${project.nftPrefix} #12`,
    artId: "gate-12",
    listed: true,
    traits: [{ trait_type: "Type", value: "Gate" }],
    market: {
      listing: { priceEth: 2.4, seller: DEMO_OWNER },
      bestOffer: { priceEth: 1.9, bidder: DEMO_CREATOR },
    },
    nftAccount: {
      address: "0x0012acc00012acc00012acc00012acc00012acc0",
      nft: { contract: SHOWCASE_NFT, tokenId: "12" },
      controller: DEMO_OWNER,
      assets: [],
      estimatedTokenValue: 0,
      estimatedNftValue: 0,
      estimatedTotalValue: 0,
    },
  },
  {
    chainId: ROBINHOOD_CHAIN_ID,
    contract: SHOWCASE_NFT,
    tokenId: "441",
    collectionId: project.collectionId,
    collectionName: project.collectionName,
    verified: true,
    owner: DEMO_CREATOR,
    name: `${project.nftPrefix} #441`,
    artId: "origin-192",
    listed: true,
    traits: [{ trait_type: "Layer", value: "Pale" }],
    market: {
      listing: { priceEth: 0.39, seller: DEMO_CREATOR },
      bestOffer: { priceEth: 0.28, bidder: DEMO_OWNER },
    },
  },
];

export const activity: ActivityItem[] = [
  {
    id: "1",
    type: "Sale",
    title: `${project.nftPrefix} #775`,
    from: "0x812032f0812032f0812032f0812032f0812032f0",
    to: DEMO_OWNER,
    amount: "0.72 ETH",
    at: "2 minutes ago",
    href: nftPath(nfts[0]),
  },
  {
    id: "2",
    type: "Token deposit",
    title: `18,420 $${project.tokenSymbol} into ${project.nftPrefix} #775`,
    to: ITEM_775_ACCOUNT,
    amount: `18,420 ${project.tokenSymbol}`,
    at: "14 minutes ago",
    href: nftPath(nfts[0]),
  },
  {
    id: "3",
    type: "Listing",
    title: `${project.nftPrefix} #8812`,
    from: DEMO_CREATOR,
    amount: "0.80 ETH",
    at: "1 hour ago",
    href: nftPath(nfts[1]),
  },
  {
    id: "4",
    type: "Token claim",
    title: `2,000 $${project.tokenSymbol} claimed`,
    to: DEMO_OWNER,
    amount: `2,000 ${project.tokenSymbol}`,
    at: "Yesterday",
  },
];

export function getNft(chain: string, contract: string, tokenId: string) {
  return nfts.find(
    (nft) =>
      String(nft.chainId) === chain &&
      nft.contract.toLowerCase() === contract.toLowerCase() &&
      nft.tokenId === tokenId,
  );
}

export function listedNfts() {
  return nfts.filter((nft) => nft.listed);
}

export function nftsOwnedBy(owner: Address) {
  return nfts.filter((nft) => nft.owner.toLowerCase() === owner.toLowerCase());
}

export function accountNfts(owner: Address) {
  return nftsOwnedBy(owner).filter((nft) => nft.nftAccount);
}

export const portfolioDemo = {
  address: DEMO_OWNER,
  tokens: [
    {
      symbol: project.tokenSymbol,
      name: project.tokenName,
      balance: 42820,
      valueUsd: 3597,
      contract: SHOWCASE_TOKEN,
    },
  ],
};
