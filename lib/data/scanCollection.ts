import { formatEther, formatUnits, parseAbiItem, zeroAddress } from "viem";
import { arcadePath, artIdForSkin, skinById } from "../arcade";
import { ROBINHOOD_TESTNET_ID, acccPublicClient } from "../chain";
import { acccArcadeAbi, acccNftAbi, acccTokenAbi } from "../contracts";
import { LIVE_ARCADE, LIVE_NFT, LIVE_TOKEN, project, tokenLabel } from "../project";
import { accountPath } from "../tba";
import type { ActivityItem, Address, CollectionNFT, TokenAsset } from "../types";

const nftTransferEvent = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
);
const erc20TransferEvent = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)",
);
const skinBoughtEvent = parseAbiItem(
  "event SkinBought(uint256 indexed tokenId, address indexed buyer, uint8 skinId)",
);

function acccAsset(balance: number): TokenAsset {
  return {
    kind: "token",
    symbol: project.tokenSymbol,
    name: project.tokenName,
    contract: LIVE_TOKEN,
    balance,
    estimatedValueUsd: 0,
  };
}

function ethAsset(balance: number): TokenAsset {
  return {
    kind: "token",
    symbol: "ETH",
    name: "Ether",
    contract: zeroAddress,
    balance,
    estimatedValueUsd: 0,
  };
}

export async function fetchAcccNft(tokenId: bigint): Promise<CollectionNFT> {
  const [owner, tba, arcade] = await Promise.all([
    acccPublicClient.readContract({
      address: LIVE_NFT,
      abi: acccNftAbi,
      functionName: "ownerOf",
      args: [tokenId],
    }),
    acccPublicClient.readContract({
      address: LIVE_NFT,
      abi: acccNftAbi,
      functionName: "accountOf",
      args: [tokenId],
    }),
    LIVE_ARCADE
      ? acccPublicClient
          .readContract({
            address: LIVE_ARCADE,
            abi: acccArcadeAbi,
            functionName: "wallpaperOf",
            args: [tokenId],
          })
          .catch(() => 0)
      : Promise.resolve(0),
  ]);
  const [acccWei, ethWei] = await Promise.all([
    acccPublicClient.readContract({
      address: LIVE_TOKEN,
      abi: acccTokenAbi,
      functionName: "balanceOf",
      args: [tba],
    }),
    acccPublicClient.getBalance({ address: tba }),
  ]);
  const id = String(tokenId);
  const accc = Number(formatUnits(acccWei, 18));
  const eth = Number(formatEther(ethWei));
  const assets: TokenAsset[] = [acccAsset(accc)];
  if (eth > 0) assets.unshift(ethAsset(eth));
  const wallpaper = Number(arcade);

  return {
    chainId: ROBINHOOD_TESTNET_ID,
    contract: LIVE_NFT,
    tokenId: id,
    collectionId: project.collectionId,
    collectionName: project.collectionName,
    verified: true,
    owner,
    name: `${project.nftPrefix} #${id}`,
    description: `${project.nftPrefix} #${id} from ${project.collectionName}.`,
    artId: artIdForSkin(wallpaper),
    listed: false,
    traits: [],
    arcadeWallpaper: wallpaper || undefined,
    nftAccount: {
      address: tba,
      nft: { contract: LIVE_NFT, tokenId: id },
      controller: owner,
      assets,
      estimatedTokenValue: 0,
      estimatedNftValue: 0,
      estimatedTotalValue: 0,
    },
  };
}

export async function fetchAcccMintStats(owner?: Address) {
  const [nextId, totalSupply, owned] = await Promise.all([
    acccPublicClient.readContract({
      address: LIVE_NFT,
      abi: acccNftAbi,
      functionName: "nextId",
    }),
    acccPublicClient.readContract({
      address: LIVE_NFT,
      abi: acccNftAbi,
      functionName: "totalSupply",
    }),
    owner
      ? acccPublicClient.readContract({
          address: LIVE_NFT,
          abi: acccNftAbi,
          functionName: "balanceOf",
          args: [owner],
        })
      : Promise.resolve(undefined),
  ]);
  return {
    nextId: Number(nextId),
    minted: Number(totalSupply),
    owned: owned === undefined ? 0 : Number(owned),
  };
}

async function scanMintedTokenIds(): Promise<bigint[]> {
  const stats = await fetchAcccMintStats();
  if (stats.minted <= 0) return [];
  const ids = await Promise.all(
    Array.from({ length: stats.minted }, (_, index) =>
      acccPublicClient.readContract({
        address: LIVE_NFT,
        abi: acccNftAbi,
        functionName: "tokenByIndex",
        args: [BigInt(index)],
      }),
    ),
  );
  return [...ids].sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));
}

async function fetchActivity(tbas: Set<string>): Promise<ActivityItem[]> {
  const [nftLogs, tokenLogs, arcadeLogs] = await Promise.all([
    acccPublicClient.getLogs({
      address: LIVE_NFT,
      event: nftTransferEvent,
      fromBlock: BigInt(0),
      toBlock: "latest",
    }),
    acccPublicClient.getLogs({
      address: LIVE_TOKEN,
      event: erc20TransferEvent,
      fromBlock: BigInt(0),
      toBlock: "latest",
    }),
    LIVE_ARCADE
      ? acccPublicClient.getLogs({
          address: LIVE_ARCADE,
          event: skinBoughtEvent,
          fromBlock: BigInt(0),
          toBlock: "latest",
        })
      : Promise.resolve([]),
  ]);

  const items: ActivityItem[] = [];

  for (const log of nftLogs) {
    const tokenId = String(log.args.tokenId);
    const from = log.args.from;
    const to = log.args.to;
    if (!from || !to || log.args.tokenId === undefined) continue;
    const minted = from.toLowerCase() === zeroAddress.toLowerCase();
    items.push({
      id: `${log.transactionHash}-${tokenId}`,
      type: minted ? "Mint" : "Transfer",
      title: minted
        ? `${project.nftPrefix} #${tokenId} minted`
        : `${project.nftPrefix} #${tokenId} transferred`,
      from: minted ? undefined : from,
      to,
      at: `Block ${log.blockNumber}`,
      href: accountPath(tokenId),
    });
  }

  for (const log of tokenLogs) {
    const from = log.args.from;
    const to = log.args.to;
    const value = log.args.value;
    if (!from || !to || value === undefined) continue;
    const amount = Number(formatUnits(value, 18));
    if (amount <= 0) continue;
    const toTba = tbas.has(to.toLowerCase());
    const fromTba = tbas.has(from.toLowerCase());
    if (!toTba && !fromTba) continue;
    const label = `${amount.toLocaleString("en-US")} ${tokenLabel()}`;
    items.push({
      id: `${log.transactionHash}-${fromTba ? "out" : "in"}`,
      type: toTba ? "Token deposit" : "Token withdrawal",
      title: toTba
        ? `${label} into an NFT Account`
        : `${label} from an NFT Account`,
      from,
      to,
      amount: label,
      at: `Block ${log.blockNumber}`,
    });
  }

  for (const log of arcadeLogs) {
    const tokenId = String(log.args.tokenId);
    const skin = skinById(Number(log.args.skinId));
    if (!log.args.tokenId || !log.args.buyer) continue;
    items.push({
      id: `${log.transactionHash}-arcade`,
      type: "Arcade",
      title: `${project.nftPrefix} #${tokenId} bought ${skin.name}`,
      from: log.args.buyer,
      at: `Block ${log.blockNumber}`,
      href: arcadePath(tokenId),
    });
  }

  return items.reverse();
}

export type LiveCollection = {
  nfts: CollectionNFT[];
  minted: number;
  holders: number;
  tokenSupply: number;
  activity: ActivityItem[];
};

export async function fetchLiveCollection(): Promise<LiveCollection> {
  const [tokenIds, tokenSupplyWei] = await Promise.all([
    scanMintedTokenIds(),
    acccPublicClient.readContract({
      address: LIVE_TOKEN,
      abi: acccTokenAbi,
      functionName: "totalSupply",
    }),
  ]);
  const nfts: CollectionNFT[] = [];
  for (const tokenId of tokenIds) {
    try {
      nfts.push(await fetchAcccNft(tokenId));
    } catch {
      /* burned or unreadable token */
    }
  }
  const tbas = new Set(
    nfts
      .map((nft) => nft.nftAccount?.address.toLowerCase())
      .filter((value): value is string => Boolean(value)),
  );
  const holders = new Set(nfts.map((nft) => nft.owner.toLowerCase())).size;
  let activity: ActivityItem[] = [];
  try {
    activity = await fetchActivity(tbas);
  } catch {
    activity = nfts.map((nft) => ({
      id: `mint-${nft.tokenId}`,
      type: "Mint" as const,
      title: `${nft.name} minted`,
      to: nft.owner,
      at: "Onchain",
      href: accountPath(nft.tokenId),
    }));
  }
  return {
    nfts,
    minted: tokenIds.length,
    holders,
    tokenSupply: Number(formatUnits(tokenSupplyWei, 18)),
    activity,
  };
}
