"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Wordmark } from "@/components/brand/Logo";
import { WalletControls } from "@/components/wallet/WalletControls";
import { cx } from "@/lib/cx";

const nav = [
  { href: "/collection/", label: "Collection" },
  { href: "/market/", label: "Market" },
  { href: "/mint/", label: "Mint" },
  { href: "/tools/", label: "Tools" },
  { href: "/plan/", label: "Plan" },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-bg">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-4 md:px-8 lg:px-12">
        <Link href="/" className="shrink-0">
          <Wordmark />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  "relative text-sm font-medium",
                  active
                    ? "text-text-primary"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {item.label}
                {active ? (
                  <span className="absolute inset-x-0 -bottom-[22px] h-0.5 bg-forge-green" />
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="hidden h-10 items-center gap-2 rounded-full border border-border bg-surface-1 px-3 text-sm text-text-secondary sm:inline-flex"
          >
            <span className="h-4 w-4 rounded-full bg-forge-green/90" />
            <span className="hidden xl:inline">Robinhood Testnet</span>
            <span className="xl:hidden">RH test</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <WalletControls />
        </div>
      </div>
    </header>
  );
}
