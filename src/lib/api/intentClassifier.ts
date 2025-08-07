// AI Intent Classifier - Determines user intent and routes to appropriate tools
// Following 0rug.com coding guidelines

interface IntentResult {
  intent: string;
  confidence: number;
  parameters: Record<string, any>;
  suggestedTools: string[];
}

interface ToolMapping {
  intent: string;
  primaryTools: string[];
  fallbackTools: string[];
  aiGuidance: string;
}

// Tool mappings for each intent
const TOOL_MAPPINGS: Record<string, ToolMapping> = {
  'token_analysis': {
    intent: 'Analyze token data, price, volume, market cap',
    primaryTools: ['dexscreener', 'jupiter', 'tokenRegistry', 'smartRouter'],
    fallbackTools: ['moralis', 'birdeye'],
    aiGuidance: 'Use DexScreener for price/volume, Jupiter for holder data, TokenRegistry for metadata'
  },
  'lp_lock_check': {
    intent: 'Check if liquidity is locked and for how long',
    primaryTools: ['dexscreener', 'solana', 'tokenRegistry', 'smartRouter'],
    fallbackTools: ['helius', 'raydium'],
    aiGuidance: 'Use DexScreener for LP info, Solana RPC for contract checks, TokenRegistry for pool data'
  },
  'holder_analysis': {
    intent: 'Analyze token holder distribution and whale wallets',
    primaryTools: ['holderAnalysis', 'jupiter', 'solana', 'smartRouter'],
    fallbackTools: ['moralis'],
    aiGuidance: 'Use Jupiter for holder data, Solana RPC for wallet analysis, HolderAnalysis for insights'
  },
  'rug_pull_detection': {
    intent: 'Detect potential rug pull risks and red flags',
    primaryTools: ['rugAnalysis', 'dexscreener', 'solana', 'smartRouter'],
    fallbackTools: ['moralis', 'helius'],
    aiGuidance: 'Use RugAnalysis for risk scoring, DexScreener for market data, Solana RPC for contract analysis'
  },
  'honeypot_detection': {
    intent: 'Check if token is a honeypot (can\'t sell)',
    primaryTools: ['honeypotDetection', 'solana', 'smartRouter'],
    fallbackTools: ['moralis'],
    aiGuidance: 'Use HoneypotDetection for sellability tests, Solana RPC for contract verification'
  },
  'new_token_detection': {
    intent: 'Find newly launched tokens and analyze them',
    primaryTools: ['newTokenDetection', 'dexscreener', 'smartRouter'],
    fallbackTools: ['birdeye'],
    aiGuidance: 'Use NewTokenDetection for recent launches, DexScreener for market data'
  },
  'volume_spike_detection': {
    intent: 'Find tokens with unusual volume spikes',
    primaryTools: ['volumeSpikeDetection', 'dexscreener', 'smartRouter'],
    fallbackTools: ['birdeye'],
    aiGuidance: 'Use VolumeSpikeDetection for spike analysis, DexScreener for volume data'
  },
  'whale_tracking': {
    intent: 'Track large wallet movements and whale activity',
    primaryTools: ['whaleTracking', 'jupiter', 'solana', 'smartRouter'],
    fallbackTools: ['helius', 'moralis'],
    aiGuidance: 'Use WhaleTracking for large transactions, Jupiter for holder data, Solana RPC for wallet analysis'
  },
  'trending_tokens': {
    intent: 'Find trending tokens and hot projects',
    primaryTools: ['dexscreener', 'jupiter', 'smartRouter'],
    fallbackTools: ['birdeye'],
    aiGuidance: 'Use DexScreener for trending data, Jupiter for token lists'
  },
  'educational': {
    intent: 'Provide educational content about crypto trading',
    primaryTools: ['educationalKB'],
    fallbackTools: [],
    aiGuidance: 'Use built-in knowledge base, no external APIs needed'
  },
  'token_metadata': {
    intent: 'Get basic token information (name, symbol, logo)',
    primaryTools: ['tokenRegistry', 'smartRouter'],
    fallbackTools: ['moralis'],
    aiGuidance: 'Use TokenRegistry for metadata, SmartRouter for fallback strategy'
  },
  'risk_scoring': {
    intent: 'Calculate comprehensive risk score for token',
    primaryTools: ['riskScorer', 'dexscreener', 'solana', 'smartRouter'],
    fallbackTools: ['moralis', 'helius'],
    aiGuidance: 'Use RiskScorer for comprehensive risk analysis, DexScreener for market data, Solana RPC for contract verification'
  }
};

// Keywords for intent classification
const INTENT_KEYWORDS = {
  'token_analysis': ['analyze', 'token', 'price', 'volume', 'market cap', 'mcap', 'data', 'info', 'chart'],
  'lp_lock_check': ['lp', 'liquidity', 'locked', 'lock', 'pool', 'liquidity pool', 'locked liquidity'],
  'holder_analysis': ['holders', 'holder', 'distribution', 'whale', 'wallet', 'top holders', 'holder count'],
  'rug_pull_detection': ['rug', 'rugpull', 'rug pull', 'scam', 'risk', 'red flag', 'suspicious', 'safe'],
  'honeypot_detection': ['honeypot', 'honey pot', 'sell', 'sellable', 'can sell', 'sell test'],
  'new_token_detection': ['new', 'launched', 'recent', 'just launched', 'new token', 'fresh'],
  'volume_spike_detection': ['volume', 'spike', 'volume spike', 'unusual volume', 'high volume'],
  'whale_tracking': ['whale', 'large', 'big wallet', 'whale wallet', 'movement', 'track'],
  'trending_tokens': ['trending', 'hot', 'popular', 'trend', 'top', 'best', 'trending tokens'],
  'educational': ['teach', 'learn', 'how to', 'guide', 'tutorial', 'explain', 'what is', 'education'],
  'token_metadata': ['name', 'symbol', 'logo', 'info', 'metadata', 'what is this token'],
  'risk_scoring': ['risk', 'score', 'risk score', 'safety', 'security', 'danger', 'safe', 'unsafe']
};

// Classify user intent from message
export function classifyIntent(message: string): IntentResult {
  const lowerMessage = message.toLowerCase();
  let bestIntent = 'token_analysis'; // Default
  let bestConfidence = 0;
  const parameters: Record<string, any> = {};

  // Extract token address if present - improved regex for Solana addresses
  // This regex matches Solana addresses (base58, 32-44 characters)
  const tokenAddressMatch = message.match(/([1-9A-HJ-NP-Za-km-z]{32,44})/);
  if (tokenAddressMatch) {
    parameters.tokenAddress = tokenAddressMatch[1];
    console.log('Token address extracted:', parameters.tokenAddress);
    // If we found a token address, boost confidence for token analysis
    bestConfidence = 1;
  } else {
    console.log('No token address found in message:', message);
    // Let's also try to find any long alphanumeric string that might be a token address
    const anyLongString = message.match(/([A-Za-z0-9]{30,50})/);
    if (anyLongString) {
      parameters.tokenAddress = anyLongString[1];
      console.log('Alternative token address extracted:', parameters.tokenAddress);
      bestConfidence = 1;
    }
  }

  // Extract wallet address if present
  const walletAddressMatch = lowerMessage.match(/([1-9A-HJ-NP-Za-km-z]{32,44})/);
  if (walletAddressMatch && !parameters.tokenAddress) {
    parameters.walletAddress = walletAddressMatch[1];
  }

  // Classify intent based on keywords
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    let confidence = 0;
    
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        confidence += 1;
      }
    }

    // Boost confidence for exact matches
    if (lowerMessage.includes('rug') || lowerMessage.includes('scam')) {
      confidence += 2;
    }
    if (lowerMessage.includes('lp') && lowerMessage.includes('lock')) {
      confidence += 2;
    }
    if (lowerMessage.includes('holder') || lowerMessage.includes('whale')) {
      confidence += 1.5;
    }

    if (confidence > bestConfidence) {
      bestConfidence = confidence;
      bestIntent = intent;
    }
  }

  // If we have a token address but no specific intent, default to token_analysis
  if (parameters.tokenAddress && bestConfidence === 0) {
    bestIntent = 'token_analysis';
    bestConfidence = 1;
  }

  // Get tool mapping for the intent
  const toolMapping = TOOL_MAPPINGS[bestIntent] || TOOL_MAPPINGS['token_analysis'];

  return {
    intent: bestIntent,
    confidence: bestConfidence,
    parameters,
    suggestedTools: [...toolMapping.primaryTools, ...toolMapping.fallbackTools]
  };
}

// Get AI guidance for specific intent
export function getAIGuidance(intent: string): string {
  const mapping = TOOL_MAPPINGS[intent];
  return mapping ? mapping.aiGuidance : 'Use DexScreener for general token data';
}

// Get tool priority for intent
export function getToolPriority(intent: string): {
  primary: string[];
  fallback: string[];
} {
  const mapping = TOOL_MAPPINGS[intent];
  if (!mapping) {
    return {
      primary: ['dexscreener', 'jupiter', 'smartRouter'],
      fallback: ['moralis', 'birdeye']
    };
  }

  return {
    primary: mapping.primaryTools,
    fallback: mapping.fallbackTools
  };
}

// Check if intent requires paid APIs
export function requiresPaidAPIs(intent: string): boolean {
  const mapping = TOOL_MAPPINGS[intent];
  return mapping ? mapping.fallbackTools.length > 0 : false;
}

// Get response template for intent
export function getResponseTemplate(intent: string, tokenAddress?: string): string {
  const templates = {
    'token_analysis': `I'll analyze ${tokenAddress ? 'this token' : 'the token'} for you. Let me check the price, volume, market cap, and other key metrics...`,
    'lp_lock_check': `I'll check the liquidity pool lock status for ${tokenAddress ? 'this token' : 'the token'}. This will tell us if the liquidity is secure...`,
    'holder_analysis': `I'll analyze the holder distribution for ${tokenAddress ? 'this token' : 'the token'}. This will show us whale wallets and concentration...`,
    'rug_pull_detection': `I'll run a comprehensive rug pull risk assessment for ${tokenAddress ? 'this token' : 'the token'}. This will check for red flags...`,
    'honeypot_detection': `I'll test if ${tokenAddress ? 'this token' : 'the token'} is a honeypot (can't sell). This is crucial for safety...`,
    'new_token_detection': `I'll find recently launched tokens and analyze them for you. Let me check what's new...`,
    'volume_spike_detection': `I'll detect tokens with unusual volume spikes. This could indicate interesting activity...`,
    'whale_tracking': `I'll track large wallet movements and whale activity. This will show us what big players are doing...`,
    'trending_tokens': `I'll find trending tokens and hot projects for you. Let me check what's popular...`,
    'educational': `I'll provide educational content about crypto trading. Let me share some insights...`,
    'token_metadata': `I'll get the basic information for ${tokenAddress ? 'this token' : 'the token'}. Let me fetch the details...`
  };

  return templates[intent as keyof typeof templates] || 'I\'ll help you analyze this. Let me gather the information...';
} 