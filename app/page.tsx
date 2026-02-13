"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useWallet } from "./contexts/WalletContext";
import {
  SorobanRpc,
  TransactionBuilder,
  Networks,
  xdr,
  Address,
  scValToNative,
  Contract,
  Operation,
  nativeToScVal,
} from "@stellar/stellar-sdk";
import { stellar } from "./lib/stellar";
import {
  Target,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Coins,
  DiamondPlus,
} from "lucide-react";

const CONTRACT_ID = "CD2UNSAD6GI5FX7NWFO3IU72E7LNP7OQDGQ4G7VURXY7GFULNBNFLM5J";
const server = new SorobanRpc.Server("https://soroban-testnet.stellar.org:443");
const networkPassphrase = Networks.TESTNET;

export default function Home() {
  const { address: connectedAddress, walletsKit, setAddress } = useWallet();
  const [usdcBalance, setUsdcBalance] = useState("0");
  const [userContribution, setUserContribution] = useState("0");
  const [campaign, setCampaign] = useState({
    state: 2,
    raised: "0",
    target: "10000000",
    deadline: 17775664,
    recipient: "",
  });
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState("0");
  const [txStatus, setTxStatus] = useState<{
    type: "success" | "error" | "pending";
    msg: string;
    hash?: string;
    explorerUrl?: string;
  } | null>(null);
  const [sending, setSending] = useState(false);
  const [loadingCampaign, setLoadingCampaign] = useState(true);

  const progress =
    campaign.target !== "0"
      ? (Number(campaign.raised) / Number(campaign.target)) * 100
      : 0;

  const isRunning = campaign.state === 0;
  const isSuccess = campaign.state === 1;
  const isExpired = campaign.state === 2;

  const getStatusLabel = () => {
    if (isRunning) return "Active";
    if (isSuccess) return "Goal Reached";
    if (isExpired) return "Campaign Ended";
    return "Unknown";
  };

  const handlePreset = (value: number) => {
    setAmount((prev) => {
      const currentAmount = parseFloat(prev) || 0;

      const newAmount = currentAmount + value;

      return newAmount.toFixed(2).replace(/\.00$/, "");
    });
  };

  // Load user XLM balance
  useEffect(() => {
    if (!connectedAddress) return;
    const load = async () => {
      try {
        const { xlm } = await stellar.getBalance(connectedAddress);
        setBalance(xlm);
      } catch {}
    };
    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, [connectedAddress]);

  // load USDC balance
  useEffect(() => {
    if (!connectedAddress) return;

    const loadUsdc = async () => {
      try {
        const response = await fetch(
          `https://horizon-testnet.stellar.org/accounts/${connectedAddress}`
        );
        const data = await response.json();

        if (data.balances) {
          const usdc = data.balances.find(
            (b: any) =>
              b.asset_code === "USDC" &&
              b.asset_issuer ===
                "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
          );

          setUsdcBalance(usdc ? usdc.balance : "0.00");
        }
      } catch (e) {
        console.error("Error fetching USDC balance:", e);
      }
    };

    loadUsdc();
    const iv = setInterval(loadUsdc, 10000);
    return () => clearInterval(iv);
  }, [connectedAddress]);

  const isInsufficient = parseFloat(amount) > parseFloat(usdcBalance);
  const canDeposit = isRunning && amount && !isInsufficient && !sending;

  // Load campaign data from contract
  const loadCampaign = async () => {
    try {
      const sourceAddr =
        connectedAddress ||
        "GDXK7EYVBXTITLBW2ZCODJW3B7VTVCNNNWDDEHKJ7Y67TZVW5VKRRMU6";

      const fetchValue = async (
        method: string,
        args: any[] = [],
        contractId = CONTRACT_ID
      ) => {
        const targetContract = new Contract(contractId);
        const account = await server.getAccount(sourceAddr);
        const tx = new TransactionBuilder(account, {
          fee: "1000",
          networkPassphrase,
        })
          .addOperation(targetContract.call(method, ...args))
          .setTimeout(30)
          .build();
        const sim = await server.simulateTransaction(tx);
        if (SorobanRpc.Api.isSimulationSuccess(sim)) {
          return scValToNative(sim.result!.retval);
        }
        throw new Error(`Failed ${method}`);
      };

      const [state, target, deadline, recipient, tokenAddr] = await Promise.all(
        [
          fetchValue("state"),
          fetchValue("target"),
          fetchValue("deadline"),
          fetchValue("recipient"),
          fetchValue("token"),
        ]
      );

      const raisedRaw = await fetchValue(
        "balance",
        [new Address(CONTRACT_ID).toScVal()],
        tokenAddr.toString()
      );
      const formatAmount = (val: any) => (Number(val) / 1e7).toFixed(2);

      setCampaign({
        state: Number(state),
        raised: formatAmount(raisedRaw),
        target: formatAmount(target),
        deadline: Number(deadline),
        recipient: recipient.toString(),
      });
      setLoadingCampaign(false);
    } catch (err) {
      console.error("Campaign load error:", err);
      setLoadingCampaign(false);
    }
  };

  const loadUserContribution = async () => {
    if (!connectedAddress) {
      setUserContribution("0");
      return;
    }
    try {
      const contract = new Contract(CONTRACT_ID);
      const sourceAddr =
      connectedAddress;
      const account = await server.getAccount(sourceAddr);
      
      const tx = new TransactionBuilder(account, { fee: "1000", networkPassphrase })
        .addOperation(contract.call("balance", new Address(connectedAddress).toScVal()))
        .setTimeout(30)
        .build();
  
      const sim = await server.simulateTransaction(tx);
      if (SorobanRpc.Api.isSimulationSuccess(sim)) {
        const rawValue = scValToNative(sim.result!.retval);
        setUserContribution((Number(rawValue) / 1e7).toFixed(2));
      }
    } catch (e) {
      console.error("Error fetching contribution:", e);
    }
  };

  //  Initial load on mount
  useEffect(() => {
    loadCampaign();
    loadUserContribution();
  }, [connectedAddress]);

  const handleDeposit = async () => {
    if (!connectedAddress || !walletsKit) return;

    setSending(true);
    setTxStatus({ type: "pending", msg: "Preparing transaction..." });

    try {
      const source = await server.getAccount(connectedAddress);
      const amountRaw = BigInt(Math.floor(parseFloat(amount) * 1e7));
      const contract = new Contract(CONTRACT_ID);

      const tx = new TransactionBuilder(source, {
        fee: "10000",
        networkPassphrase,
      })
        .addOperation(
          contract.call(
            "deposit",
            new Address(connectedAddress).toScVal(),
            nativeToScVal(amountRaw, { type: "i128" })
          )
        )
        .setTimeout(30)
        .build();

      const preparedTx = await server.prepareTransaction(tx);
      const { signedTxXdr } = await walletsKit.signTransaction(
        preparedTx.toXDR()
      );

      const sendResponse = await server.sendTransaction(
        TransactionBuilder.fromXDR(signedTxXdr, networkPassphrase)
      );

      if (sendResponse.status === "ERROR")
        throw new Error("Transaction rejected");

      let status: string = sendResponse.status;
      const txHash = sendResponse.hash;

      // Safety counters to prevent infinite loops
      let retryCount = 0;
      const maxRetries = 2;

      while (status !== "SUCCESS" && status !== "FAILED") {
        if (retryCount >= maxRetries) {
          status = "TIMEOUT";
          break;
        }

        await new Promise((r) => setTimeout(r, 2000));
        retryCount++;

        try {
          const txResult = await server.getTransaction(txHash);
          status = txResult.status;
        } catch (e: any) {
          if (
            e.message.includes("union switch") ||
            e.message.includes("switch")
          ) {
            await loadCampaign();

            status = "SUCCESS";
            break;
          }
        }
      }

      if (status === "SUCCESS" || status === "TIMEOUT") {
        setTxStatus({
          type: "success",
          msg:
            status === "TIMEOUT"
              ? "Transaction sent! It may take a moment to reflect."
              : "Deposit successful!",
          hash: txHash,
          explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txHash}`,
        });

        setAmount("");
        await loadCampaign();
        await loadUserContribution();
      } else {
        throw new Error("Transaction failed on-chain.");
      }
    } catch (err: any) {
      setTxStatus({ type: "error", msg: err.message || "Transaction failed" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-5 md:py-2 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* LEFT SIDE: Content & Story */}
        <div className="lg:col-span-7 space-y-8">
          <div className="relative aspect-video rounded-4xl sm:rounded-[3rem] overflow-hidden border border-zinc-800 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop"
              alt="Campaign Hero"
              className="object-cover w-full h-full hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute top-6 left-6">
              <span
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-md border ${
                  isRunning
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-zinc-900/80 text-zinc-400 border-zinc-700"
                }`}
              >
                {getStatusLabel()}
              </span>
            </div>
          </div>

          <div className="space-y-6 px-2">
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-[0.9]">
              THE FUTURE OF <span className="text-cyan-500">ONCHAIN</span>{" "}
              CAPITAL
            </h1>
            <p className="text-zinc-400 text-xl leading-relaxed max-w-2xl">
              Join a global collective powering the next generation of Stellar
              protocols. Our target-locked pools ensure your contribution only
              deploys when the mission is ready for takeoff
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 text-zinc-300 bg-zinc-900/50 px-4 py-2 rounded-2xl border border-zinc-800">
                <CheckCircle2 size={18} className="text-cyan-500" />
                <span className="text-sm font-bold uppercase tracking-tight">
                  Smart Milestone
                </span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300 bg-zinc-900/50 px-4 py-2 rounded-2xl border border-zinc-800">
                <Wallet size={18} className="text-cyan-500" />
                <span className="text-sm font-bold uppercase tracking-tight">
                  USDC Standard
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Stats & Action */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
          {/* Connection Status & Wallet Info */}
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-6">
            {connectedAddress ? (
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">
                    Active Wallet
                  </p>
                  <p className="text-sm font-mono text-cyan-500">
                    {stellar.formatAddress(connectedAddress)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">
                    Balance
                  </p>
                  <p className="text-sm font-bold text-white">
                    {parseFloat(usdcBalance).toFixed(2)} USDC
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-zinc-400 text-sm font-bold italic">
                  Wallet Disconnected
                </p>
                <button
                  onClick={() =>
                    walletsKit.openModal({
                      onWalletSelected: async (option) => {
                        try {
                          const { address } = await walletsKit.getAddress();

                          setAddress(address);
                          return option;
                        } catch (e) {
                          console.error("Failed to connect wallet:", e);
                        }
                      },
                      modalTitle: "Connect Your Wallet",
                    })
                  }
                  className="text-xs bg-cyan-500 text-black font-black px-4 py-2 rounded-full uppercase tracking-tighter hover:bg-cyan-400 transition-colors"
                >
                  Connect Now
                </button>
              </div>
            )}
          </div>

          {/* Campaign Stats Card */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">
                    Total Raised
                  </p>
                  <h2 className="text-5xl font-black text-white">
                    {campaign.raised}
                  </h2>
                </div>
                <p className="text-zinc-500 font-bold mb-1 italic">
                  of {campaign.target} USDC
                </p>
              </div>

              <div className="relative w-full bg-zinc-800 h-4 rounded-full overflow-hidden border border-zinc-700">
                <div
                  className={`h-full transition-all duration-1000 ease-out ${
                    isSuccess
                      ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                      : "bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-black text-white">
                  {progress.toFixed(1)}%
                </span>
                <span className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-1 leading-none">
                  <Clock size={10} /> Deadline:{" "}
                  {new Date(campaign.deadline * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {connectedAddress && (
              <div className="pt-6 border-t border-zinc-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Your Contribution</p>
                  <p className="text-2xl font-black text-white">{userContribution} <span className="text-xs text-zinc-500">USDC</span></p>
                </div>
                <div className="bg-cyan-500/10 p-3 rounded-2xl">
                  <DiamondPlus className="text-cyan-500" size={20} />
                </div>
              </div>
            )}

          {/* Contribution Form - Always Visible, Button logic changes */}
          <div className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-cyan-500/5">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">
                  Amount to Pledge
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-zinc-100 border-none rounded-2xl px-6 py-5 text-3xl font-black text-black focus:ring-4 focus:ring-cyan-500/20 transition-all placeholder:text-zinc-300"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-zinc-400 text-xl tracking-tighter">
                    USDC
                  </span>
                </div>
              </div>

              {connectedAddress ? (
                <button
                  onClick={handleDeposit}
                  disabled={!canDeposit}
                  className="w-full bg-black text-white disabled:bg-zinc-200 disabled:text-zinc-400 font-black py-6 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase text-lg tracking-tighter"
                >
                  {sending ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    `${!isInsufficient ? "Confirm Contribution" : "Insufficient balance"}`
                  )}
                  {!sending && <ArrowUpRight size={22} />}
                </button>
              ) : (
                <button
                  onClick={() =>
                    walletsKit.openModal({
                      onWalletSelected: async (option) => {
                        try {
                          const { address } = await walletsKit.getAddress();

                          setAddress(address);
                          return option;
                        } catch (e) {
                          console.error("Failed to connect wallet:", e);
                        }
                      },
                      modalTitle: "Connect Your Wallet",
                    })
                  }
                  className="w-full bg-cyan-500 text-black font-black py-6 rounded-2xl flex items-center justify-center gap-3 hover:bg-cyan-400 transition-all uppercase text-lg tracking-tighter"
                >
                  Connect Wallet to Pledge
                </button>
              )}
            </div>

            {txStatus && (
              <div
                className={`mt-6 p-4 rounded-2xl text-sm font-bold border animate-in slide-in-from-top-4 ${
                  txStatus.type === "success"
                    ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                    : "bg-rose-50 border-rose-100 text-rose-700"
                }`}
              >
                <p className="flex items-center gap-2">
                  {txStatus.type === "success" ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}
                  {txStatus.msg}
               
                {txStatus.explorerUrl && (
                  <a
                    href={txStatus.explorerUrl}
                    target="_blank"
                    className="underline opacity-80 hover:opacity-100 flex items-center gap-1"
                  >
                    View Transaction <ArrowUpRight size={14} />
                  </a>
                )}
                 </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
