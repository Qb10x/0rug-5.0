# 🚀 Jupiter Referral Program Setup Guide

## **💰 How to Earn Referral Fees from Jupiter**

### **Step 1: Create Your Jupiter Referral Account**

1. **Install Jupiter Referral SDK:**
   ```bash
   npm install @jup-ag/referral-sdk
   npm install @solana/web3.js@1
   ```

2. **Initialize Your Referral Account:**
   ```typescript
   import { ReferralProvider } from "@jup-ag/referral-sdk";
   import { Connection, Keypair, PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";

   const connection = new Connection("https://api.mainnet-beta.solana.com");
   const provider = new ReferralProvider(connection);
   const projectPubKey = new PublicKey('DkiqsTrw1u1bYFumumC7sCG2S8K25qc2vemJFHyW2wJc'); // Jupiter Ultra Project

   async function initReferralAccount() {
     const transaction = await provider.initializeReferralAccountWithName({
       payerPubKey: wallet.publicKey,
       partnerPubKey: wallet.publicKey,
       projectPubKey: projectPubKey,
       name: "0rug-analytics", // Your project name
     });

     const referralAccount = await connection.getAccountInfo(
       transaction.referralAccountPubKey,
     );

     if (!referralAccount) {
       const signature = await sendAndConfirmTransaction(connection, transaction.tx, [wallet]);
       console.log('Referral account created:', transaction.referralAccountPubKey.toBase58());
     }
   }
   ```

### **Step 2: Set Up Token Accounts for Fee Collection**

```typescript
async function initReferralTokenAccount() {
  const mint = new PublicKey("So11111111111111111111111111111111111111112"); // SOL
  
  const transaction = await provider.initializeReferralTokenAccountV2({
    payerPubKey: wallet.publicKey,
    referralAccountPubKey: new PublicKey("YOUR_REFERRAL_ACCOUNT_PUBKEY"),
    mint,
  });
  
  const signature = await sendAndConfirmTransaction(connection, transaction.tx, [wallet]);
  console.log('Token account created for SOL fees');
}
```

### **Step 3: Integrate with Your Trading Page**

Update your trading page to include referral fees:

```typescript
// In your trading page
const getQuote = async () => {
  const amount = parseFloat(inputAmount) * Math.pow(10, 9);
  const slippageBps = slippage * 100;
  
     // Include platformFeeBps for referral fees
   const url = `https://quote-api.jup.ag/v6/quote?inputMint=${inputToken}&outputMint=${outputToken}&amount=${amount}&slippageBps=${slippageBps}&platformFeeBps=100`;
  
  const response = await fetch(url);
  const quoteData = await response.json();
  
  // Use the quote in your swap
  const swapRequest = {
    quoteResponse: quoteData,
    userPublicKey: userWallet.publicKey,
    wrapAndUnwrapSol: true,
    feeAccount: 'YOUR_REFERRAL_TOKEN_ACCOUNT' // Your referral token account
  };
};
```

### **Step 4: Claim Your Referral Fees**

```typescript
async function claimAllTokens() {
  const transactions = await provider.claimAllV2({
    payerPubKey: wallet.publicKey,
    referralAccountPubKey: new PublicKey("YOUR_REFERRAL_ACCOUNT_PUBKEY"),
  });

  // Send each claim transaction
  for (const transaction of transactions) {
    transaction.sign([wallet]);
    const signature = await sendAndConfirmRawTransaction(connection, transaction.serialize(), [wallet]);
    console.log('Claimed fees:', signature);
  }
}
```

## **🎯 Revenue Model**

 ### **Fee Structure:**
 - **Your Platform Fee:** 1.0% (100 basis points)
 - **Jupiter's Share:** 20% of your fees
 - **Your Net Revenue:** 0.8% of all swaps

 ### **Example Revenue:**
 - User swaps $1000 worth of tokens
 - Your fee: $10 (1.0%)
 - Jupiter's share: $2 (20% of your fee)
 - Your net revenue: $8

## **🔧 Integration Steps**

1. **Replace Demo Mode:** Update the trading page to use real wallet integration
2. **Add Wallet Connection:** Integrate with Phantom, Solflare, or other Solana wallets
3. **Set Up Referral Account:** Run the initialization scripts above
4. **Test with Small Amounts:** Start with small swaps to verify fee collection
5. **Monitor Earnings:** Set up a dashboard to track your referral earnings

## **📊 Expected Revenue**

 Based on Jupiter's volume:
 - **Daily Volume:** ~$50M
 - **Your 1.0% Fee:** $500,000 daily potential
 - **Conservative Estimate:** 0.1% market share = $500 daily
 - **Monthly Revenue:** $15,000+ from referral fees

## **🚨 Important Notes**

1. **Only Initialize Once:** Your referral account should only be created once
2. **Token Accounts:** Create token accounts for tokens you want to collect fees in
3. **Gas Fees:** You'll pay SOL for initializing accounts
4. **Compliance:** Ensure your platform complies with local regulations
5. **User Experience:** Make sure users understand the fee structure

## **🎉 Next Steps**

1. Set up your referral account
2. Integrate real wallet connection
3. Test with small swaps
4. Monitor fee collection
5. Scale your platform!

**Ready to start earning referral fees? Let's implement this! 🚀** 