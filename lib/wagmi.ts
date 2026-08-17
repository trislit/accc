import { createConfig, http } from "wagmi";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";
import { robinhoodChain, robinhoodTestnet } from "./chain";
import { project } from "./project";

const walletConnectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID;

export const wagmiConfig = createConfig({
  chains: [robinhoodTestnet, robinhoodChain],
  connectors: [
    injected({ target: "metaMask" }),
    coinbaseWallet({ appName: project.name }),
    ...(walletConnectId
      ? [
          walletConnect({
            projectId: walletConnectId,
            showQrModal: true,
          }),
        ]
      : []),
  ],
  transports: {
    [robinhoodTestnet.id]: http(robinhoodTestnet.rpcUrls.default.http[0]),
    [robinhoodChain.id]: http(robinhoodChain.rpcUrls.default.http[0]),
  },
  ssr: true,
});
