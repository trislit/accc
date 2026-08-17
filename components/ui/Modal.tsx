"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cx } from "@/lib/cx";

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const allowDismiss = useRef(false);

  useEffect(() => {
    if (!open) {
      allowDismiss.current = false;
      return;
    }
    allowDismiss.current = false;
    const enable = window.setTimeout(() => {
      allowDismiss.current = true;
    }, 400);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(enable);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  function dismiss() {
    if (allowDismiss.current) onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70"
        aria-hidden="true"
        onClick={dismiss}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cx(
          "relative z-10 w-full max-w-md rounded-xl border border-border bg-surface-1 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.55)]",
          className,
        )}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          {title ? (
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-text-muted hover:bg-surface-3 hover:text-text-primary"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
