import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "./contexts/WalletContext";
import WalletConnection from "./components/WalletConnection";
import { HandCoins } from 'lucide-react';
 


export const metadata: Metadata = {
  title: "BITFUND: Crowdfund Dapp",
  description: "Simple testnet tipping app on Stellar",
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
      <header className="sticky top-0 z-50 bg-none backdrop-blur">
  <div className="flex items-center justify-between px-6 py-4">
    {/* Logo with tipping icon */}
    <div className="flex items-center gap-3 bg-[#1a1a1a] p-3 rounded-2xl border border-zinc-800">
  <div className="relative h-9 w-9 flex items-center justify-center">
    {/* Background Glow */}
    <div className="absolute inset-0 bg-cyan-500/20 blur-lg rounded-full" />
    
    {/* Custom SVG Logo */}
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      className="h-8 w-8 relative z-10" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M12 2L3 7V17L12 22L21 17V7L12 2Z" 
        stroke="url(#logo-gradient)" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" fill="currentColor" className="text-cyan-500" />
      <path 
        d="M12 8V16M8 12H16" 
        stroke="white" 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="logo-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06b6d4" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  </div>
  
  <span className="text-2xl font-black tracking-tighter text-white uppercase italic">
    Bit<span className="text-cyan-500">Fund</span>
  </span>
</div>

    <div className="flex items-center gap-3">
      <WalletConnection />
    </div>
  </div>
</header>

      {/* Main Content */}
      <main className="flex-1 sm:p-6 md:p-10">
        {children}
      </main>

    </div>
    </WalletProvider>
  </body>
</html>

  );
}