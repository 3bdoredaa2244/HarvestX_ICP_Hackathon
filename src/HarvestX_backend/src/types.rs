use candid::{CandidType, Decode, Deserialize, Encode, Principal};
use ic_stable_structures::storable::{Bound, Storable}; // <-- Remove BoundedStorable
use serde::Serialize;

macro_rules! impl_storable {
    ($t:ty, $max_size:expr) => {
        impl Storable for $t {
            const BOUND: Bound = Bound::Bounded {
                max_size: $max_size,
                is_fixed_size: false,
            };

            fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
                std::borrow::Cow::Owned(candid::Encode!(self).unwrap())
            }

            fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
                candid::Decode!(bytes.as_ref(), $t).unwrap()
            }
        }
    };
}
// User Management
#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub enum UserRole {
    Admin,
    Farmer,
    Investor,
    Guest,
}

#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub struct UserProfile {
    pub principal: Principal,
    pub role: UserRole,
    pub display_name: String,
    pub email: String,
    pub created_at: u64,
    pub updated_at: u64,
}

// Investment Offers
#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub struct InvestmentOffer {
    pub id: String,
    pub farmer: Principal,
    pub product_name: String,
    pub product_type: ProductType,
    pub total_quantity: u64,
    pub available_quantity: u64,
    pub price_per_kg: f64,
    pub description: String,
    pub harvest_date: String,
    pub location: String,
    pub quality_grade: QualityGrade,
    pub minimum_investment: u64,
    pub status: OfferStatus,
    pub created_at: u64,
    pub updated_at: u64,
}

#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub enum ProductType {
    Grains,
    Fruits,
    Vegetables,
    Nuts,
    Herbs,
    Legumes,
    Other(String),
}

#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub enum QualityGrade {
    Premium,
    Grade1,
    Grade2,
    Standard,
    Organic,
    Certified(String),
}

#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub enum OfferStatus {
    Active,
    Completed,
    Cancelled,
    Expired,
}

// Investment Requests
#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub struct InvestmentRequest {
    pub id: String,
    pub offer_id: String,
    pub investor: Principal,
    pub requested_quantity: u64,
    pub offered_price_per_kg: f64,
    pub total_offered: f64,
    pub message: String,
    pub status: RequestStatus,
    pub created_at: u64,
    pub updated_at: u64,
    pub expires_at: u64,
}

#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub enum RequestStatus {
    Pending,
    Accepted,
    Rejected,
    Expired,
    Cancelled,
}

// Transactions
#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub struct Transaction {
    pub id: String,
    pub offer_id: String,
    pub request_id: String,
    pub farmer: Principal,
    pub investor: Principal,
    pub quantity: u64,
    pub price_per_kg: f64,
    pub total_amount: f64,
    pub status: TransactionStatus,
    pub created_at: u64,
    pub updated_at: u64,
    pub tokenized_at: Option<u64>,
}

#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub enum TransactionStatus {
    Confirmed,
    Tokenized,
    Completed,
}

// Request Types
#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub struct RegisterUserRequest {
    pub role: UserRole,
    pub display_name: String,
    pub email: String,
}

#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub struct CreateOfferRequest {
    pub product_name: String,
    pub product_type: ProductType,
    pub total_quantity: u64,
    pub price_per_kg: f64,
    pub description: String,
    pub harvest_date: String,
    pub location: String,
    pub quality_grade: QualityGrade,
    pub minimum_investment: u64,
}

#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub struct CreateInvestmentRequest {
    pub offer_id: String,
    pub requested_quantity: u64,
    pub offered_price_per_kg: f64,
    pub message: String,
}

#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub struct RespondToRequestRequest {
    pub request_id: String,
    pub accept: bool,
}

// Response Types
#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn error(error: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(error),
        }
    }
}

// Platform Statistics
#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub struct PlatformStats {
    pub total_users: u64,
    pub total_offers: u64,
    pub total_requests: u64,
    pub total_transactions: u64,
    pub active_offers: u64,
}
impl_storable!(UserProfile, 1024);
impl_storable!(InvestmentOffer, 2048);
impl_storable!(InvestmentRequest, 1024);
impl_storable!(Transaction, 1024);
impl_storable!(RegisterUserRequest, 512);
impl_storable!(CreateOfferRequest, 1024);
impl_storable!(CreateInvestmentRequest, 512);
impl_storable!(RespondToRequestRequest, 256);
impl_storable!(PlatformStats, 256);
