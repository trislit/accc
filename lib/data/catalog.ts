import { accountPath } from "../tba";
import type { CollectionNFT } from "../types";

export function nftPath(
  nft: Pick<CollectionNFT, "chainId" | "contract" | "tokenId">,
) {
  return accountPath(nft.tokenId);
}
