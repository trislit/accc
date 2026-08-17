import { nftPath } from "./data/catalog";
import { accountPath } from "./tba";
import type { CollectionNFT } from "./types";

export { accountPath, nftPath };

export function collectionPath() {
  return "/collection/";
}

export function marketPath() {
  return "/market/";
}

export function mintPath(dropId?: string) {
  return dropId ? `/mint/?id=${encodeURIComponent(dropId)}` : "/mint/";
}

export function planPath() {
  return "/plan/";
}

export function itemPath(nft: Pick<CollectionNFT, "chainId" | "contract" | "tokenId">) {
  return nftPath(nft);
}
