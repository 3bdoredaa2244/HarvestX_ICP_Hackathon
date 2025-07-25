use candid::{CandidType, Deserialize, Principal};
use ic_cdk::{query, update};
use std::cell::RefCell;

// Basic types without external dependencies
#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct CreateTokenArgs {
    pub token_name: String,
    pub token_symbol: String,
    pub token_logo: String,
    pub initial_supply: u64,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Account {
    pub owner: Principal,
    pub subaccount: Option<Vec<u8>>,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct TokenConfiguration {
    pub token_name: String,
    pub token_symbol: String,
    pub token_logo: String,
    pub transfer_fee: u64,
    pub decimals: u8,
    pub minting_account: Option<Account>,
    pub token_created: bool,
    pub initial_supply: u64,
    pub created_at: u64,
}

impl Default for TokenConfiguration {
    fn default() -> Self {
        Self {
            token_name: String::new(),
            token_symbol: String::new(),
            token_logo: String::new(),
            transfer_fee: 10_000,
            decimals: 8,
            minting_account: None,
            token_created: false,
            initial_supply: 0,
            created_at: 0,
        }
    }
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Transaction {
    pub tx_type: String,
    pub from: Option<Account>,
    pub to: Option<Account>,
    pub amount: u64,
    pub timestamp: u64,
    pub memo: Option<String>,
}

// Simple state management without stable structures
pub struct State {
    pub configuration: TokenConfiguration,
    pub transactions: Vec<Transaction>,
}

thread_local! {
    static STATE: RefCell<State> = RefCell::new(State {
        configuration: TokenConfiguration::default(),
        transactions: Vec::new(),
    });
}

// Convenience methods for state management
pub fn read_state<R>(f: impl FnOnce(&State) -> R) -> R {
    STATE.with(|cell| f(&cell.borrow()))
}

pub fn mutate_state<R>(f: impl FnOnce(&mut State) -> R) -> R {
    STATE.with(|cell| f(&mut cell.borrow_mut()))
}

// Record transaction function - simplified
fn record_transaction(tx: Transaction) -> u64 {
    mutate_state(|state| {
        let idx = state.transactions.len();
        state.transactions.push(tx);
        idx as u64
    })
}

#[update]
fn create_token(args: CreateTokenArgs) -> Result<String, String> {
    // Check if token already exists
    if read_state(|state| state.configuration.token_created) {
        return Err("Token already created".to_string());
    }

    let caller = ic_cdk::api::caller();
    let current_time = ic_cdk::api::time();

    let minting_account = Account {
        owner: caller,
        subaccount: None,
    };

    // Create initial mint transaction
    let init_transaction = Transaction {
        tx_type: "mint".to_string(),
        from: None, // Minting has no from account
        to: Some(minting_account.clone()),
        amount: args.initial_supply,
        timestamp: current_time,
        memo: Some("Initial token creation".to_string()),
    };

    // Record the transaction
    record_transaction(init_transaction);

    // Update configuration
    mutate_state(|state| {
        state.configuration = TokenConfiguration {
            token_name: args.token_name,
            token_symbol: args.token_symbol,
            token_logo: args.token_logo,
            transfer_fee: 10_000, // Default fee
            decimals: 8,
            minting_account: Some(minting_account),
            token_created: true,
            initial_supply: args.initial_supply,
            created_at: current_time,
        };
    });

    Ok("Token created successfully".to_string())
}

#[query]
fn token_created() -> bool {
    read_state(|state| state.configuration.token_created)
}

#[query]
fn get_token_info() -> TokenConfiguration {
    read_state(|state| state.configuration.clone())
}

#[query]
fn get_transactions() -> Vec<Transaction> {
    read_state(|state| state.transactions.clone())
}

#[query]
fn get_transaction_count() -> u64 {
    read_state(|state| state.transactions.len() as u64)
}

// Optional: Helper function to check if caller is token creator
#[query]
fn is_token_creator() -> bool {
    let caller = ic_cdk::api::caller();
    read_state(|state| {
        if let Some(minting_account) = &state.configuration.minting_account {
            minting_account.owner == caller
        } else {
            false
        }
    })
}

ic_cdk::export_candid!();
