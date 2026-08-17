"use client";

import { useQuery } from "@tanstack/react-query";
import { erc20Abi, formatEther, formatUnits } from "viem";
import {
  useAccount,
  useBalance,
  usePublicClient,
  useReadContract,
  useReadContracts,
} from "wagmi";
import { activeChain } from "../chain";
import { acccNftAbi, acccTokenAbi } from "../contracts";
import { LIVE_NFT, LIVE_TOKEN, liveContracts, project } from "../project";
import type { Address, CollectionNFT } from "../types";

export function useConnectedWallet() {
  const account = useAccount();
  return {
    address: account.address,
    isConnected: account.isConnected,
    chainId: account.chainId,
    isRobinhood: account.chainId === activeChain.id,
    status: account.status,
  };
}

export function useNativeEthBalance(address?: Address) {
  const { data, error, isLoading, refetch } = useBalance({
    address,
    chainId: activeChain.id,
    query: { enabled: Boolean(address) },
  });

  return {
    wei: data?.value,
    formatted: data ? Number(formatEther(data.value)) : undefined,
    isLoading,
    error: error?.message,
    refetch,
  };
}

export function useAcccBalance(holder?: Address) {
  const enabled = Boolean(liveContracts && holder);
  const { data, error, isLoading, refetch } = useReadContract({
    address: LIVE_TOKEN,
    abi: acccTokenAbi,
    functionName: "balanceOf",
    args: holder ? [holder] : undefined,
    chainId: activeChain.id,
    query: { enabled },
  });

  return {
    configured: liveContracts,
    wei: data,
    formatted: data !== undefined ? Number(formatUnits(data, 18)) : undefined,
    isLoading,
    error: error?.message,
    refetch,
  };
}

export function useNftOwner(tokenId?: string) {
  const enabled = Boolean(liveContracts && tokenId);
  const { data, error, isLoading, refetch } = useReadContract({
    address: LIVE_NFT,
    abi: acccNftAbi,
    functionName: "ownerOf",
    args: tokenId ? [BigInt(tokenId)] : undefined,
    chainId: activeChain.id,
    query: { enabled },
  });

  return {
    owner: data as Address | undefined,
    isLoading,
    error: error?.message,
    refetch,
  };
}

export function useTbaAddress(tokenId?: string) {
  const enabled = Boolean(liveContracts && tokenId);
  const { data, error, isLoading, refetch } = useReadContract({
    address: LIVE_NFT,
    abi: acccNftAbi,
    functionName: "accountOf",
    args: tokenId ? [BigInt(tokenId)] : undefined,
    chainId: activeChain.id,
    query: { enabled },
  });

  return {
    address: data as Address | undefined,
    isLoading,
    error: error?.message,
    refetch,
  };
}

export function useOwnedAcccNfts(owner?: Address) {
  const publicClient = usePublicClient({ chainId: activeChain.id });
  const enabled = Boolean(liveContracts && publicClient && owner);

  const query = useQuery({
    queryKey: ["accc-owned", activeChain.id, LIVE_NFT, owner],
    enabled,
    refetchOnMount: "always",
    queryFn: async () => {
      if (!publicClient || !owner) return [];
      const balance = await publicClient.readContract({
        address: LIVE_NFT,
        abi: acccNftAbi,
        functionName: "balanceOf",
        args: [owner],
      });
      const nfts: CollectionNFT[] = [];
      for (let index = 0; index < Number(balance); index += 1) {
        const tokenId = await publicClient.readContract({
          address: LIVE_NFT,
          abi: acccNftAbi,
          functionName: "tokenOfOwnerByIndex",
          args: [owner, BigInt(index)],
        });
        const account = await publicClient.readContract({
          address: LIVE_NFT,
          abi: acccNftAbi,
          functionName: "accountOf",
          args: [tokenId],
        });
        const id = String(tokenId);
        nfts.push({
          chainId: activeChain.id,
          contract: LIVE_NFT,
          tokenId: id,
          collectionId: project.collectionId,
          collectionName: project.collectionName,
          verified: true,
          owner,
          name: `${project.nftPrefix} #${id}`,
          artId: "wanderer-775",
          listed: false,
          traits: [],
          nftAccount: {
            address: account,
            nft: { contract: LIVE_NFT, tokenId: id },
            controller: owner,
            assets: [],
            estimatedTokenValue: 0,
            estimatedNftValue: 0,
            estimatedTotalValue: 0,
          },
        });
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
        chainId: activeChain.id,
      },
      {
        address: LIVE_TOKEN,
        abi: erc20Abi,
        functionName: "symbol",
        chainId: activeChain.id,
      },
      {
        address: LIVE_TOKEN,
        abi: erc20Abi,
        functionName: "decimals",
        chainId: activeChain.id,
      },
      {
        address: LIVE_TOKEN,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: holder ? [holder] : undefined,
        chainId: activeChain.id,
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
