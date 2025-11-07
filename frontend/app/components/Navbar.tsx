"use client";

import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Navbar() {
  return (
    <nav className="flex w-full px-3 md:px-0 h-fit py-10 justify-between items-center">
      <div className="flex items-center gap-4">
        <Image
          src="/strength-logo.svg"
          alt="Strength Tracker Logo"
          width={60}
          height={60}
        />
        <h1 className="text-2xl font-bold text-white">Strength Progress Tracker</h1>
      </div>
      <div className="flex items-center">
        <ConnectButton />
      </div>
    </nav>
  );
}

