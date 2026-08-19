import Link from "next/link";
import { Atmosphere } from "@/components/art/Atmosphere";
import { AccountBadge, Badge, VerifiedBadge } from "@/components/ui/Badge";
import { formatTokenAmount } from "@/lib/format";
import { nftPath } from "@/lib/paths";
import { tokenLabel } from "@/lib/project";
import type { CollectionNFT } from "@/lib/types";

function containedAccc(nft: CollectionNFT) {
  const asset = nft.nftAccount?.assets.find(
    (item) => item.kind === "token" && item.symbol !== "ETH",
  );
  return asset?.kind === "token" ? asset.balance : undefined;
}

export function NFTCard({ nft, href }: { nft: CollectionNFT; href?: string }) {
  const accc = containedAccc(nft);
  return (
    <Link
      href={href ?? nftPath(nft)}
      className="group overflow-hidden rounded-lg border border-border bg-surface-1 hover:border-[#3a4440]"
    >
      <Atmosphere id={nft.artId} className="aspect-square" rounded="rounded-none" />
      <div className="space-y-2 p-3">
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <span className="truncate">{nft.collectionName}</span>
          {nft.verified ? <VerifiedBadge /> : null}
          {nft.core ? <Badge tone="info">Core</Badge> : null}
          {nft.special ? <Badge tone="warning">Special grant</Badge> : null}
        </div>
        <p className="truncate text-sm font-medium">{nft.name}</p>
        <div>
          {accc !== undefined ? (
            <p className="tabular text-sm font-medium">
              {formatTokenAmount(accc)} {tokenLabel()}
            </p>
          ) : null}
          <p className="text-xs text-text-muted">
            {nft.listed ? "Listed" : "Minted"}
            {nft.nftAccount ? " · NFT Account" : ""}
            {nft.special && nft.genesisGrant
              ? ` · ${formatTokenAmount(nft.genesisGrant)} grant`
              : ""}
          </p>
        </div>
      </div>
    </Link>
  );
}
