"use client";

import { useState, useEffect } from "react";
import { stellar } from "../lib/stellar";
import { FaWallet, FaFaucet } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { useWallet } from "../contexts/WalletContext";

export default function WalletConnection() {
  // 1. Destructure walletsKit and setAddress from the context
  const { address, setAddress, walletsKit } = useWallet();
  const [usdcBalance, setUsdcBalance] = useState("0");
  const [loading, setLoading] = useState(false);
  const [faucetLoading, setFaucetLoading] = useState(false);
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
          console.log("Connected successfully:", address);
        },
        onClosed: (err) => {
          console.log("Modal closed", err);
          setLoading(false);
        },
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

  const handleRequestFaucet = async () => {
    if (!address) return;
    setFaucetLoading(true);

    try {
      const res = await fetch(
        `https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`
      );
      const data = await res.json();

      if (res.ok && data.successful) {
        setToast({
          message: "Success! ~10,000 test XLM added",
          type: "success",
        });
      } else {
        setToast({
          message: data.title || "Failed – rate limit",
          type: "error",
        });
      }
    } catch {
      setToast({ message: "Network error", type: "error" });
    } finally {
      setFaucetLoading(false);
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!address) {
    return (
      <button
        onClick={handleConnect}
        disabled={loading}
        className="w-full bg-white hover:bg-blue-50 text-black font-medium py-3 px-4 rounded-lg transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
      >
        {loading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-r-transparent" />
        ) : (
          <FaWallet className="text-black" />
        )}
        {loading ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  }

  return (
    <div className="rounded-xl relative">
      {toast && (
        <div
          className={`absolute -bottom-14 left-1/2 -translate-x-1/2 px-5 py-3 rounded-lg shadow-xl text-sm font-medium z-50 whitespace-nowrap ${
            toast.type === "success"
              ? "bg-green-800/90 text-green-100 border border-green-600"
              : "bg-red-800/90 text-red-100 border border-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleRequestFaucet}
            disabled={faucetLoading}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
          >
            {faucetLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
            ) : (
              <FaFaucet />
            )}
            Faucet
          </button>

          <button
            onClick={handleDisconnect}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <MdLogout /> Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}
