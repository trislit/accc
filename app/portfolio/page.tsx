"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { NFTCard } from "@/components/cards/NFTCard";
import { AddressDisplay } from "@/components/ui/AddressDisplay";
import { Button } from "@/components/ui/Button";
import { EmptyState, Tabs } from "@/components/ui/Tabs";
import {
  DEMO_OWNER,
  accountNfts,
  activity,
  nftsOwnedBy,
  portfolioDemo,
} from "@/lib/data/catalog";
import { holdingPath } from "@/lib/holdings";
import { useHoldings } from "@/lib/useHoldings";
import { useAcccBalance, useNativeEthBalance, useOwnedAcccNfts } from "@/lib/data/onchain";
import { ethToUsd, formatEth, formatTokenAmount, formatUsd } from "@/lib/format";
import { liveContracts, project, tokenLabel } from "@/lib/project";
import { accountPath } from "@/lib/tba";
import type { Address, CollectionNFT } from "@/lib/types";

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const wallet = (isConnected && address ? address : DEMO_OWNER) as Address;
  const eth = useNativeEthBalance(isConnected ? address : undefined);
  const walletAccc = useAcccBalance(isConnected && liveContracts ? address : undefined);
  const [tab, setTab] = useState("overview");
  const holdings = useHoldings(address);
  const onchain = useOwnedAcccNfts(liveContracts && address ? address : undefined);
  const example = !isConnected;
  const useLiveHoldings = Boolean(liveContracts && isConnected && address);
  const owned = example
    ? nftsOwnedBy(DEMO_OWNER)
    : useLiveHoldings
      ? onchain.nfts
      : address
        ? holdings.map((holding) => holding.nft)
        : [];
  const ownedHrefs = example
    ? undefined
    : useLiveHoldings
      ? Object.fromEntries(
          onchain.nfts.map((nft) => [
            `${nft.contract}-${nft.tokenId}`,
            accountPath(nft.tokenId),
          ]),
        )
      : Object.fromEntries(
          holdings.map((holding) => [
            `${holding.nft.contract}-${holding.nft.tokenId}`,
            holdingPath(holding.id),
          ]),
        );
  const accounts = example
    ? accountNfts(DEMO_OWNER)
    : useLiveHoldings
      ? onchain.nfts
      : holdings.map((holding) => holding.nft).filter((nft) => nft.nftAccount);
  const liveEthUsd = eth.formatted ? ethToUsd(eth.formatted) : 0;
  const nftsUsd = example
    ? owned.reduce(
        (sum, nft) => sum + ethToUsd(nft.market?.listing?.priceEth ?? 0),
        0,
      )
    : holdings.reduce((sum, holding) => sum + ethToUsd(holding.mintPriceEth), 0);
  const accountsUsd = accounts.reduce(
    (sum, nft) => sum + (nft.nftAccount?.estimatedTotalValue ?? 0),
    0,
  );
  const tokensUsd = example
    ? portfolioDemo.tokens.reduce((sum, token) => sum + token.valueUsd, 0)
    : 0;
  const total = nftsUsd + accountsUsd + tokensUsd + liveEthUsd;

  const tokenRows = useMemo(() => {
    const rows: {
      symbol: string;
      name: string;
      balance: number;
      valueUsd: number;
      contract: Address;
    }[] = example ? [...portfolioDemo.tokens] : [];
    if (isConnected && eth.formatted !== undefined) {
      rows.unshift({
        symbol: "ETH",
        name: "Ether",
        balance: Number(eth.formatted.toFixed(4)),
        valueUsd: liveEthUsd,
        contract: "0x0000000000000000000000000000000000000000" as Address,
      });
    }
    if (isConnected && walletAccc.formatted) {
      rows.push({
        symbol: project.tokenSymbol,
        name: project.tokenName,
        balance: walletAccc.formatted,
        valueUsd: walletAccc.formatted * project.tokenPriceUsd,
        contract: project.tokenContract,
      });
    }
    return rows;
  }, [eth.formatted, example, isConnected, liveEthUsd, walletAccc.formatted]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold tracking-wide text-text-muted">
          MY PORTFOLIO
        </p>
        <h1 className="mt-2 text-[32px] font-semibold leading-10">
          {isConnected ? `Your ${project.name} portfolio` : `Example ${project.name} portfolio`}
        </h1>
        <div className="mt-2">
          <AddressDisplay address={wallet} />
        </div>
        <p className="mt-6 text-xs text-text-muted">Estimated portfolio value</p>
        <p className="tabular text-4xl font-semibold">{formatUsd(total)}</p>
        <p className="mt-2 max-w-2xl text-sm text-text-muted">
          This site only tracks {project.collectionName} so each NFT can show its
          NFT Account and contained {tokenLabel()}.
        </p>
        {example ? (
          <p className="mt-2 text-sm text-text-muted">
            This is sample collection holdings. Connect a wallet to see NFTs you
            minted here.
          </p>
        ) : null}
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
          <div className="grid gap-3 sm:grid-cols-4">
            <Stat label="Total value" value={formatUsd(total)} />
            <Stat label="NFTs" value={formatUsd(nftsUsd)} />
            <Stat label="Tokens" value={formatUsd(tokensUsd + liveEthUsd)} />
            <Stat label="NFT Accounts" value={formatUsd(accountsUsd)} />
          </div>
          <NftSection
            owned={owned}
            hrefs={ownedHrefs}
            loading={Boolean(useLiveHoldings && onchain.isLoading)}
            error={useLiveHoldings ? onchain.error : undefined}
          />
          <TokenTable rows={tokenRows} empty={isConnected && tokenRows.length === 0} />
          <AccountsTable
            accounts={accounts}
            hrefs={ownedHrefs}
            loading={Boolean(useLiveHoldings && onchain.isLoading)}
          />
        </div>
      ) : null}

      {tab === "nfts" ? (
        <NftSection
          owned={owned}
          hrefs={ownedHrefs}
          loading={Boolean(useLiveHoldings && onchain.isLoading)}
          error={useLiveHoldings ? onchain.error : undefined}
        />
      ) : null}

      {tab === "tokens" ? (
        <TokenTable rows={tokenRows} empty={isConnected && tokenRows.length === 0} />
      ) : null}

      {tab === "accounts" ? (
        <AccountsTable
          accounts={accounts}
          hrefs={ownedHrefs}
          loading={Boolean(useLiveHoldings && onchain.isLoading)}
        />
      ) : null}

      {tab === "activity" ? (
        <ActivityList
          items={
            example
              ? activity
              : holdings.map((holding) => ({
                  id: holding.id,
                  type: "Mint" as const,
                  title: holding.nft.name,
                  amount: `${holding.mintPriceEth.toFixed(2)} ETH`,
                  at: new Date(holding.mintedAt).toLocaleString(),
                }))
          }
        />
      ) : null}
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
    return (
      <EmptyCollection
        title="Could not load NFTs"
        body={error}
      />
    );
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
        <Link href="/market/">
          <Button variant="secondary" size="sm">
            Market
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
  rows: { symbol: string; balance: number; valueUsd: number }[];
  empty?: boolean;
}) {
  if (empty || !rows.length) {
    return (
      <EmptyCollection
        title={`No ${tokenLabel()}`}
        body={`${tokenLabel()} claimed into NFT Accounts, plus ETH when connected, will appear here.`}
      />
    );
  }

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Tokens</h2>
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-3 px-4 py-3 text-xs text-text-muted">
          <span>Token</span>
          <span className="text-right">Balance</span>
          <span className="text-right">Value</span>
        </div>
        {rows.map((row) => (
          <div
            key={row.symbol}
            className="grid grid-cols-3 items-center px-4 py-4 hover:bg-surface-2"
          >
            <span className="text-sm font-medium">
              {row.symbol === "ETH" ? "ETH" : `$${row.symbol}`}
            </span>
            <span className="tabular text-right text-sm">
              {row.symbol === "ETH"
                ? formatEth(row.balance, 4)
                : formatTokenAmount(row.balance)}
            </span>
            <span className="tabular text-right text-sm">
              {row.valueUsd ? formatUsd(row.valueUsd) : "—"}
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
          <span>Assets</span>
          <span className="text-right">Estimated value</span>
        </div>
        {accounts.map((nft) => (
          <Link
            key={nft.tokenId}
            href={
              hrefs?.[`${nft.contract}-${nft.tokenId}`] ??
              `/nft/${nft.chainId}/${nft.contract}/${nft.tokenId}/`
            }
            className="grid cursor-pointer grid-cols-3 items-center px-4 py-4 hover:bg-surface-2"
          >
            <span className="text-sm font-medium">{nft.name}</span>
            <span className="tabular text-sm">{nft.nftAccount?.assets.length}</span>
            <span className="tabular text-right text-sm">
              {formatUsd(nft.nftAccount?.estimatedTotalValue ?? 0)}
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
        body="Mints, sales, and NFT Account deposits will appear here."
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
