import { formatUnits } from "viem";

export const ARCADE_PLAY_COST = 10;

export const ARCADE_MARKS: Record<number, string> = {
  1: "Handshake",
  2: "Silver handshake",
  3: "Gold handshake",
};

export function arcadeMarkLabel(mark?: number) {
  if (!mark) return undefined;
  return ARCADE_MARKS[mark];
}

export function arcadePath(tokenId?: string) {
  return tokenId
    ? `/arcade/?tokenId=${encodeURIComponent(tokenId)}`
    : "/arcade/";
}

export function asTokenAmount(wei?: bigint) {
  return wei === undefined ? undefined : Number(formatUnits(wei, 18));
}
