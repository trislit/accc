# ACCC — Cabal arcade sink

- [x] AcccArcade.sol + tests (inner circle, 10 $ACCC sink, marks, no principal ratchet)
- [x] Deployed on Robinhood testnet `0x50a79A2f412a84f82EDF49379192eD266E6a3Eae`
- [x] TBA $ACCC withdraw capped to harvested surplus
- [x] `/arcade/?tokenId=` Handshake cabinet
- [x] Marks on NFT cards; Arcade in tools catalog
- [x] Plan page Play note

## Review

The NFT is the inner-circle seat. Genesis `$ACCC` that stays in the NFT Account unlocks Handshake. Plays spend 10 `$ACCC` from the owner wallet (harvest surplus, then withdraw only surplus). Marks are cosmetic; no `$ACCC` comes back.

## How to verify

1. Own an ACCC NFT, claim genesis, wait or warp isn't possible on testnet — harvest if any yield, or use wallet `$ACCC`
2. `/account/?tokenId=` withdraw Max on `$ACCC` should not exceed surplus (full 1,000 genesis stays)
3. `/arcade/?tokenId=` — Inner circle badge, Approve, Play
4. Collection card shows Handshake / Silver / Gold after a play
5. `/tools/` Arcade is live and gated on NFT + genesis held
