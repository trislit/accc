import { project } from "../project";
import type { Drop } from "../types";

export const drops: Drop[] = [
  {
    id: "genesis",
    name: `Genesis ${project.collectionName}`,
    status: "live",
    priceEth: 0,
    supply: 0,
    minted: 0,
    maxPerWallet: 0,
    artId: "wanderer-775",
    video: project.videos.mint,
    includes: {
      nftLabel: `1 ${project.nftPrefix} NFT`,
      nftAccount: true,
      tokenClaim: 0,
      tokenSymbol: project.tokenSymbol,
    },
  },
];

export function getDrop(id: string) {
  return drops.find((drop) => drop.id === id);
}

export const liveDrop = drops[0];
