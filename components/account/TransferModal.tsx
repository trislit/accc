"use client";

import { useState } from "react";
import { encodeFunctionData, parseEther, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { getWalletClient } from "wagmi/actions";
import {
  TransactionModal,
  useOnchainTransaction,
} from "@/components/tx/TransactionStatus";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { acccTokenAbi, erc6551AccountAbi } from "@/lib/contracts";
import { acccTxFees, robinhoodTestnet } from "@/lib/chain";
import { useAcccBalance, useNativeEthBalance } from "@/lib/data/onchain";
import { formatEth, formatTokenAmount } from "@/lib/format";
import { LIVE_TOKEN, tokenLabel } from "@/lib/project";
import { wagmiConfig } from "@/lib/wagmi";
import type { Address } from "@/lib/types";

type Asset = "eth" | "accc";
type Mode = "deposit" | "withdraw";

export function TransferModal({
  open,
  mode,
  tba,
  acccPrincipal,
  onClose,
  onSuccess,
}: {
  open: boolean;
  mode: Mode;
  tba?: Address;
  acccPrincipal?: number;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { address } = useAccount();
  const [asset, setAsset] = useState<Asset>("accc");
  const [amount, setAmount] = useState("");
  const tx = useOnchainTransaction();

  const walletEth = useNativeEthBalance(address);
  const walletToken = useAcccBalance(address);
  const tbaEth = useNativeEthBalance(tba);
  const tbaToken = useAcccBalance(tba);

  const sourceEth = mode === "deposit" ? walletEth : tbaEth;
  const sourceToken = mode === "deposit" ? walletToken : tbaToken;
  const tokenAvailable = sourceToken.formatted ?? 0;
  const principal =
    mode === "withdraw" ? Math.max(0, acccPrincipal ?? 0) : 0;
  const harvest = Math.max(0, tokenAvailable - principal);
  const max =
    asset === "eth"
      ? Math.max(
          0,
          (sourceEth.formatted ?? 0) - (mode === "deposit" ? 0.0002 : 0),
        )
      : tokenAvailable;
  const numeric = Number(amount);
  const cutsGenesis =
    mode === "withdraw" &&
    asset === "accc" &&
    principal > 0 &&
    Number.isFinite(numeric) &&
    numeric > harvest + 1e-12;
  const genesisTaken = cutsGenesis ? Math.min(principal, numeric - harvest) : 0;
  const remainingPrincipal = Math.max(0, principal - genesisTaken);

  async function send() {
    if (!address || !tba) {
      throw new Error("Connect a wallet first.");
    }
    const walletClient = await getWalletClient(wagmiConfig, {
      chainId: robinhoodTestnet.id,
    });
    if (!walletClient) throw new Error("Wallet is not ready.");
    if (asset === "eth") {
      const value = parseEther(amount);
      if (mode === "deposit") {
        return walletClient.sendTransaction({
          to: tba,
          value,
          chain: robinhoodTestnet,
          account: walletClient.account,
          ...(await acccTxFees()),
        });
      }
      return walletClient.writeContract({
        address: tba,
        abi: erc6551AccountAbi,
        functionName: "execute",
        args: [address, value, "0x", 0],
        chain: robinhoodTestnet,
        account: walletClient.account,
        ...(await acccTxFees()),
      });
    }

    const value = parseUnits(amount, 18);
    if (mode === "deposit") {
      return walletClient.writeContract({
        address: LIVE_TOKEN,
        abi: acccTokenAbi,
        functionName: "transfer",
        args: [tba, value],
        chain: robinhoodTestnet,
        account: walletClient.account,
        ...(await acccTxFees()),
      });
    }
    return walletClient.writeContract({
      address: tba,
      abi: erc6551AccountAbi,
      functionName: "execute",
      args: [
        LIVE_TOKEN,
        BigInt(0),
        encodeFunctionData({
          abi: acccTokenAbi,
          functionName: "transfer",
          args: [address, value],
        }),
        0,
      ],
      chain: robinhoodTestnet,
      account: walletClient.account,
      ...(await acccTxFees()),
    });
  }

  function submit() {
    if (!Number.isFinite(numeric) || numeric <= 0) return;
    tx.start(
      `${mode === "deposit" ? "Deposit" : "Withdraw"} ${amount} ${
        asset === "eth" ? "ETH" : tokenLabel()
      }`,
      asset === "eth" ? numeric : 0,
      send,
      () => {
        void sourceEth.refetch();
        void sourceToken.refetch();
        void walletEth.refetch();
        void walletToken.refetch();
        void tbaEth.refetch();
        void tbaToken.refetch();
        onSuccess?.();
      },
    );
  }

  const acccWithdraw = mode === "withdraw" && asset === "accc";

  return (
    <>
      <Modal
        open={open && tx.phase === "idle"}
        onClose={onClose}
        title={
          mode === "deposit"
            ? "Transfer to NFT Account"
            : "Withdraw from NFT Account"
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={asset === "accc" ? "primary" : "secondary"}
              size="sm"
              onClick={() => {
                setAsset("accc");
                setAmount("");
              }}
            >
              {tokenLabel()}
            </Button>
            <Button
              variant={asset === "eth" ? "primary" : "secondary"}
              size="sm"
              onClick={() => {
                setAsset("eth");
                setAmount("");
              }}
            >
              ETH
            </Button>
          </div>
          {acccWithdraw ? (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md border border-border bg-bg px-3 py-2">
                <p className="text-text-muted">Harvest</p>
                <p className="mt-0.5 tabular font-medium">
                  {formatTokenAmount(harvest)} {tokenLabel()}
                </p>
              </div>
              <div className="rounded-md border border-border bg-bg px-3 py-2">
                <p className="text-text-muted">Genesis in seat</p>
                <p className="mt-0.5 tabular font-medium">
                  {formatTokenAmount(principal)} {tokenLabel()}
                </p>
              </div>
            </div>
          ) : null}
          <label className="block">
            <span className="text-xs text-text-muted">Amount</span>
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              placeholder="0"
              className="mt-1 h-11 w-full rounded-md border border-border bg-bg px-3 tabular text-sm outline-none focus:border-forge-green"
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted">
            <span>
              Available{" "}
              {asset === "eth"
                ? formatEth(max, 4)
                : `${formatTokenAmount(max)} ${tokenLabel()}`}
            </span>
            <div className="flex gap-2">
              {acccWithdraw && harvest > 0 ? (
                <button
                  type="button"
                  className="text-forge-green"
                  onClick={() => setAmount(String(harvest))}
                >
                  Harvest only
                </button>
              ) : null}
              <button
                type="button"
                className="text-forge-green"
                onClick={() => setAmount(max > 0 ? String(max) : "")}
              >
                Max
              </button>
            </div>
          </div>
          {acccWithdraw && !cutsGenesis ? (
            <p className="text-xs text-text-secondary">
              Harvest only keeps original genesis in the seat. 10% APY and
              inner-circle access stay the same.
            </p>
          ) : null}
          {cutsGenesis ? (
            <div className="rounded-md border border-warning/40 bg-[#2a2314] p-3 text-sm text-warning">
              <p className="font-medium">This cuts earning principal</p>
              <p className="mt-1 text-text-secondary">
                {formatTokenAmount(genesisTaken)} genesis {tokenLabel()} leaves
                the seat. Earning principal falls to{" "}
                {formatTokenAmount(remainingPrincipal)} {tokenLabel()}. 10% APY
                will not come back if you deposit later, and wallpaper shop
                needs genesis still in the account. You can still do this.
              </p>
            </div>
          ) : null}
          <Button
            className="w-full"
            disabled={!numeric || numeric <= 0 || numeric > max + 1e-12}
            onClick={submit}
          >
            {mode === "deposit"
              ? "Transfer to NFT"
              : cutsGenesis
                ? "Withdraw anyway"
                : "Withdraw"}
          </Button>
        </div>
      </Modal>
      <TransactionModal
        tx={tx}
        completeTitle={
          mode === "deposit" ? "Transfer complete" : "Withdraw complete"
        }
        completeBody={
          mode === "deposit"
            ? "Tokens are now held by this NFT Account."
            : cutsGenesis
              ? "Tokens were sent to your wallet. Earning principal on this NFT is now permanently lower."
              : "Tokens were sent to your wallet."
        }
        completeLabel="Done"
        onComplete={() => {
          setAmount("");
          onClose();
        }}
      />
    </>
  );
}
