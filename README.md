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
- `/account?tokenId=` live ERC-6551 account (claim / harvest / transfer / withdraw)
- `/portfolio` ACCC holdings
- `/plan` public pitch and go-to-market
- `/tools` gated club tools (NFT, $ACCC total, genesis still in the NFT Account)
- `/admin` administrator link board (wallet allowlist)

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
forge script script/DeployDistributor.s.sol:DeployDistributor --rpc-url https://rpc.testnet.chain.robinhood.com --broadcast
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
| `NEXT_PUBLIC_DISTRIBUTOR` | Live AcccDistributor (per-NFT genesis + yield) |
| `NEXT_PUBLIC_TBA_IMPLEMENTATION` | Live ERC6551Account implementation |
| `NEXT_PUBLIC_ADMINS` | Comma-separated wallets that can open `/admin` |
| `NEXT_PUBLIC_TELEGRAM` | Member Telegram URL (makes the Telegram tool live) |
| `NEXT_PUBLIC_DISCORD` | Member Discord URL |
| `NEXT_PUBLIC_TOKENSMART` | TokenSmart desktop URL (defaults to `https://desktop.tokensmart.co`) |

Buy/list stay mocked. Mint, claim, harvest, deposit, and withdraw are live when NFT/token/implementation addresses are set.

## Cloudflare

Static export (`out/`). `NEXT_PUBLIC_*` is baked in at **build** time, not at request time. Framework preset: **None**. Build: `npm run build`. Deploy: `npx wrangler deploy` (or push `main` if the Cloudflare project is Git-connected).

After a deploy that includes the live addresses:

1. Open the Cloudflare URL, go to **Mint**.
2. Connect a wallet on **Robinhood Chain Testnet** (chain ID `46630`).
3. That wallet needs testnet ETH from [the faucet](https://faucet.testnet.chain.robinhood.com/) (the deployer key is only for contracts; mint from your own wallet).
4. Mint → **Open NFT Account** → **Claim 1,000 $ACCC** → Harvest / Withdraw.

To rebuild without a code change, set these as Cloudflare **build** environment variables and retry the deployment:

```
NEXT_PUBLIC_CHAIN_ID=46630
NEXT_PUBLIC_NFT=0xdcbC12c8ebe5cD0E24B414F51283F7afE0d35cA5
NEXT_PUBLIC_TOKEN=0xc153e32f7f0dBe3131FECcC598a1EA57C64c5A99
NEXT_PUBLIC_DISTRIBUTOR=0x56deD1a8d70893113Cff4289e204B142d4ce5eDA
NEXT_PUBLIC_TBA_IMPLEMENTATION=0x8A0455E86536F57323866ed13c26febAb8ae3049
NEXT_PUBLIC_TBA_REGISTRY=0x000000006551c19487814612e58FE06813775758
```

## Stack

Next.js App Router (static export), Tailwind, wagmi, viem, Robinhood Chain testnet (`46630`).
