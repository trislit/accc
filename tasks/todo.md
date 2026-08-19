# ACCC — Core seats for leadership

- [x] AcccNft: owner, pause, reserve IDs, mintTo(wallet, id), core flag; public mint skips those IDs
- [x] seedNextMints skips reserved/minted IDs
- [x] Tests for pause, reserve skip, mintTo
- [x] Admin: pause, reserve, mint core to wallet, set grant
- [x] Mint page respects pause; cards show Core
- [x] Redeployed NFT `0xB740c4bef629d15A4B3058368E6CBC807dbC0357` + distributor + arcade. Public mint starts paused.

## How to verify

1. `/mint/` shows public mint paused
2. `/admin/` Core seats: set grant on #1, mint to a leadership wallet
3. Collection card shows Core
4. Open public mint, next public ID skips #1
5. Seed next mints for public specials without colliding with reserved cores
