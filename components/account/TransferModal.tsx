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
import { robinhoodTestnet } from "@/lib/chain";
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
  onClose,
  onSuccess,
}: {
  open: boolean;
  mode: Mode;
  tba?: Address;
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
  const max =
    asset === "eth"
      ? Math.max(
          0,
          (sourceEth.formatted ?? 0) - (mode === "deposit" ? 0.0002 : 0),
        )
      : (sourceToken.formatted ?? 0);
  const numeric = Number(amount);

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
        });
      }
      return walletClient.writeContract({
        address: tba,
        abi: erc6551AccountAbi,
        functionName: "execute",
        args: [address, value, "0x", 0],
        chain: robinhoodTestnet,
        account: walletClient.account,
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

  return (
    <>
      <Modal
        open={open && tx.phase === "idle"}
        onClose={onClose}
        title={mode === "deposit" ? "Deposit to NFT Account" : "Withdraw from NFT Account"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={asset === "accc" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setAsset("accc")}
            >
              {tokenLabel()}
            </Button>
            <Button
              variant={asset === "eth" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setAsset("eth")}
            >
              ETH
            </Button>
          </div>
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
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>
              Available{" "}
              {asset === "eth"
                ? formatEth(max, 4)
                : `${formatTokenAmount(max)} ${tokenLabel()}`}
            </span>
            <button
              type="button"
              className="text-forge-green"
              onClick={() => setAmount(max > 0 ? String(max) : "")}
            >
              Max
            </button>
          </div>
          <Button
            className="w-full"
            disabled={!numeric || numeric <= 0 || numeric > max + 1e-12}
            onClick={submit}
          >
            {mode === "deposit" ? "Deposit" : "Withdraw"}
          </Button>
        </div>
      </Modal>
      <TransactionModal
        tx={tx}
        completeTitle={mode === "deposit" ? "Deposit complete" : "Withdraw complete"}
        completeBody={
          mode === "deposit"
            ? "Tokens are now held by this NFT Account."
            : "Tokens were sent to the NFT owner wallet."
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
