"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { CoreSeats } from "@/components/admin/CoreSeats";
import { SeedGrants } from "@/components/admin/SeedGrants";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConnectModal } from "@/components/wallet/WalletControls";
import { isAdminAddress } from "@/lib/admins";
import {
  TOOL_GROUPS,
  accessLabel,
  bundledTools,
  writePublishedTools,
  type ClubTool,
  type ToolAccess,
  type ToolGroup,
  type ToolStatus,
} from "@/lib/data/tools";
import { useTools } from "@/lib/data/useTools";

const emptyDraft: Omit<ClubTool, "id"> = {
  name: "",
  summary: "",
  group: "community",
  status: "soon",
  access: {},
  href: "",
};

export function AdminView() {
  const { address, isConnected } = useAccount();
  const tools = useTools();
  const [connectOpen, setConnectOpen] = useState(false);
  const [editing, setEditing] = useState<ClubTool | null>(null);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string>();
  const admin = isAdminAddress(address);

  function persist(next: ClubTool[]) {
    writePublishedTools(next);
    setMessage("Published on this device. Download JSON to ship it in a deploy.");
  }

  function download() {
    const blob = new Blob([`${JSON.stringify(tools, null, 2)}\n`], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tools-catalog.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!isConnected) {
    return (
      <Gate
        title="Admin"
        body="Connect an administrator wallet to add tool links and set access levels."
        action={<Button onClick={() => setConnectOpen(true)}>Connect wallet</Button>}
        modal={<ConnectModal open={connectOpen} onClose={() => setConnectOpen(false)} />}
      />
    );
  }

  if (!admin) {
    return (
      <Gate
        title="Admin"
        body="This wallet is not on the administrator list. Set NEXT_PUBLIC_ADMINS to include it."
      />
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold tracking-wide text-text-muted">ADMIN</p>
        <h1 className="text-[32px] font-semibold leading-10">Admin</h1>
        <p className="max-w-2xl text-sm text-text-secondary">
          Assign core seats to leadership wallets, seed public specials, then
          manage tool links. Publish tools on this device; download JSON and
          replace{" "}
          <span className="font-mono text-text-primary">lib/data/tools-catalog.json</span>{" "}
          to ship it for everyone.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setCreating(true)}>Add link</Button>
        <Button variant="secondary" onClick={() => persist(tools)}>
          Publish on this device
        </Button>
        <Button variant="secondary" onClick={download}>
          Download JSON
        </Button>
        <Button variant="secondary" onClick={() => persist(bundledTools)}>
          Reset to bundled
        </Button>
        <Link href="/tools/">
          <Button variant="tertiary">View tools →</Button>
        </Link>
      </div>

      {message ? <p className="text-sm text-forge-green">{message}</p> : null}

      <CoreSeats />
      <SeedGrants />

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-[1fr_7rem_1fr_auto] gap-3 px-4 py-3 text-xs text-text-muted">
          <span>Tool</span>
          <span>Group</span>
          <span>Access</span>
          <span />
        </div>
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="grid grid-cols-[1fr_7rem_1fr_auto] items-center gap-3 border-t border-border-subtle px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium">{tool.name}</p>
              <p className="truncate text-xs text-text-muted">
                {tool.status === "live" ? tool.href || "Live, no URL" : "Soon"}
              </p>
            </div>
            <Badge tone="muted">{tool.group}</Badge>
            <p className="text-xs text-text-secondary">{accessLabel(tool.access)}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setEditing(tool)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => persist(tools.filter((row) => row.id !== tool.id))}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      {creating ? (
        <ToolEditor
          key="create"
          open
          title="Add link"
          initial={{ id: "", ...emptyDraft }}
          onClose={() => setCreating(false)}
          onSave={(tool) => {
            persist([...tools, tool]);
            setCreating(false);
          }}
        />
      ) : null}
      {editing ? (
        <ToolEditor
          key={editing.id}
          open
          title="Edit link"
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(tool) => {
            persist(tools.map((row) => (row.id === tool.id ? tool : row)));
            setEditing(null);
          }}
        />
      ) : null}
    </div>
  );
}

function ToolEditor({
  open,
  title,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  title: string;
  initial: ClubTool;
  onClose: () => void;
  onSave: (tool: ClubTool) => void;
}) {
  const [name, setName] = useState(initial.name);
  const [summary, setSummary] = useState(initial.summary);
  const [group, setGroup] = useState<ToolGroup>(initial.group);
  const [status, setStatus] = useState<ToolStatus>(initial.status);
  const [href, setHref] = useState(initial.href ?? "");
  const [nft, setNft] = useState(String(initial.access.nft ?? ""));
  const [accc, setAccc] = useState(String(initial.access.accc ?? ""));
  const [genesis, setGenesis] = useState(String(initial.access.genesis ?? ""));

  const ready = name.trim() && summary.trim() && (status === "soon" || href.trim());

  function save() {
    if (!ready) return;
    const access: ToolAccess = {
      nft: positive(nft),
      accc: positive(accc),
      genesis: positive(genesis),
    };
    onSave({
      id: initial.id || slug(name),
      name: name.trim(),
      summary: summary.trim(),
      group,
      status,
      access,
      href: href.trim() || undefined,
      perks: initial.perks,
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-lg">
      <div className="space-y-3">
        <Field label="Name">
          <input value={name} onChange={(event) => setName(event.target.value)} className={inputClass} />
        </Field>
        <Field label="Summary">
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-forge-green"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Group">
            <select
              value={group}
              onChange={(event) => setGroup(event.target.value as ToolGroup)}
              className={inputClass}
            >
              {TOOL_GROUPS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as ToolStatus)}
              className={inputClass}
            >
              <option value="live">Live</option>
              <option value="soon">Soon</option>
            </select>
          </Field>
        </div>
        <Field label="URL">
          <input
            value={href}
            onChange={(event) => setHref(event.target.value)}
            placeholder="https://desktop.tokensmart.co or /portfolio/"
            className={inputClass}
          />
        </Field>
        <p className="text-xs font-semibold tracking-wide text-text-muted">
          ACCESS (leave blank if not required)
        </p>
        <div className="grid grid-cols-3 gap-3">
          <Field label="NFTs">
            <input value={nft} onChange={(event) => setNft(event.target.value)} inputMode="numeric" className={inputClass} />
          </Field>
          <Field label="$ACCC total">
            <input value={accc} onChange={(event) => setAccc(event.target.value)} inputMode="numeric" className={inputClass} />
          </Field>
          <Field label="Genesis held">
            <input
              value={genesis}
              onChange={(event) => setGenesis(event.target.value)}
              inputMode="numeric"
              className={inputClass}
            />
          </Field>
        </div>
        <Button className="w-full" disabled={!ready} onClick={save}>
          Save
        </Button>
      </div>
    </Modal>
  );
}

const inputClass =
  "mt-1 h-10 w-full rounded-md border border-border bg-bg px-3 text-sm outline-none focus:border-forge-green";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-text-muted">{label}</span>
      {children}
    </label>
  );
}

function Gate({
  title,
  body,
  action,
  modal,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  modal?: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h1 className="text-[32px] font-semibold leading-10">{title}</h1>
      <p className="max-w-xl text-sm text-text-secondary">{body}</p>
      {action}
      {modal}
    </div>
  );
}

function positive(value: string) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function slug(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base || "tool"}-${Date.now().toString(36)}`;
}
