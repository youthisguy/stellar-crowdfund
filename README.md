 # 🚀 Soroban Crowdfund Protocol

A decentralized, trustless crowdfunding platform built on the **Stellar Soroban** smart contract engine. This protocol allows creators to raise funds in **USDC** with a "Goal or Nothing" mechanism, ensuring that funds are only released if the campaign target is met, otherwise, they remain secure for contributor protection.

**Level 2 – Blue Belt / Soroban Track Submission**

---

## ✨ Features

* **Smart Contract Governance**: Fully governed by a Soroban Rust contract (No centralized middleman).
* **USDC Standard**: Utilizes the official Circle USDC on Stellar Testnet for stable, real-world value simulation.
* **Trustless Contributions**: Contributions are locked in the contract until the deadline.
* **Real-time Global State**: View campaign progress, total raised, and target status even without a wallet connected.
* **Personal Contribution Tracking**: Users can see their specific pledge balance directly from the contract state.
* **Multi-Wallet Support**: Integrated via `@creit.tech/stellar-wallets-kit` for Freighter, xBull, and more.

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide React.
* **Smart Contracts**: Rust / Soroban SDK.
* **Blockchain**: Stellar Testnet.
* **Tools**: `@stellar/stellar-sdk`, `Soroban RPC`.

---

## 📜 Contract Details

| Field | Value |
| --- | --- |
| **Contract ID** | `CD2UNSAD6GI5FX7NWFO3IU72E7LNP7OQDGQ4G7VURXY7GFULNBNFLM5J` |
| **Network** | Stellar Testnet |
| **Token Asset** | USDC (`GBBD47IF...FLA5`) |
| **Explorer Link** | [View on Stellar Expert](https://www.google.com/search?q=https://stellar.expert/explorer/testnet/contract/CD2UNSAD6GI5FX7NWFO3IU72E7LNP7OQDGQ4G7VURXY7GFULNBNFLM5J) |

---

## 🚀 Getting Started

### 1. Prerequisites

* [Freighter Wallet](https://www.freighter.app/) installed.
* Freighter set to **Testnet** mode.
* Testnet USDC. (Get it from the [Circle Faucet](https://faucet.circle.com/)).

### 2. Installation

```bash
git clone https://github.com/yourusername/soroban-crowdfund.git
cd soroban-crowdfund
npm install

```

### 3. Run Locally

```bash
npm run dev

```

Navigate to `http://localhost:3000`.

---

## ✅ Submission Requirements (Soroban Track)

* [x] **Wallet Integration**: Connect/Disconnect via Freighter.
* [x] **Contract Interaction**: Implements `deposit` and `get_contribution` contract calls.
* [x] **Read-Only Simulation**: Fetches global campaign stats on page load without requiring a signature.
* [x] **Transaction Feedback**: Real-time status updates and clickable Stellar Expert transaction hashes.
* [x] **Verifiable On-Chain**: All logic is handled by the deployed `CONTRACT_ID` provided above.

---

## 📸 Screenshots

### 1. Global Campaign Dashboard

*Real-time progress tracking with automated data fetching on page load.*

### 2. Wallet & Personal Contribution

*User-specific data showing USDC balance and individual contribution amounts.*

### 3. Contract Interaction

*Successful deposit transaction confirmed via Soroban RPC.*

---

## 🔗 Verifiable Transaction

**Successful Deposit Hash:** `[INSERT_YOUR_TX_HASH_HERE]`

*(You can verify this on-chain to see the `deposit` function being invoked with USDC tokens.)*

---