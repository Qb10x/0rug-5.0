# 🔑 MemeBot Chat - API Setup Guide

## 📋 Required API Keys

### 🤖 AI APIs (Required for Chat Functionality)

#### 1. Kimi K2 API
- **Purpose**: Token personality and conversational responses
- **Get Key**: [Kimi API Documentation](https://kimi.com/api)
- **Usage**: Generates engaging, personality-driven responses

#### 2. DeepSeek API  
- **Purpose**: Security analysis and market insights
- **Get Key**: [DeepSeek API Documentation](https://platform.deepseek.com/)
- **Usage**: Professional analysis and risk assessment

### 🌐 Free Data Sources (No API Keys Required)

#### ✅ Jupiter API
- **Status**: Ready to use
- **Data**: Token prices, metadata, quotes
- **Rate Limit**: 100 requests/minute

#### ✅ Raydium API
- **Status**: Ready to use  
- **Data**: Pool data, liquidity info
- **Rate Limit**: 50 requests/minute

#### ✅ Solana RPC
- **Status**: Ready to use
- **Data**: Contract data, transactions
- **Rate Limit**: 6000 requests/minute

## 🚀 Setup Instructions

### Step 1: Create Environment File
```bash
# Copy the template to .env.local
cp env.template .env.local
```

### Step 2: Add Your API Keys
Edit `.env.local` and replace the placeholder values:

```bash
# AI API Keys (Required)
NEXT_PUBLIC_KIMI_API_KEY=your_actual_kimi_api_key_here
NEXT_PUBLIC_DEEPSEEK_API_KEY=your_actual_deepseek_api_key_here

# Optional: Custom Solana RPC (for better performance)
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### Step 3: Test Configuration
```bash
# Restart the development server
npm run dev

# Test the build
npm run build
```

## 🔧 Configuration Options

### Cache Settings (Optional)
```bash
# Cache TTL in milliseconds
NEXT_PUBLIC_CACHE_TTL_PRICE=30000        # 30 seconds
NEXT_PUBLIC_CACHE_TTL_METADATA=300000    # 5 minutes  
NEXT_PUBLIC_CACHE_TTL_ANALYSIS=600000    # 10 minutes
NEXT_PUBLIC_CACHE_TTL_AI_RESPONSE=900000 # 15 minutes
```

### Development Settings (Optional)
```bash
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_ENABLE_LOGGING=false
```

## 🎯 Ready for API Keys!

**Please provide your API keys when ready:**

1. **Kimi K2 API Key** - For token personality responses
2. **DeepSeek API Key** - For security analysis

Once you provide the keys, I'll help you:
- ✅ Test the API connections
- ✅ Verify the chat functionality  
- ✅ Deploy to production
- ✅ Monitor API usage

**The system is ready to go live!** 🚀 