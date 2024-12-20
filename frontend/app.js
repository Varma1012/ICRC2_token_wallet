// Replace with your canister ID
// Define the canister ID for the Token Wallet contract
const canisterId = 'bkyz2-fmaaa-aaaaa-qaaaq-cai';

// Create a connection to the canister
const { Actor, HttpAgent } = window.ic.agent;
const agent = new HttpAgent({ host: 'https://ic0.app' });
agent.fetchRootKey();  // Fetch the root key to verify the connection

// Define the interface for the Token Wallet contract
const tokenWalletInterface = [
    ["get_balance", ["Principal"], "Nat"],
    ["total_supply", [], "Nat"],
    ["name", [], "Text"],
    ["symbol", [], "Text"],
    ["decimals", [], "Nat"],
    ["transfer", ["Principal", "Nat"], "Result"],
    ["mint", ["Nat"], "Result"]
];

// Actor interface for interacting with the TokenWallet canister
const tokenWalletActor = Actor.createActor(tokenWalletInterface, {
    agent,
    canisterId
});

// Display the current account (assumes it's the caller)
async function displayAccount() {
    const account = await window.ic.plug.getPrincipal();  // Get the current user's principal
    document.getElementById("account").innerText = account.toString();
}

// Query the balance of the current account
async function queryBalance() {
    const account = await window.ic.plug.getPrincipal();
    const balance = await tokenWalletActor.get_balance(account);
    document.getElementById("balance").innerText = `Balance: ${balance.toString()}`;
}

// Query the total supply of tokens
async function queryTotalSupply() {
    const totalSupply = await tokenWalletActor.total_supply();
    document.getElementById("total-supply").innerText = `Total Supply: ${totalSupply.toString()}`;
}

// Query and display token information
async function queryTokenInfo() {
    const name = await tokenWalletActor.name();
    const symbol = await tokenWalletActor.symbol();
    const decimals = await tokenWalletActor.decimals();

    document.getElementById("token-name").innerText = `Token Name: ${name}`;
    document.getElementById("token-symbol").innerText = `Token Symbol: ${symbol}`;
    document.getElementById("decimals").innerText = `Decimals: ${decimals.toString()}`;
}

// Handle the transfer of tokens
async function transferTokens() {
    const recipientPrincipal = document.getElementById("transfer-to").value;
    const amount = parseInt(document.getElementById("transfer-amount").value);

    try {
        const recipient = Principal.fromText(recipientPrincipal);  // Convert recipient principal to Principal object
        const result = await tokenWalletActor.transfer(recipient, amount);
        if (result.ok) {
            document.getElementById("transfer-result").innerText = "Transfer successful!";
            queryBalance(); // Update balance after transfer
        } else {
            document.getElementById("transfer-result").innerText = `Error: ${result.err}`;
        }
    } catch (error) {
        document.getElementById("transfer-result").innerText = `Error: ${error.message}`;
    }
}

// Handle minting new tokens
async function mintTokens() {
    const amount = parseInt(document.getElementById("mint-amount").value);
    try {
        const result = await tokenWalletActor.mint(amount);
        if (result.ok) {
            document.getElementById("mint-result").innerText = "Minting successful!";
            queryBalance(); // Update balance after minting
        } else {
            document.getElementById("mint-result").innerText = `Error: ${result.err}`;
        }
    } catch (error) {
        document.getElementById("mint-result").innerText = `Error: ${error.message}`;
    }
}

// Handle receiving tokens (simply querying balance)
async function receiveTokens() {
    const account = await window.ic.plug.getPrincipal();
    const balance = await tokenWalletActor.get_balance(account);
    document.getElementById("receive-result").innerText = `Your current balance is: ${balance.toString()}`;
}

// Fetch initial data when the page loads
window.onload = async function() {
    await displayAccount();  // Show the user's principal ID
    await queryBalance();     // Display the balance of the user's account
    await queryTotalSupply(); // Display the total supply of the tokens
    await queryTokenInfo();   // Display the token's name, symbol, and decimals
};
