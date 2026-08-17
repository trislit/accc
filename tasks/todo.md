# ACCC — ERC-6551 NFT accounts

- [x] Foundry contracts: AcccNft, AcccToken, ERC6551Account
- [x] Forge tests: mint→TBA, deposit, owner withdraw, non-owner revert
- [x] Deploy script for Robinhood testnet + env wiring
- [x] Point wagmi/explorers at testnet via NEXT_PUBLIC_CHAIN_ID
- [x] Live TBA address, balances, mint/faucet/deposit/withdraw writes
- [x] `/account/?tokenId=` page with Deposit/Withdraw + portfolio list

## Review

Contracts compile and `forge test` passes (5 tests). App typecheck and lint pass.

Deploy still needs a funded testnet key:

```bash
cd contracts
forge script script/Deploy.s.sol:Deploy --rpc-url https://rpc.testnet.chain.robinhood.com --broadcast --private-key $PRIVATE_KEY
```

Paste printed addresses into `.env.local`, then mint / deposit / withdraw on http://localhost:3000.

## How to verify

1. `cd contracts && forge test`
2. Deploy and paste addresses into `.env.local`
3. `npm run dev` — wallet on Robinhood testnet (46630), ETH from https://faucet.testnet.chain.robinhood.com/
4. Mint genesis → `/account/?tokenId=`
5. Get test $ACCC → Deposit → Withdraw; balances update
