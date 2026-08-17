import { redirect } from "next/navigation";
import { LIVE_NFT } from "@/lib/project";
import { fetchLiveCollection } from "@/lib/data/scanCollection";
import { accountPath } from "@/lib/tba";

export async function generateStaticParams() {
  try {
    const collection = await fetchLiveCollection();
    return collection.nfts.flatMap((nft) => [
      {
        chain: String(nft.chainId),
        contract: nft.contract,
        tokenId: nft.tokenId,
      },
      {
        chain: String(nft.chainId),
        contract: LIVE_NFT.toLowerCase(),
        tokenId: nft.tokenId,
      },
    ]);
  } catch {
    return [];
  }
}

export default async function NftPage({
  params,
}: {
  params: Promise<{ chain: string; contract: string; tokenId: string }>;
}) {
  const { tokenId } = await params;
  redirect(accountPath(tokenId));
}
