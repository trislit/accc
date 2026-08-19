"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { parseUnits } from "viem";
import { useAccount } from "wagmi";
import { getWalletClient } from "wagmi/actions";
import { MemoryGame } from "@/components/arcade/MemoryGame";
import { SnakeGame } from "@/components/arcade/SnakeGame";
import { Atmosphere } from "@/components/art/Atmosphere";
import {
  TransactionModal,
  useOnchainTransaction,
} from "@/components/tx/TransactionStatus";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Tabs";
import { ConnectModal } from "@/components/wallet/WalletControls";
import {
  ARCADE_SKINS,
  arcadePath,
  artIdForSkin,
  ownsSkin,
  skinById,
} from "@/lib/arcade";
import { acccTxFees, robinhoodTestnet } from "@/lib/chain";
import { acccArcadeAbi, acccTokenAbi } from "@/lib/contracts";
import {
  useAcccBalance,
  useArcadeStatus,
  useDistributorStatus,
  useNftOwner,
  useOwnedAcccNfts,
  useTbaAddress,
  useTokenAllowance,
} from "@/lib/data/onchain";
import { formatTokenAmount } from "@/lib/format";
import { LIVE_ARCADE, LIVE_TOKEN, project, tokenLabel } from "@/lib/project";
import { accountPath } from "@/lib/tba";
import { wagmiConfig } from "@/lib/wagmi";

type Tab = "games" | "skins";
type Game = "snake" | "memory";

function ArcadeInner() {
  const params = useSearchParams();
  const tokenId = params.get("tokenId") ?? "";
  const { address, isConnected } = useAccount();
  const [connectOpen, setConnectOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("games");
  const [game, setGame] = useState<Game>("snake");
  const ownerQuery = useNftOwner(tokenId || undefined);
  const tbaQuery = useTbaAddress(tokenId || undefined);
  const dist = useDistributorStatus(tokenId || undefined);
  const arcade = useArcadeStatus(tokenId || undefined);
  const tbaToken = useAcccBalance(tbaQuery.address);
  const walletToken = useAcccBalance(isConnected ? address : undefined);
  const allowance = useTokenAllowance(
    isConnected ? address : undefined,
    LIVE_ARCADE,
  );
  const owned = useOwnedAcccNfts(isConnected ? address : undefined);
  const tx = useOnchainTransaction();

  const isOwner =
    Boolean(address) &&
    Boolean(ownerQuery.owner) &&
    address?.toLowerCase() === ownerQuery.owner?.toLowerCase();
  const principal = dist.eligibleFormatted ?? 0;
  const innerCircle = principal > 0;
  const spendable = arcade.spendable;
  const wallet = walletToken.formatted ?? 0;
  const cost = arcade.cost;
  const wallpaper = artIdForSkin(arcade.wallpaper);
  const approved = (allowance.formatted ?? 0) + 1e-12 >= cost;
  const canPay = wallet + 1e-12 >= cost;

  function refetchAll() {
    void arcade.refetch();
    void walletToken.refetch();
    void tbaToken.refetch();
    void allowance.refetch();
    void dist.refetch();
    void owned.refetch();
  }

  function sendApprove() {
    tx.start(`Approve ${tokenLabel()} for skins`, 0, async () => {
      const walletClient = await getWalletClient(wagmiConfig, {
        chainId: robinhoodTestnet.id,
      });
      if (!walletClient) throw new Error("Wallet is not ready.");
      return walletClient.writeContract({
        address: LIVE_TOKEN,
        abi: acccTokenAbi,
        functionName: "approve",
        args: [LIVE_ARCADE, parseUnits("100", 18)],
        chain: robinhoodTestnet,
        account: walletClient.account,
        ...(await acccTxFees()),
      });
    }, refetchAll);
  }

  function sendBuy(skinId: number) {
    if (!tokenId) return;
    tx.start(`Buy ${skinById(skinId).name} · ${cost} ${tokenLabel()}`, 0, async () => {
      const walletClient = await getWalletClient(wagmiConfig, {
        chainId: robinhoodTestnet.id,
      });
      if (!walletClient) throw new Error("Wallet is not ready.");
      return walletClient.writeContract({
        address: LIVE_ARCADE,
        abi: acccArcadeAbi,
        functionName: "buySkin",
        args: [BigInt(tokenId), skinId],
        chain: robinhoodTestnet,
        account: walletClient.account,
        ...(await acccTxFees()),
      });
    }, refetchAll);
  }

  function sendWear(skinId: number) {
    if (!tokenId) return;
    tx.start(`Wear ${skinById(skinId).name}`, 0, async () => {
      const walletClient = await getWalletClient(wagmiConfig, {
        chainId: robinhoodTestnet.id,
      });
      if (!walletClient) throw new Error("Wallet is not ready.");
      return walletClient.writeContract({
        address: LIVE_ARCADE,
        abi: acccArcadeAbi,
        functionName: "wearSkin",
        args: [BigInt(tokenId), skinId],
        chain: robinhoodTestnet,
        account: walletClient.account,
        ...(await acccTxFees()),
      });
    }, refetchAll);
  }

  function onSkinClick(skinId: number) {
    if (!isConnected) {
      setConnectOpen(true);
      return;
    }
    if (!isOwner || !innerCircle) return;
    if (ownsSkin(arcade.mask, skinId)) {
      if (arcade.wallpaper !== skinId) sendWear(skinId);
      return;
    }
    if (!approved) {
      sendApprove();
      return;
    }
    sendBuy(skinId);
  }

  if (!tokenId) {
    return (
      <div className="space-y-6">
        <Header />
        <p className="max-w-xl text-sm text-text-secondary">
          Pick a seat. Snake and memory are free. {tokenLabel()} buys a
          wallpaper that skins the board and the collection card.
        </p>
        {!isConnected ? (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface-1 p-4">
            <p className="flex-1 text-sm text-text-secondary">
              Connect a wallet that holds an ACCC NFT.
            </p>
            <Button size="sm" onClick={() => setConnectOpen(true)}>
              Connect wallet
            </Button>
          </div>
        ) : owned.isLoading ? (
          <p className="text-sm text-text-muted">Reading seats…</p>
        ) : owned.nfts.length === 0 ? (
          <EmptyState
            title="No ACCC NFT on this wallet"
            body="Mint a membership, then open arcade from that seat."
          />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {owned.nfts.map((nft) => (
              <li key={nft.tokenId}>
                <Link
                  href={arcadePath(nft.tokenId)}
                  className="block overflow-hidden rounded-lg border border-border bg-surface-1 hover:border-[#3a4440]"
                >
                  <Atmosphere id={nft.artId} className="aspect-[16/10]" rounded="rounded-none" />
                  <div className="p-4">
                    <p className="text-sm font-medium">{nft.name}</p>
                    <p className="mt-1 text-xs text-text-muted">
                      {skinById(nft.arcadeWallpaper).name}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <ConnectModal open={connectOpen} onClose={() => setConnectOpen(false)} />
      </div>
    );
  }

  if (ownerQuery.error) {
    return (
      <EmptyState title={`ACCC #${tokenId} not found`} body={ownerQuery.error} />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <Header tokenId={tokenId} />
        <ol className="max-w-xl list-decimal space-y-1 pl-5 text-sm text-text-secondary">
          <li>
            Play snake or memory anytime. No {tokenLabel()}. The board uses this
            seat’s wallpaper.
          </li>
          <li>
            Harvest yield, then withdraw surplus to this wallet. Leave genesis
            in the NFT Account.
          </li>
          <li>
            Open Wallpapers. {cost} {tokenLabel()} buys a look. Games and the
            collection card switch to it.
          </li>
        </ol>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={tab === "games" ? "primary" : "secondary"}
            onClick={() => setTab("games")}
          >
            Games
          </Button>
          <Button
            size="sm"
            variant={tab === "skins" ? "primary" : "secondary"}
            onClick={() => setTab("skins")}
          >
            Wallpapers
          </Button>
        </div>
        {tab === "games" ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={game === "snake" ? "primary" : "secondary"}
                onClick={() => setGame("snake")}
              >
                Snake
              </Button>
              <Button
                size="sm"
                variant={game === "memory" ? "primary" : "secondary"}
                onClick={() => setGame("memory")}
              >
                Memory
              </Button>
            </div>
            {game === "snake" ? (
              <SnakeGame wallpaper={wallpaper} />
            ) : (
              <MemoryGame wallpaper={wallpaper} />
            )}
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {ARCADE_SKINS.map((skin) => {
              const ownedSkin = ownsSkin(arcade.mask, skin.id);
              const equipped = arcade.wallpaper === skin.id;
              return (
                <li key={skin.id}>
                  <button
                    type="button"
                    onClick={() => onSkinClick(skin.id)}
                    className={`w-full overflow-hidden rounded-lg border text-left ${
                      equipped
                        ? "border-forge-green"
                        : "border-border hover:border-[#3a4440]"
                    }`}
                  >
                    <Atmosphere id={skin.artId} className="aspect-[16/10]" rounded="rounded-none" />
                    <div className="space-y-1 p-3">
                      <p className="text-sm font-medium">{skin.name}</p>
                      <p className="text-xs text-text-muted">
                        {equipped
                          ? "Equipped"
                          : ownedSkin
                            ? "Owned · tap to wear"
                            : `${skin.cost} ${tokenLabel()}`}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <aside className="h-fit space-y-5 rounded-lg border border-border bg-surface-1 p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold">
            {project.nftPrefix} #{tokenId}
          </h2>
          <Badge tone={innerCircle ? "green" : "warning"}>
            {innerCircle ? "Inner circle" : "Locked shop"}
          </Badge>
        </div>
        <Atmosphere id={wallpaper} className="aspect-[16/10]" />
        <p className="text-sm text-text-secondary">{skinById(arcade.wallpaper).name}</p>
        <div className="grid grid-cols-1 gap-3 text-sm">
          <Meta
            label="Seat (principal)"
            value={`${formatTokenAmount(principal)} ${tokenLabel()}`}
          />
          <Meta
            label="Spendable surplus"
            value={`${formatTokenAmount(spendable)} ${tokenLabel()}`}
          />
          <Meta
            label="Wallet"
            value={isConnected ? `${formatTokenAmount(wallet)} ${tokenLabel()}` : "—"}
          />
        </div>
        {!innerCircle ? (
          <p className="text-sm text-warning">
            Keep genesis {tokenLabel()} in the NFT Account to buy wallpapers.
            Games still play.
          </p>
        ) : null}
        {tab === "skins" && innerCircle && isOwner && !canPay ? (
          <p className="text-sm text-text-secondary">
            Need {cost} {tokenLabel()} in this wallet. Harvest, then withdraw
            surplus from the{" "}
            <Link href={accountPath(tokenId)} className="text-forge-green">
              NFT Account
            </Link>
            .
          </p>
        ) : null}
        {tab === "skins" && isOwner && innerCircle && !approved ? (
          <Button className="w-full" onClick={sendApprove} disabled={!canPay}>
            Approve {tokenLabel()} for skins
          </Button>
        ) : null}
        <Link href={accountPath(tokenId)} className="block text-sm text-forge-green">
          Open NFT Account →
        </Link>
      </aside>

      <ConnectModal open={connectOpen} onClose={() => setConnectOpen(false)} />
      <TransactionModal
        tx={tx}
        completeTitle={
          tx.action.startsWith("Buy")
            ? "Wallpaper unlocked"
            : tx.action.startsWith("Wear")
              ? "Wallpaper equipped"
              : "Approved"
        }
        completeBody={
          tx.action.startsWith("Buy")
            ? `${cost} ${tokenLabel()} left circulation. This seat’s wallpaper updated.`
            : tx.action.startsWith("Wear")
              ? "Collection cards and games use this wallpaper."
              : `Arcade can take ${tokenLabel()} for wallpaper skins.`
        }
        completeLabel="Done"
        onComplete={() => undefined}
      />
    </div>
  );
}

function Header({ tokenId }: { tokenId?: string }) {
  return (
    <header className="space-y-2">
      <p className="text-xs font-semibold tracking-wide text-text-muted">ARCADE</p>
      <h1 className="text-[32px] font-semibold leading-10">Arcade</h1>
      {tokenId ? (
        <p className="text-sm text-text-muted">
          <Link href="/arcade/" className="hover:text-text-primary">
            Arcade
          </Link>
          <span className="px-2">/</span>
          {project.nftPrefix} #{tokenId}
        </p>
      ) : null}
    </header>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-0.5 tabular font-medium">{value}</p>
    </div>
  );
}

export function ArcadeView() {
  return (
    <Suspense fallback={<p className="text-sm text-text-muted">Loading arcade…</p>}>
      <ArcadeInner />
    </Suspense>
  );
}
