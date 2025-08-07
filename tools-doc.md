# 🛠️ AI Tools Guide - MemeBot Chat

## 🎯 **Purpose**
This document guides the AI on which tools to use for each task, preventing confusion and ensuring consistent, accurate responses while **staying within free API limits**.

## 💰 **API COST OPTIMIZATION STRATEGY**

### **🟢 FREE APIs (Unlimited) - Use First**
- **DexScreener** - Primary data source for tokens, LP, volume
- **Solana RPC (Free)** - Blockchain data, transactions, contracts
- **Solana ORC (OpenRay Core)** - Direct Raydium AMM v4 access, pool detection, real-time LP monitoring
- **Jupiter Token List** - Comprehensive token metadata, symbols, names
- **Raydium Token List** - Token metadata and LP pairs
- **Web3.js Library** - Direct blockchain interactions
- **Jupiter API** - Holder data, trading information

### **🔵 PAID APIs (1k/day limit) - Use as Fallback Only**
- **Moralis** - Enhanced wallet profiling, token metadata
- **Helius** - Advanced wallet tracking, NFT indexing
- **QuickNode** - Fast RPC, historical data
- **Birdeye** - Real-time volume, transaction patterns

### **📊 API PRIORITY FLOW**
```
1. FREE APIs (DexScreener + Solana RPC + Solana ORC + Jupiter Token List + Raydium Token List)
2. If data incomplete → Use PAID APIs as fallback
3. If all fail → Use ChatGPT built-in knowledge
```

---

## 🚀 **ORC (OPENRAY CORE) TOOLS**

### **🟢 Solana ORC (OpenRay Core) - FREE**
**Purpose:** Direct Raydium AMM v4 access, real-time pool monitoring, LP detection

**Key Features:**
- **Direct Chain Access** - Real-time Raydium AMM v4 data
- **Pool Detection** - New liquidity pool creation monitoring
- **LP Monitoring** - Real-time liquidity pool changes
- **Whale Tracking** - Large LP movements and whale activity
- **Smart RPC Rotation** - Automatic failover between providers

**Use Cases:**
- New token detection via pool creation
- LP lock status monitoring
- Whale LP activity tracking
- Real-time pool data analysis
- Advanced rug pull detection

**AI Guidance:**
```
1. Use ORC for real-time pool and LP data
2. Monitor new pool creations for new tokens
3. Track LP changes for security analysis
4. Use ORC data for enhanced whale tracking
5. Combine with other APIs for comprehensive analysis
```

---

## 📊 **CORE ANALYSIS TOOLS**
**Task:** "Analyze this token" / "Analyze [token address]"

**🟢 FREE Tools (Use First):**
- `@/lib/api/dexscreener.ts` - Token data, price, volume, LP info
- `@/lib/api/jupiter.ts` - Holder distribution data
- `@/lib/api/solana.ts` - Direct blockchain data
- `@/lib/api/ai.ts` - Generate AI summary

**🔵 PAID Fallback (Use Only If Free Fails):**
- `@/lib/api/moralis.ts` - Enhanced token metadata
- `@/lib/api/birdeye.ts` - Real-time volume data

**AI Guidance:**
```
1. Extract token address from user input
2. Call DexScreener API for token data (FREE)
3. Call Jupiter API for holder distribution (FREE)
4. If data incomplete → Try Solana RPC (FREE)
5. If still incomplete → Use Moralis/Birdeye (PAID)
6. Calculate risk metrics using utils
7. Generate AI summary with context
8. Format as interactive card
```

### **🔒 LP Lock Analysis**
**Task:** "Is the LP locked?" / "Check LP lock"

**🟢 FREE Tools (Use First):**
- `@/lib/api/dexscreener.ts` - LP lock status, duration, source
- `@/lib/api/solana.ts` - Direct blockchain LP verification
- `@/lib/api/ai.ts` - Risk assessment

**🔵 PAID Fallback (Use Only If Free Fails):**
- `@/lib/api/helius.ts` - Advanced LP source identification
- `@/lib/api/raydium.ts` - Raydium-specific LP data

**AI Guidance:**
```
1. Extract token address from user input
2. Check LP lock status via DexScreener (FREE)
3. If data incomplete → Try Solana RPC (FREE)
4. If still incomplete → Use Helius (PAID)
5. Verify lock duration and source
6. Calculate security score (0-100)
7. Generate risk assessment
8. Format as security card
```

### **🐋 Holder Analysis**
**Task:** "Who are the top holders?" / "Analyze holder distribution"

**Primary Tools:**
- `@/lib/api/holderAnalysis.ts` - Holder analysis
- `@/lib/api/jupiter.ts` - Holder data
- `@/lib/api/ai.ts` - AI analysis

**Fallback Tools:**
- `@/lib/api/solana.ts` - Direct blockchain data
- `@/lib/api/dexscreener.ts` - Alternative holder data

**AI Guidance:**
```
1. Extract token address from user input
2. Fetch top 10 holders via Jupiter
3. Calculate concentration percentages
4. Identify whale wallets
5. Generate holder distribution analysis
6. Format as data card with charts
```

---

## 🛡️ **SECURITY & SAFETY TOOLS**

### **🚨 Rug Pull Detection**
**Task:** "Is this a rug?" / "Check for rug pull"

**🟢 FREE Tools (Use First):**
- `@/lib/api/rugAnalysis.ts` - Rug pull analysis
- `@/lib/api/dexscreener.ts` - Token data, dev wallet activity
- `@/lib/api/solana.ts` - Direct blockchain analysis
- `@/lib/api/ai.ts` - Risk assessment

**🔵 PAID Fallback (Use Only If Free Fails):**
- `@/lib/api/moralis.ts` - Enhanced wallet profiling
- `@/lib/api/helius.ts` - Advanced wallet tracking

**AI Guidance:**
```
1. Extract token address from user input
2. Analyze dev wallet activity via DexScreener (FREE)
3. Check LP lock status via Solana RPC (FREE)
4. Monitor price manipulation via DexScreener (FREE)
5. Calculate holder concentration via Jupiter (FREE)
6. If data incomplete → Use Moralis/Helius (PAID)
7. Generate risk score (0-100)
8. Format as alert card
```

### **🍯 Honeypot Detection**
**Task:** "Is this a honeypot?" / "Check security score"

**Primary Tools:**
- `@/lib/api/honeypotDetection.ts` - Honeypot analysis
- `@/lib/api/ai.ts` - Security assessment

**Fallback Tools:**
- `@/lib/api/solana.ts` - Direct contract analysis
- `@/lib/api/dexscreener.ts` - Alternative security data

**AI Guidance:**
```
1. Extract token address from user input
2. Test buy/sell functionality
3. Check sell restrictions
4. Analyze blacklist functionality
5. Test transfer fees and limits
6. Generate security score (0-100)
7. Format as security alert card
```

### **📊 Risk Scoring**
**Task:** "What's the risk score?" / "Risk assessment"

**Primary Tools:**
- `@/lib/api/rugAnalysis.ts` - Rug risk
- `@/lib/api/honeypotDetection.ts` - Honeypot risk
- `@/lib/api/holderAnalysis.ts` - Holder risk
- `@/lib/api/ai.ts` - Combined assessment

**Fallback Tools:**
- `@/lib/api/solana.ts` - Direct blockchain analysis
- `@/lib/api/dexscreener.ts` - Market risk data

**AI Guidance:**
```
1. Extract token address from user input
2. Run rug pull analysis
3. Run honeypot detection
4. Run holder analysis
5. Combine all risk factors
6. Generate comprehensive risk score
7. Format as risk assessment card
```

### **💸 Sellability Analysis**
**Task:** "Can I sell this token?" / "Sellability check"

**Primary Tools:**
- `@/lib/api/honeypotDetection.ts` - Sell restrictions
- `@/lib/api/solana.ts` - Direct sell test
- `@/lib/api/ai.ts` - Sellability assessment

**Fallback Tools:**
- `@/lib/api/dexscreener.ts` - Market data
- `@/lib/api/jupiter.ts` - Trading data

**AI Guidance:**
```
1. Extract token address from user input
2. Test sell functionality
3. Check anti-sell mechanisms
4. Identify blacklists
5. Test transaction limits
6. Generate sellability report
7. Format as sellability card
```

---

## 📈 **TRENDING & DISCOVERY TOOLS**

### **🔥 Trending Tokens**
**Task:** "What tokens are trending?" / "Show trending"

**🟢 FREE Tools (Use First):**
- `@/lib/api/dexscreener.ts` - Trending data, volume, price changes
- `@/lib/api/jupiter.ts` - Alternative trending data
- `@/lib/api/ai.ts` - Market analysis

**🔵 PAID Fallback (Use Only If Free Fails):**
- `@/lib/api/birdeye.ts` - Real-time trending data
- `@/lib/api/raydium.ts` - Raydium-specific trending

**AI Guidance:**
```
1. Fetch trending tokens from DexScreener (FREE)
2. If data incomplete → Try Jupiter (FREE)
3. If still incomplete → Use Birdeye (PAID)
4. Filter by volume and price change
5. Generate market analysis
6. Create interactive token cards
7. Add "View Details" and "Trade" buttons
8. Format as trending cards grid
```

### **🆕 New Token Detection**
**Task:** "Show new tokens" / "New launches"

**Primary Tools:**
- `@/lib/api/newTokenDetection.ts` - New token analysis
- `@/lib/api/dexscreener.ts` - Launch data
- `@/lib/api/ai.ts` - Launch assessment

**Fallback Tools:**
- `@/lib/api/solana.ts` - Direct blockchain monitoring
- `@/lib/api/raydium.ts` - Raydium launches

**AI Guidance:**
```
1. Fetch tokens launched in last hour
2. Analyze launch quality (EXCELLENT/GOOD/SUSPICIOUS/POOR)
3. Calculate risk scores
4. Filter by quality and risk
5. Show launch age in minutes
6. Format as new token cards
```

### **📊 Volume Spike Detection**
**Task:** "Volume spike analysis" / "Which token had volume spike?"

**🟢 FREE Tools (Use First):**
- `@/lib/api/volumeSpikeDetection.ts` - Volume analysis
- `@/lib/api/dexscreener.ts` - Volume data, price changes
- `@/lib/api/solana.ts` - Direct volume data
- `@/lib/api/ai.ts` - Spike analysis

**🔵 PAID Fallback (Use Only If Free Fails):**
- `@/lib/api/birdeye.ts` - Real-time volume spikes
- `@/lib/api/raydium.ts` - Raydium volume data

**AI Guidance:**
```
1. Fetch trending tokens from DexScreener (FREE)
2. Calculate volume change percentages (FREE)
3. If data incomplete → Try Solana RPC (FREE)
4. If still incomplete → Use Birdeye (PAID)
5. Identify sudden spikes (MASSIVE/LARGE/MEDIUM/SMALL)
6. Detect patterns (PUMP_AND_DUMP/ORGANIC_GROWTH/MANIPULATION)
7. Calculate risk scores
8. Format as volume spike cards
```

### **🐋 Whale Activity Tracking**
**Task:** "Whale activity today" / "Where are whales buying?"

**Primary Tools:**
- `@/lib/api/whaleTracking.ts` - Whale analysis
- `@/lib/api/dexscreener.ts` - Transaction data
- `@/lib/api/ai.ts` - Whale assessment

**Fallback Tools:**
- `@/lib/api/solana.ts` - Direct transaction monitoring
- `@/lib/api/jupiter.ts` - Large transaction data

**AI Guidance:**
```
1. Fetch trending tokens
2. Simulate/analyze whale activity
3. Classify activity (BUYING/SELLING/LP_ADD/LP_REMOVE/HOLDING)
4. Assess whale reputation (LEGENDARY/EXPERT/PROFICIENT/NOVICE)
5. Calculate market impact
6. Format as whale activity cards
```

---

## 📚 **EDUCATIONAL TOOLS**

### **🎓 Learning Content**
**Task:** "What should I look for in a good token?" / "Teach me how to spot a rugpull"

**Primary Tools:**
- `@/lib/api/ai.ts` - Educational responses
- `@/lib/api/educationalKB.ts` - Knowledge base

**Fallback Tools:**
- Built-in ChatGPT knowledge
- `@/lib/api/dexscreener.ts` - Real examples

**AI Guidance:**
```
1. Identify educational topic from user query
2. Use ChatGPT's built-in knowledge
3. Provide real examples from current market
4. Include actionable checklists
5. Format as educational panel
6. Add visual indicators and examples
```

### **💡 Valuation Analysis**
**Task:** "How do I know if a token is undervalued?" / "Valuation check"

**Primary Tools:**
- `@/lib/api/dexscreener.ts` - Market data
- `@/lib/api/ai.ts` - Valuation analysis
- `@/lib/api/jupiter.ts` - Comparative data

**Fallback Tools:**
- `@/lib/api/solana.ts` - Historical data
- `@/lib/api/raydium.ts` - Raydium metrics

**AI Guidance:**
```
1. Extract token address from user input
2. Gather market data and metrics
3. Compare to similar tokens
4. Analyze valuation ratios
5. Generate AI analysis
6. Format as valuation card with charts
```

### **💧 LP Education**
**Task:** "Explain how LP affects price stability" / "LP analysis"

**Primary Tools:**
- `@/lib/api/ai.ts` - Educational content
- `@/lib/api/dexscreener.ts` - LP data
- `@/lib/api/solana.ts` - LP calculations

**Fallback Tools:**
- Built-in ChatGPT knowledge
- `@/lib/api/raydium.ts` - Raydium LP data

**AI Guidance:**
```
1. Identify LP-related question
2. Use ChatGPT's built-in knowledge
3. Provide real LP examples
4. Include interactive LP calculator
5. Show visual explanations
6. Format as educational panel
```

---

## 🔍 **ADVANCED ANALYSIS TOOLS**

### **👛 Wallet Tracking**
**Task:** "Show all tokens launched by this wallet" / "Track wallet"

**🟢 FREE Tools (Use First):**
- `@/lib/api/solana.ts` - Wallet analysis, transaction history
- `@/lib/api/dexscreener.ts` - Token data, launch history
- `@/lib/api/ai.ts` - Pattern analysis

**🔵 PAID Fallback (Use Only If Free Fails):**
- `@/lib/api/helius.ts` - Advanced wallet tracking
- `@/lib/api/moralis.ts` - Enhanced wallet profiling
- `@/lib/api/quicknode.ts` - Fast RPC for historical data

**AI Guidance:**
```
1. Extract wallet address from user input
2. Track wallet via Solana RPC (FREE)
3. Get token launches via DexScreener (FREE)
4. If data incomplete → Use Helius (PAID)
5. If still incomplete → Use Moralis/QuickNode (PAID)
6. Calculate success rates
7. Generate wallet reputation score
8. Show launch history
9. Format as wallet analysis card
```

### **🔄 Transaction Monitoring**
**Task:** "Track every token this wallet interacted with" / "Wallet interactions"

**Primary Tools:**
- `@/lib/api/solana.ts` - Transaction monitoring
- `@/lib/api/ai.ts` - Pattern analysis
- `@/lib/api/dexscreener.ts` - Token data

**Fallback Tools:**
- `@/lib/api/jupiter.ts` - Alternative transaction data
- `@/lib/api/raydium.ts` - Raydium transactions

**AI Guidance:**
```
1. Extract wallet address from user input
2. Monitor wallet transactions
3. Show interaction timeline
4. Calculate profit/loss
5. Generate trading patterns
6. Format as transaction timeline
```

### **📊 LP Monitoring**
**Task:** "Monitor LP changes in real-time" / "LP changes"

**Primary Tools:**
- `@/lib/api/solana.ts` - LP monitoring
- `@/lib/api/dexscreener.ts` - LP data
- `@/lib/api/ai.ts` - LP analysis

**Fallback Tools:**
- `@/lib/api/raydium.ts` - Raydium LP data
- `@/lib/api/jupiter.ts` - Alternative LP data

**AI Guidance:**
```
1. Extract token address from user input
2. Set up LP monitoring
3. Create LP change alerts
4. Show LP history charts
5. Generate LP analysis
6. Format as LP monitoring card
```

### **🕸️ Wallet Flow Visualization**
**Task:** "Visualize wallet flow between top wallets" / "Wallet connections"

**Primary Tools:**
- `@/lib/api/solana.ts` - Wallet connections
- `@/lib/api/ai.ts` - Network analysis
- `@/lib/api/dexscreener.ts` - Wallet data

**Fallback Tools:**
- `@/lib/api/jupiter.ts` - Alternative wallet data
- `@/lib/api/raydium.ts` - Raydium wallet data

**AI Guidance:**
```
1. Extract token address from user input
2. Create wallet connection map
3. Show fund flow patterns
4. Identify wallet clusters
5. Generate network analysis
6. Format as network visualization
```

---

## 🎯 **AI RESPONSE GUIDANCE**

### **📝 Response Format Standards**

**For Data Cards:**
```
1. Extract relevant data from API
2. Format as compact business card
3. Include key metrics and risk scores
4. Add color-coded indicators
5. Include "View Details" and "Trade" buttons
```

**For Alert Cards:**
```
1. Identify security/threat level
2. Use appropriate color coding (red/yellow/green)
3. Include risk score (0-100)
4. Provide actionable recommendations
5. Add "Learn More" links
```

**For Educational Panels:**
```
1. Identify user experience level
2. Provide step-by-step explanations
3. Include real examples from current market
4. Add visual indicators and checklists
5. Include "Practice" or "Learn More" options
```

### **🤖 Context-Aware Responses**

**Newbie Mode:**
- Use simple language
- Explain basic concepts
- Provide step-by-step guidance
- Include "Learn More" links

**Pro Mode:**
- Include technical analysis
- Show detailed charts
- Provide advanced metrics
- Include API references

**Risk-Averse Mode:**
- Heavy focus on security checks
- Multiple verification steps
- Conservative recommendations
- Detailed risk explanations

**Trend Hunter Mode:**
- Emphasis on volume spikes
- Focus on momentum indicators
- Quick decision guidance
- Risk vs reward analysis

---

## 🔧 **TOOL INTEGRATION RULES**

### **💰 COST OPTIMIZATION STRATEGY**
1. **🟢 FREE APIs First** → DexScreener, Solana RPC, Jupiter, Web3.js
2. **🔵 PAID APIs Last** → Only use if free APIs fail or return incomplete data
3. **Cache Aggressively** → Store results for 3-6 minutes to reduce API calls
4. **Batch Requests** → Combine multiple calls to same API
5. **Monitor Usage** → Track daily API call counts to stay under 1k limits

### **🔄 Fallback Strategy**
1. **🟢 FREE Tool Fails** → Try other free tools
2. **All FREE Tools Fail** → Use PAID APIs as fallback
3. **All APIs Fail** → Use built-in ChatGPT knowledge
4. **No Data Available** → Provide educational content
5. **API Rate Limited** → Use cached data or wait

### **⚡ Performance Optimization**
1. **Cache Results** → Store API responses for 3-6 minutes
2. **Batch Requests** → Combine multiple API calls
3. **Timeout Handling** → Set 3-second timeouts
4. **Error Recovery** → Graceful degradation
5. **Avoid Duplicate Calls** → Check cache before making new requests

### **🎯 Accuracy Standards**
1. **Data Validation** → Verify all inputs
2. **Cross-Reference** → Use multiple sources
3. **Confidence Scoring** → Indicate data reliability
4. **Update Frequency** → Use real-time data when possible
5. **Cost Awareness** → Prioritize free APIs over paid ones

---

## 📋 **QUICK REFERENCE**

### **🔍 Analysis Tasks (🟢 FREE First, 🔵 PAID Fallback):**
- Token Analysis → `dexscreener.ts` + `jupiter.ts` + `solana.ts` + `orc-engine` + `tokenRegistry.ts` + `smartRouter.ts` → `moralis.ts`/`birdeye.ts`
- LP Lock → `dexscreener.ts` + `solana.ts` + `orc-engine` + `tokenRegistry.ts` + `smartRouter.ts` → `helius.ts`/`raydium.ts`
- Holder Analysis → `holderAnalysis.ts` + `jupiter.ts` + `solana.ts` + `orc-engine` + `tokenRegistry.ts` + `smartRouter.ts` → `moralis.ts`
- Rug Detection → `rugAnalysis.ts` + `dexscreener.ts` + `solana.ts` + `orc-engine` + `tokenRegistry.ts` + `smartRouter.ts` → `moralis.ts`/`helius.ts`
- Honeypot → `honeypotDetection.ts` + `solana.ts` + `orc-engine` + `tokenRegistry.ts` + `smartRouter.ts` → `moralis.ts`

### **📈 Discovery Tasks (🟢 FREE First, 🔵 PAID Fallback):**
- Trending → `dexscreener.ts` + `jupiter.ts` + `orc-engine` → `birdeye.ts`/`raydium.ts`
- New Tokens → `newTokenDetection.ts` + `dexscreener.ts` + `solana.ts` + `orc-engine` → `birdeye.ts`
- Volume Spikes → `volumeSpikeDetection.ts` + `dexscreener.ts` + `solana.ts` + `orc-engine` → `birdeye.ts`
- Whale Activity → `whaleTracking.ts` + `dexscreener.ts` + `solana.ts` + `orc-engine` → `helius.ts`

### **📚 Educational Tasks (🟢 FREE Only):**
- Learning → `ai.ts` + `educationalKB.ts` (No API calls needed)
- Valuation → `dexscreener.ts` + `jupiter.ts` + `ai.ts` → `birdeye.ts`
- LP Education → `ai.ts` + `dexscreener.ts` (No paid APIs needed)

### **🔍 Advanced Tasks (🟢 FREE First, 🔵 PAID Fallback):**
- Wallet Tracking → `solana.ts` + `dexscreener.ts` → `helius.ts`/`moralis.ts`/`quicknode.ts`
- Transaction Monitoring → `solana.ts` + `dexscreener.ts` → `helius.ts`/`quicknode.ts`
- LP Monitoring → `solana.ts` + `dexscreener.ts` → `helius.ts`
- Wallet Flow → `solana.ts` + `dexscreener.ts` → `helius.ts`

---

*This guide ensures the AI always uses the right tools for each task! 🚀* 