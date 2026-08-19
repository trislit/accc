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
      "0xB740c4bef629d15A4B3058368E6CBC807dbC0357",
    NEXT_PUBLIC_TOKEN:
      process.env.NEXT_PUBLIC_TOKEN ??
      "0x9e73FB99E42C520A305b570159a6f7DD2B227Ac3",
    NEXT_PUBLIC_DISTRIBUTOR:
      process.env.NEXT_PUBLIC_DISTRIBUTOR ??
      "0x3448096b67f3459EE2458c3618Db57a47ca602cD",
    NEXT_PUBLIC_ARCADE:
      process.env.NEXT_PUBLIC_ARCADE ??
      "0xc5bA7541CFB9d4F4f6e131d95acC8f246b86F77b",
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
