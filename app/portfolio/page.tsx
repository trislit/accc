"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { NFTCard } from "@/components/cards/NFTCard";
import { AddressDisplay } from "@/components/ui/AddressDisplay";
import { Button } from "@/components/ui/Button";
import { EmptyState, Tabs } from "@/components/ui/Tabs";
import { useAcccBalance, useNativeEthBalance, useOwnedAcccNfts } from "@/lib/data/onchain";
import { useLiveCollection } from "@/lib/data/liveCollection";
import { formatEth, formatTokenAmount } from "@/lib/format";
import { LIVE_TOKEN, project, tokenLabel } from "@/lib/project";
import { accountPath } from "@/lib/tba";
import type { Address, CollectionNFT } from "@/lib/types";

function containedAccc(nft: CollectionNFT) {
  const asset = nft.nftAccount?.assets.find(
    (item) => item.kind === "token" && item.symbol === project.tokenSymbol,
  );
  return asset && asset.kind === "token" ? asset.balance : 0;
}

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const eth = useNativeEthBalance(isConnected ? address : undefined);
  const walletAccc = useAcccBalance(isConnected ? address : undefined);
  const [tab, setTab] = useState("overview");
  const onchain = useOwnedAcccNfts(isConnected ? address : undefined);
  const collection = useLiveCollection();
  const owned = isConnected ? onchain.nfts : [];
  const ownedHrefs = Object.fromEntries(
    owned.map((nft) => [`${nft.contract}-${nft.tokenId}`, accountPath(nft.tokenId)]),
  );
  const accountAccc = owned.reduce((sum, nft) => sum + containedAccc(nft), 0);
  const activity = (collection.data?.activity ?? []).filter((item) => {
    if (!address) return false;
    const mine = address.toLowerCase();
    return (
      item.from?.toLowerCase() === mine ||
      item.to?.toLowerCase() === mine ||
      owned.some((nft) => item.href === accountPath(nft.tokenId))
    );
  });

  const tokenRows = useMemo(() => {
    const rows: {
      symbol: string;
      balance: number;
      contract: Address;
    }[] = [];
    if (isConnected && eth.formatted !== undefined) {
      rows.push({
        symbol: "ETH",
        balance: Number(eth.formatted.toFixed(4)),
        contract: "0x0000000000000000000000000000000000000000",
      });
    }
    if (isConnected && walletAccc.formatted) {
      rows.push({
        symbol: project.tokenSymbol,
        balance: walletAccc.formatted,
        contract: LIVE_TOKEN,
      });
    }
    if (accountAccc > 0) {
      rows.push({
        symbol: `${project.tokenSymbol} in accounts`,
        balance: accountAccc,
        contract: LIVE_TOKEN,
      });
    }
    return rows;
  }, [accountAccc, eth.formatted, isConnected, walletAccc.formatted]);

  if (!isConnected) {
    return (
      <EmptyState
        title="Connect to see your portfolio"
        body={`Minted ${project.nftPrefix} NFTs and ${tokenLabel()} in their NFT Accounts appear here.`}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold tracking-wide text-text-muted">
          MY PORTFOLIO
        </p>
        <h1 className="mt-2 text-[32px] font-semibold leading-10">
          Your {project.name} portfolio
        </h1>
        <div className="mt-2">
          <AddressDisplay address={address ?? ""} />
        </div>
        <p className="mt-6 text-xs text-text-muted">NFT Account {tokenLabel()}</p>
        <p className="tabular text-4xl font-semibold">
          {formatTokenAmount(accountAccc)} {tokenLabel()}
        </p>
        <p className="mt-2 max-w-2xl text-sm text-text-muted">
          Live {project.collectionName} on Robinhood testnet. Each NFT shows the
          {tokenLabel()} held by its NFT Account.
        </p>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "nfts", label: "NFTs" },
          { id: "tokens", label: "Tokens" },
          { id: "accounts", label: "NFT Accounts" },
          { id: "activity", label: "Activity" },
        ]}
      />

      {tab === "overview" ? (
        <div className="space-y-8">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="NFTs" value={String(owned.length)} />
            <Stat
              label={`${tokenLabel()} in accounts`}
              value={formatTokenAmount(accountAccc)}
            />
            <Stat
              label={`Wallet ${tokenLabel()}`}
              value={formatTokenAmount(walletAccc.formatted ?? 0)}
            />
          </div>
          <NftSection
            owned={owned}
            hrefs={ownedHrefs}
            loading={onchain.isLoading}
            error={onchain.error}
          />
          <TokenTable rows={tokenRows} empty={tokenRows.length === 0} />
          <AccountsTable
            accounts={owned}
            hrefs={ownedHrefs}
            loading={onchain.isLoading}
          />
        </div>
      ) : null}

      {tab === "nfts" ? (
        <NftSection
          owned={owned}
          hrefs={ownedHrefs}
          loading={onchain.isLoading}
          error={onchain.error}
        />
      ) : null}

      {tab === "tokens" ? (
        <TokenTable rows={tokenRows} empty={tokenRows.length === 0} />
      ) : null}

      {tab === "accounts" ? (
        <AccountsTable
          accounts={owned}
          hrefs={ownedHrefs}
          loading={onchain.isLoading}
        />
      ) : null}

      {tab === "activity" ? <ActivityList items={activity} /> : null}
    </div>
  );
}

function NftSection({
  owned,
  hrefs,
  loading,
  error,
}: {
  owned: CollectionNFT[];
  hrefs?: Record<string, string>;
  loading?: boolean;
  error?: string;
}) {
  if (loading && owned.length === 0) {
    return (
      <EmptyState
        title="Loading NFTs"
        body="Reading Anti-Cabal Cabal Club tokens from Robinhood testnet."
      />
    );
  }
  if (error && owned.length === 0) {
    return <EmptyCollection title="Could not load NFTs" body={error} />;
  }
  if (owned.length === 0) {
    return (
      <EmptyCollection
        title={`No ${project.collectionName} NFTs`}
        body="Mint from the live drop to see this collection in your wallet."
      />
    );
  }

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">NFTs</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {owned.map((nft) => (
          <NFTCard
            key={`${nft.contract}-${nft.tokenId}`}
            nft={nft}
            href={hrefs?.[`${nft.contract}-${nft.tokenId}`]}
          />
        ))}
      </div>
    </section>
  );
}

function EmptyCollection({ title, body }: { title: string; body: string }) {
  return (
    <div className="space-y-4">
      <EmptyState title={title} body={body} />
      <div className="flex flex-wrap gap-2">
        <Link href="/mint/">
          <Button size="sm">Mint</Button>
        </Link>
        <Link href="/collection/">
          <Button variant="secondary" size="sm">
            Collection
          </Button>
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-1 p-4">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 tabular text-xl font-semibold">{value}</p>
    </div>
  );
}

function TokenTable({
  rows,
  empty,
}: {
  rows: { symbol: string; balance: number }[];
  empty?: boolean;
}) {
  if (empty || !rows.length) {
    return (
      <EmptyCollection
        title={`No ${tokenLabel()}`}
        body={`${tokenLabel()} in your wallet or NFT Accounts will appear here.`}
      />
    );
  }

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Tokens</h2>
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-2 px-4 py-3 text-xs text-text-muted">
          <span>Token</span>
          <span className="text-right">Balance</span>
        </div>
        {rows.map((row) => (
          <div
            key={row.symbol}
            className="grid grid-cols-2 items-center px-4 py-4 hover:bg-surface-2"
          >
            <span className="text-sm font-medium">
              {row.symbol === "ETH"
                ? "ETH"
                : row.symbol.endsWith("in accounts")
                  ? `$${project.tokenSymbol} in accounts`
                  : `$${row.symbol}`}
            </span>
            <span className="tabular text-right text-sm">
              {row.symbol === "ETH"
                ? formatEth(row.balance, 4)
                : formatTokenAmount(row.balance)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function AccountsTable({
  accounts,
  hrefs,
  loading,
}: {
  accounts: CollectionNFT[];
  hrefs?: Record<string, string>;
  loading?: boolean;
}) {
  if (loading && accounts.length === 0) {
    return (
      <EmptyState
        title="Loading NFT Accounts"
        body="Reading ERC-6551 accounts for NFTs in this wallet."
      />
    );
  }
  if (accounts.length === 0) {
    return (
      <EmptyCollection
        title="No NFT Accounts"
        body="Mint an NFT from this collection to get an NFT Account that can hold tokens."
      />
    );
  }

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">NFT Accounts</h2>
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-3 px-4 py-3 text-xs text-text-muted">
          <span>NFT</span>
          <span>Account</span>
          <span className="text-right">{tokenLabel()}</span>
        </div>
        {accounts.map((nft) => (
          <Link
            key={nft.tokenId}
            href={hrefs?.[`${nft.contract}-${nft.tokenId}`] ?? accountPath(nft.tokenId)}
            className="grid cursor-pointer grid-cols-3 items-center px-4 py-4 hover:bg-surface-2"
          >
            <span className="text-sm font-medium">{nft.name}</span>
            <span className="font-mono text-xs text-text-muted">
              {nft.nftAccount?.address.slice(0, 8)}…
            </span>
            <span className="tabular text-right text-sm">
              {formatTokenAmount(containedAccc(nft))}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ActivityList({
  items,
}: {
  items: { id: string; type: string; title: string; amount?: string; at: string }[];
}) {
  if (!items.length) {
    return (
      <EmptyState
        title="No activity"
        body="Mints and NFT Account deposits for this wallet will appear here."
      />
    );
  }

  return (
    <div className="divide-y divide-border-subtle rounded-lg border border-border">
      {items.map((item) => (
        <div key={item.id} className="flex justify-between px-4 py-4">
          <div>
            <p className="text-xs uppercase text-text-muted">{item.type}</p>
            <p className="text-sm">{item.title}</p>
          </div>
          <div className="text-right">
            {item.amount ? <p className="tabular text-sm">{item.amount}</p> : null}
            <p className="text-xs text-text-muted">{item.at}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
