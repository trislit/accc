"use client";

import { erc20Abi, formatEther, formatUnits } from "viem";
import { useAccount, useBalance, useReadContract, useReadContracts } from "wagmi";
import { activeChain } from "../chain";
import { acccNftAbi, acccTokenAbi } from "../contracts";
import { liveContracts, project } from "../project";
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
  const enabled = Boolean(liveContracts && project.tokenContract && holder);
  const { data, error, isLoading, refetch } = useReadContract({
    address: project.tokenContract,
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
    address: project.nftContract,
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
    address: project.nftContract,
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
  const enabled = Boolean(liveContracts && owner);
  const balance = useReadContract({
    address: project.nftContract,
    abi: acccNftAbi,
    functionName: "balanceOf",
    args: owner ? [owner] : undefined,
    chainId: activeChain.id,
    query: { enabled },
  });

  const count = balance.data !== undefined ? Number(balance.data) : 0;
  const tokens = useReadContracts({
    allowFailure: true,
    query: { enabled: enabled && count > 0 },
    contracts: Array.from({ length: count }, (_, index) => ({
      address: project.nftContract,
      abi: acccNftAbi,
      functionName: "tokenOfOwnerByIndex" as const,
      args: owner ? ([owner, BigInt(index)] as const) : undefined,
      chainId: activeChain.id,
    })),
  });

  const nfts: CollectionNFT[] = (tokens.data ?? [])
    .filter((row) => row.status === "success")
    .map((row) => {
      const tokenId = String(row.result as bigint);
      return {
        chainId: project.chainId,
        contract: project.nftContract,
        tokenId,
        collectionId: project.collectionId,
        collectionName: project.collectionName,
        verified: true,
        owner: owner ?? project.nftContract,
        name: `${project.nftPrefix} #${tokenId}`,
        artId: "wanderer-775",
        listed: false,
        traits: [],
        nftAccount: {
          address: project.nftContract,
          nft: { contract: project.nftContract, tokenId },
          controller: owner ?? project.nftContract,
          assets: [],
          estimatedTokenValue: 0,
          estimatedNftValue: 0,
          estimatedTotalValue: 0,
        },
      };
    });

  return {
    nfts,
    isLoading: balance.isLoading || tokens.isLoading,
    error: balance.error?.message ?? tokens.error?.message,
    refetch: () => {
      void balance.refetch();
      void tokens.refetch();
    },
  };
}

export function useDemoTokenBalance(holder?: Address) {
  const enabled = Boolean(liveContracts && holder);
  const { data, error, isLoading } = useReadContracts({
    allowFailure: true,
    query: { enabled },
    contracts: [
      {
        address: project.tokenContract,
        abi: erc20Abi,
        functionName: "name",
        chainId: activeChain.id,
      },
      {
        address: project.tokenContract,
        abi: erc20Abi,
        functionName: "symbol",
        chainId: activeChain.id,
      },
      {
        address: project.tokenContract,
        abi: erc20Abi,
        functionName: "decimals",
        chainId: activeChain.id,
      },
      {
        address: project.tokenContract,
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
    contract: project.tokenContract,
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
