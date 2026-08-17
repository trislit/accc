# ACCC — ERC-6551 NFT accounts

- [x] Foundry contracts: AcccNft, AcccToken, ERC6551Account
- [x] Forge tests: mint→TBA, deposit, owner withdraw, non-owner revert
- [x] Deploy script for Robinhood testnet + env wiring
- [x] Point wagmi/explorers at testnet via NEXT_PUBLIC_CHAIN_ID
- [x] Live TBA address, balances, mint/claim/harvest/deposit/withdraw writes
- [x] `/account/?tokenId=` page with Deposit/Withdraw + portfolio list
- [x] Per-NFT genesis (1,000 $ACCC once) + 10% APY on remaining original principal

## Review

`forge test` — 14 passed. `npm run typecheck` after app wiring.

Live on Robinhood testnet (`46630`) from `0x3872ff66dF4b9570F4e58FB1234a717dFe1334a9`:

- TBA implementation: `0x8A0455E86536F57323866ed13c26febAb8ae3049`
- AcccNft: `0xdcbC12c8ebe5cD0E24B414F51283F7afE0d35cA5`
- AcccToken: `0xc153e32f7f0dBe3131FECcC598a1EA57C64c5A99`
- AcccDistributor: `0x56deD1a8d70893113Cff4289e204B142d4ce5eDA`
- Registry (canonical): `0x000000006551c19487814612e58FE06813775758`

Old faucet token `0x3EE8…` is abandoned testnet inventory.

## How to verify

1. `cd contracts && forge test`
2. `npm run typecheck`
3. `npm run dev` — wallet on Robinhood testnet (46630), ETH from https://faucet.testnet.chain.robinhood.com/
4. Open `/account/?tokenId=` for an NFT you own
5. Claim 1,000 $ACCC once into the NFT Account
6. Harvest later; withdraw 500 and confirm earning principal is 500 / 1,000; withdraw all and confirm it stays 0 even after transferring $ACCC back in
