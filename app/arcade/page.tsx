import { ArcadeView } from "@/components/pages/ArcadeView";
import { project } from "@/lib/project";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Arcade · ${project.name}`,
  description: "Free snake and memory. Spend harvested $ACCC on seat wallpapers.",
};

export default function ArcadePage() {
  return <ArcadeView />;
}
