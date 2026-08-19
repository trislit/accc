"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { pitch, SEAT_PATH } from "@/lib/pitch";

export function CopyPitch() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const origin = window.location.origin;
    const text = `${pitch.share} ${origin}${SEAT_PATH}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface-1 p-5">
      <p className="text-xs font-semibold tracking-wide text-text-muted">
        SEND THIS
      </p>
      <p className="text-sm leading-6 text-text-secondary">{pitch.share}</p>
      <Button size="sm" variant="secondary" onClick={() => void copy()}>
        {copied ? "Copied" : "Copy pitch"}
      </Button>
    </div>
  );
}
