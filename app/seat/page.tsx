import type { Metadata } from "next";
import { CopyPitch } from "@/components/pitch/CopyPitch";
import { SeatPitch } from "@/components/pitch/SeatPitch";
import { pitch } from "@/lib/pitch";
import { project } from "@/lib/project";

export const metadata: Metadata = {
  title: `The seat · ${project.name}`,
  description: pitch.share,
};

export default function SeatPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-medium text-forge-green">
          {project.fullName}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">The seat</h1>
        <p className="max-w-xl text-base text-text-secondary">
          One explanation. Send this page instead of rewriting it.
        </p>
      </header>
      <SeatPitch variant="page" />
      <CopyPitch />
    </div>
  );
}
