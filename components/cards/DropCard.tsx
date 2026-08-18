"use client";

import Link from "next/link";
import { Atmosphere } from "@/components/art/Atmosphere";
import { ProjectVideo } from "@/components/art/ProjectVideo";
import { Badge } from "@/components/ui/Badge";
import { useAcccMintStats } from "@/lib/data/onchain";
import { formatEth } from "@/lib/format";
import { mintPath } from "@/lib/paths";
import type { Drop } from "@/lib/types";

const tones = {
  live: "green",
  upcoming: "warning",
  completed: "muted",
} as const;

const labels = {
  live: "Minting now",
  upcoming: "Upcoming",
  completed: "Sold out",
} as const;

export function DropCard({ drop }: { drop: Drop }) {
  const stats = useAcccMintStats();
  const minted = drop.status === "live" ? stats.minted : drop.minted;
  const mintedLabel =
    minted === undefined && stats.isLoading ? "—" : (minted ?? 0).toLocaleString();

  return (
    <Link
      href={mintPath(drop.id)}
      className="overflow-hidden rounded-lg border border-border bg-surface-1 hover:border-[#3a4440]"
    >
      {drop.video ? (
        <ProjectVideo src={drop.video} className="aspect-[16/10]" rounded="rounded-none" />
      ) : (
        <Atmosphere id={drop.artId} className="aspect-[16/10]" rounded="rounded-none" />
      )}
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold">{drop.name}</h3>
          <Badge tone={tones[drop.status]}>{labels[drop.status]}</Badge>
        </div>
        <p className="tabular text-sm">{formatEth(drop.priceEth)}</p>
        <p className="text-xs text-text-muted">
          {mintedLabel} minted · open supply
        </p>
      </div>
    </Link>
  );
}
