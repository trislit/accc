# ACCC

Anti-Cabal Cabal Club on Robinhood Chain.

Mint a membership NFT. Each mint includes an NFT Account (ERC-6551) that can hold $ACCC. Secondary market is this collection only.

Identity lives in [`lib/project.ts`](lib/project.ts).

This is **not** TwinForge. TwinForge stays the factory.

## Screens

- `/` landing
- `/collection` collection + $ACCC + activity
- `/market` secondary listings
- `/mint` genesis drop
- `/nft/...` NFT + NFT Account + buy/list (showcase catalog)
- `/account?tokenId=` live ERC-6551 account (deposit / withdraw)
- `/portfolio` ACCC holdings
- `/held?id=` minted NFTs in this browser

## Local

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npm run typecheck
npm run build
```

`npm run build` writes a static export to `out/` for Cloudflare Pages.

## Contracts (Robinhood testnet)

```bash
cd contracts
forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts --no-git
forge test
forge script script/Deploy.s.sol:Deploy --rpc-url https://rpc.testnet.chain.robinhood.com --broadcast --private-key $PRIVATE_KEY
```

Paste the printed addresses into `.env.local`. Get testnet ETH from [the faucet](https://faucet.testnet.chain.robinhood.com/).

## Environment

Copy `.env.example` to `.env.local`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CHAIN_ID` | `46630` testnet (default) or `4663` mainnet |
| `NEXT_PUBLIC_RPC_URL` | Optional Robinhood Chain RPC |
| `NEXT_PUBLIC_WALLETCONNECT_ID` | Enables WalletConnect in the connect modal |
| `NEXT_PUBLIC_NFT` | Live AcccNft address |
| `NEXT_PUBLIC_TOKEN` | Live AcccToken address |
| `NEXT_PUBLIC_TBA_IMPLEMENTATION` | Live ERC6551Account implementation |
| `NEXT_PUBLIC_TBA_REGISTRY` | Canonical ERC-6551 registry |

Buy/list stay mocked. Mint, faucet, deposit, and withdraw are live when NFT/token/implementation addresses are set.

## Cloudflare

Static export (`out/`). Framework preset: **None**. Build: `npm run build`. Deploy: `npx wrangler deploy`.

## Stack

Next.js App Router (static export), Tailwind, wagmi, viem, Robinhood Chain testnet (`46630`).
