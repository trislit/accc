"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { getWalletClient } from "wagmi/actions";
import { ProjectVideo } from "@/components/art/ProjectVideo";
import {
  TransactionModal,
  useOnchainTransaction,
} from "@/components/tx/TransactionStatus";
import { Badge } from "@/components/ui/Badge";
import { SeatPitch } from "@/components/pitch/SeatPitch";
import { Button } from "@/components/ui/Button";
import { ConnectModal } from "@/components/wallet/WalletControls";
import { acccNftAbi } from "@/lib/contracts";
import { activeChain, explorerAddressUrl } from "@/lib/chain";
import { useAcccMintStats, useGrantOf } from "@/lib/data/onchain";
import { formatTokenAmount } from "@/lib/format";
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
  const { isConnected } = useAccount();
  const liveTx = useOnchainTransaction();
  const queryClient = useQueryClient();
  const [connectOpen, setConnectOpen] = useState(false);
  const [liveTokenId, setLiveTokenId] = useState<string>();
  const onchainMint = drop.status === "live";
  const stats = useAcccMintStats();
  const nextTokenId =
    stats.nextId === undefined ? undefined : String(stats.nextId + 1);
  const nextGrant = useGrantOf(onchainMint ? nextTokenId : undefined);
  const minted = onchainMint ? stats.minted : drop.minted;
  const mintedLabel =
    minted === undefined && stats.isLoading ? "—" : (minted ?? 0).toLocaleString();

  const includes = useMemo(
    () =>
      [
        `1 × ${drop.includes.nftLabel.replace(/^1 /, "")}`,
        drop.includes.nftAccount ? "An account this NFT owns" : "",
        "Tokens, NFTs, and locked perks that follow this seat",
        nextGrant.special
          ? `${formatTokenAmount(nextGrant.formatted)} ${project.tokenSymbol} genesis grant (special)`
          : "Genesis grant into the NFT Account (usually 1,000 $ACCC)",
      ].filter(Boolean),
    [drop, nextGrant.formatted, nextGrant.special],
  );

  function onMintClick() {
    if (stats.paused) return;
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
      void stats.refetch();
      void queryClient.invalidateQueries({ queryKey: ["accc-collection"] });
      void queryClient.invalidateQueries({ queryKey: ["accc-owned"] });
      void queryClient.invalidateQueries({ queryKey: ["accc-grant"] });
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
            Free testnet mint. You get a seat: an NFT with its own account.
            Tokens, other NFTs, and perks you buy stay on that seat.
          </p>
        ) : null}
        <ProjectVideo
          src={drop.video ?? project.videos.mint}
          className="mt-6 aspect-[16/10] w-full"
          rounded="rounded-lg"
        />
        <div className="mt-6">
          <SeatPitch variant="compact" />
        </div>
      </div>

      <aside className="h-fit space-y-5 rounded-lg border border-border bg-surface-1 p-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Meta label="Mint price" value="Free" />
          <Meta label="Supply" value="Open" />
          <Meta label="Minted" value={mintedLabel} />
          <Meta
            label="Next grant"
            value={
              nextGrant.special
                ? `${formatTokenAmount(nextGrant.formatted)} special`
                : `${formatTokenAmount(nextGrant.formatted)} $ACCC`
            }
          />
        </div>
        {stats.error ? (
          <p className="text-sm text-error">{stats.error}</p>
        ) : null}

        {drop.status === "upcoming" ? (
          <p className="text-sm text-text-secondary">
            Opens {drop.startsAt ?? "soon"}.
          </p>
        ) : null}

        {drop.status === "live" ? (
          stats.paused ? (
            <p className="text-sm text-warning">
              Public mint is paused while core seats are assigned. Open mint
              from Admin when leadership IDs are minted.
            </p>
          ) : (
            <>
            {nextGrant.special ? (
              <Badge tone="warning">Next mint is a special grant</Badge>
            ) : null}
            <p className="tabular text-sm text-text-secondary">0 ETH</p>
            <Button className="w-full" onClick={onMintClick}>
              {isConnected ? "Mint on testnet" : "Connect to mint"}
            </Button>
            </>
          )
        ) : null}
        {drop.status === "live" ? (
            <a
              href={explorerAddressUrl(LIVE_NFT)}
              target="_blank"
              rel="noreferrer"
              className="block break-all font-mono text-xs text-text-muted hover:text-forge-green"
            >
              {LIVE_NFT}
            </a>
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
        completeBody="Your seat is onchain. Tokens, NFTs, and skins you buy stay with this NFT."
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
