"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConnectModal } from "@/components/wallet/WalletControls";
import { isAdminAddress } from "@/lib/admins";
import { useClubAccess } from "@/lib/data/access";
import {
  TOOL_GROUPS,
  accessLabel,
  isExternalHref,
  type ClubTool,
} from "@/lib/data/tools";
import { useTools } from "@/lib/data/useTools";
import { formatTokenAmount } from "@/lib/format";
import { tokenLabel } from "@/lib/project";

export function ToolsView() {
  const { address, isConnected } = useAccount();
  const access = useClubAccess();
  const tools = useTools();
  const [connectOpen, setConnectOpen] = useState(false);
  const token = tokenLabel();
  const admin = isAdminAddress(address);

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-xs font-semibold tracking-wide text-text-muted">
          TOOLS
        </p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-[32px] font-semibold leading-10">Club tools</h1>
          {admin ? (
            <Link href="/admin/">
              <Button size="sm" variant="secondary">
                Admin
              </Button>
            </Link>
          ) : null}
        </div>
        <p className="max-w-2xl text-sm text-text-secondary">
          Access opens as we ship. Some tools need an ACCC NFT, some need{" "}
          {token} anywhere you hold it, and some need original genesis {token}{" "}
          still sitting in the NFT Account.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="ACCC NFTs"
          value={isConnected ? String(access.nftCount) : "—"}
          hint="Membership seats you own"
        />
        <Stat
          label={`${token} total`}
          value={isConnected ? formatTokenAmount(access.totalAccc) : "—"}
          hint="Wallet plus every NFT Account"
        />
        <Stat
          label={`Genesis ${token} held`}
          value={isConnected ? formatTokenAmount(access.genesisHeld) : "—"}
          hint="Remaining original grant in NFT Accounts"
        />
      </section>

      {!isConnected ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface-1 p-4">
          <p className="flex-1 text-sm text-text-secondary">
            Connect a wallet on Robinhood testnet to see what you already unlock.
          </p>
          <Button size="sm" onClick={() => setConnectOpen(true)}>
            Connect wallet
          </Button>
        </div>
      ) : access.isLoading ? (
        <p className="text-sm text-text-muted">Checking membership…</p>
      ) : access.nftCount === 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface-1 p-4">
          <p className="flex-1 text-sm text-text-secondary">
            Mint an ACCC NFT to unlock member tools. Keep genesis {token} in the
            NFT Account for the tighter rooms.
          </p>
          <Link href="/mint/">
            <Button size="sm">Mint</Button>
          </Link>
        </div>
      ) : null}

      {TOOL_GROUPS.map((group) => {
        const rows = tools.filter((tool) => tool.group === group.id);
        if (!rows.length) return null;
        return (
          <section key={group.id} className="space-y-4">
            <h2 className="text-lg font-semibold">{group.label}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {rows.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  open={access.unlocked(tool.access)}
                  connected={isConnected}
                  loading={access.isLoading}
                  nftCount={access.nftCount}
                  onConnect={() => setConnectOpen(true)}
                />
              ))}
            </div>
          </section>
        );
      })}

      <ConnectModal open={connectOpen} onClose={() => setConnectOpen(false)} />
    </div>
  );
}

function ToolCard({
  tool,
  open,
  connected,
  loading,
  nftCount,
  onConnect,
}: {
  tool: ClubTool;
  open: boolean;
  connected: boolean;
  loading: boolean;
  nftCount: number;
  onConnect: () => void;
}) {
  const requirement = accessLabel(tool.access);
  const liveLink = open && tool.status === "live" && tool.href;
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold">{tool.name}</h2>
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          <Badge tone={tool.status === "live" ? "green" : "muted"}>
            {tool.status === "live" ? "Live" : "Soon"}
          </Badge>
          {loading ? null : (
            <Badge tone={open ? "green" : "warning"}>
              {open ? "Unlocked" : "Locked"}
            </Badge>
          )}
        </div>
      </div>
      <p className="mt-2 text-sm text-text-secondary">{tool.summary}</p>
      <p className="mt-4 text-xs text-text-muted">{requirement}</p>
      {!open && !loading ? (
        <div className="mt-4">
          {!connected ? (
            <Button size="sm" variant="secondary" onClick={onConnect}>
              Connect to check
            </Button>
          ) : (
            <Link href={lockHref(tool, nftCount)}>
              <Button size="sm" variant="secondary">
                {lockLabel(tool, nftCount)}
              </Button>
            </Link>
          )}
        </div>
      ) : null}
      {open && tool.status === "soon" ? (
        <p className="mt-4 text-xs text-forge-green">
          You qualify. This tool is not shipping yet.
        </p>
      ) : null}
      {liveLink ? (
        <p className="mt-4 text-xs text-forge-green">Open →</p>
      ) : null}
    </>
  );

  const className =
    "block rounded-lg border border-border bg-surface-1 p-5 hover:border-[#3a4440]";

  if (liveLink && tool.href) {
    if (isExternalHref(tool.href)) {
      return (
        <a
          href={tool.href}
          target="_blank"
          rel="noreferrer"
          className={className}
        >
          {inner}
        </a>
      );
    }
    return (
      <Link href={tool.href} className={className}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}

function lockHref(tool: ClubTool, nftCount: number) {
  if (tool.access.nft && nftCount < (tool.access.nft ?? 1)) return "/mint/";
  if (tool.access.genesis || tool.access.accc) return "/portfolio/";
  return "/mint/";
}

function lockLabel(tool: ClubTool, nftCount: number) {
  if (tool.access.nft && nftCount < (tool.access.nft ?? 1)) return "Mint to unlock";
  if (tool.access.genesis) return "Keep genesis in the NFT Account";
  if (tool.access.accc) return `Get ${tokenLabel()}`;
  return "Mint";
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-1 p-4">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 tabular text-xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-text-muted">{hint}</p>
    </div>
  );
}
