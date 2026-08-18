"use client";

import { useQuery } from "@tanstack/react-query";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { ROBINHOOD_TESTNET_ID, acccPublicClient } from "../chain";
import { acccDistributorAbi } from "../contracts";
import { LIVE_DISTRIBUTOR, project } from "../project";
import { useAcccBalance, useOwnedAcccNfts } from "./onchain";
import { accessMet, type ToolAccess } from "./tools";

export function useClubAccess() {
  const { address, isConnected } = useAccount();
  const nfts = useOwnedAcccNfts(isConnected ? address : undefined);
  const wallet = useAcccBalance(isConnected ? address : undefined);
  const tokenIds = nfts.nfts.map((nft) => nft.tokenId);

  const genesis = useQuery({
    queryKey: [
      "accc-genesis-held",
      ROBINHOOD_TESTNET_ID,
      LIVE_DISTRIBUTOR,
      address,
      tokenIds.join(","),
    ],
    enabled: Boolean(isConnected && address && tokenIds.length),
    refetchOnMount: "always" as const,
    queryFn: async () => {
      let total = BigInt(0);
      for (const tokenId of tokenIds) {
        const principal = await acccPublicClient.readContract({
          address: LIVE_DISTRIBUTOR,
          abi: acccDistributorAbi,
          functionName: "eligiblePrincipal",
          args: [BigInt(tokenId)],
        });
        total += principal;
      }
      return total;
    },
  });

  const tbaAccc = nfts.nfts.reduce((sum, nft) => {
    const asset = nft.nftAccount?.assets.find(
      (item) => item.kind === "token" && item.symbol === project.tokenSymbol,
    );
    return sum + (asset && asset.kind === "token" ? asset.balance : 0);
  }, 0);
  const walletAccc = wallet.formatted ?? 0;
  const totalAccc = walletAccc + tbaAccc;
  const genesisHeld =
    genesis.data !== undefined ? Number(formatUnits(genesis.data, 18)) : 0;
  const nftCount = nfts.nfts.length;
  const stats = { nftCount, walletAccc, tbaAccc, totalAccc, genesisHeld };
  const isLoading =
    Boolean(isConnected) &&
    (nfts.isLoading || wallet.isLoading || (tokenIds.length > 0 && genesis.isLoading));

  function unlocked(access: ToolAccess) {
    if (!isConnected) return Object.keys(access).length === 0;
    return accessMet(access, stats);
  }

  return {
    address,
    isConnected,
    isLoading,
    error: nfts.error ?? wallet.error ?? genesis.error?.message,
    ...stats,
    unlocked,
    refetch: () => {
      void nfts.refetch();
      void wallet.refetch();
      void genesis.refetch();
    },
  };
}
