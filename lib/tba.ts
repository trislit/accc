import { parseEventLogs, type TransactionReceipt } from "viem";
import { acccNftAbi } from "./contracts";
import type { Address } from "./types";

export const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as Address;

export function accountPath(tokenId: string | bigint | number) {
  return `/account/?tokenId=${encodeURIComponent(String(tokenId))}`;
}

export function tokenIdFromMintReceipt(receipt: TransactionReceipt) {
  const minted = parseEventLogs({
    abi: acccNftAbi,
    logs: receipt.logs,
    eventName: "Minted",
  });
  const id = minted[0]?.args.tokenId;
  return id !== undefined ? String(id) : undefined;
}
