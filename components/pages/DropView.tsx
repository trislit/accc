"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { getWalletClient } from "wagmi/actions";
import { ProjectVideo } from "@/components/art/ProjectVideo";
import {
  TransactionModal,
  useOnchainTransaction,
} from "@/components/tx/TransactionStatus";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConnectModal } from "@/components/wallet/WalletControls";
import { acccNftAbi } from "@/lib/contracts";
import { activeChain, explorerAddressUrl } from "@/lib/chain";
import { LIVE_NFT, project } from "@/lib/project";
import { accountPath, tokenIdFromMintReceipt } from "@/lib/tba";
import { wagmiConfig } from "@/lib/wagmi";
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
  const liveTx = useOnchainTransaction();
  const [connectOpen, setConnectOpen] = useState(false);
  const [liveTokenId, setLiveTokenId] = useState<string>();
  const onchainMint = drop.status === "live";

  const nextId = useReadContract({
    address: LIVE_NFT,
    abi: acccNftAbi,
    functionName: "nextId",
    chainId: activeChain.id,
    query: { enabled: onchainMint },
  });
  const ownedOnchain = useReadContract({
    address: LIVE_NFT,
    abi: acccNftAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: activeChain.id,
    query: { enabled: onchainMint && Boolean(address) },
  });

  const minted = onchainMint ? Number(nextId.data ?? 0) : drop.minted;
  const remaining = Math.max(0, drop.supply - minted);
  const already = onchainMint ? Number(ownedOnchain.data ?? 0) : 0;
  const walletLeft = Math.max(0, drop.maxPerWallet - already);
  const canMint =
    drop.status === "live" && remaining > 0 && (!isConnected || walletLeft > 0);

  const includes = useMemo(
    () =>
      [
        `1 × ${drop.includes.nftLabel.replace(/^1 /, "")}`,
        drop.includes.nftAccount ? "1 NFT Account" : "",
        "Onchain ERC-6551 account created at mint",
      ].filter(Boolean),
    [drop],
  );

  function onMintClick() {
    if (!isConnected) {
      setConnectOpen(true);
      return;
    }
    liveTx.start("Mint ACCC", 0, async () => {
      const walletClient = await getWalletClient(wagmiConfig, {
        chainId: activeChain.id,
      });
      if (!walletClient) throw new Error("Wallet is not ready.");
      return walletClient.writeContract({
        address: LIVE_NFT,
        abi: acccNftAbi,
        functionName: "mint",
        chain: activeChain,
        account: walletClient.account,
      });
    }, (receipt) => {
      const tokenId = tokenIdFromMintReceipt(receipt);
      if (tokenId) setLiveTokenId(tokenId);
      void nextId.refetch();
      void ownedOnchain.refetch();
    });
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
          <Meta label="Mint price" value="Free" />
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
            <p className="tabular text-sm text-text-secondary">0 ETH</p>
            {isConnected && walletLeft <= 0 ? (
              <p className="text-sm text-warning">
                This wallet already minted its maximum for this drop.
              </p>
            ) : null}
            <Button className="w-full" disabled={!canMint && isConnected} onClick={onMintClick}>
              {isConnected ? "Mint on testnet" : "Connect to mint"}
            </Button>
            <a
              href={explorerAddressUrl(LIVE_NFT)}
              target="_blank"
              rel="noreferrer"
              className="block break-all font-mono text-xs text-text-muted hover:text-forge-green"
            >
              {LIVE_NFT}
            </a>
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

        {liveTokenId ? (
          <Link href={accountPath(liveTokenId)} className="block text-sm text-forge-green">
            Open NFT Account →
          </Link>
        ) : null}
      </aside>

      <ConnectModal open={connectOpen} onClose={() => setConnectOpen(false)} />
      <TransactionModal
        tx={liveTx}
        completeTitle="Mint complete"
        completeBody="Your NFT Account is onchain. Deposit test $ACCC or ETH into it."
        completeHref={liveTokenId ? accountPath(liveTokenId) : "/portfolio/"}
        completeLabel="View NFT Account"
      />
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
