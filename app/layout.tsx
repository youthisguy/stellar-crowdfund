import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "./contexts/WalletContext";
import WalletConnection from "./components/WalletConnection";
import { HandCoins } from 'lucide-react';
 


export const metadata: Metadata = {
  title: "Tip Jar",
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
    <div className="flex items-center gap-2 bg-[#212121] p-3 rounded-2xl">
      <HandCoins className="h-7 w-7 text-[]" strokeWidth={2} />
      <span className="text-xl font-semibold tracking-tight">CrowdFund</span>
 
    </div>

    <div className="flex items-center gap-3">
      <WalletConnection />
    </div>
  </div>
</header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10">
        {children}
      </main>

    </div>
    </WalletProvider>
  </body>
</html>

  );
}