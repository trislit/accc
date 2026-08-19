import { redirect } from "next/navigation";
import { fetchLiveCollection } from "@/lib/data/scanCollection";
import { LIVE_NFT, project } from "@/lib/project";
import { accountPath } from "@/lib/tba";

function fallbackParams() {
  return [
    {
      chain: String(project.chainId),
      contract: LIVE_NFT,
      tokenId: "1",
    },
    {
      chain: String(project.chainId),
      contract: LIVE_NFT.toLowerCase(),
      tokenId: "1",
    },
  ];
}

export async function generateStaticParams() {
  try {
    const collection = await fetchLiveCollection();
    const params = collection.nfts.flatMap((nft) => [
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
    return params.length > 0 ? params : fallbackParams();
  } catch {
    return fallbackParams();
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
