"use client";

import Link from "next/link";
import { useState } from "react";
import { useAccount } from "wagmi";
import { Atmosphere } from "@/components/art/Atmosphere";
import { NftAccountPanel } from "@/components/account/NftAccountPanel";
import {
  TransactionModal,
  useMockTransaction,
} from "@/components/tx/TransactionStatus";
import { AddressDisplay } from "@/components/ui/AddressDisplay";
import { AccountBadge, VerifiedBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { ethToUsd, formatEth, formatUsd } from "@/lib/format";
import type { ActivityItem, CollectionNFT } from "@/lib/types";

export function NftView({ nft }: { nft: CollectionNFT }) {
  const { address } = useAccount();
  const isOwner = address?.toLowerCase() === nft.owner.toLowerCase();
  const [tab, setTab] = useState(nft.nftAccount ? "account" : "overview");
  const [buyOpen, setBuyOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [listPrice, setListPrice] = useState(
    String(nft.market?.listing?.priceEth ?? 0.72),
  );
  const tx = useMockTransaction();
  const account = nft.nftAccount;
  const activity: ActivityItem[] = [];
  const marketUsd = nft.market?.listing
    ? ethToUsd(nft.market.listing.priceEth)
    : 0;
  const contained = account?.estimatedTotalValue ?? 0;
  const combined = marketUsd + contained;

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Atmosphere
          id={nft.artId}
          className="aspect-square w-full"
          rounded="rounded-lg"
        />
        <div>
          <Link
            href="/collection/"
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary"
          >
            {nft.collectionName}
            {nft.verified ? <VerifiedBadge /> : null}
            {nft.nftAccount ? <AccountBadge /> : null}
          </Link>
          <h1 className="mt-2 text-[32px] font-semibold leading-10">{nft.name}</h1>
          <div className="mt-4 space-y-2 text-sm">
            <p className="text-text-muted">Owned by</p>
            <AddressDisplay address={nft.owner} />
            {account ? (
              <>
                <p className="pt-2 text-text-muted">NFT Account</p>
                <AddressDisplay address={account.address} />
              </>
            ) : null}
          </div>
          {nft.market?.listing ? (
            <div className="mt-6 rounded-lg border border-border bg-surface-1 p-4">
              <p className="text-xs text-text-muted">Price</p>
              <p className="tabular text-2xl font-semibold">
                {formatEth(nft.market.listing.priceEth)}
              </p>
              <p className="text-sm text-text-secondary">{formatUsd(marketUsd)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => setBuyOpen(true)}>Buy now</Button>
                <Button variant="secondary">Make offer</Button>
                {isOwner ? (
                  <Button variant="secondary" onClick={() => setListOpen(true)}>
                    Sell
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <Button variant="secondary" onClick={() => setListOpen(true)}>
                Sell
              </Button>
            </div>
          )}
          {account ? (
            <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg border border-border bg-surface-1 p-4 text-sm">
              <div>
                <p className="text-xs text-text-muted">NFT market value</p>
                <p className="tabular font-medium">{formatUsd(marketUsd)}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Contained assets</p>
                <p className="tabular font-medium">{formatUsd(contained)}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Combined estimated value</p>
                <p className="tabular font-semibold">{formatUsd(combined)}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "account", label: "NFT Account" },
          { id: "traits", label: "Traits" },
          { id: "activity", label: "Activity" },
        ]}
      />

      {tab === "overview" ? (
        <p className="max-w-2xl text-sm text-text-secondary">
          {nft.description ?? `${nft.name} is part of ${nft.collectionName}.`}
        </p>
      ) : null}

      {tab === "account" ? (
        account ? (
          <NftAccountPanel account={account} isOwner={isOwner} />
        ) : (
          <p className="text-sm text-text-secondary">
            This NFT does not currently have an NFT Account.
          </p>
        )
      ) : null}

      {tab === "traits" ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {nft.traits.map((trait) => (
            <div
              key={trait.trait_type}
              className="rounded-lg border border-border bg-surface-1 p-3"
            >
              <p className="text-xs uppercase tracking-wide text-text-muted">
                {trait.trait_type}
              </p>
              <p className="mt-1 text-sm font-medium">{trait.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "activity" ? (
        <div className="divide-y divide-border-subtle rounded-lg border border-border">
          {activity.slice(0, 4).map((item) => (
            <div key={item.id} className="flex justify-between px-4 py-4 text-sm">
              <div>
                <p className="text-xs uppercase text-text-muted">{item.type}</p>
                <p>{item.title}</p>
              </div>
              <p className="text-text-muted">{item.at}</p>
            </div>
          ))}
        </div>
      ) : null}

      <Modal open={buyOpen} onClose={() => setBuyOpen(false)} title="You are buying">
        <p className="font-medium">{nft.name}</p>
        {nft.market?.listing ? (
          <p className="mt-3 tabular text-lg">{formatEth(nft.market.listing.priceEth)}</p>
        ) : null}
        {account && account.assets.length ? (
          <div className="mt-4 rounded-md border border-warning/40 bg-[#2a2314] p-3 text-sm">
            <p className="font-medium text-warning">This NFT currently controls</p>
            <ul className="mt-2 space-y-1 text-text-secondary">
              {account.assets.map((asset) => (
                <li key={asset.kind === "token" ? asset.symbol : asset.name}>
                  {asset.kind === "token"
                    ? `${asset.balance.toLocaleString()} $${asset.symbol}`
                    : asset.name}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-text-muted">
              Estimated contained assets {formatUsd(account.estimatedTotalValue)}
            </p>
          </div>
        ) : null}
        <Button
          className="mt-5 w-full"
          onClick={() => {
            setBuyOpen(false);
            tx.start(`Buy ${nft.name}`, nft.market?.listing?.priceEth ?? 0);
          }}
        >
          Confirm purchase
        </Button>
      </Modal>

      <Modal open={listOpen} onClose={() => setListOpen(false)} title="List for sale">
        <p className="font-medium">{nft.name}</p>
        <div className="mt-4 space-y-2 text-sm">
          <p className="flex justify-between">
            <span className="text-text-muted">Estimated market value</span>
            <span>{formatUsd(marketUsd || 1599)}</span>
          </p>
          {account ? (
            <p className="flex justify-between">
              <span className="text-text-muted">Contained assets</span>
              <span>{formatUsd(account.estimatedTotalValue)}</span>
            </p>
          ) : null}
        </div>
        {account ? (
          <p className="mt-4 rounded-md border border-warning/40 bg-[#2a2314] p-3 text-sm text-warning">
            Your listing transfers control of the NFT and its NFT Account.
          </p>
        ) : null}
        <label className="mt-4 block text-sm">
          Listing price
          <input
            value={listPrice}
            onChange={(event) => setListPrice(event.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-border bg-surface-2 px-3 tabular"
          />
        </label>
        <div className="mt-3 space-y-1 text-sm text-text-secondary">
          <p className="flex justify-between">
            <span>Marketplace fee</span>
            <span>1.5%</span>
          </p>
          <p className="flex justify-between">
            <span>Creator royalty</span>
            <span>5%</span>
          </p>
        </div>
        <Button
          className="mt-5 w-full"
          onClick={() => {
            setListOpen(false);
            tx.start(`List ${nft.name}`, Number(listPrice) || 0);
          }}
        >
          Create listing
        </Button>
      </Modal>

      <TransactionModal
        tx={tx}
        completeTitle="Purchase complete"
        completeBody={`${nft.name} would now be yours. No assets were transferred.`}
      />
    </div>
  );
}
