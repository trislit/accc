# ACCC — Arcade wallpapers

- [x] AcccArcade.sol + tests (inner circle, 10 $ACCC skins, no principal ratchet)
- [x] Redeployed on Robinhood testnet `0xE3D58B7BA09d1F4f5007C394EEe2694f54f91BcE`
- [x] Wired `LIVE_ARCADE` / `NEXT_PUBLIC_ARCADE`
- [x] `/arcade/?tokenId=` snake + memory (free) and wallpaper shop
- [x] Collection + account art follows equipped wallpaper
- [x] Plan page Play note: games free, spend harvest on skins

## Review

Games are free client-side (snake, memory). The sink is wallpaper: 10 `$ACCC` from the owner wallet, inner-circle only (`eligiblePrincipal > 0`). Skin 0 is free. Equipped wallpaper skins the board and the NFT art.

## How to verify

1. Own an ACCC NFT, claim genesis, keep it in the NFT Account
2. `/arcade/?tokenId=` — play snake / memory without a tx
3. Harvest surplus (or use wallet `$ACCC`), Approve, buy a wallpaper
4. Collection + account atmosphere match the equipped skin
5. `/tools/` Arcade is live and gated on NFT + genesis held
