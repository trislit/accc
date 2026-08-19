"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { parseUnits } from "viem";
import { useAccount } from "wagmi";
import { getWalletClient } from "wagmi/actions";
import { Atmosphere } from "@/components/art/Atmosphere";
import {
  TransactionModal,
  useOnchainTransaction,
} from "@/components/tx/TransactionStatus";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Tabs";
import { ConnectModal } from "@/components/wallet/WalletControls";
import { arcadeMarkLabel, arcadePath } from "@/lib/arcade";
import { robinhoodTestnet } from "@/lib/chain";
import { acccArcadeAbi, acccTokenAbi } from "@/lib/contracts";
import {
  useAcccBalance,
  useArcadeStatus,
  useDistributorStatus,
  useNftOwner,
  useOwnedAcccNfts,
  useTbaAddress,
  useTokenAllowance,
} from "@/lib/data/onchain";
import { formatTokenAmount } from "@/lib/format";
import { LIVE_ARCADE, LIVE_TOKEN, project, tokenLabel } from "@/lib/project";
import { accountPath } from "@/lib/tba";
import { wagmiConfig } from "@/lib/wagmi";

function ArcadeInner() {
  const params = useSearchParams();
  const tokenId = params.get("tokenId") ?? "";
  const { address, isConnected } = useAccount();
  const [connectOpen, setConnectOpen] = useState(false);
  const [inWindow, setInWindow] = useState(false);
  const ownerQuery = useNftOwner(tokenId || undefined);
  const tbaQuery = useTbaAddress(tokenId || undefined);
  const dist = useDistributorStatus(tokenId || undefined);
  const arcade = useArcadeStatus(tokenId || undefined);
  const tbaToken = useAcccBalance(tbaQuery.address);
  const walletToken = useAcccBalance(isConnected ? address : undefined);
  const allowance = useTokenAllowance(
    isConnected ? address : undefined,
    LIVE_ARCADE,
  );
  const owned = useOwnedAcccNfts(isConnected ? address : undefined);
  const tx = useOnchainTransaction();

  const isOwner =
    Boolean(address) &&
    Boolean(ownerQuery.owner) &&
    address?.toLowerCase() === ownerQuery.owner?.toLowerCase();
  const principal = dist.eligibleFormatted ?? 0;
  const innerCircle = principal > 0;
  const spendable = arcade.spendable;
  const wallet = walletToken.formatted ?? 0;
  const cost = arcade.cost;
  const approved = (allowance.formatted ?? 0) + 1e-12 >= cost;
  const canPay = wallet + 1e-12 >= cost;
  const markLabel = arcadeMarkLabel(arcade.mark);

  useEffect(() => {
    const id = window.setInterval(() => {
      setInWindow((Date.now() / 900) % 4 < 1);
    }, 80);
    return () => window.clearInterval(id);
  }, []);

  function sendApprove() {
    tx.start(`Approve ${cost} ${tokenLabel()}`, 0, async () => {
      const walletClient = await getWalletClient(wagmiConfig, {
        chainId: robinhoodTestnet.id,
      });
      if (!walletClient) throw new Error("Wallet is not ready.");
      return walletClient.writeContract({
        address: LIVE_TOKEN,
        abi: acccTokenAbi,
        functionName: "approve",
        args: [LIVE_ARCADE, parseUnits(String(cost), 18)],
        chain: robinhoodTestnet,
        account: walletClient.account,
      });
    }, () => {
      void allowance.refetch();
    });
  }

  function sendPlay() {
    if (!tokenId) return;
    tx.start(`Play Handshake · ${cost} ${tokenLabel()}`, 0, async () => {
      const walletClient = await getWalletClient(wagmiConfig, {
        chainId: robinhoodTestnet.id,
      });
      if (!walletClient) throw new Error("Wallet is not ready.");
      return walletClient.writeContract({
        address: LIVE_ARCADE,
        abi: acccArcadeAbi,
        functionName: "play",
        args: [BigInt(tokenId)],
        chain: robinhoodTestnet,
        account: walletClient.account,
      });
    }, () => {
      void arcade.refetch();
      void walletToken.refetch();
      void tbaToken.refetch();
      void allowance.refetch();
      void dist.refetch();
    });
  }

  function onPlayClick() {
    if (!isConnected) {
      setConnectOpen(true);
      return;
    }
    if (!approved) {
      sendApprove();
      return;
    }
    sendPlay();
  }

  if (!tokenId) {
    return (
      <div className="space-y-6">
        <Header />
        {!isConnected ? (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface-1 p-4">
            <p className="flex-1 text-sm text-text-secondary">
              Connect a wallet that holds an inner-circle seat to pick a cabinet.
            </p>
            <Button size="sm" onClick={() => setConnectOpen(true)}>
              Connect wallet
            </Button>
          </div>
        ) : owned.isLoading ? (
          <p className="text-sm text-text-muted">Reading seats…</p>
        ) : owned.nfts.length === 0 ? (
          <EmptyState
            title="No ACCC NFT on this wallet"
            body="Mint a membership. Claim genesis into the NFT Account to enter the inner circle."
          />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {owned.nfts.map((nft) => (
              <li key={nft.tokenId}>
                <Link
                  href={arcadePath(nft.tokenId)}
                  className="block rounded-lg border border-border bg-surface-1 p-4 hover:border-[#3a4440]"
                >
                  <p className="text-sm font-medium">{nft.name}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    {arcadeMarkLabel(nft.arcadeMark) ?? "No mark yet"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <ConnectModal open={connectOpen} onClose={() => setConnectOpen(false)} />
      </div>
    );
  }

  if (ownerQuery.error) {
    return (
      <EmptyState title={`ACCC #${tokenId} not found`} body={ownerQuery.error} />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <Header tokenId={tokenId} />
        <p className="mt-2 max-w-xl text-sm text-text-secondary">
          Keep original genesis {tokenLabel()} in the NFT Account to stay inner
          circle. Plays spend harvested surplus or wallet {tokenLabel()} — never
          the seat.
        </p>
        <div className="relative mt-6 overflow-hidden rounded-lg border border-border">
          <Atmosphere id="wanderer-775" className="aspect-[16/10]" rounded="rounded-none" />
          <div className="absolute inset-x-0 bottom-0 bg-black/70 p-4">
            <p className="text-xs font-semibold tracking-wide text-text-muted">
              THE HANDSHAKE
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Hit the window when the cabal lets you in. {cost} {tokenLabel()}{" "}
              per play. Marks only — no {tokenLabel()} comes back.
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-3">
              <div
                className={`h-full w-1/4 ${inWindow ? "bg-forge-green" : "bg-surface-2"}`}
                style={{
                  marginLeft: inWindow ? "38%" : "8%",
                  transition: "margin-left 80ms linear, background-color 80ms",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <aside className="h-fit space-y-5 rounded-lg border border-border bg-surface-1 p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold">
            {project.nftPrefix} #{tokenId}
          </h2>
          <Badge tone={innerCircle ? "green" : "warning"}>
            {innerCircle ? "Inner circle" : "Locked"}
          </Badge>
        </div>
        <div className="grid grid-cols-1 gap-3 text-sm">
          <Meta
            label="Seat (principal)"
            value={`${formatTokenAmount(principal)} ${tokenLabel()}`}
          />
          <Meta
            label="Spendable surplus"
            value={`${formatTokenAmount(spendable)} ${tokenLabel()}`}
          />
          <Meta
            label="Wallet"
            value={isConnected ? `${formatTokenAmount(wallet)} ${tokenLabel()}` : "—"}
          />
        </div>
        {markLabel ? (
          <p className="text-sm text-forge-green">
            Mark: {markLabel}
            {arcade.plays ? ` · ${arcade.plays} play${arcade.plays === 1 ? "" : "s"}` : ""}
          </p>
        ) : (
          <p className="text-sm text-text-muted">No handshake yet.</p>
        )}
        {!innerCircle ? (
          <p className="text-sm text-warning">
            This seat emptied its genesis grant. Claim and keep principal in the
            NFT Account to unlock the cabinet.
          </p>
        ) : null}
        {innerCircle && isOwner && !canPay ? (
          <p className="text-sm text-text-secondary">
            Need {cost} {tokenLabel()} in this wallet. Harvest, then withdraw
            only surplus from the{" "}
            <Link href={accountPath(tokenId)} className="text-forge-green">
              NFT Account
            </Link>
            .
          </p>
        ) : null}
        {!isConnected ? (
          <Button className="w-full" onClick={() => setConnectOpen(true)}>
            Connect to play
          </Button>
        ) : !isOwner ? (
          <p className="text-sm text-text-secondary">
            Connect the wallet that owns this NFT.
          </p>
        ) : (
          <Button
            className="w-full"
            disabled={!innerCircle || !canPay}
            onClick={onPlayClick}
          >
            {!innerCircle
              ? "Inner circle locked"
              : !approved
                ? `Approve ${cost} ${tokenLabel()}`
                : inWindow
                  ? `Play · ${cost} ${tokenLabel()}`
                  : `Play · ${cost} ${tokenLabel()}`}
          </Button>
        )}
        <Link href={accountPath(tokenId)} className="block text-sm text-forge-green">
          Open NFT Account →
        </Link>
      </aside>

      <ConnectModal open={connectOpen} onClose={() => setConnectOpen(false)} />
      <TransactionModal
        tx={tx}
        completeTitle={tx.action.startsWith("Play") ? "Handshake complete" : "Approved"}
        completeBody={
          tx.action.startsWith("Play")
            ? `${cost} ${tokenLabel()} left circulation. Your mark is on this seat.`
            : `Arcade can now take ${cost} ${tokenLabel()} for a Handshake play.`
        }
        completeLabel="Done"
        onComplete={() => undefined}
      />
    </div>
  );
}

function Header({ tokenId }: { tokenId?: string }) {
  return (
    <header className="space-y-2">
      <p className="text-xs font-semibold tracking-wide text-text-muted">
        ARCADE
      </p>
      <h1 className="text-[32px] font-semibold leading-10">The Handshake</h1>
      {tokenId ? (
        <p className="text-sm text-text-muted">
          <Link href="/arcade/" className="hover:text-text-primary">
            Arcade
          </Link>
          <span className="px-2">/</span>
          {project.nftPrefix} #{tokenId}
        </p>
      ) : null}
    </header>
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

export function ArcadeView() {
  return (
    <Suspense fallback={<p className="text-sm text-text-muted">Loading arcade…</p>}>
      <ArcadeInner />
    </Suspense>
  );
}
