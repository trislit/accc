"use client";

import { NFTCard } from "@/components/cards/NFTCard";
import { EmptyState } from "@/components/ui/Tabs";
import { useLiveCollection } from "@/lib/data/liveCollection";
import { project } from "@/lib/project";
import { accountPath } from "@/lib/tba";

export default function MarketPage() {
  const collection = useLiveCollection();
  const items = collection.data?.nfts ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[32px] font-semibold leading-10">Market</h1>
        <p className="mt-2 max-w-xl text-sm text-text-secondary">
          Live {project.collectionName} on Robinhood testnet. Secondary listings
          are not enabled yet — minted NFTs and the {project.tokenSymbol} in
          their NFT Accounts are shown here.
        </p>
      </div>
      {collection.isLoading ? (
        <p className="text-sm text-text-muted">Reading minted NFTs…</p>
      ) : items.length === 0 ? (
        <EmptyState
          title="No minted NFTs"
          body="Mint from the live drop. This page lists every token from onchain mint events."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((nft) => (
            <NFTCard
              key={`${nft.contract}-${nft.tokenId}`}
              nft={nft}
              href={accountPath(nft.tokenId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
