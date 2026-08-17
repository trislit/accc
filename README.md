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

Live testnet addresses are baked into [`lib/project.ts`](lib/project.ts). Override them with `.env.local` if you redeploy. Get testnet ETH from [the faucet](https://faucet.testnet.chain.robinhood.com/).

## Environment

Copy `.env.example` to `.env.local` for local overrides. Cloudflare Git builds use the baked-in testnet addresses.

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

Static export (`out/`). `NEXT_PUBLIC_*` is baked in at **build** time, not at request time. Framework preset: **None**. Build: `npm run build`. Deploy: `npx wrangler deploy` (or push `main` if the Cloudflare project is Git-connected).

After a deploy that includes the live addresses:

1. Open the Cloudflare URL, go to **Mint**.
2. Connect a wallet on **Robinhood Chain Testnet** (chain ID `46630`).
3. That wallet needs testnet ETH from [the faucet](https://faucet.testnet.chain.robinhood.com/) (the deployer key is only for contracts; mint from your own wallet).
4. Mint → **Open NFT Account** → **Get test $ACCC** → Deposit.

To rebuild without a code change, set these as Cloudflare **build** environment variables and retry the deployment:

```
NEXT_PUBLIC_CHAIN_ID=46630
NEXT_PUBLIC_NFT=0xdcbC12c8ebe5cD0E24B414F51283F7afE0d35cA5
NEXT_PUBLIC_TOKEN=0x3EE8c0c19f6622e6a62f9F04a79cB92444719f71
NEXT_PUBLIC_TBA_IMPLEMENTATION=0x8A0455E86536F57323866ed13c26febAb8ae3049
NEXT_PUBLIC_TBA_REGISTRY=0x000000006551c19487814612e58FE06813775758
```

## Stack

Next.js App Router (static export), Tailwind, wagmi, viem, Robinhood Chain testnet (`46630`).
