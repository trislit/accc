"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAccount, useReadContract, useWalletClient } from "wagmi";
import { ProjectVideo } from "@/components/art/ProjectVideo";
import {
  TransactionModal,
  useMockTransaction,
  useOnchainTransaction,
} from "@/components/tx/TransactionStatus";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConnectModal } from "@/components/wallet/WalletControls";
import { acccNftAbi } from "@/lib/contracts";
import { activeChain } from "@/lib/chain";
import { mintHoldings } from "@/lib/holdings";
import { useHoldings } from "@/lib/useHoldings";
import { formatEth } from "@/lib/format";
import { liveContracts, project, tokenLabel } from "@/lib/project";
import { accountPath, tokenIdFromMintReceipt } from "@/lib/tba";
import type { Drop } from "@/lib/types";

const statusTone = {
  live: "green",
  upcoming: "warning",
  completed: "muted",
} as const;

const statusLabel = {
  live: "Minting now",
  upcoming: "Upcoming",
  completed: "Sold out",
} as const;

export function DropView({ drop }: { drop: Drop }) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const mine = useHoldings(address);
  const allHoldings = useHoldings();
  const rawTx = useMockTransaction();
  const liveTx = useOnchainTransaction();
  const [quantity, setQuantity] = useState(1);
  const [connectOpen, setConnectOpen] = useState(false);
  const [mintedIds, setMintedIds] = useState<string[]>([]);
  const [liveTokenId, setLiveTokenId] = useState<string>();
  const onchainMint = liveContracts && drop.id === "genesis";

  const nextId = useReadContract({
    address: project.nftContract,
    abi: acccNftAbi,
    functionName: "nextId",
    chainId: activeChain.id,
    query: { enabled: onchainMint },
  });
  const ownedOnchain = useReadContract({
    address: project.nftContract,
    abi: acccNftAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: activeChain.id,
    query: { enabled: onchainMint && Boolean(address) },
  });

  const tx = {
    ...rawTx,
    confirm: () => {
      if (address) {
        const created = mintHoldings(address, drop, quantity);
        setMintedIds(created.map((item) => item.id));
      }
      rawTx.confirm();
    },
  };

  const localMinted = allHoldings.filter((holding) => holding.dropId === drop.id)
    .length;
  const minted = onchainMint
    ? Number(nextId.data ?? 0)
    : drop.minted + localMinted;
  const remaining = Math.max(0, drop.supply - minted);
  const already = onchainMint
    ? Number(ownedOnchain.data ?? 0)
    : mine.filter((holding) => holding.dropId === drop.id).length;
  const walletLeft = Math.max(0, drop.maxPerWallet - already);
  const maxQty = onchainMint
    ? 1
    : Math.min(drop.maxPerWallet, remaining, walletLeft || drop.maxPerWallet);
  const total = onchainMint ? 0 : drop.priceEth * quantity;
  const canMint =
    drop.status === "live" && remaining > 0 && (!isConnected || walletLeft > 0);

  const includes = useMemo(
    () =>
      [
        `${onchainMint ? 1 : quantity} × ${drop.includes.nftLabel.replace(/^1 /, "")}`,
        drop.includes.nftAccount
          ? `${onchainMint ? 1 : quantity} NFT Account${quantity > 1 && !onchainMint ? "s" : ""}`
          : "",
        onchainMint
          ? "Onchain ERC-6551 account created at mint"
          : `${(drop.includes.tokenClaim * quantity).toLocaleString()} ${tokenLabel()} claim eligibility`,
      ].filter(Boolean),
    [drop, onchainMint, quantity],
  );

  function onMintClick() {
    if (!isConnected) {
      setConnectOpen(true);
      return;
    }
    if (onchainMint) {
      liveTx.start("Mint ACCC", 0, async () => {
        if (!walletClient) throw new Error("Wallet is not ready.");
        return walletClient.writeContract({
          address: project.nftContract,
          abi: acccNftAbi,
          functionName: "mint",
        });
      }, (receipt) => {
        const tokenId = tokenIdFromMintReceipt(receipt);
        if (tokenId) setLiveTokenId(tokenId);
        void nextId.refetch();
        void ownedOnchain.refetch();
      });
      return;
    }
    const nextQty = Math.min(quantity, walletLeft, remaining);
    setQuantity(nextQty);
    tx.start(`Mint ${nextQty} from ${drop.name}`, drop.priceEth * nextQty);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <p className="text-sm text-text-muted">
          <Link href="/mint/" className="hover:text-text-primary">
            Mint
          </Link>
          <span className="px-2">/</span>
          {drop.name}
        </p>
        <Link
          href="/collection/"
          className="mt-4 inline-block text-sm text-text-secondary hover:text-text-primary"
        >
          {project.name}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-[32px] font-semibold leading-10">{drop.name}</h1>
          <Badge tone={statusTone[drop.status]}>{statusLabel[drop.status]}</Badge>
        </div>
        {onchainMint ? (
          <p className="mt-2 text-sm text-text-secondary">
            Testnet mint. Each NFT deploys an ERC-6551 account you can deposit
            tokens into.
          </p>
        ) : null}
        <ProjectVideo
          src={drop.video ?? project.videos.mint}
          className="mt-6 aspect-[16/10] w-full"
          rounded="rounded-lg"
        />
      </div>

      <aside className="h-fit space-y-5 rounded-lg border border-border bg-surface-1 p-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Meta
            label="Mint price"
            value={onchainMint ? "Free" : formatEth(drop.priceEth)}
          />
          <Meta label="Supply" value={drop.supply.toLocaleString()} />
          <Meta label="Minted" value={minted.toLocaleString()} />
          <Meta label="Per wallet" value={String(drop.maxPerWallet)} />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs text-text-muted">
            <span>
              {minted.toLocaleString()} / {drop.supply.toLocaleString()}
            </span>
            <span>{Math.round((minted / drop.supply) * 100)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-sm bg-surface-3">
            <div
              className="h-full bg-forge-green"
              style={{ width: `${Math.min(100, (minted / drop.supply) * 100)}%` }}
            />
          </div>
        </div>

        {drop.status === "upcoming" ? (
          <p className="text-sm text-text-secondary">
            Opens {drop.startsAt ?? "soon"}.
          </p>
        ) : null}

        {drop.status === "live" ? (
          <>
            {onchainMint ? null : (
              <div className="flex items-center justify-between rounded-md border border-border bg-bg px-3 py-2">
                <button
                  type="button"
                  className="text-lg text-text-secondary"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                >
                  −
                </button>
                <span className="tabular font-medium">{quantity}</span>
                <button
                  type="button"
                  className="text-lg text-text-secondary"
                  onClick={() =>
                    setQuantity((value) => Math.min(Math.max(maxQty, 1), value + 1))
                  }
                >
                  +
                </button>
              </div>
            )}
            <p className="tabular text-sm text-text-secondary">{formatEth(total)}</p>
            {isConnected && walletLeft <= 0 ? (
              <p className="text-sm text-warning">
                This wallet already minted its maximum for this drop.
              </p>
            ) : null}
            <Button className="w-full" disabled={!canMint && isConnected} onClick={onMintClick}>
              {isConnected ? "Mint" : "Connect to mint"}
            </Button>
          </>
        ) : null}

        {drop.status === "completed" ? (
          <Button className="w-full" disabled>
            Sold out
          </Button>
        ) : null}

        <div>
          <p className="text-xs font-semibold tracking-wide text-text-muted">
            YOUR MINT INCLUDES
          </p>
          <ul className="mt-2 space-y-1 text-sm text-text-secondary">
            {includes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        {onchainMint && liveTokenId ? (
          <Link href={accountPath(liveTokenId)} className="block text-sm text-forge-green">
            Open NFT Account →
          </Link>
        ) : mine.some((holding) => holding.dropId === drop.id) ? (
          <Link href="/portfolio/" className="block text-sm text-forge-green">
            View in portfolio →
          </Link>
        ) : null}
      </aside>

      <ConnectModal open={connectOpen} onClose={() => setConnectOpen(false)} />
      {onchainMint ? (
        <TransactionModal
          tx={liveTx}
          completeTitle="Mint complete"
          completeBody="Your NFT Account is onchain. Deposit test $ACCC or ETH into it."
          completeHref={liveTokenId ? accountPath(liveTokenId) : "/portfolio/"}
          completeLabel="View NFT Account"
        />
      ) : (
        <TransactionModal
          tx={tx}
          completeTitle="Mint complete"
          completeBody={
            mintedIds.length
              ? `${mintedIds.length === 1 ? "Your NFT is" : "Your NFTs are"} in your portfolio${drop.includes.nftAccount ? ", each with an NFT Account" : ""}.`
              : "Your mint is in your portfolio."
          }
          completeHref="/portfolio/"
          completeLabel="View portfolio"
          onComplete={() => undefined}
        />
      )}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-0.5 tabular font-medium">{value}</p>
    </div>
  );
}
