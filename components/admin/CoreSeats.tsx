"use client";

import { useState } from "react";
import { isAddress, parseUnits } from "viem";
import { getWalletClient } from "wagmi/actions";
import {
  TransactionModal,
  useOnchainTransaction,
} from "@/components/tx/TransactionStatus";
import { Button } from "@/components/ui/Button";
import { robinhoodTestnet } from "@/lib/chain";
import { acccDistributorAbi, acccNftAbi } from "@/lib/contracts";
import { useAcccMintStats, useGrantOf } from "@/lib/data/onchain";
import { formatTokenAmount } from "@/lib/format";
import { LIVE_DISTRIBUTOR, LIVE_NFT } from "@/lib/project";
import { wagmiConfig } from "@/lib/wagmi";

const inputClass =
  "mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-forge-green";

export function CoreSeats() {
  const stats = useAcccMintStats();
  const nextId = (stats.nextId ?? 0) + 1;
  const nextGrant = useGrantOf(String(nextId));
  const tx = useOnchainTransaction();
  const [tokenId, setTokenId] = useState("1");
  const [wallet, setWallet] = useState("");
  const [grant, setGrant] = useState("5000");

  function refetch() {
    void stats.refetch();
    void nextGrant.refetch();
  }

  function sendNft(
    action: string,
    write: (walletClient: Awaited<ReturnType<typeof getWalletClient>>) => Promise<`0x${string}`>,
  ) {
    tx.start(action, 0, async () => {
      const walletClient = await getWalletClient(wagmiConfig, {
        chainId: robinhoodTestnet.id,
      });
      if (!walletClient) throw new Error("Wallet is not ready.");
      return write(walletClient);
    }, refetch);
  }

  function pause(paused: boolean) {
    sendNft(paused ? "Pause public mint" : "Open public mint", (walletClient) =>
      walletClient.writeContract({
        address: LIVE_NFT,
        abi: acccNftAbi,
        functionName: "setPaused",
        args: [paused],
        chain: robinhoodTestnet,
        account: walletClient.account,
      }),
    );
  }

  function reserve(on: boolean) {
    const id = Number(tokenId);
    if (!Number.isInteger(id) || id < 1) return;
    sendNft(on ? `Reserve #${id}` : `Release #${id}`, (walletClient) =>
      walletClient.writeContract({
        address: LIVE_NFT,
        abi: acccNftAbi,
        functionName: "reserve",
        args: [BigInt(id), on],
        chain: robinhoodTestnet,
        account: walletClient.account,
      }),
    );
  }

  function saveGrant() {
    const id = Number(tokenId);
    const value = Number(grant);
    if (!Number.isInteger(id) || id < 1) return;
    if (!Number.isFinite(value) || value < 1000) return;
    tx.start(`Set #${id} grant · ${value} $ACCC`, 0, async () => {
      const walletClient = await getWalletClient(wagmiConfig, {
        chainId: robinhoodTestnet.id,
      });
      if (!walletClient) throw new Error("Wallet is not ready.");
      return walletClient.writeContract({
        address: LIVE_DISTRIBUTOR,
        abi: acccDistributorAbi,
        functionName: "setGrant",
        args: [BigInt(id), parseUnits(String(value), 18)],
        chain: robinhoodTestnet,
        account: walletClient.account,
      });
    }, refetch);
  }

  function mintCore() {
    const id = Number(tokenId);
    if (!Number.isInteger(id) || id < 1) return;
    if (!isAddress(wallet)) return;
    sendNft(`Mint core #${id}`, (walletClient) =>
      walletClient.writeContract({
        address: LIVE_NFT,
        abi: acccNftAbi,
        functionName: "mintTo",
        args: [wallet, BigInt(id)],
        chain: robinhoodTestnet,
        account: walletClient.account,
      }),
    );
  }

  return (
    <section className="space-y-4 rounded-lg border border-border bg-surface-1 p-5">
      <div>
        <h2 className="text-base font-semibold">Core seats</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Pause public mint, reserve IDs, set the grant, then mint that ID to a
          leadership wallet. Public mint skips reserved and already-minted IDs.
        </p>
        <p className="mt-2 text-xs text-text-muted">
          Public queue next #{nextId}
          {nextGrant.special
            ? ` · ${formatTokenAmount(nextGrant.formatted)} special`
            : " · 1,000 default"}
          {stats.paused ? " · paused" : " · open"}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {stats.paused ? (
          <Button onClick={() => pause(false)}>Open public mint</Button>
        ) : (
          <Button variant="secondary" onClick={() => pause(true)}>
            Pause public mint
          </Button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm">
          <span className="text-xs text-text-muted">Token ID</span>
          <input
            value={tokenId}
            onChange={(event) => setTokenId(event.target.value)}
            inputMode="numeric"
            className={inputClass}
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="text-xs text-text-muted">Wallet</span>
          <input
            value={wallet}
            onChange={(event) => setWallet(event.target.value)}
            placeholder="0x…"
            className={inputClass}
          />
        </label>
        <label className="text-sm">
          <span className="text-xs text-text-muted">Grant</span>
          <input
            value={grant}
            onChange={(event) => setGrant(event.target.value)}
            inputMode="numeric"
            className={inputClass}
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => reserve(true)}>
          Reserve ID
        </Button>
        <Button variant="secondary" onClick={() => reserve(false)}>
          Release ID
        </Button>
        <Button variant="secondary" onClick={saveGrant}>
          Set grant
        </Button>
        <Button onClick={mintCore} disabled={!isAddress(wallet)}>
          Mint to wallet
        </Button>
      </div>
      <TransactionModal
        tx={tx}
        completeTitle="Core seat updated"
        completeBody="That ID is held for the assigned wallet. The grant stays on the NFT."
        completeLabel="Done"
        onComplete={() => undefined}
      />
    </section>
  );
}
