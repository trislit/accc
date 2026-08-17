"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { activeChain, isTestnet } from "@/lib/chain";
import { abbreviateAddress } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import Link from "next/link";

function connectorLabel(name: string) {
  if (/meta/i.test(name)) return "MetaMask";
  if (/coinbase/i.test(name)) return "Coinbase Wallet";
  if (/walletconnect/i.test(name)) return "WalletConnect";
  return name;
}

export function ConnectModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { connectors, connect, isPending, error } = useConnect();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && open) onClose();
  }, [isConnected, open, onClose]);

  return (
    <Modal open={open} onClose={onClose} title="Connect wallet">
      <p className="mb-4 text-sm text-text-secondary">
        Connect to this collection on {activeChain.name}.
      </p>
      <div className="space-y-2">
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            type="button"
            disabled={isPending}
            onClick={() => connect({ connector, chainId: activeChain.id })}
            className="flex h-12 w-full items-center justify-between rounded-md border border-border bg-surface-2 px-4 text-sm font-medium hover:bg-surface-3"
          >
            {connectorLabel(connector.name)}
            <span className="text-text-muted">Connect</span>
          </button>
        ))}
      </div>
      {error ? (
        <p className="mt-3 text-sm text-error">
          {error.message.split("Version:")[0].trim()}
        </p>
      ) : null}
      <p className="mt-4 text-xs text-text-muted">
        By connecting, you agree to the Terms of Service.
      </p>
    </Modal>
  );
}

export function WrongNetworkModal() {
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending } = useSwitchChain();
  const wrong = isConnected && chainId !== activeChain.id;

  return (
    <Modal
      open={Boolean(wrong)}
      onClose={() => undefined}
      title={`${activeChain.name} required`}
    >
      <p className="mb-4 text-sm text-text-secondary">
        This collection runs on {activeChain.name}
        {isTestnet ? " (chain ID 46630)" : ""}. Switch networks to continue.
      </p>
      <Button
        className="w-full"
        disabled={isPending}
        onClick={() => switchChain({ chainId: activeChain.id })}
      >
        Switch network
      </Button>
    </Modal>
  );
}

export function WalletControls() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);

  if (!isConnected || !address) {
    return (
      <>
        <Button onClick={() => setOpen(true)}>Connect wallet</Button>
        <ConnectModal open={open} onClose={() => setOpen(false)} />
      </>
    );
  }

  return (
    <div className="relative">
      <Button variant="secondary" onClick={() => setMenu((value) => !value)}>
        {abbreviateAddress(address)}
      </Button>
      {menu ? (
        <div className="absolute right-0 z-40 mt-2 w-56 rounded-lg border border-border bg-surface-1 py-2 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
          <Link
            href="/portfolio/"
            className="block px-4 py-2 text-sm hover:bg-surface-3"
            onClick={() => setMenu(false)}
          >
            Portfolio
          </Link>
          <Link
            href="/portfolio/"
            className="block px-4 py-2 text-sm hover:bg-surface-3"
            onClick={() => setMenu(false)}
          >
            My NFTs
          </Link>
          <Link
            href="/portfolio/"
            className="block px-4 py-2 text-sm hover:bg-surface-3"
            onClick={() => setMenu(false)}
          >
            My tokens
          </Link>
          <Link
            href="/portfolio/"
            className="block px-4 py-2 text-sm hover:bg-surface-3"
            onClick={() => setMenu(false)}
          >
            Forge Accounts
          </Link>
          <Link
            href="/collection/"
            className="block px-4 py-2 text-sm hover:bg-surface-3"
            onClick={() => setMenu(false)}
          >
            Collection
          </Link>
          <div className="my-2 border-t border-border-subtle" />
          <button
            type="button"
            className="block w-full px-4 py-2 text-left text-sm text-error hover:bg-surface-3"
            onClick={() => {
              disconnect();
              setMenu(false);
            }}
          >
            Disconnect
          </button>
        </div>
      ) : null}
    </div>
  );
}
