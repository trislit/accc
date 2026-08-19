"use client";

import { useQuery } from "@tanstack/react-query";
import { ROBINHOOD_TESTNET_ID } from "../chain";
import { LIVE_ARCADE, LIVE_DISTRIBUTOR, LIVE_NFT, LIVE_TOKEN } from "../project";
import { fetchLiveCollection } from "./scanCollection";

export { fetchAcccNft, fetchAcccMintStats, fetchLiveCollection } from "./scanCollection";
export type { LiveCollection } from "./scanCollection";

export function useLiveCollection() {
  return useQuery({
    queryKey: [
      "accc-collection",
      ROBINHOOD_TESTNET_ID,
      LIVE_NFT,
      LIVE_TOKEN,
      LIVE_DISTRIBUTOR,
      LIVE_ARCADE,
    ],
    queryFn: fetchLiveCollection,
    refetchOnMount: "always",
  });
}
