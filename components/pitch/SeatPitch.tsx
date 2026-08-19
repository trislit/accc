import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { pitch, SEAT_PATH } from "@/lib/pitch";
import { tokenLabel } from "@/lib/project";

export function SeatPitch({
  variant = "embed",
}: {
  variant?: "embed" | "compact" | "page";
}) {
  const token = tokenLabel();
  const compact = variant === "compact";
  const page = variant === "page";

  return (
    <section className="space-y-5 rounded-lg border border-border bg-surface-1 p-6 md:p-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-wide text-text-muted">
          {pitch.kicker.toUpperCase()}
        </p>
        <h2 className={page ? "text-3xl font-semibold" : "text-xl font-semibold"}>
          {pitch.headline}
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-text-secondary">{pitch.lede}</p>
      </div>
      <div className={`grid gap-3 ${compact ? "md:grid-cols-1" : "md:grid-cols-3"}`}>
        {pitch.beats.map((beat) => (
          <div
            key={beat.title}
            className="rounded-lg border border-border bg-bg p-4"
          >
            <p className="text-sm font-medium">{beat.title}</p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {beat.body.replaceAll("$ACCC", token)}
            </p>
          </div>
        ))}
      </div>
      {compact ? null : (
        <div className="font-mono text-sm leading-7 text-text-secondary">
          <p className="text-text-primary">NFT (the seat)</p>
          <p className="pl-4">│</p>
          <p className="pl-4">
            ├── owns → <span className="text-text-primary">NFT Account</span>
          </p>
          <p className="pl-8">│</p>
          <p className="pl-8">├── {token}</p>
          <p className="pl-8">├── ETH</p>
          <p className="pl-8">└── other NFTs</p>
          <p className="pl-4">│</p>
          <p className="pl-4">
            └── locked → <span className="text-text-primary">perks</span> (wallpapers)
          </p>
          <p className="mt-3 text-text-muted">Move the NFT → the bag moves.</p>
        </div>
      )}
      <p className="text-xs text-text-muted">{pitch.footnote}</p>
      {page ? (
        <div className="flex flex-wrap gap-3">
          <Link href="/mint/">
            <Button>Mint a seat</Button>
          </Link>
          <Link href="/plan/">
            <Button variant="secondary">The plan</Button>
          </Link>
        </div>
      ) : (
        <Link href={SEAT_PATH} className="inline-block text-sm text-forge-green">
          Share this pitch →
        </Link>
      )}
    </section>
  );
}
