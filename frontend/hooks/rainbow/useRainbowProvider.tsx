"use client";

import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider, useAccount, useChainId, useConnect, useDisconnect } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sepolia, hardhat } from "wagmi/chains";
import "@rainbow-me/rainbowkit/styles.css";

// RainbowKit configuration
const config = getDefaultConfig({
  appName: "Strength Progress Tracker",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [hardhat, sepolia],
  ssr: true,
});

const queryClient = new QueryClient();

export interface UseRainbowState {
  provider: ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  accounts: string[] | undefined;
  isConnected: boolean;
  error: Error | undefined;
  connect: () => void;
  disconnect: () => void;
}

function useRainbowInternal(): UseRainbowState {
  const { address, isConnected: wagmiConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [error, setError] = useState<Error | undefined>(undefined);

  const accounts = address ? [address] : undefined;
  const isConnected = wagmiConnected && Boolean(address) && Boolean(chainId);

  // Create EIP-1193 provider from wagmi
  const [provider, setProvider] = useState<ethers.Eip1193Provider | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      setProvider(window.ethereum as ethers.Eip1193Provider);
    } else if (typeof window !== "undefined") {
      // Try to get provider from wagmi
      const getProvider = async () => {
        try {
          const { createConfig, http } = await import("wagmi");
          // Provider will be set by wagmi
        } catch (e) {
          console.error("Failed to initialize provider", e);
        }
      };
      getProvider();
    }
  }, []);

  const handleConnect = () => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };

  return {
    provider,
    chainId,
    accounts,
    isConnected,
    error,
    connect: handleConnect,
    disconnect,
  };
}

const RainbowContext = createContext<UseRainbowState | undefined>(undefined);

interface RainbowProviderProps {
  children: ReactNode;
}

export const RainbowProvider: React.FC<RainbowProviderProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          appInfo={{
            appName: "Strength Progress Tracker",
            // Disable analytics to avoid COEP header conflicts
            // Analytics errors are expected and don't affect core functionality
          }}
        >
          <RainbowProviderInternal>{children}</RainbowProviderInternal>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

const RainbowProviderInternal: React.FC<RainbowProviderProps> = ({ children }) => {
  const state = useRainbowInternal();
  return (
    <RainbowContext.Provider value={state}>
      {children}
    </RainbowContext.Provider>
  );
};

export function useRainbow() {
  const context = useContext(RainbowContext);
  if (context === undefined) {
    throw new Error("useRainbow must be used within a RainbowProvider");
  }
  return context;
}

