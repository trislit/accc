import Link from "next/link";
import { Wordmark } from "@/components/brand/Logo";
import { project } from "@/lib/project";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border-subtle pb-20 lg:pb-0">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-8 md:px-8 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <Wordmark />
          <div className="flex flex-wrap items-center gap-6 text-sm text-text-secondary">
            <Link href="/collection/" className="hover:text-text-primary">
              Collection
            </Link>
            <Link href="/market/" className="hover:text-text-primary">
              Market
            </Link>
            <Link href="/mint/" className="hover:text-text-primary">
              Mint
            </Link>
            <Link href="/tools/" className="hover:text-text-primary">
              Tools
            </Link>
            <Link href="/plan/" className="hover:text-text-primary">
              Plan
            </Link>
            <Link href="/seat/" className="hover:text-text-primary">
              The seat
            </Link>
          </div>
          <div className="flex items-center gap-4 text-text-secondary">
            {project.links.x ? (
              <a
                href={project.links.x}
                target="_blank"
                rel="noreferrer"
                className="hover:text-text-primary"
                aria-label="X"
              >
                𝕏
              </a>
            ) : null}
            {project.links.discord ? (
              <a
                href={project.links.discord}
                target="_blank"
                rel="noreferrer"
                className="hover:text-text-primary"
              >
                Discord
              </a>
            ) : null}
            {project.links.telegram ? (
              <a
                href={project.links.telegram}
                target="_blank"
                rel="noreferrer"
                className="hover:text-text-primary"
              >
                Telegram
              </a>
            ) : null}
            {project.links.tokensmart ? (
              <a
                href={project.links.tokensmart}
                target="_blank"
                rel="noreferrer"
                className="hover:text-text-primary"
              >
                TokenSmart
              </a>
            ) : null}
            {project.links.website ? (
              <a href={project.links.website} className="hover:text-text-primary">
                Web
              </a>
            ) : null}
          </div>
        </div>
        <p className="text-xs text-text-muted">
          © 2026 {project.name}. {project.fullName}.
        </p>
      </div>
    </footer>
  );
}
