import type { Metadata } from "next";
import { ToolsView } from "@/components/pages/ToolsView";
import { project } from "@/lib/project";

export const metadata: Metadata = {
  title: `Tools · ${project.name}`,
  description:
    "Club tools gated by ACCC NFT ownership, $ACCC held, and genesis $ACCC still in the NFT Account.",
};

export default function ToolsPage() {
  return <ToolsView />;
}
