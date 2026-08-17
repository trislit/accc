import type { Metadata } from "next";
import { PlanView } from "@/components/pages/PlanView";
import { project } from "@/lib/project";

export const metadata: Metadata = {
  title: `Plan · ${project.name}`,
  description:
    "Membership that earns. Tools that buy it back. ACCC NFT Accounts accrue $ACCC; 33% of tool revenue buys it on the open market.",
};

export default function PlanPage() {
  return <PlanView />;
}
