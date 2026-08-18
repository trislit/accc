import { isAddressLike } from "./format";
import type { Address } from "./types";

const DEFAULT_ADMIN =
  "0x3872ff66dF4b9570F4e58FB1234a717dFe1334a9" as Address;

export function adminAddresses(): Address[] {
  const raw = process.env.NEXT_PUBLIC_ADMINS ?? DEFAULT_ADMIN;
  return raw
    .split(/[,\s]+/)
    .map((value) => value.trim())
    .filter(isAddressLike);
}

export function isAdminAddress(address?: string) {
  if (!address) return false;
  const needle = address.toLowerCase();
  return adminAddresses().some((admin) => admin.toLowerCase() === needle);
}
