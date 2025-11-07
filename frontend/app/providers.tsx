"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { RainbowProvider } from "@/hooks/rainbow/useRainbowProvider";
import { InMemoryStorageProvider } from "@/hooks/useInMemoryStorage";
import { RainbowEthersSignerProvider } from "@/hooks/rainbow/useRainbowEthersSigner";
import { initErrorFiltering } from "@/utils/errorFilter";

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  useEffect(() => {
    // Initialize error filtering to suppress expected Analytics SDK errors
    initErrorFiltering();
  }, []);

  return (
    <RainbowProvider>
      <RainbowEthersSignerProvider initialMockChains={{ 31337: "http://localhost:8545" }}>
        <InMemoryStorageProvider>
          {children}
        </InMemoryStorageProvider>
      </RainbowEthersSignerProvider>
    </RainbowProvider>
  );
}


