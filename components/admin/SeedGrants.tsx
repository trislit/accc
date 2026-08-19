"use client";

import { useState } from "react";
import { parseUnits } from "viem";
import { getWalletClient } from "wagmi/actions";
import {
  TransactionModal,
  useOnchainTransaction,
} from "@/components/tx/TransactionStatus";
import { Button } from "@/components/ui/Button";
import { robinhoodTestnet } from "@/lib/chain";
import { acccDistributorAbi } from "@/lib/contracts";
import { useAcccMintStats, useGrantOf } from "@/lib/data/onchain";
import { formatTokenAmount } from "@/lib/format";
import { LIVE_DISTRIBUTOR } from "@/lib/project";
import { wagmiConfig } from "@/lib/wagmi";

export function SeedGrants() {
  const stats = useAcccMintStats();
  const nextId = (stats.nextId ?? 0) + 1;
  const nextGrant = useGrantOf(String(nextId));
  const tx = useOnchainTransaction();
  const [amount, setAmount] = useState("5000");
  const [count, setCount] = useState("3");
  const [tokenId, setTokenId] = useState("");
  const [tokenAmount, setTokenAmount] = useState("5000");

  function seed() {
    const n = Number(count);
    const value = Number(amount);
    if (!Number.isInteger(n) || n < 1 || n > 20) return;
    if (!Number.isFinite(value) || value <= 1000) return;
    tx.start(`Seed ${n} special mint${n === 1 ? "" : "s"} · ${value} $ACCC`, 0, async () => {
      const walletClient = await getWalletClient(wagmiConfig, {
        chainId: robinhoodTestnet.id,
      });
      if (!walletClient) throw new Error("Wallet is not ready.");
      return walletClient.writeContract({
        address: LIVE_DISTRIBUTOR,
        abi: acccDistributorAbi,
        functionName: "seedNextMints",
        args: [parseUnits(String(value), 18), BigInt(n)],
        chain: robinhoodTestnet,
        account: walletClient.account,
      });
    }, () => {
      void nextGrant.refetch();
      void stats.refetch();
    });
  }

  function setOne() {
    const id = Number(tokenId);
    const value = Number(tokenAmount);
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
    }, () => {
      void nextGrant.refetch();
    });
  }

  return (
    <section className="space-y-4 rounded-lg border border-border bg-surface-1 p-5">
      <div>
        <h2 className="text-base font-semibold">Special genesis grants</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Default is 1,000 $ACCC. Seed the next mints, or mark one unclaimed
          token. The extra principal stays on that NFT until someone withdraws
          it.
        </p>
        <p className="mt-2 text-xs text-text-muted">
          Next mint ACCC #{nextId}
          {nextGrant.special
            ? ` · ${formatTokenAmount(nextGrant.formatted)} special`
            : " · 1,000 default"}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <label className="text-sm">
          <span className="text-xs text-text-muted">Grant</span>
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="text-xs text-text-muted">Next mints</span>
          <input
            value={count}
            onChange={(event) => setCount(event.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2"
          />
        </label>
        <div className="flex items-end">
          <Button onClick={seed}>Seed next mints</Button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <label className="text-sm">
          <span className="text-xs text-text-muted">Token ID</span>
          <input
            value={tokenId}
            onChange={(event) => setTokenId(event.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="text-xs text-text-muted">Grant</span>
          <input
            value={tokenAmount}
            onChange={(event) => setTokenAmount(event.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2"
          />
        </label>
        <div className="flex items-end">
          <Button variant="secondary" onClick={setOne}>
            Set this seat
          </Button>
        </div>
      </div>
      <TransactionModal
        tx={tx}
        completeTitle="Grant reserved"
        completeBody="That genesis amount is locked to those token IDs until claim. It moves with the NFT."
        completeLabel="Done"
        onComplete={() => undefined}
      />
    </section>
  );
}
