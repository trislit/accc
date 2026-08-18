# ACCC — Admin-gated tools

- [x] Wallet-gated `/admin` to add/edit tool links and access levels
- [x] Community + desktop + upcoming dev tools in the catalog
- [x] Tools page grouped; external links open in a new tab

## Review

Yes to an admin link board. No to a general CMS.

This site is a static export, so an admin change is real for everyone only after `tools` JSON is deployed (or later, Cloudflare KV). Wallet gates on `/tools` are membership UX, not secret URLs — invite links still ship in the client bundle.

Default admin: `0x3872ff66dF4b9570F4e58FB1234a717dFe1334a9` (override with `NEXT_PUBLIC_ADMINS`).

## How to verify

1. Connect the admin wallet → wallet menu → Admin
2. Add Telegram / Discord / TokenSmart URLs, set NFT or genesis gates, Publish on this device
3. Open `/tools/` and confirm gates; Download JSON and put it in `lib/data/tools-catalog.json` to ship
