import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pitch } from "@/lib/pitch";
import { project } from "@/lib/project";

export const metadata: Metadata = {
  title: `Mint · ${project.name}`,
  description: pitch.share,
};

export default function MintLayout({ children }: { children: ReactNode }) {
  return children;
}
