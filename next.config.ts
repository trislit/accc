import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID ?? "46630",
    NEXT_PUBLIC_NFT:
      process.env.NEXT_PUBLIC_NFT ??
      "0xdcbC12c8ebe5cD0E24B414F51283F7afE0d35cA5",
    NEXT_PUBLIC_TOKEN:
      process.env.NEXT_PUBLIC_TOKEN ??
      "0xc153e32f7f0dBe3131FECcC598a1EA57C64c5A99",
    NEXT_PUBLIC_DISTRIBUTOR:
      process.env.NEXT_PUBLIC_DISTRIBUTOR ??
      "0x56deD1a8d70893113Cff4289e204B142d4ce5eDA",
    NEXT_PUBLIC_ARCADE:
      process.env.NEXT_PUBLIC_ARCADE ??
      "0x50a79A2f412a84f82EDF49379192eD266E6a3Eae",
    NEXT_PUBLIC_TBA_IMPLEMENTATION:
      process.env.NEXT_PUBLIC_TBA_IMPLEMENTATION ??
      "0x8A0455E86536F57323866ed13c26febAb8ae3049",
    NEXT_PUBLIC_TBA_REGISTRY:
      process.env.NEXT_PUBLIC_TBA_REGISTRY ??
      "0x000000006551c19487814612e58FE06813775758",
  },
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
