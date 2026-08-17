"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { getWalletClient } from "wagmi/actions";
import { Atmosphere } from "@/components/art/Atmosphere";
import { NftAccountPanel } from "@/components/account/NftAccountPanel";
import {
  TransactionModal,
  useOnchainTransaction,
} from "@/components/tx/TransactionStatus";
import { AddressDisplay } from "@/components/ui/AddressDisplay";
import { AccountBadge, VerifiedBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Tabs";
import { robinhoodTestnet } from "@/lib/chain";
import { acccTokenAbi } from "@/lib/contracts";
import {
  useAcccBalance,
  useNativeEthBalance,
  useNftOwner,
  useTbaAddress,
} from "@/lib/data/onchain";
import { ethToUsd, formatUsd } from "@/lib/format";
import { LIVE_NFT, LIVE_TOKEN, liveContracts, project, tokenLabel } from "@/lib/project";
import { ZERO_ADDRESS } from "@/lib/tba";
import { wagmiConfig } from "@/lib/wagmi";
import type { NftAccount, TokenAsset } from "@/lib/types";

function AccountInner() {
  const params = useSearchParams();
  const tokenId = params.get("tokenId") ?? "";
  const { address, isConnected } = useAccount();
  const ownerQuery = useNftOwner(tokenId || undefined);
  const tbaQuery = useTbaAddress(tokenId || undefined);
  const tbaEth = useNativeEthBalance(tbaQuery.address);
  const tbaToken = useAcccBalance(tbaQuery.address);
  const faucetTx = useOnchainTransaction();

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
    if (tbaToken.formatted) {
      assets.push({
        kind: "token",
        symbol: project.tokenSymbol,
        name: project.tokenName,
        contract: LIVE_TOKEN,
        balance: tbaToken.formatted,
        estimatedValueUsd: tbaToken.formatted * project.tokenPriceUsd,
      });
    }
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

  function onFaucet() {
    faucetTx.start(`Get test ${tokenLabel()}`, 0, async () => {
      const walletClient = await getWalletClient(wagmiConfig, {
        chainId: robinhoodTestnet.id,
      });
      if (!walletClient) throw new Error("Wallet is not ready.");
      return walletClient.writeContract({
        address: LIVE_TOKEN,
        abi: acccTokenAbi,
        functionName: "faucet",
        chain: robinhoodTestnet,
        account: walletClient.account,
      });
    });
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

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Atmosphere
          id="wanderer-775"
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
            Live ERC-6551 account on Robinhood Chain testnet.
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
          <div className="mt-6 flex flex-wrap gap-2">
            {isConnected ? (
              <Button onClick={onFaucet}>Get test {tokenLabel()}</Button>
            ) : null}
            <Link href="/mint/">
              <Button variant="secondary">Mint another</Button>
            </Link>
          </div>
          {account ? (
            <p className="mt-4 text-sm text-text-secondary">
              Contained value {formatUsd(account.estimatedTotalValue)}
            </p>
          ) : null}
        </div>
      </div>

      {account ? (
        <NftAccountPanel account={account} isOwner={isOwner} live />
      ) : (
        <p className="text-sm text-text-muted">Loading NFT Account…</p>
      )}

      <TransactionModal
        tx={faucetTx}
        completeTitle="Faucet complete"
        completeBody={`${tokenLabel()} was minted to your wallet. Deposit it into this NFT Account next.`}
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
