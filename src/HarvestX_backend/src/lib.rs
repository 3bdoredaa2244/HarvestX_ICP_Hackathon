use candid::{Deserialize, Principal};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, StableBTreeMap,
};
use std::cell::RefCell;

mod types;
use types::*;

// Memory management
type Memory = VirtualMemory<DefaultMemoryImpl>;

const USERS_MEMORY_ID: MemoryId = MemoryId::new(0);
const OFFERS_MEMORY_ID: MemoryId = MemoryId::new(1);
const REQUESTS_MEMORY_ID: MemoryId = MemoryId::new(2);
const TRANSACTIONS_MEMORY_ID: MemoryId = MemoryId::new(3);

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
    // Highlighted just for testing
    //get_caller() != Principal::anonymous()
    true
}

// User management functions
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

// Offer management functions
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
                product_name: request.product_name,
                product_type: request.product_type,
                total_quantity: request.total_quantity,
                available_quantity: request.total_quantity, // Initially all available
                price_per_kg: request.price_per_kg,
                description: request.description,
                harvest_date: request.harvest_date,
                location: request.location,
                quality_grade: request.quality_grade,
                minimum_investment: request.minimum_investment,
                status: OfferStatus::Active,
                created_at: now,
                updated_at: now,
            };

            OFFERS.with(|offers| {
                offers.borrow_mut().insert(offer_id, offer.clone());
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

// Investment request functions
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
                    .insert(request_id, investment_request.clone());
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

// Request response functions
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
                .insert(transaction_id, transaction);
        });
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

// Transaction functions
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

// Admin functions
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
