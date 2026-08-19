export const DEFAULT_ART_ID = "wanderer-775";

export const ARCADE_SKINS = [
  { id: 0, name: "Default seat", artId: "wanderer-775", cost: 0 },
  { id: 1, name: "Ash gate", artId: "gate-12", cost: 10 },
  { id: 2, name: "Origin field", artId: "origin-192", cost: 10 },
  { id: 3, name: "Iron grove", artId: "wanderer-8812", cost: 10 },
  { id: 4, name: "Pale lounge", artId: "dreamer-4821", cost: 10 },
] as const;

export type ArcadeSkin = (typeof ARCADE_SKINS)[number];

export function skinById(id?: number) {
  return ARCADE_SKINS.find((skin) => skin.id === (id ?? 0)) ?? ARCADE_SKINS[0];
}

export function artIdForSkin(id?: number) {
  return skinById(id).artId;
}

export function ownsSkin(mask: number, skinId: number) {
  if (skinId === 0) return true;
  return (mask & (1 << skinId)) !== 0;
}

export function arcadePath(tokenId?: string) {
  return tokenId
    ? `/arcade/?tokenId=${encodeURIComponent(tokenId)}`
    : "/arcade/";
}
