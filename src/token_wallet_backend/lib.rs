use candid::Principal;
use ic_cdk_macros::{query, update};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use lazy_static::lazy_static;

type Balance = u64;

#[derive(Default)]
struct TokenWallet {
    balances: HashMap<Principal, Balance>,
    total_supply: Balance,
    name: String,
    symbol: String,
    decimals: u8,
}

// Define the static variable using lazy_static
lazy_static! {
    static ref STATE: Mutex<Arc<TokenWallet>> = Mutex::new(Arc::new(TokenWallet::default()));
}

fn get_state() -> Arc<TokenWallet> {
    STATE.lock().unwrap().clone()
}

fn get_state_mut() -> std::sync::MutexGuard<'static, Arc<TokenWallet>> {
    STATE.lock().unwrap()
}

impl TokenWallet {
    fn get_balance(&self, user: Principal) -> Balance {
        *self.balances.get(&user).unwrap_or(&0)
    }

    fn transfer(&mut self, to: Principal, amount: Balance) -> Result<(), String> {
        let sender = ic_cdk::caller();
        let sender_balance = self.get_balance(sender);

        if sender_balance < amount {
            return Err("Insufficient balance".into());
        }

        self.balances.insert(sender, sender_balance - amount);
        let recipient_balance = self.get_balance(to);
        self.balances.insert(to, recipient_balance + amount);

        Ok(())
    }

    fn mint(&mut self, amount: Balance) -> Result<(), String> {
        let caller = ic_cdk::caller();
        let admin = Principal::from_text("your-admin-principal-id").unwrap();

        if caller != admin {
            return Err("Unauthorized minting attempt".into());
        }

        self.total_supply += amount;
        let sender_balance = self.get_balance(caller);
        self.balances.insert(caller, sender_balance + amount);

        Ok(())
    }
}

#[query]
fn get_balance(owner: Principal) -> Balance {
    let wallet = get_state();
    wallet.get_balance(owner)
}

#[query]
fn total_supply() -> Balance {
    let wallet = get_state();
    wallet.total_supply
}

#[query]
fn name() -> String {
    let wallet = get_state();
    wallet.name.clone()
}

#[query]
fn symbol() -> String {
    let wallet = get_state();
    wallet.symbol.clone()
}

#[query]
fn decimals() -> u8 {
    let wallet = get_state();
    wallet.decimals
}

#[update]
fn transfer(to: Principal, amount: Balance) -> Result<(), String> {
    let mut wallet = get_state_mut();
    let mut wallet_ref = Arc::get_mut(&mut wallet).unwrap();
    wallet_ref.transfer(to, amount)
}

#[update]
fn mint(amount: Balance) -> Result<(), String> {
    let mut wallet = get_state_mut();
    let mut wallet_ref = Arc::get_mut(&mut wallet).unwrap();
    wallet_ref.mint(amount)
}

