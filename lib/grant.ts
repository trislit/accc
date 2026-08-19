export const DEFAULT_GENESIS_GRANT = 1000;

export function isSpecialGrant(amount?: number, fallback = DEFAULT_GENESIS_GRANT) {
  return (amount ?? 0) > fallback + 1e-9;
}
