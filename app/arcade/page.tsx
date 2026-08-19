import { ArcadeView } from "@/components/pages/ArcadeView";
import { project } from "@/lib/project";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Arcade · ${project.name}`,
  description: "Inner-circle Handshake cabinet. Spend harvested $ACCC for a mark.",
};

export default function ArcadePage() {
  return <ArcadeView />;
}
