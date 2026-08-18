"use client";

import { useQuery } from "@tanstack/react-query";
import { formatEther, formatUnits } from "viem";
import { useAccount } from "wagmi";
import {
  ROBINHOOD_TESTNET_ID,
  acccPublicClient,
} from "../chain";
import { acccDistributorAbi, acccNftAbi, acccTokenAbi } from "../contracts";
import {
  LIVE_DISTRIBUTOR,
  LIVE_NFT,
  LIVE_TOKEN,
  liveContracts,
} from "../project";
import { fetchAcccNft, fetchAcccMintStats } from "./scanCollection";
import type { Address, CollectionNFT } from "../types";

export function useConnectedWallet() {
  const account = useAccount();
  return {
    address: account.address,
    isConnected: account.isConnected,
    chainId: account.chainId,
    isRobinhood: account.chainId === ROBINHOOD_TESTNET_ID,
    status: account.status,
  };
}

export function useNativeEthBalance(address?: Address) {
  const query = useQuery({
    queryKey: ["accc-eth", ROBINHOOD_TESTNET_ID, address],
    enabled: Boolean(address),
    refetchOnMount: "always",
    queryFn: async () => {
      if (!address) throw new Error("No address");
      return acccPublicClient.getBalance({ address });
    },
  });

  return {
    wei: query.data,
    formatted: query.data !== undefined ? Number(formatEther(query.data)) : undefined,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : undefined,
    refetch: query.refetch,
  };
}

export function useAcccBalance(holder?: Address) {
  const query = useQuery({
    queryKey: ["accc-token", ROBINHOOD_TESTNET_ID, LIVE_TOKEN, holder],
    enabled: Boolean(liveContracts && holder),
    refetchOnMount: "always",
    queryFn: async () => {
      if (!holder) throw new Error("No holder");
      return acccPublicClient.readContract({
        address: LIVE_TOKEN,
        abi: acccTokenAbi,
        functionName: "balanceOf",
        args: [holder],
      });
    },
  });

  return {
    configured: liveContracts,
    wei: query.data,
    formatted:
      query.data !== undefined ? Number(formatUnits(query.data, 18)) : undefined,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : undefined,
    refetch: query.refetch,
  };
}

export function useDistributorStatus(tokenId?: string) {
  const query = useQuery({
    queryKey: ["accc-distributor", ROBINHOOD_TESTNET_ID, LIVE_DISTRIBUTOR, tokenId],
    enabled: Boolean(
      liveContracts &&
        LIVE_DISTRIBUTOR &&
        LIVE_DISTRIBUTOR !== "0x0000000000000000000000000000000000000000" &&
        tokenId,
    ),
    refetchOnMount: "always",
    refetchInterval: 15_000,
    queryFn: async () => {
      if (!tokenId) throw new Error("No token");
      const id = BigInt(tokenId);
      const [claimed, eligible, pending, genesis] = await Promise.all([
        acccPublicClient.readContract({
          address: LIVE_DISTRIBUTOR,
          abi: acccDistributorAbi,
          functionName: "genesisClaimed",
          args: [id],
        }),
        acccPublicClient.readContract({
          address: LIVE_DISTRIBUTOR,
          abi: acccDistributorAbi,
          functionName: "eligiblePrincipal",
          args: [id],
        }),
        acccPublicClient.readContract({
          address: LIVE_DISTRIBUTOR,
          abi: acccDistributorAbi,
          functionName: "pendingYield",
          args: [id],
        }),
        acccPublicClient.readContract({
          address: LIVE_DISTRIBUTOR,
          abi: acccDistributorAbi,
          functionName: "GENESIS_AMOUNT",
        }),
      ]);
      return {
        claimed,
        eligible,
        pending,
        genesis,
        eligibleFormatted: Number(formatUnits(eligible, 18)),
        pendingFormatted: Number(formatUnits(pending, 18)),
        genesisFormatted: Number(formatUnits(genesis, 18)),
      };
    },
  });

  return {
    claimed: query.data?.claimed,
    eligible: query.data?.eligible,
    pending: query.data?.pending,
    genesis: query.data?.genesis,
    eligibleFormatted: query.data?.eligibleFormatted,
    pendingFormatted: query.data?.pendingFormatted,
    genesisFormatted: query.data?.genesisFormatted,
    isLoading: query.isLoading || query.isFetching,
    error: query.error instanceof Error ? query.error.message : undefined,
    refetch: query.refetch,
  };
}

export function useNftOwner(tokenId?: string) {
  const query = useQuery({
    queryKey: ["accc-owner", ROBINHOOD_TESTNET_ID, LIVE_NFT, tokenId],
    enabled: Boolean(liveContracts && tokenId),
    refetchOnMount: "always",
    queryFn: async () => {
      if (!tokenId) throw new Error("No token");
      return acccPublicClient.readContract({
        address: LIVE_NFT,
        abi: acccNftAbi,
        functionName: "ownerOf",
        args: [BigInt(tokenId)],
      });
    },
  });

  return {
    owner: query.data as Address | undefined,
    isLoading: query.isLoading || query.isFetching,
    error: query.error instanceof Error ? query.error.message : undefined,
    refetch: query.refetch,
  };
}

export function useTbaAddress(tokenId?: string) {
  const query = useQuery({
    queryKey: ["accc-tba", ROBINHOOD_TESTNET_ID, LIVE_NFT, tokenId],
    enabled: Boolean(liveContracts && tokenId),
    refetchOnMount: "always",
    queryFn: async () => {
      if (!tokenId) throw new Error("No token");
      return acccPublicClient.readContract({
        address: LIVE_NFT,
        abi: acccNftAbi,
        functionName: "accountOf",
        args: [BigInt(tokenId)],
      });
    },
  });

  return {
    address: query.data as Address | undefined,
    isLoading: query.isLoading || query.isFetching,
    error: query.error instanceof Error ? query.error.message : undefined,
    refetch: query.refetch,
  };
}

export function useAcccMintStats(owner?: Address) {
  const query = useQuery({
    queryKey: ["accc-mint-stats", ROBINHOOD_TESTNET_ID, LIVE_NFT, owner ?? ""],
    enabled: liveContracts,
    refetchOnMount: "always",
    queryFn: () => fetchAcccMintStats(owner),
  });

  return {
    minted: query.data?.minted,
    nextId: query.data?.nextId,
    owned: query.data?.owned ?? 0,
    isLoading: query.isLoading || query.isFetching,
    error: query.error instanceof Error ? query.error.message : undefined,
    refetch: query.refetch,
  };
}

export function useOwnedAcccNfts(owner?: Address) {
  const enabled = Boolean(liveContracts && owner);

  const query = useQuery({
    queryKey: ["accc-owned", ROBINHOOD_TESTNET_ID, LIVE_NFT, owner],
    enabled,
    refetchOnMount: "always",
    queryFn: async () => {
      if (!owner) return [];
      const chainId = await acccPublicClient.getChainId();
      if (chainId !== ROBINHOOD_TESTNET_ID) {
        throw new Error(
          `Portfolio reads must use Robinhood testnet (${ROBINHOOD_TESTNET_ID}), got ${chainId}.`,
        );
      }
      const balance = await acccPublicClient.readContract({
        address: LIVE_NFT,
        abi: acccNftAbi,
        functionName: "balanceOf",
        args: [owner],
      });
      const nfts: CollectionNFT[] = [];
      for (let index = 0; index < Number(balance); index += 1) {
        const tokenId = await acccPublicClient.readContract({
          address: LIVE_NFT,
          abi: acccNftAbi,
          functionName: "tokenOfOwnerByIndex",
          args: [owner, BigInt(index)],
        });
        nfts.push(await fetchAcccNft(tokenId));
      }
      return nfts;
    },
  });

  return {
    nfts: query.data ?? [],
    isLoading: query.isLoading || query.isFetching,
    error: query.error instanceof Error ? query.error.message : undefined,
    refetch: query.refetch,
  };
}
