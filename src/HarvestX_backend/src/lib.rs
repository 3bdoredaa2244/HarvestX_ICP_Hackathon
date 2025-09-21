use candid::{CandidType, Deserialize, Principal};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, StableBTreeMap, storable::Storable, storable::Bound,
};
use std::cell::RefCell;
use std::borrow::Cow;

use sha2::{Sha224, Digest};
use hex;

mod types;
use types::*;

// Memory management
type Memory = VirtualMemory<DefaultMemoryImpl>;

const USERS_MEMORY_ID: MemoryId = MemoryId::new(0);
const OFFERS_MEMORY_ID: MemoryId = MemoryId::new(1);
const REQUESTS_MEMORY_ID: MemoryId = MemoryId::new(2);
const TRANSACTIONS_MEMORY_ID: MemoryId = MemoryId::new(3);

// NEW memory slots for tokenization & escrow
const BATCHES_MEMORY_ID: MemoryId = MemoryId::new(4);
const SHARES_MEMORY_ID: MemoryId = MemoryId::new(5);
const ESCROW_MEMORY_ID: MemoryId = MemoryId::new(6);

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );

    static USERS: RefCell<StableBTreeMap<Principal, UserProfile, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(USERS_MEMORY_ID)))
    );

    static OFFERS: RefCell<StableBTreeMap<String, InvestmentOffer, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(OFFERS_MEMORY_ID)))
    );

    static REQUESTS: RefCell<StableBTreeMap<String, InvestmentRequest, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(REQUESTS_MEMORY_ID)))
    );

    static TRANSACTIONS: RefCell<StableBTreeMap<String, Transaction, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(TRANSACTIONS_MEMORY_ID)))
    );

    // NEW: store minted batch NFTs (one per offer)
    static BATCHES: RefCell<StableBTreeMap<String, BatchNFT, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(BATCHES_MEMORY_ID)))
    );

    // NEW: shares token info and balances
    // shares_total: token_id -> total supply (u128)
    static SHARES_TOTAL: RefCell<StableBTreeMap<String, u128, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(SHARES_MEMORY_ID)))
    );
    // shares_balances: composite key "token_id|principal" -> balance (u128)
    static SHARES_BALANCES: RefCell<StableBTreeMap<String, u128, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(SHARES_MEMORY_ID)))
    );

    // NEW: escrow subaccounts by request_id -> 32-byte subaccount (hex string)
    static ESCROW_SUBACCOUNTS: RefCell<StableBTreeMap<String, String, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(ESCROW_MEMORY_ID)))
    );
}

// Utility functions
fn get_current_time() -> u64 {
    ic_cdk::api::time()
}

fn generate_id(prefix: &str) -> String {
    format!("{}_{}", prefix, get_current_time())
}

fn get_caller() -> Principal {
    ic_cdk::caller()
}

fn is_authenticated() -> bool {
    // TODO: enable real auth check with Internet Identity
    //get_caller() != Principal::anonymous()
    true
}

// -----------------------------
// NEW TYPES USED (simple helpers)
// -----------------------------

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct DepositInfo {
    pub escrow_canister: Principal,
    pub subaccount_hex: String,
    pub expected_amount_e8s: u128,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct BatchNFT {
    pub id: String,
    pub owner: Principal,
    pub metadata: BatchMetadata,
    pub minted_at: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct BatchMetadata {
    pub product_name: String,
    pub product_type: ProductType,
    pub quality_grade: QualityGrade,
    pub location: String,
    pub harvest_date: String,
    pub total_quantity: u64,
    pub additional: Option<String>,
}

// Implement Storable for BatchNFT so it can be persisted in StableBTreeMap
impl Storable for BatchNFT {
    fn to_bytes(&self) -> Cow<'_, [u8]> {
        let bytes = candid::encode_one(self).expect("encode BatchNFT failed");
        Cow::Owned(bytes)
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        candid::decode_one(&bytes).expect("decode BatchNFT failed")
    }

    // Set as unbounded — change to Bound::Bounded(n) if you want a max size
    const BOUND: Bound = Bound::Unbounded;
}

// -----------------------------
// Existing user management functions
// -----------------------------

#[ic_cdk::query]
fn get_current_user() -> ApiResponse<Option<UserProfile>> {
    if !is_authenticated() {
        return ApiResponse::error("Authentication required".to_string());
    }

    let caller = get_caller();
    let user = USERS.with(|users| users.borrow().get(&caller));

    ApiResponse::success(user)
}

#[ic_cdk::update]
fn register_user(request: RegisterUserRequest) -> ApiResponse<UserProfile> {
    if !is_authenticated() {
        return ApiResponse::error("Authentication required".to_string());
    }

    let caller = get_caller();

    // Check if user already exists
    if USERS.with(|users| users.borrow().contains_key(&caller)) {
        return ApiResponse::error("User already registered".to_string());
    }

    let now = get_current_time();
    let user = UserProfile {
        principal: caller,
        role: request.role,
        display_name: request.display_name,
        email: request.email,
        created_at: now,
        updated_at: now,
    };

    USERS.with(|users| {
        users.borrow_mut().insert(caller, user.clone());
    });

    ApiResponse::success(user)
}

#[ic_cdk::update]
fn update_user_role(principal: Principal, new_role: UserRole) -> ApiResponse<UserProfile> {
    if !is_authenticated() {
        return ApiResponse::error("Authentication required".to_string());
    }

    let caller = get_caller();

    // Check if caller is admin
    if !USERS.with(|users| {
        users
            .borrow()
            .get(&caller)
            .map(|user| matches!(user.role, UserRole::Admin))
            .unwrap_or(false)
    }) {
        return ApiResponse::error("Admin access required".to_string());
    }

    USERS.with(|users| {
        let mut users_map = users.borrow_mut();
        match users_map.get(&principal) {
            Some(mut user) => {
                user.role = new_role;
                user.updated_at = get_current_time();
                users_map.insert(principal, user.clone());
                ApiResponse::success(user)
            }
            None => ApiResponse::error("User not found".to_string()),
        }
    })
}

// -----------------------------
// Offer management functions (modified to mint NFT on create)
// -----------------------------

#[ic_cdk::update]
fn create_agricultural_offer(request: CreateOfferRequest) -> ApiResponse<InvestmentOffer> {
    if !is_authenticated() {
        return ApiResponse::error("Authentication required".to_string());
    }

    let caller = get_caller();

    // Check if user is farmer
    let user_role = USERS.with(|users| users.borrow().get(&caller).map(|user| user.role.clone()));

    match user_role {
        Some(UserRole::Farmer) | Some(UserRole::Admin) => {
            let now = get_current_time();
            let offer_id = generate_id("offer");

            let offer = InvestmentOffer {
                id: offer_id.clone(),
                farmer: caller,
                product_name: request.product_name.clone(),
                product_type: request.product_type.clone(),
                total_quantity: request.total_quantity,
                available_quantity: request.total_quantity, // Initially all available
                price_per_kg: request.price_per_kg,
                description: request.description.clone(),
                harvest_date: request.harvest_date.clone(),
                location: request.location.clone(),
                quality_grade: request.quality_grade.clone(),
                minimum_investment: request.minimum_investment,
                status: OfferStatus::Active,
                created_at: now,
                updated_at: now,
            };

            // store offer
            OFFERS.with(|offers| {
                offers.borrow_mut().insert(offer_id.clone(), offer.clone());
            });

            // Mint a Batch NFT representing this offer
            let batch_id = format!("batch_{}", offer_id);
            let metadata = BatchMetadata {
                product_name: offer.product_name.clone(),
                product_type: offer.product_type.clone(),
                quality_grade: offer.quality_grade.clone(),
                location: offer.location.clone(),
                harvest_date: offer.harvest_date.clone(),
                total_quantity: offer.total_quantity,
                additional: None,
            };
            let nft = BatchNFT {
                id: batch_id.clone(),
                owner: caller,
                metadata,
                minted_at: now,
            };
            BATCHES.with(|b| {
                b.borrow_mut().insert(batch_id.clone(), nft);
            });

            // Create a shares token for this batch:
            // token_id pattern: "shares:batch_<offer_id>"
            let token_id = format!("shares:{}", batch_id);
            let total_shares = offer.total_quantity as u128; // 1 share == 1 kg initially
            SHARES_TOTAL.with(|t| {
                t.borrow_mut().insert(token_id.clone(), total_shares);
            });
            // assign all shares to farmer by default
            let farmer_key = format!("{}|{}", token_id, caller.to_text());
            SHARES_BALANCES.with(|b| {
                b.borrow_mut().insert(farmer_key, total_shares);
            });

            ApiResponse::success(offer)
        }
        Some(_) => ApiResponse::error("Farmer role required".to_string()),
        None => ApiResponse::error("User not found".to_string()),
    }
}

#[ic_cdk::query]
fn get_available_offers() -> ApiResponse<Vec<InvestmentOffer>> {
    let offers = OFFERS.with(|offers| {
        offers
            .borrow()
            .iter()
            .filter(|(_, offer)| matches!(offer.status, OfferStatus::Active))
            .map(|(_, offer)| offer.clone())
            .collect::<Vec<_>>()
    });

    ApiResponse::success(offers)
}

#[ic_cdk::query]
fn get_farmer_offers() -> ApiResponse<Vec<InvestmentOffer>> {
    if !is_authenticated() {
        return ApiResponse::error("Authentication required".to_string());
    }

    let caller = get_caller();
    let offers = OFFERS.with(|offers| {
        offers
            .borrow()
            .iter()
            .filter(|(_, offer)| offer.farmer == caller)
            .map(|(_, offer)| offer.clone())
            .collect::<Vec<_>>()
    });

    ApiResponse::success(offers)
}

#[ic_cdk::query]
fn get_offer_by_id(offer_id: String) -> ApiResponse<Option<InvestmentOffer>> {
    let offer = OFFERS.with(|offers| offers.borrow().get(&offer_id));
    ApiResponse::success(offer)
}

// -----------------------------
// Investment request functions
// -----------------------------

#[ic_cdk::update]
fn create_investment_request(request: CreateInvestmentRequest) -> ApiResponse<InvestmentRequest> {
    if !is_authenticated() {
        return ApiResponse::error("Authentication required".to_string());
    }

    let caller = get_caller();

    // Check if user is investor
    let user_role = USERS.with(|users| users.borrow().get(&caller).map(|user| user.role.clone()));

    match user_role {
        Some(UserRole::Investor) | Some(UserRole::Admin) => {
            // Verify offer exists and is active
            let offer_valid = OFFERS.with(|offers| {
                offers
                    .borrow()
                    .get(&request.offer_id)
                    .map(|offer| {
                        matches!(offer.status, OfferStatus::Active)
                            && offer.available_quantity >= request.requested_quantity
                    })
                    .unwrap_or(false)
            });

            if !offer_valid {
                return ApiResponse::error("Invalid offer or insufficient quantity".to_string());
            }

            let now = get_current_time();
            let request_id = generate_id("req");
            let expires_at = now + (7 * 24 * 60 * 60 * 1_000_000_000); // 7 days in nanoseconds

            let investment_request = InvestmentRequest {
                id: request_id.clone(),
                offer_id: request.offer_id,
                investor: caller,
                requested_quantity: request.requested_quantity,
                offered_price_per_kg: request.offered_price_per_kg,
                total_offered: request.requested_quantity as f64 * request.offered_price_per_kg,
                message: request.message,
                status: RequestStatus::Pending,
                created_at: now,
                updated_at: now,
                expires_at,
            };

            REQUESTS.with(|requests| {
                requests
                    .borrow_mut()
                    .insert(request_id.clone(), investment_request.clone());
            });

            // Prepare escrow subaccount for this request (store subaccount bytes as hex)
            let sub_hex = calculate_subaccount_hex(&request_id);
            ESCROW_SUBACCOUNTS.with(|esc| {
                esc.borrow_mut().insert(request_id.clone(), sub_hex.clone());
            });

            ApiResponse::success(investment_request)
        }
        Some(_) => ApiResponse::error("Investor role required".to_string()),
        None => ApiResponse::error("User not found".to_string()),
    }
}

#[ic_cdk::query]
fn get_requests_for_offer(offer_id: String) -> ApiResponse<Vec<InvestmentRequest>> {
    if !is_authenticated() {
        return ApiResponse::error("Authentication required".to_string());
    }

    let caller = get_caller();

    // Verify caller is the farmer for this offer
    let is_offer_owner = OFFERS.with(|offers| {
        offers
            .borrow()
            .get(&offer_id)
            .map(|offer| offer.farmer == caller)
            .unwrap_or(false)
    });

    if !is_offer_owner {
        return ApiResponse::error("Access denied - not offer owner".to_string());
    }

    let requests = REQUESTS.with(|requests| {
        requests
            .borrow()
            .iter()
            .filter(|(_, req)| req.offer_id == offer_id)
            .map(|(_, req)| req.clone())
            .collect::<Vec<_>>()
    });

    ApiResponse::success(requests)
}

#[ic_cdk::query]
fn get_investor_requests() -> ApiResponse<Vec<InvestmentRequest>> {
    if !is_authenticated() {
        return ApiResponse::error("Authentication required".to_string());
    }

    let caller = get_caller();
    let requests = REQUESTS.with(|requests| {
        requests
            .borrow()
            .iter()
            .filter(|(_, req)| req.investor == caller)
            .map(|(_, req)| req.clone())
            .collect::<Vec<_>>()
    });

    ApiResponse::success(requests)
}

// -----------------------------
// Request response functions (modified flow: ACCEPT -> create transaction & wait for deposit)
// -----------------------------

#[ic_cdk::update]
fn respond_to_investment_request(
    request: RespondToRequestRequest,
) -> ApiResponse<InvestmentRequest> {
    if !is_authenticated() {
        return ApiResponse::error("Authentication required".to_string());
    }

    let caller = get_caller();

    // Get the investment request
    let investment_request = REQUESTS.with(|requests| requests.borrow().get(&request.request_id));

    let mut investment_request = match investment_request {
        Some(req) => req,
        None => return ApiResponse::error("Investment request not found".to_string()),
    };

    // Verify caller is the farmer for this offer
    let is_offer_owner = OFFERS.with(|offers| {
        offers
            .borrow()
            .get(&investment_request.offer_id)
            .map(|offer| offer.farmer == caller)
            .unwrap_or(false)
    });

    if !is_offer_owner {
        return ApiResponse::error("Access denied - not offer owner".to_string());
    }

    // Check if request is still pending
    if !matches!(investment_request.status, RequestStatus::Pending) {
        return ApiResponse::error("Request already processed".to_string());
    }

    let now = get_current_time();

    if request.accept {
        // Accept the request - create transaction and update availability
        investment_request.status = RequestStatus::Accepted;

        let transaction_id = generate_id("txn");
        let transaction = Transaction {
            id: transaction_id.clone(),
            offer_id: investment_request.offer_id.clone(),
            request_id: investment_request.id.clone(),
            farmer: caller,
            investor: investment_request.investor,
            quantity: investment_request.requested_quantity,
            price_per_kg: investment_request.offered_price_per_kg,
            total_amount: investment_request.total_offered,
            status: TransactionStatus::Confirmed,
            created_at: now,
            updated_at: now,
            tokenized_at: None,
        };

        // Update offer availability
        OFFERS.with(|offers| {
            let mut offers_map = offers.borrow_mut();
            if let Some(mut offer) = offers_map.get(&investment_request.offer_id) {
                offer.available_quantity -= investment_request.requested_quantity;
                offer.updated_at = now;

                // Mark as completed if no quantity left
                if offer.available_quantity == 0 {
                    offer.status = OfferStatus::Completed;
                }

                offers_map.insert(investment_request.offer_id.clone(), offer);
            }
        });

        // Store transaction
        TRANSACTIONS.with(|transactions| {
            transactions
                .borrow_mut()
                .insert(transaction_id.clone(), transaction);
        });

        // After acceptance: frontend should call `get_deposit_info(request_id)` to get deposit subaccount info
    } else {
        // Reject the request
        investment_request.status = RequestStatus::Rejected;
    }

    investment_request.updated_at = now;

    // Update the request
    REQUESTS.with(|requests| {
        requests
            .borrow_mut()
            .insert(request.request_id, investment_request.clone());
    });

    ApiResponse::success(investment_request)
}

// -----------------------------
// New: Deposit / Escrow helpers
// -----------------------------

// Helper: create a deterministic 32-byte subaccount from request_id
fn calculate_subaccount_bytes(request_id: &str) -> [u8; 32] {
    let mut out = [0u8; 32];
    // use sha224 to create deterministic bytes
    let mut hasher = Sha224::new();
    hasher.update(request_id.as_bytes());
    let hash_bytes = hasher.finalize(); // 28 bytes
    let copy_len = std::cmp::min(hash_bytes.len(), 32);
    out[..copy_len].copy_from_slice(&hash_bytes[..copy_len]);
    out
}

fn calculate_subaccount_hex(request_id: &str) -> String {
    let bytes = calculate_subaccount_bytes(request_id);
    hex::encode(bytes)
}

/// Returns deposit info: the escrow canister principal (this canister id) and the subaccount hex for the request.
/// Frontend can compute an ICP account identifier: AccountIdentifier::new(escrow_canister_principal, Some(subaccount_bytes))
#[ic_cdk::query]
fn get_deposit_info(request_id: String) -> ApiResponse<DepositInfo> {
    if !is_authenticated() {
        return ApiResponse::error("Authentication required".to_string());
    }

    // Check request exists and caller is the investor who created it
    let caller = get_caller();
    let req_opt = REQUESTS.with(|r| r.borrow().get(&request_id));
    if req_opt.is_none() {
        return ApiResponse::error("Request not found".into());
    }
    let req = req_opt.unwrap();
    if req.investor != caller {
        return ApiResponse::error("Unauthorized - only investor can request deposit info".into());
    }

    // ensure subaccount stored
    let sub_hex = ESCROW_SUBACCOUNTS.with(|esc| {
        let mut esc_map = esc.borrow_mut();
        if let Some(s) = esc_map.get(&request_id) {
            s.clone()
        } else {
            let new_hex = calculate_subaccount_hex(&request_id);
            esc_map.insert(request_id.clone(), new_hex.clone());
            new_hex
        }
    });

    let deposit_info = DepositInfo {
        escrow_canister: ic_cdk::id(),
        subaccount_hex: sub_hex,
        // NOTE: amount in ICP must be computed by frontend or backend and shown in UI.
        // We return the expected_amount here (in ICP e8 units recommended)
        expected_amount_e8s: ((req.total_offered) * 100_000_000f64) as u128,
    };

    ApiResponse::success(deposit_info)
}

// DepositInfo type is defined here; ensure it matches candid

/// settle_request: verifies deposit and mints shares to investor.
/// IMPORTANT: ledger calls are not implemented here because ledger candid differs between local dfx and mainnet.
/// You'll need to wire an inter-canister call to the ledger canister to check the balance of
/// (this_canister_principal, subaccount) and ensure the expected amount has arrived.
/// I left a clear TODO where to put that call. After verifying balance,
/// this function mints shares to the investor and marks the transaction as tokenized.
#[ic_cdk::update]
fn settle_request(request_id: String) -> ApiResponse<Transaction> {
    // This function requires admin/farmer authorization in production. Here we keep it simple.
    if !is_authenticated() {
        return ApiResponse::error("Authentication required".to_string());
    }

    // find request and related transaction
    let req_opt = REQUESTS.with(|r| r.borrow().get(&request_id));
    if req_opt.is_none() {
        return ApiResponse::error("Request not found".into());
    }
    let _req = req_opt.unwrap();

    // find transaction record by matching request_id
    let txn_opt = TRANSACTIONS.with(|t| {
        t.borrow()
            .iter()
            .find(|(_, txn)| txn.request_id == request_id)
            .map(|(_, txn)| txn.clone())
    });
    if txn_opt.is_none() {
        return ApiResponse::error("Transaction not found".into());
    }
    let mut txn = txn_opt.unwrap();

    // retrieve escrow subaccount
    let sub_hex_opt = ESCROW_SUBACCOUNTS.with(|esc| esc.borrow().get(&request_id));
    if sub_hex_opt.is_none() {
        return ApiResponse::error("No escrow account for this request".into());
    }
    let _sub_hex = sub_hex_opt.unwrap();

    // TODO: call ledger canister to query balance for (this_canister, subaccount)
    // Example (pseudo):
    //  let ledger_principal = Principal::from_text("<LEDGER_CANISTER_PRINCIPAL>").unwrap();
    //  let account_id = AccountIdentifier::new(ic_cdk::id(), Some(sub_bytes));
    //  let balance = call ledger's `account_balance` or appropriate method to get balance
    //
    // For now, we cannot perform this call because the ledger candid may not be available.
    // You must replace the logic below with a real ledger check.

    // ----- PLACEHOLDER: assume payment is received (for local testing only) -----
    let payment_received = true; // <<-- Replace with actual ledger check
    // ---------------------------------------------------------------------------

    if !payment_received {
        return ApiResponse::error("Payment not yet received".into());
    }

    // Mint (transfer) shares to investor: token_id derived from batch id of the offer
    // find offer -> batch token id
    let offer_opt = OFFERS.with(|o| o.borrow().get(&txn.offer_id));
    if offer_opt.is_none() {
        return ApiResponse::error("Offer not found".into());
    }
    let offer = offer_opt.unwrap();
    let canonical_batch_id = format!("batch_{}", offer.id);
    let token_id = format!("shares:{}", canonical_batch_id);

    // compute share amount: 1 share per kg by default
    let share_amount: u128 = txn.quantity as u128;

    // update balances
    let investor_key = format!("{}|{}", token_id, txn.investor.to_text());
    SHARES_BALANCES.with(|b| {
        let mut bmap = b.borrow_mut();
        let current = bmap.get(&investor_key).unwrap_or(0u128);
        let farmer_balance = bmap.get(&farmer_key).unwrap_or(0u128);


    });

    // subtract from farmer balance
    let farmer_key = format!("{}|{}", token_id, txn.farmer.to_text());
    SHARES_BALANCES.with(|b| {
        let mut bmap = b.borrow_mut();
        let farmer_balance = bmap.get(&farmer_key).copied().unwrap_or(0u128);
        let new_farmer = if farmer_balance >= share_amount {
            farmer_balance - share_amount
        } else {
            0u128
        };
        bmap.insert(farmer_key.clone(), new_farmer);
    });

    txn.status = TransactionStatus::Tokenized;
    txn.tokenized_at = Some(get_current_time());
    txn.updated_at = get_current_time();

    // persist transaction
    TRANSACTIONS.with(|t| {
        t.borrow_mut().insert(txn.id.clone(), txn.clone());
    });

    ApiResponse::success(txn)
}

// -----------------------------
// Transaction functions (unchanged)
// -----------------------------

#[ic_cdk::query]
fn get_farmer_transactions() -> ApiResponse<Vec<Transaction>> {
    if !is_authenticated() {
        return ApiResponse::error("Authentication required".to_string());
    }

    let caller = get_caller();
    let transactions = TRANSACTIONS.with(|transactions| {
        transactions
            .borrow()
            .iter()
            .filter(|(_, txn)| txn.farmer == caller)
            .map(|(_, txn)| txn.clone())
            .collect::<Vec<_>>()
    });

    ApiResponse::success(transactions)
}

#[ic_cdk::query]
fn get_investor_transactions() -> ApiResponse<Vec<Transaction>> {
    if !is_authenticated() {
        return ApiResponse::error("Authentication required".to_string());
    }

    let caller = get_caller();
    let transactions = TRANSACTIONS.with(|transactions| {
        transactions
            .borrow()
            .iter()
            .filter(|(_, txn)| txn.investor == caller)
            .map(|(_, txn)| txn.clone())
            .collect::<Vec<_>>()
    });

    ApiResponse::success(transactions)
}

// -----------------------------
// Admin functions (unchanged)
// -----------------------------

#[ic_cdk::query]
fn get_all_users() -> ApiResponse<Vec<UserProfile>> {
    if !is_authenticated() {
        return ApiResponse::error("Authentication required".to_string());
    }

    let caller = get_caller();

    // Check if caller is admin
    let is_admin = USERS.with(|users| {
        users
            .borrow()
            .get(&caller)
            .map(|user| matches!(user.role, UserRole::Admin))
            .unwrap_or(false)
    });

    if !is_admin {
        return ApiResponse::error("Admin access required".to_string());
    }

    let users = USERS.with(|users| {
        users
            .borrow()
            .iter()
            .map(|(_, user)| user.clone())
            .collect::<Vec<_>>()
    });

    ApiResponse::success(users)
}

#[ic_cdk::query]
fn get_platform_stats() -> ApiResponse<PlatformStats> {
    let stats = PlatformStats {
        total_users: USERS.with(|users| users.borrow().len() as u64),
        total_offers: OFFERS.with(|offers| offers.borrow().len() as u64),
        total_requests: REQUESTS.with(|requests| requests.borrow().len() as u64),
        total_transactions: TRANSACTIONS.with(|transactions| transactions.borrow().len() as u64),
        active_offers: OFFERS.with(|offers| {
            offers
                .borrow()
                .iter()
                .filter(|(_, offer)| matches!(offer.status, OfferStatus::Active))
                .count() as u64
        }),
    };

    ApiResponse::success(stats)
}

// Health check
#[ic_cdk::query]
fn health_check() -> String {
    "HarvestX backend is healthy".to_string()
}

// Export Candid interface
ic_cdk::export_candid!();
