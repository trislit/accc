# ACCC — Live mint stats

- [x] Mint page reads AcccNft `totalSupply` / `nextId` via the testnet public client
- [x] Collection scan uses ERC-721 enumerable `tokenByIndex` instead of mock `minted: 0`
- [x] Drop card uses live minted count; no fake per-wallet cap
- [x] `/held` mock holdings redirect to `/portfolio`

## Review

The mint page showed **0 minted** because it treated a wagmi `nextId` miss as zero, and the drop catalog still had `minted: 0`. AcccNft on testnet currently has `nextId = 2` and `totalSupply = 2` (token ids 1 and 2).

The contract has no supply cap and no max-per-wallet, so the UI now shows open supply and the live `totalSupply`. Marketplace buy/list on `NftView` is still a showcase (that page redirects to `/account`).

## How to verify

1. Open `/mint/` — Minted should be **2** (or current `totalSupply`), not 0
2. Home and `/collection/` list both NFTs
3. Mint another token; the count increments after the receipt
