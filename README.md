# 🌾 HarvestX

<div align="center">

**Decentralized Agricultural Investment Platform**

Built on Internet Computer Protocol (ICP)

[![Internet Computer](https://img.shields.io/badge/Internet%20Computer-29ABE2?style=flat&logo=internetcomputer&logoColor=white)](https://internetcomputer.org/)
[![Rust](https://img.shields.io/badge/Rust-000000?style=flat&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)

</div>

---

HarvestX is a decentralized agricultural investment platform built on the Internet Computer (ICP). It enables farmers to tokenize their agricultural products and allows investors to invest in these assets transparently and securely.


Farmers can create agricultural offers, investors can request allocations, and the platform manages transactions, requests, and tokenized assets.


## 🚀 Features

### 👨‍🌾 **Farmer Portal**
- ✅ Create agricultural offers (products, quantity, grade, price)
- ✅ Manage offers and track transactions
- ✅ Respond to investor requests
- ✅ Real-time portfolio monitoring

### 💼 **Investor Portal**
- ✅ Browse available agricultural opportunities
- ✅ Send investment requests with custom terms
- ✅ Track investment performance and transactions
- ✅ Portfolio analytics dashboard

### 🛠️ **Platform Management**
- ✅ User registration & role-based access control
- ✅ Global statistics dashboard
- ✅ Health check monitoring
- ✅ Transaction transparency and security

## ⚙️ Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- ![DFX](https://img.shields.io/badge/DFX-SDK-blue) [DFX SDK](https://internetcomputer.org/docs/current/developer-docs/setup/install/)
- ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white) [Node.js](https://nodejs.org/) (v16+)
- ![Rust](https://img.shields.io/badge/Rust-000000?style=flat&logo=rust&logoColor=white) [Rust](https://rustup.rs/) (for backend canisters)

### 🛠️ Installation & Deployment

```bash
# Clone the repository
git clone https://github.com/0xAdaaam/HarvestX
cd HarvestX

# Install frontend dependencies
npm install

# Start local Internet Computer replica
dfx start --background

# Deploy all canisters
dfx deploy
```

### 🌐 Environment Setup

Create a `.env` file in your project root:

```env
VITE_HARVESTX_BACKEND_CANISTER_ID=your-canister-id
VITE_IC_HOST=http://localhost:4943
VITE_DFX_NETWORK=local
```

## 🛠️ API Reference

Below are all backend canister methods as defined in the Candid interface. Authentication is handled via Internet Identity/ICP principals with role-based access control.

### 👤 User Management

| Method | Type | Description | Access |
|--------|------|-------------|--------|
| `register_user` | Update | Register new user with role, email, display name | Public |
| `get_current_user` | Query | Get currently authenticated user profile | Authenticated |
| `get_all_users` | Query | Fetch all registered users | Admin Only |
| `update_user_role` | Update | Update user's role assignment | Admin Only |

### 🌱 Farmer Endpoints

| Method | Type | Description | Access |
|--------|------|-------------|--------|
| `create_agricultural_offer` | Update | Create new agricultural investment offer | Farmer |
| `get_farmer_offers` | Query | Fetch offers created by authenticated farmer | Farmer |
| `get_farmer_transactions` | Query | Fetch farmer's transaction history | Farmer |
| `respond_to_investment_request` | Update | Accept or reject investment requests | Farmer |

### 💰 Investor Endpoints

| Method | Type | Description | Access |
|--------|------|-------------|--------|
| `get_available_offers` | Query | Browse all active investment offers | Public |
| `create_investment_request` | Update | Submit investment request for an offer | Investor |
| `get_investor_requests` | Query | Fetch investor's submitted requests | Investor |
| `get_investor_transactions` | Query | Fetch investor's transaction history | Investor |

### 📦 Offers & Requests

| Method | Type | Description | Access |
|--------|------|-------------|--------|
| `get_offer_by_id` | Query | Get specific offer details by ID | Public |
| `get_requests_for_offer` | Query | Fetch requests for specific offer | Farmer |

### 📊 Platform Analytics

| Method | Type | Description | Access |
|--------|------|-------------|--------|
| `get_platform_stats` | Query | Global platform statistics | Public |
| `health_check` | Query | Platform health status | Public |

## 🔑 Data Models

<details>
<summary><strong>👤 UserProfile</strong></summary>

```rust
UserProfile {
  principal: principal;
  display_name: text;
  email: text;
  role: { Farmer | Investor | Guest | Admin };
  created_at: nat64;
  updated_at: nat64;
}
```
</details>

<details>
<summary><strong>🌱 InvestmentOffer</strong></summary>

```rust
InvestmentOffer {
  id: text;
  product_name: text;
  product_type: { Grains | Fruits | Vegetables | Nuts | Herbs | Legumes };
  quality_grade: { Premium | Organic | Grade1 | Grade2 | Standard };
  price_per_kg: float64;
  total_quantity: nat64;
  available_quantity: nat64;
  minimum_investment: nat64;
  location: text;
  harvest_date: text;
  description: text;
  farmer: principal;
  status: { Active | Cancelled | Completed | Expired };
  created_at: nat64;
  updated_at: nat64;
}
```
</details>

<details>
<summary><strong>💼 InvestmentRequest</strong></summary>

```rust
InvestmentRequest {
  id: text;
  offer_id: text;
  investor: principal;
  requested_quantity: nat64;
  offered_price_per_kg: float64;
  message: text;
  status: { Pending | Accepted | Rejected | Cancelled | Expired };
  created_at: nat64;
  updated_at: nat64;
  expires_at: nat64;
  total_offered: float64;
}
```
</details>

<details>
<summary><strong>🔄 Transaction</strong></summary>

```rust
Transaction {
  id: text;
  offer_id: text;
  request_id: text;
  investor: principal;
  farmer: principal;
  quantity: nat64;
  price_per_kg: float64;
  total_amount: float64;
  status: { Confirmed | Completed | Tokenized };
  created_at: nat64;
  updated_at: nat64;
  tokenized_at: opt nat64;
}
```
</details>

## 🔒 Authentication & Role System

HarvestX implements a comprehensive role-based access control system:

| Role | Permissions | Description |
|------|-------------|-------------|
| 🔍 **Guest** | Browse offers only | Limited read-only access |
| 💼 **Investor** | Create requests, view transactions | Full investor functionality |
| 👨‍🌾 **Farmer** | Create offers, manage requests | Full farmer functionality |
| ⚙️ **Admin** | Full platform access | Administrative privileges |

> **Authentication**: Secured via ICP principals with Internet Identity integration

## 🧪 Testing

### Backend Tests
```bash
# Run Rust canister tests
cargo test

# Run with coverage
cargo test --coverage
```

### Frontend Tests
```bash
# Run React component tests
npm test

# Run with coverage
npm run test:coverage
```

### Integration Tests
```bash
# Deploy to local testnet
dfx deploy --network local

# Run end-to-end tests
npm run test:e2e
```

## 🚀 Deployment

### Local Development
```bash
# Start local replica
dfx start --clean

# Deploy all canisters
dfx deploy
```

### Production Deployment
```bash
# Deploy to IC mainnet (requires cycles)
dfx deploy --network ic --with-cycles 1000000000000
```

## 🗺️ Roadmap

### ✅ **Completed**
- [x] Core platform functionality
- [x] User registration and authentication
- [x] Offer creation and management
- [x] Investment request system
- [x] Transaction processing

### 🔄 **In Progress**
- [ ] 🪙 **Tokenization** with ICP ledger integration
- [ ] 💱 **Multi-currency** support (ICP, ckBTC, USDC)
- [ ] 🏆 **Reputation system** for farmers and investors

### 🔮 **Planned**
- [ ] 🤝 **Decentralized dispute resolution**
- [ ] 📱 **Mobile application**
- [ ] 🌍 **Global expansion** and localization
- [ ] 🤖 **AI-powered** risk assessment
- [ ] 📈 **Advanced analytics** dashboard



## 🏆 Acknowledgments

- [Internet Computer](https://internetcomputer.org/) for providing the blockchain infrastructure
- [DFINITY Foundation](https://dfinity.org/) for development tools and support
- Agricultural communities worldwide for inspiration and feedback
- Open source contributors and the ICP ecosystem

---

<div align="center">

**🌾 Built with ❤️ for the future of sustainable agriculture 🌱**

[![GitHub stars](https://img.shields.io/github/stars/0xAdaaam/HarvestX?style=social)](https://github.com/0xAdaaam/HarvestX/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/0xAdaaam/HarvestX?style=social)](https://github.com/0xAdaaam/HarvestX/network/members)

*Empowering farmers, enabling investors, transforming agriculture*

</div>
