import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Image from "next/image";
import { Navbar } from "./components/Navbar";

export const metadata: Metadata = {
  title: "Strength Progress Tracker - Encrypted Training Data",
  description: "Privacy-preserving strength training progress tracker using FHE encryption",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`strength-bg text-foreground antialiased`}>
        <div className="fixed inset-0 w-full h-full strength-bg z-[-20] min-w-[850px]"></div>
        <Providers>
          <main className="flex flex-col max-w-screen-lg mx-auto pb-20 min-w-[850px]">
            <Navbar />
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}


