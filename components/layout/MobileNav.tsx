"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, Sparkles, UserRound, Wrench } from "lucide-react";
import { cx } from "@/lib/cx";

const items = [
  { href: "/collection/", label: "Collection", icon: Layers },
  { href: "/mint/", label: "Mint", icon: Sparkles },
  { href: "/tools/", label: "Tools", icon: Wrench },
  { href: "/portfolio/", label: "Me", icon: UserRound },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-bg lg:hidden">
      <div className="grid grid-cols-4">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cx(
                "flex flex-col items-center gap-1 py-2.5 text-[11px]",
                active ? "text-forge-green" : "text-text-muted",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
