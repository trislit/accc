/** Canonical product pitch. Reuse this copy; do not rewrite it per page. */
export const SEAT_PATH = "/seat/";

export const pitch = {
  kicker: "What you are buying",
  headline: "The NFT is the bag.",
  lede:
    "It holds tokens and other NFTs. It spends into perks locked to this seat. Transfer the NFT and the whole bag moves.",
  share:
    "Mint an ACCC seat. It holds its own tokens and NFTs, spends into locked perks, and takes the bag with it when it moves.",
  beats: [
    {
      title: "Hold",
      body: "The NFT owns its own account. $ACCC, ETH, and other NFTs sit in that account — not in the owner wallet.",
    },
    {
      title: "Spend",
      body: "Harvested $ACCC buys assets locked to this NFT. Wallpapers first. The seat keeps them.",
    },
    {
      title: "Move",
      body: "Send or sell the NFT. The account, the tokens, the nested NFTs, and the locked perks go with it.",
    },
  ],
  footnote:
    "The account is an ERC-6551 NFT Account. Skins and similar perks are recorded on the NFT, not the owner wallet.",
} as const;
