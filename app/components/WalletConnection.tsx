"use client";

import { useState, useEffect } from "react";
import { stellar } from "../lib/stellar";
import { FaWallet } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { useWallet } from "../contexts/WalletContext";
import { BiCoinStack } from "react-icons/bi";

export default function WalletConnection() {
  const { address, setAddress, walletsKit } = useWallet();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const handleConnect = async () => {
    try {
      setLoading(true);
      await walletsKit.openModal({
        onWalletSelected: async (option) => {
          walletsKit.setWallet(option.id);
          const { address } = await walletsKit.getAddress();
          setAddress(address);
        },
        onClosed: () => setLoading(false),
      });
    } catch (error: any) {
      console.error("Connection error:", error);
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setAddress(null);
    if (stellar.disconnect) stellar.disconnect();
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

 
  const buttonBaseClass = "font-medium py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-sm text-sm md:text-base w-fit md:w-auto";

  if (!address) {
    return (
      <div className="flex justify-end w-full">
        <button
          onClick={handleConnect}
          disabled={loading}
          className={`bg-white hover:bg-zinc-100 text-black ${buttonBaseClass} disabled:opacity-60`}
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-r-transparent" />
          ) : (
            <FaWallet className="text-black" />
          )}
          {/* Hiding text on mobile for the connect button too */}
          <span className="hidden md:inline">{loading ? "Connecting..." : "Connect Wallet"}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {toast && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 px-5 py-3 rounded-lg shadow-xl text-sm font-medium z-50 whitespace-nowrap bg-zinc-800 text-white border border-zinc-700">
          {toast.message}
        </div>
      )}

      <div className="flex flex-row items-center justify-end gap-2">
        {/* USDC FAUCET */}
        <a
          href="https://faucet.circle.com/"
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonBaseClass} bg-[#2775CA] hover:bg-[#1E5BA3] text-white`}
          title="Get USDC"
        >
          <BiCoinStack size={20} />
          {/* <span className="hidden md:inline">Get USDC</span> */}
        </a>

        {/* DISCONNECT */}
        <button
          onClick={handleDisconnect}
          className={`${buttonBaseClass} bg-rose-600 hover:bg-rose-500 text-white`}
          title="Disconnect"
        >
          <MdLogout size={20} />
          <span className="hidden md:inline">Disconnect</span>
        </button>
      </div>
    </div>
  );
}