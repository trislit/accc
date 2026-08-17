# ACCC — ERC-6551 NFT accounts

- [x] Foundry contracts: AcccNft, AcccToken, ERC6551Account
- [x] Forge tests: mint→TBA, deposit, owner withdraw, non-owner revert
- [x] Deploy script for Robinhood testnet + env wiring
- [x] Point wagmi/explorers at testnet via NEXT_PUBLIC_CHAIN_ID
- [x] Live TBA address, balances, mint/faucet/deposit/withdraw writes
- [x] `/account/?tokenId=` page with Deposit/Withdraw + portfolio list

## Review

Contracts compile and `forge test` passes (5 tests). App typecheck and lint pass.

Live on Robinhood testnet (`46630`) from `0x3872ff66dF4b9570F4e58FB1234a717dFe1334a9`:

- TBA implementation: `0x8A0455E86536F57323866ed13c26febAb8ae3049`
- AcccNft: `0xdcbC12c8ebe5cD0E24B414F51283F7afE0d35cA5`
- AcccToken: `0x3EE8c0c19f6622e6a62f9F04a79cB92444719f71`
- Registry (canonical): `0x000000006551c19487814612e58FE06813775758`

Addresses are in `.env.local`. Restart `npm run dev` if it was already running.

## How to verify

1. `cd contracts && forge test`
2. Deploy and paste addresses into `.env.local`
3. `npm run dev` — wallet on Robinhood testnet (46630), ETH from https://faucet.testnet.chain.robinhood.com/
4. Mint genesis → `/account/?tokenId=`
5. Owner: Get test $ACCC mints into the NFT Account (not the wallet). Transfer to NFT / Withdraw from the NFT page.
