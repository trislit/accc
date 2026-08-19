"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { getWalletClient } from "wagmi/actions";
import { Atmosphere } from "@/components/art/Atmosphere";
import { NftAccountPanel } from "@/components/account/NftAccountPanel";
import { TransferModal } from "@/components/account/TransferModal";
import {
  TransactionModal,
  useOnchainTransaction,
} from "@/components/tx/TransactionStatus";
import { AddressDisplay } from "@/components/ui/AddressDisplay";
import { AccountBadge, Badge, VerifiedBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Tabs";
import { artIdForSkin } from "@/lib/arcade";
import { acccTxFees, robinhoodTestnet } from "@/lib/chain";
import { acccDistributorAbi } from "@/lib/contracts";
import {
  useAcccBalance,
  useArcadeStatus,
  useDistributorStatus,
  useNativeEthBalance,
  useNftOwner,
  useTbaAddress,
} from "@/lib/data/onchain";
import { ethToUsd, formatTokenAmount, formatUsd } from "@/lib/format";
import {
  LIVE_DISTRIBUTOR,
  LIVE_NFT,
  LIVE_TOKEN,
  liveContracts,
  project,
  tokenLabel,
} from "@/lib/project";
import { ZERO_ADDRESS } from "@/lib/tba";
import { wagmiConfig } from "@/lib/wagmi";
import type { NftAccount, TokenAsset } from "@/lib/types";

function formatPending(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 6,
  });
}

function AccountInner() {
  const params = useSearchParams();
  const tokenId = params.get("tokenId") ?? "";
  const { address } = useAccount();
  const ownerQuery = useNftOwner(tokenId || undefined);
  const tbaQuery = useTbaAddress(tokenId || undefined);
  const tbaEth = useNativeEthBalance(tbaQuery.address);
  const tbaToken = useAcccBalance(tbaQuery.address);
  const dist = useDistributorStatus(tokenId || undefined);
  const arcade = useArcadeStatus(tokenId || undefined);
  const distTx = useOnchainTransaction();
  const [completeTitle, setCompleteTitle] = useState("Done");
  const [completeBody, setCompleteBody] = useState("");
  const [depositOpen, setDepositOpen] = useState(false);

  const isOwner =
    Boolean(address) &&
    Boolean(ownerQuery.owner) &&
    address?.toLowerCase() === ownerQuery.owner?.toLowerCase();

  const account = useMemo<NftAccount | undefined>(() => {
    if (!tokenId || !tbaQuery.address) return undefined;
    const assets: TokenAsset[] = [];
    if (tbaEth.formatted) {
      assets.push({
        kind: "token",
        symbol: "ETH",
        name: "Ether",
        contract: ZERO_ADDRESS,
        balance: tbaEth.formatted,
        estimatedValueUsd: ethToUsd(tbaEth.formatted),
      });
    }
    const acccBalance = tbaToken.formatted ?? 0;
    assets.push({
      kind: "token",
      symbol: project.tokenSymbol,
      name: project.tokenName,
      contract: LIVE_TOKEN,
      balance: acccBalance,
      estimatedValueUsd: acccBalance * project.tokenPriceUsd,
    });
    const estimatedTokenValue = assets.reduce(
      (sum, asset) => sum + asset.estimatedValueUsd,
      0,
    );
    return {
      address: tbaQuery.address,
      nft: { contract: LIVE_NFT, tokenId },
      controller: ownerQuery.owner ?? ZERO_ADDRESS,
      assets,
      estimatedTokenValue,
      estimatedNftValue: 0,
      estimatedTotalValue: estimatedTokenValue,
    };
  }, [
    ownerQuery.owner,
    tbaEth.formatted,
    tbaQuery.address,
    tbaToken.formatted,
    tokenId,
  ]);

  function onDistributorWrite(
    action: string,
    functionName: "claimGenesis" | "harvest",
    completeTitle: string,
    completeBody: string,
  ) {
    if (!tokenId) return;
    setCompleteTitle(completeTitle);
    setCompleteBody(completeBody);
    distTx.start(action, 0, async () => {
      const walletClient = await getWalletClient(wagmiConfig, {
        chainId: robinhoodTestnet.id,
      });
      if (!walletClient) throw new Error("Wallet is not ready.");
      return walletClient.writeContract({
        address: LIVE_DISTRIBUTOR,
        abi: acccDistributorAbi,
        functionName,
        args: [BigInt(tokenId)],
        chain: robinhoodTestnet,
        account: walletClient.account,
        ...(await acccTxFees()),
      });
    }, () => {
      void tbaToken.refetch();
      void tbaEth.refetch();
      void dist.refetch();
    });
  }

  function onClaim() {
    onDistributorWrite(
      `Claim ${formatTokenAmount(genesis)} ${tokenLabel()}`,
      "claimGenesis",
      "Claim complete",
      `${formatTokenAmount(genesis)} ${tokenLabel()} was minted into this NFT Account. Yield accrues on that grant while it stays here.`,
    );
  }

  function onHarvest() {
    onDistributorWrite(
      `Harvest ${tokenLabel()}`,
      "harvest",
      "Harvest complete",
      `Yield was minted into this NFT Account. Original principal is unchanged.`,
    );
  }

  if (!liveContracts) {
    return (
      <EmptyState
        title="Contracts not configured"
        body="Set NEXT_PUBLIC_NFT, NEXT_PUBLIC_TOKEN, and NEXT_PUBLIC_TBA_IMPLEMENTATION after deploying to Robinhood testnet."
      />
    );
  }

  if (!tokenId) {
    return (
      <EmptyState
        title="No token selected"
        body="Mint an NFT to open its NFT Account, or open this page with ?tokenId=."
      />
    );
  }

  if (ownerQuery.isLoading) {
    return (
      <EmptyState
        title={`Loading ACCC #${tokenId}`}
        body="Reading this NFT from Robinhood Chain testnet."
      />
    );
  }

  if (ownerQuery.error) {
    return (
      <EmptyState
        title={`ACCC #${tokenId} not found`}
        body={ownerQuery.error}
      />
    );
  }

  const genesis = dist.genesisFormatted ?? 1000;
  const eligible = dist.eligibleFormatted ?? 0;
  const pending = dist.pendingFormatted ?? 0;

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Atmosphere
          id={artIdForSkin(arcade.wallpaper)}
          className="aspect-square w-full"
          rounded="rounded-lg"
        />
        <div>
          <Link
            href="/collection/"
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary"
          >
            {project.collectionName}
            <VerifiedBadge />
            <AccountBadge />
          </Link>
          <h1 className="mt-2 text-[32px] font-semibold leading-10">
            {project.nftPrefix} #{tokenId}
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            This NFT owns the account. Tokens, other NFTs, and locked perks
            move with the seat.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <p className="text-text-muted">Owned by</p>
            {ownerQuery.owner ? (
              <AddressDisplay address={ownerQuery.owner} />
            ) : (
              <p className="text-sm text-text-muted">Loading…</p>
            )}
            {account ? (
              <>
                <p className="pt-2 text-text-muted">NFT Account</p>
                <AddressDisplay address={account.address} />
              </>
            ) : null}
          </div>
          {dist.claimed ? (
            <div className="mt-5 rounded-lg border border-border bg-surface-1 p-4 text-sm">
              <div className="flex items-center gap-2">
                <p className="text-xs text-text-muted">Earning principal</p>
                {dist.special ? <Badge tone="warning">Special grant</Badge> : null}
              </div>
              <p className="mt-1 tabular font-medium">
                {formatTokenAmount(eligible)} / {formatTokenAmount(genesis)}{" "}
                {tokenLabel()}
              </p>
              <p className="mt-3 text-xs text-text-muted">Pending yield</p>
              <p className="mt-1 tabular font-medium">
                {formatPending(pending)} {tokenLabel()}
              </p>
              <p className="mt-2 text-xs text-text-secondary">
                10% APY on remaining original grant only. Withdrawals cut it;
                deposits do not restore it.
              </p>
            </div>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-2">
            {isOwner && dist.claimed === false ? (
              <Button onClick={onClaim} disabled={!tbaQuery.address}>
                Claim {formatTokenAmount(genesis)} {tokenLabel()}
              </Button>
            ) : null}
            {isOwner && dist.claimed ? (
              <Button onClick={onHarvest} disabled={!tbaQuery.address}>
                Harvest
              </Button>
            ) : null}
            {isOwner ? (
              <Button
                variant="secondary"
                onClick={() => setDepositOpen(true)}
                disabled={!tbaQuery.address}
              >
                Transfer to NFT
              </Button>
            ) : null}
            {isOwner && dist.claimed ? (
              <Link href={`/arcade/?tokenId=${encodeURIComponent(tokenId)}`}>
                <Button variant="secondary">Play arcade</Button>
              </Link>
            ) : null}
            <Link href="/mint/">
              <Button variant="secondary">Mint another</Button>
            </Link>
          </div>
          {isOwner && dist.claimed === false ? (
            <p className="mt-3 text-sm text-text-secondary">
              This NFT can claim {formatTokenAmount(genesis)} {tokenLabel()} once
              {dist.special ? " — a marked seat" : ""}. Yield then accrues only
              while that original grant stays in the NFT Account.
            </p>
          ) : null}
          {account ? (
            <p className="mt-4 text-sm text-text-secondary">
              Contained value {formatUsd(account.estimatedTotalValue)}
            </p>
          ) : null}
        </div>
      </div>

      {account ? (
        <NftAccountPanel
          account={account}
          isOwner={isOwner}
          live
          acccPrincipal={dist.claimed ? eligible : 0}
          onTransfer={() => {
            void tbaToken.refetch();
            void tbaEth.refetch();
            void dist.refetch();
          }}
        />
      ) : (
        <p className="text-sm text-text-muted">Loading NFT Account…</p>
      )}

      {account && isOwner ? (
        <TransferModal
          open={depositOpen}
          mode="deposit"
          tba={account.address}
          onClose={() => setDepositOpen(false)}
          onSuccess={() => {
            void tbaToken.refetch();
            void tbaEth.refetch();
            void dist.refetch();
          }}
        />
      ) : null}

      <TransactionModal
        tx={distTx}
        completeTitle={completeTitle}
        completeBody={completeBody}
        completeLabel="Done"
        onComplete={() => undefined}
      />
    </div>
  );
}

export function AccountView() {
  return (
    <Suspense fallback={<p className="text-sm text-text-muted">Loading account…</p>}>
      <AccountInner />
    </Suspense>
  );
}
