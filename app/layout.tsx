import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "./contexts/WalletContext";
import WalletConnection from "./components/WalletConnection";
import { HandCoins } from "lucide-react";

export const metadata: Metadata = {
  title: "CROWDFUND",
  description: "Simple testnet crowdfunding app on Stellar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className=" text-white antialiased">
        <WalletProvider>
          <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-transparent backdrop-blur-md">
              <div className="flex items-center justify-between px-4 py-4">
                {/* Refined Icon-Only Logo */}
                <div className="flex items-center justify-center bg-zinc-900/80 p-2.5 rounded-2xl border border-zinc-800 shadow-xl">
                  <div className="relative h-9 w-9 flex items-center justify-center">
                    {/* Subtle Background Glow */}
                    <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />

                    {/* Professional SVG Icon */}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-7 w-7 relative z-10"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Hexagonal Shield Base */}
                      <path
                        d="M12 2L3.5 7V17L12 22L20.5 17V7L12 2Z"
                        stroke="url(#logo-gradient)"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                      />
                      {/* Center Stellar-esque Spark */}
                      <path
                        d="M12 7V17M7 12H17"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <circle cx="12" cy="12" r="2" fill="white" />

                      <defs>
                        <linearGradient
                          id="logo-gradient"
                          x1="2"
                          y1="2"
                          x2="22"
                          y2="22"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#22d3ee" />
                          <stop offset="1" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                {/* Wallet Section */}
                <div className="flex items-center gap-3">
                  <WalletConnection />
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 sm:p-6 md:p-10">{children}</main>
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
