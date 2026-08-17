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
      "0x3EE8c0c19f6622e6a62f9F04a79cB92444719f71",
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
