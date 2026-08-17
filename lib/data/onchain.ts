"use client";

import { useQuery } from "@tanstack/react-query";
import { erc20Abi, formatEther, formatUnits } from "viem";
import { useAccount, useReadContracts } from "wagmi";
import {
  ROBINHOOD_TESTNET_ID,
  acccPublicClient,
} from "../chain";
import { acccNftAbi, acccTokenAbi } from "../contracts";
import { LIVE_NFT, LIVE_TOKEN, liveContracts } from "../project";
import { fetchAcccNft } from "./scanCollection";
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

export function useDemoTokenBalance(holder?: Address) {
  const enabled = Boolean(liveContracts && holder);
  const { data, error, isLoading } = useReadContracts({
    allowFailure: true,
    query: { enabled },
    contracts: [
      {
        address: LIVE_TOKEN,
        abi: erc20Abi,
        functionName: "name",
        chainId: ROBINHOOD_TESTNET_ID,
      },
      {
        address: LIVE_TOKEN,
        abi: erc20Abi,
        functionName: "symbol",
        chainId: ROBINHOOD_TESTNET_ID,
      },
      {
        address: LIVE_TOKEN,
        abi: erc20Abi,
        functionName: "decimals",
        chainId: ROBINHOOD_TESTNET_ID,
      },
      {
        address: LIVE_TOKEN,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: holder ? [holder] : undefined,
        chainId: ROBINHOOD_TESTNET_ID,
      },
    ],
  });

  const name = data?.[0]?.status === "success" ? String(data[0].result) : undefined;
  const symbol =
    data?.[1]?.status === "success" ? String(data[1].result) : undefined;
  const decimals =
    data?.[2]?.status === "success" ? Number(data[2].result) : undefined;
  const raw =
    data?.[3]?.status === "success" ? (data[3].result as bigint) : undefined;

  return {
    configured: liveContracts,
    contract: LIVE_TOKEN,
    name,
    symbol,
    decimals,
    formatted:
      raw !== undefined && decimals !== undefined
        ? Number(formatUnits(raw, decimals))
        : undefined,
    isLoading,
    error: error?.message,
  };
}
