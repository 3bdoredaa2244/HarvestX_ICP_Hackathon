# 🌾 HarvestX

<div align="center">

**Decentralized Agricultural Investment & Tokenization Platform**

Built on the **Internet Computer Protocol (ICP)**
Empowering Farmers 🌱 | Enabling Investors 💼 | Secured by Blockchain 🔒

[![Internet Computer](https://img.shields.io/badge/Internet%20Computer-29ABE2?style=flat\&logo=internetcomputer\&logoColor=white)](https://internetcomputer.org/)
[![Rust](https://img.shields.io/badge/Rust-000000?style=flat\&logo=rust\&logoColor=white)](https://www.rust-lang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat\&logo=react\&logoColor=61DAFB)](https://reactjs.org/)

</div>

---

HarvestX is a **decentralized agricultural investment platform** built on the Internet Computer (ICP).
It enables **farmers** to tokenize their agricultural products and raise capital, while allowing **investors** to invest in real agricultural assets transparently and securely.

✔️ Farmers can create and manage tokenized offers
✔️ Investors can browse, invest, and track agricultural portfolios
✔️ Escrow settlement ensures **trustless, secure transactions**
✔️ Crops can be tokenized as **Batch NFTs** for transparency & traceability

---

## 🚀 Features

### 👨‍🌾 **Farmer Portal**

* ✅ Create agricultural offers (products, quantity, grade, price)
* ✅ Manage offers and track transactions
* ✅ Respond to investor requests
* ✅ Real-time portfolio monitoring

### 💼 **Investor Portal**

* ✅ Browse available agricultural opportunities
* ✅ Submit investment requests with custom terms
* ✅ Track investment performance and transactions
* ✅ Portfolio analytics dashboard

### 🛡️ **Escrow & Settlement**

* ✅ Secure deposits via ICP Ledger integration
* ✅ Escrow subaccount per request for trustless handling
* ✅ Automated settlement when funds are received
* ✅ Dispute safety through transparent records

### 🪙 **Tokenization**

* ✅ Mint **Batch NFTs** representing agricultural products
* ✅ Metadata includes product type, quality grade, location, harvest date
* ✅ Immutable record of tokenized agricultural assets
* ✅ Lays groundwork for DeFi integration

### 🛠️ **Platform Management**

* ✅ User registration & role-based access control
* ✅ Global statistics dashboard
* ✅ Health check monitoring
* ✅ Transparent, auditable smart contracts

---

## ⚙️ Setup

### Prerequisites

* [DFX SDK](https://internetcomputer.org/docs/current/developer-docs/setup/install/)
* [Node.js](https://nodejs.org/) (v16+)
* [Rust](https://rustup.rs/) (for backend canisters)

### Installation & Deployment

```bash
# Clone the repository
git clone https://github.com/3bdoredaa2244/HarvestX_ICP_Hackathon
cd HarvestX_ICP_Hackathon

# Install frontend dependencies
npm install

# Start local ICP replica
dfx start --background

# Deploy all canisters
dfx deploy
```

### 🌐 Environment Setup

```env
VITE_HARVESTX_BACKEND_CANISTER_ID=your-canister-id
VITE_IC_HOST=http://localhost:4943
VITE_DFX_NETWORK=local
```

---

## 🛠️ API Reference

### 👤 User Management

| Method             | Type   | Description                    | Access        |
| ------------------ | ------ | ------------------------------ | ------------- |
| `register_user`    | Update | Register new user              | Public        |
| `get_current_user` | Query  | Get authenticated user profile | Authenticated |
| `get_all_users`    | Query  | Fetch all users                | Admin         |
| `update_user_role` | Update | Change user role               | Admin         |

### 🌱 Farmer Endpoints

| Method                          | Type   | Description                              | Access |
| ------------------------------- | ------ | ---------------------------------------- | ------ |
| `create_agricultural_offer`     | Update | Create new agricultural investment offer | Farmer |
| `get_farmer_offers`             | Query  | Fetch farmer’s offers                    | Farmer |
| `get_farmer_transactions`       | Query  | Farmer transaction history               | Farmer |
| `respond_to_investment_request` | Update | Accept or reject requests                | Farmer |

### 💰 Investor Endpoints

| Method                      | Type   | Description                   | Access   |
| --------------------------- | ------ | ----------------------------- | -------- |
| `get_available_offers`      | Query  | Browse all active offers      | Public   |
| `create_investment_request` | Update | Submit investment request     | Investor |
| `get_investor_requests`     | Query  | Investor’s submitted requests | Investor |
| `get_investor_transactions` | Query  | Investor transaction history  | Investor |

### 🔒 Escrow & Settlement

| Method             | Type   | Description                                  | Access          |
| ------------------ | ------ | -------------------------------------------- | --------------- |
| `get_deposit_info` | Query  | Get escrow canister + subaccount for deposit | Investor        |
| `settle_request`   | Update | Settle request after deposit confirmation    | Farmer/Platform |

### 🪙 Tokenization

| Method           | Type   | Description                        | Access |
| ---------------- | ------ | ---------------------------------- | ------ |
| `mint_batch_nft` | Update | Mint NFT for agricultural batch    | Farmer |
| NFT Metadata     | Query  | View metadata for tokenized assets | Public |

---

## 🔒 Authentication & Role System

| Role             | Permissions                                   | Description                 |
| ---------------- | --------------------------------------------- | --------------------------- |
| 🔍 **Guest**     | Browse offers only                            | Read-only access            |
| 💼 **Investor**  | Create requests, deposit via escrow           | Full investor functionality |
| 👨‍🌾 **Farmer** | Create offers, respond to requests, mint NFTs | Full farmer functionality   |
| ⚙️ **Admin**     | Manage roles, oversee stats                   | Full platform privileges    |

Authentication via **ICP principals** with **Internet Identity integration**.

---

## 🧪 Testing

### Backend

```bash
cargo test
```

### Frontend

```bash
npm test
```

### Integration

```bash
dfx deploy --network local
npm run test:e2e
```

---

## 🗺️ Roadmap

### ✅ Completed

* Core farmer & investor workflows
* User authentication & role system
* Investment offers & requests
* Transaction system with escrow settlement

### 🔄 In Progress

* 🪙 Batch NFT tokenization
* 💱 Multi-currency support (ICP, ckBTC, USDC)
* 📊 Portfolio analytics

### 🔮 Planned

* 🤝 Decentralized dispute resolution
* 📱 Mobile application
* 🌍 Global expansion & localization
* 🤖 AI-powered risk assessment
* 📈 Advanced analytics dashboard

---

## 👥 Team

* **Eng. AbdulRahmann Redaa** – Co-founder, Software Engineer, Web3 & Blockchain Developer @Bridge.fi
* **Adam Nouman** – Co-founder, Web3 & Blockchain Developer
* **Ali Reda** – Co-founder, CS Student & Backend Developer (ASP.NET), Blockchain Enthusiast
* **Advisor:** Omar Arafa – Technical & Strategic Support

---

<div align="center">

**🌾 Built with ❤️ for the future of sustainable agriculture 🌱**

*Empowering farmers, enabling investors, transforming agriculture*

</div>
