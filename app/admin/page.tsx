import type { Metadata } from "next";
import { AdminView } from "@/components/pages/AdminView";
import { project } from "@/lib/project";

export const metadata: Metadata = {
  title: `Admin · ${project.name}`,
  description: "Add tool links and set NFT, $ACCC, or genesis access levels.",
};

export default function AdminPage() {
  return <AdminView />;
}
