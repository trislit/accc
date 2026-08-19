import catalog from "./tools-catalog.json";
import { tokenLabel } from "../project";

export type ToolStatus = "live" | "soon";
export type ToolGroup = "club" | "community" | "dev";

export type ToolAccess = {
  nft?: number;
  accc?: number;
  genesis?: number;
};

export type ToolPerk = {
  label: string;
  nft?: number;
  accc?: number;
  genesis?: number;
};

export type ClubTool = {
  id: string;
  name: string;
  summary: string;
  group: ToolGroup;
  status: ToolStatus;
  access: ToolAccess;
  href?: string;
  perks?: ToolPerk[];
};

export const TOOL_GROUPS: { id: ToolGroup; label: string }[] = [
  { id: "club", label: "Club" },
  { id: "community", label: "Community" },
  { id: "dev", label: "Dev" },
];

export const TOOLS_STORAGE_KEY = "accc.tools.published.v7";

const LINK_ENV: Record<string, string | undefined> = {
  telegram: process.env.NEXT_PUBLIC_TELEGRAM,
  discord: process.env.NEXT_PUBLIC_DISCORD,
  tokensmart: process.env.NEXT_PUBLIC_TOKENSMART,
};

function asTool(value: unknown): ClubTool | undefined {
  if (!value || typeof value !== "object") return undefined;
  const row = value as Partial<ClubTool>;
  if (!row.id || !row.name || !row.summary) return undefined;
  const group: ToolGroup =
    row.group === "community" || row.group === "dev" ? row.group : "club";
  const status: ToolStatus = row.status === "live" ? "live" : "soon";
  const access: ToolAccess = {
    nft: positive(row.access?.nft),
    accc: positive(row.access?.accc),
    genesis: positive(row.access?.genesis),
  };
  const href = typeof row.href === "string" && row.href.trim() ? row.href.trim() : undefined;
  const perks = asPerks(row.perks);
  return {
    id: String(row.id),
    name: String(row.name),
    summary: String(row.summary),
    group,
    status,
    access,
    href,
    perks,
  };
}

function asPerks(value: unknown): ToolPerk[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const perks = value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    if (typeof record.label !== "string" || !record.label.trim()) return [];
    return [
      {
        label: record.label.trim(),
        nft: positive(record.nft),
        accc: positive(record.accc),
        genesis: positive(record.genesis),
      },
    ];
  });
  return perks.length ? perks : undefined;
}

function positive(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function hydrate(tool: ClubTool): ClubTool {
  const fromEnv = LINK_ENV[tool.id]?.trim();
  if (!fromEnv) return tool;
  return { ...tool, status: "live", href: fromEnv, perks: tool.perks };
}

export function parseTools(raw: string): ClubTool[] | undefined {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return undefined;
    const tools = parsed.map(asTool).filter((tool): tool is ClubTool => Boolean(tool));
    return tools.length ? tools.map(hydrate) : undefined;
  } catch {
    return undefined;
  }
}

export const bundledTools: ClubTool[] = (catalog as unknown[])
  .map(asTool)
  .filter((tool): tool is ClubTool => Boolean(tool))
  .map(hydrate);

export function readPublishedTools(): ClubTool[] {
  if (typeof window === "undefined") return bundledTools;
  const raw = window.localStorage.getItem(TOOLS_STORAGE_KEY);
  return (raw && parseTools(raw)) || bundledTools;
}

export function writePublishedTools(tools: ClubTool[]) {
  window.localStorage.setItem(TOOLS_STORAGE_KEY, JSON.stringify(tools, null, 2));
  window.dispatchEvent(new Event("accc-tools-changed"));
}

export function isExternalHref(href?: string) {
  return Boolean(href && /^(https?:)?\/\//i.test(href));
}

export function accessLabel(access: ToolAccess) {
  const token = tokenLabel();
  const parts: string[] = [];
  if (access.nft) {
    parts.push(
      access.nft === 1 ? "Hold 1 ACCC NFT" : `Hold ${access.nft} ACCC NFTs`,
    );
  }
  if (access.accc) {
    parts.push(`Hold ${access.accc.toLocaleString("en-US")} ${token} total`);
  }
  if (access.genesis) {
    parts.push(
      `Keep ${access.genesis.toLocaleString("en-US")} genesis ${token} in an NFT Account`,
    );
  }
  return parts.length ? parts.join(" · ") : "Open to everyone";
}

export function accessMet(
  access: ToolAccess,
  stats: {
    nftCount: number;
    totalAccc: number;
    genesisHeld: number;
  },
) {
  if (access.nft && stats.nftCount < access.nft) return false;
  if (access.accc && stats.totalAccc + 1e-9 < access.accc) return false;
  if (access.genesis && stats.genesisHeld + 1e-9 < access.genesis) return false;
  return true;
}

/** @deprecated use bundledTools or readPublishedTools */
export const tools = bundledTools;
