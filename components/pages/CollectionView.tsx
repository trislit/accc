"use client";

import Link from "next/link";
import { useState } from "react";
import { Atmosphere } from "@/components/art/Atmosphere";
import { ProjectVideo } from "@/components/art/ProjectVideo";
import { NFTCard } from "@/components/cards/NFTCard";
import { AddressDisplay } from "@/components/ui/AddressDisplay";
import { Badge, VerifiedBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, Tabs } from "@/components/ui/Tabs";
import { useLiveCollection } from "@/lib/data/liveCollection";
import { formatTokenAmount } from "@/lib/format";
import { LIVE_DISTRIBUTOR, LIVE_NFT, LIVE_TOKEN, project, tokenLabel } from "@/lib/project";
import { accountPath } from "@/lib/tba";

export function CollectionView() {
  const [tab, setTab] = useState("overview");
  const collection = useLiveCollection();
  const nfts = collection.data?.nfts ?? [];
  const minted = collection.data?.minted ?? 0;
  const holders = collection.data?.holders ?? 0;
  const tokenSupply = collection.data?.tokenSupply ?? 0;
  const activity = collection.data?.activity ?? [];
  const containedAccc = nfts.reduce((sum, nft) => {
    const asset = nft.nftAccount?.assets.find(
      (item) => item.kind === "token" && item.symbol === project.tokenSymbol,
    );
    return sum + (asset && asset.kind === "token" ? asset.balance : 0);
  }, 0);

  return (
    <div>
      <ProjectVideo
        src={project.videos.collection}
        className="h-48 w-full md:h-64"
        rounded="rounded-[10px]"
      />
      <div className="-mt-8 ml-4 flex items-end gap-4 md:ml-0">
        <Atmosphere
          id={project.logoArtId}
          className="h-20 w-20 border-4 border-bg"
          rounded="rounded-lg"
        />
      </div>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[32px] font-semibold leading-10">{project.name}</h1>
            <VerifiedBadge className="h-5 w-5" />
            <Badge tone="green">Collection</Badge>
          </div>
          <p className="mt-2 text-text-secondary">{project.description}</p>
          <p className="mt-2 text-sm text-text-muted">
            Contract <AddressDisplay address={LIVE_NFT} />
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            {minted.toLocaleString()} minted · {holders.toLocaleString()} holders
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/mint/">
            <Button>Mint genesis drop</Button>
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "overview", label: "Overview" },
            { id: "nfts", label: "NFTs" },
            { id: "token", label: tokenLabel() },
            { id: "activity", label: "Activity" },
          ]}
        />
      </div>

      {tab === "overview" || tab === "nfts" ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <MarketStat label="Minted" value={minted.toLocaleString()} />
          <MarketStat
            label={`${tokenLabel()} in NFT Accounts`}
            value={formatTokenAmount(containedAccc)}
          />
          <MarketStat label="Holders" value={holders.toLocaleString()} />
        </div>
      ) : null}

      {collection.isLoading ? (
        <p className="mt-8 text-sm text-text-muted">Reading live collection…</p>
      ) : null}
      {collection.error ? (
        <p className="mt-8 text-sm text-error">
          {collection.error instanceof Error
            ? collection.error.message
            : "Could not load collection."}
        </p>
      ) : null}

      {tab === "overview" ? (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="text-xl font-semibold">About</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="NFT collection" value={project.collectionName} />
              <Row label="Token" value={tokenLabel()} />
              <Row label="NFT Accounts" value="Enabled" />
            </dl>
            <p className="mt-4 max-w-xl text-sm text-text-secondary">
              Every mint includes an NFT Account that can hold {tokenLabel()} on
              Robinhood testnet.
            </p>
            <h3 className="mt-10 text-lg font-semibold">NFTs</h3>
            {nfts.length === 0 && !collection.isLoading ? (
              <EmptyState
                title="No NFTs minted yet"
                body="Mint from the live drop. New tokens show up here from onchain mint events."
              />
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                {nfts.map((nft) => (
                  <NFTCard
                    key={`${nft.contract}-${nft.tokenId}`}
                    nft={nft}
                    href={accountPath(nft.tokenId)}
                  />
                ))}
              </div>
            )}
          </div>
          <aside className="h-fit rounded-lg border border-border bg-surface-1 p-5">
            <p className="text-sm text-text-muted">{tokenLabel()}</p>
            <p className="mt-1 tabular text-2xl font-semibold">
              {formatTokenAmount(tokenSupply)}
            </p>
            <p className="text-sm text-text-secondary">Testnet supply</p>
            <dl className="mt-5 space-y-3 text-sm">
              <Row label="In NFT Accounts" value={formatTokenAmount(containedAccc)} />
              <div>
                <p className="text-text-muted">Contract</p>
                <AddressDisplay address={LIVE_TOKEN} />
              </div>
            </dl>
            {nfts[0] ? (
              <Link href={accountPath(nfts[0].tokenId)}>
                <Button className="mt-5 w-full">
                  Open {nfts[0].name} account
                </Button>
              </Link>
            ) : (
              <Link href="/mint/">
                <Button className="mt-5 w-full">Mint</Button>
              </Link>
            )}
          </aside>
        </div>
      ) : null}

      {tab === "nfts" ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {nfts.map((nft) => (
            <NFTCard
              key={`${nft.contract}-${nft.tokenId}`}
              nft={nft}
              href={accountPath(nft.tokenId)}
            />
          ))}
        </div>
      ) : null}

      {tab === "token" ? (
        <div className="mt-8 max-w-2xl space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">{tokenLabel()}</h2>
            <p className="text-sm text-text-secondary">
              Each NFT can claim 1,000 {tokenLabel()} once into its NFT Account.
              After that, 10% APY accrues only on remaining original principal —
              withdrawing cuts rewards, transferring more in does not restore them.
            </p>
            <p className="mt-3 tabular text-3xl font-semibold">
              {formatTokenAmount(tokenSupply)}
            </p>
            <p className="text-sm text-text-muted">Total minted</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <MarketStat
              label="In NFT Accounts"
              value={formatTokenAmount(containedAccc)}
            />
            <MarketStat label="NFT Accounts" value={String(minted)} />
          </div>
          <dl className="space-y-3 text-sm">
            <div>
              <p className="text-text-muted">Token</p>
              <AddressDisplay address={LIVE_TOKEN} />
            </div>
            <div>
              <p className="text-text-muted">Distributor</p>
              <AddressDisplay address={LIVE_DISTRIBUTOR} />
            </div>
          </dl>
        </div>
      ) : null}

      {tab === "activity" ? (
        <div className="mt-8 divide-y divide-border-subtle rounded-lg border border-border">
          {activity.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No activity yet"
                body="Mints and NFT Account token deposits will show here."
              />
            </div>
          ) : (
            activity.map((item) => (
              <Link
                key={item.id}
                href={item.href ?? "/collection/"}
                className="flex items-center justify-between px-4 py-4 hover:bg-surface-2"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                    {item.type}
                  </p>
                  <p className="text-sm font-medium">{item.title}</p>
                </div>
                <div className="text-right">
                  {item.amount ? (
                    <p className="tabular text-sm">{item.amount}</p>
                  ) : null}
                  <p className="text-xs text-text-muted">{item.at}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

function MarketStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-1 p-4">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 tabular text-lg font-semibold">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
