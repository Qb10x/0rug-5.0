// Dexscreener API Integration
// Following 0rug.com coding guidelines

export interface DexscreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    h24: {
      buys: number;
      sells: number;
    };
    h6: {
      buys: number;
      sells: number;
    };
    h1: {
      buys: number;
      sells: number;
    };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
  };
  priceChange: {
    h24: number;
    h6: number;
    h1: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap?: number;
  pairCreatedAt: number;
  info?: {
    imageUrl?: string;
    websites?: Array<{ url: string }>;
    socials?: Array<{ platform: string; handle: string }>;
  };
  boosts?: {
    active: number;
  };
}

export interface ComprehensiveTokenData {
  basic: {
    name: string;
    symbol: string;
    address: string;
    price: number;
    priceChange24h: number;
    volume24h: number;
    liquidity: number;
    marketCap: number;
    fdv: number;
  };
  risk: {
    rugRiskScore: number;
    liquidityRisk: number;
    volatilityRisk: number;
    overallRiskScore: number;
    riskFactors: string[];
  };
  metrics: {
    buySellRatio: number;
    transactionCount24h: number;
    pairAge: number;
    priceVolatility: number;
  };
  social: {
    hasWebsite: boolean;
    hasSocials: boolean;
    socialCount: number;
  };
}

export interface DexscreenerResponse {
  pairs: DexscreenerPair[];
}

// Comprehensive token analysis - Core function for "Analyze this token"
export const analyzeTokenComprehensive = async (tokenAddress: string): Promise<ComprehensiveTokenData | null> => {
  try {
    const pair = await getDexscreenerTokenData(tokenAddress);
    
    if (!pair) {
      return null;
    }

    // Calculate risk metrics
    const rugRiskScore = calculateRugRiskScore(pair);
    const liquidityRisk = calculateLiquidityRisk(pair);
    const volatilityRisk = calculateVolatilityRisk(pair);
    const overallRiskScore = Math.round((rugRiskScore + liquidityRisk + volatilityRisk) / 3);

    // Calculate additional metrics
    const buySellRatio = pair.txns.h24.buys / Math.max(pair.txns.h24.sells, 1);
    const transactionCount24h = pair.txns.h24.buys + pair.txns.h24.sells;
    const pairAge = Date.now() - pair.pairCreatedAt;
    const priceVolatility = Math.abs(pair.priceChange.h1);

    // Identify risk factors
    const riskFactors = [];
    if (pair.liquidity.usd < 10000) riskFactors.push('Very low liquidity');
    if (pair.volume.h24 > pair.liquidity.usd * 10) riskFactors.push('Suspicious volume/liquidity ratio');
    if (pairAge < 24 * 60 * 60 * 1000) riskFactors.push('Very new token (< 24h)');
    if (pair.priceChange.h24 < -50) riskFactors.push('Recent price crash');
    if (buySellRatio < 0.5) riskFactors.push('More sells than buys');
    if (transactionCount24h < 10) riskFactors.push('Low transaction activity');

    // Social presence
    const hasWebsite = Boolean(pair.info?.websites && pair.info.websites.length > 0);
    const hasSocials = Boolean(pair.info?.socials && pair.info.socials.length > 0);
    const socialCount = (pair.info?.socials?.length || 0) + (hasWebsite ? 1 : 0);

    return {
      basic: {
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
        address: pair.baseToken.address,
        price: parseFloat(pair.priceUsd),
        priceChange24h: pair.priceChange.h24,
        volume24h: pair.volume.h24,
        liquidity: pair.liquidity.usd,
        marketCap: pair.marketCap || pair.fdv,
        fdv: pair.fdv
      },
      risk: {
        rugRiskScore,
        liquidityRisk,
        volatilityRisk,
        overallRiskScore,
        riskFactors
      },
      metrics: {
        buySellRatio,
        transactionCount24h,
        pairAge,
        priceVolatility
      },
      social: {
        hasWebsite,
        hasSocials,
        socialCount
      }
    };
  } catch (error) {
    console.error('Comprehensive token analysis error:', error);
    return null;
  }
};

// Calculate liquidity risk score
const calculateLiquidityRisk = (pair: DexscreenerPair): number => {
  let riskScore = 0;
  
  // Very low liquidity
  if (pair.liquidity.usd < 5000) riskScore += 40;
  else if (pair.liquidity.usd < 25000) riskScore += 25;
  else if (pair.liquidity.usd < 100000) riskScore += 10;
  
  // High volume to liquidity ratio
  const volumeLiquidityRatio = pair.volume.h24 / Math.max(pair.liquidity.usd, 1);
  if (volumeLiquidityRatio > 20) riskScore += 30;
  else if (volumeLiquidityRatio > 10) riskScore += 20;
  else if (volumeLiquidityRatio > 5) riskScore += 10;
  
  return Math.min(riskScore, 100);
};

// Calculate volatility risk score
const calculateVolatilityRisk = (pair: DexscreenerPair): number => {
  let riskScore = 0;
  
  // Extreme price changes
  if (Math.abs(pair.priceChange.h24) > 100) riskScore += 40;
  else if (Math.abs(pair.priceChange.h24) > 50) riskScore += 25;
  else if (Math.abs(pair.priceChange.h24) > 25) riskScore += 15;
  
  // High hourly volatility
  if (Math.abs(pair.priceChange.h1) > 20) riskScore += 30;
  else if (Math.abs(pair.priceChange.h1) > 10) riskScore += 20;
  
  // Low transaction activity
  const totalTxns = pair.txns.h24.buys + pair.txns.h24.sells;
  if (totalTxns < 5) riskScore += 25;
  else if (totalTxns < 20) riskScore += 15;
  
  return Math.min(riskScore, 100);
};

// Get token data from Dexscreener using the correct endpoint
export const getDexscreenerTokenData = async (tokenAddress: string): Promise<DexscreenerPair | null> => {
  try {
    // Use the token-pairs endpoint for Solana
    const response = await fetch(`https://api.dexscreener.com/token-pairs/v1/solana/${tokenAddress}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Dexscreener API error: ${response.status}`);
      return null;
    }

    const data: DexscreenerPair[] = await response.json();
    
    if (!data || data.length === 0) {
      return null;
    }

    // Return the first (most relevant) pair
    return data[0];
  } catch (error) {
    console.error('Dexscreener API error:', error);
    return null;
  }
};

// Get trending tokens for a specific chain
export const getTrendingTokensByChain = async (chainId: string): Promise<DexscreenerPair[]> => {
  try {
    // Chain-specific search queries
    const chainQueries: Record<string, string[]> = {
      'solana': ['USDC', 'RAY', 'SRM', 'ORCA', 'JUP'],
      'bsc': ['BNB', 'BUSD', 'CAKE', 'WBNB'],
      'ethereum': ['ETH', 'USDT', 'USDC', 'WETH'],
      'polygon': ['MATIC', 'USDC', 'WMATIC'],
      'arbitrum': ['ETH', 'USDC', 'ARB'],
      'optimism': ['ETH', 'USDC', 'OP']
    };
    
    const queries = chainQueries[chainId.toLowerCase()] || ['USDC', 'ETH'];
    let allTokens: DexscreenerPair[] = [];
    
    for (const query of queries) {
      try {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${query}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data: DexscreenerResponse = await response.json();
          
          // Filter for specific chain with good volume
          const chainPairs = data.pairs?.filter(pair => 
            pair.chainId.toLowerCase() === chainId.toLowerCase() && 
            pair.volume.h24 > 10000 && 
            pair.liquidity.usd > 50000
          ) || [];
          
          allTokens = [...allTokens, ...chainPairs];
        }
      } catch (error) {
        console.error(`Failed to search for ${query} on ${chainId}:`, error);
      }
    }
    
    // Remove duplicates and sort by volume
    const uniqueTokens = allTokens.filter((token, index, self) => 
      index === self.findIndex(t => t.pairAddress === token.pairAddress)
    );
    
    // Sort by volume and return top results
    const sortedTokens = uniqueTokens.sort((a, b) => b.volume.h24 - a.volume.h24);
    
    return sortedTokens.slice(0, 20); // Return top 20 by volume
  } catch (error) {
    console.error(`Dexscreener ${chainId} trending tokens error:`, error);
    return [];
  }
};

// Get trending Solana tokens (backward compatibility)
export const getTrendingSolanaTokens = async (): Promise<DexscreenerPair[]> => {
  return getTrendingTokensByChain('solana');
};

// Get all supported chains
export const getSupportedChains = (): string[] => {
  return ['solana', 'bsc', 'ethereum', 'polygon', 'arbitrum', 'optimism'];
};

// Get chain display name
export const getChainDisplayName = (chainId: string): string => {
  const chainNames: Record<string, string> = {
    'solana': 'Solana',
    'bsc': 'Binance Smart Chain',
    'ethereum': 'Ethereum',
    'polygon': 'Polygon',
    'arbitrum': 'Arbitrum',
    'optimism': 'Optimism'
  };
  return chainNames[chainId.toLowerCase()] || chainId;
};

// Get multiple tokens by address
export const getMultipleTokensData = async (tokenAddresses: string[]): Promise<DexscreenerPair[]> => {
  try {
    const addresses = tokenAddresses.slice(0, 30).join(','); // Max 30 addresses
    const response = await fetch(`https://api.dexscreener.com/tokens/v1/solana/${addresses}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Dexscreener API error: ${response.status}`);
      return [];
    }

    const data: DexscreenerPair[] = await response.json();
    return data || [];
  } catch (error) {
    console.error('Dexscreener multiple tokens error:', error);
    return [];
  }
};

// Calculate rug risk score based on Dexscreener data
export const calculateRugRiskScore = (pair: DexscreenerPair): number => {
  let riskScore = 0;
  
  // Low liquidity = high risk
  if (pair.liquidity.usd < 10000) riskScore += 30;
  else if (pair.liquidity.usd < 50000) riskScore += 15;
  
  // High volume with low liquidity = suspicious
  if (pair.volume.h24 > pair.liquidity.usd * 10) riskScore += 25;
  
  // Recent pair (less than 24h) = higher risk
  const pairAge = Date.now() - pair.pairCreatedAt;
  if (pairAge < 24 * 60 * 60 * 1000) riskScore += 20;
  
  // Price crash = high risk
  if (pair.priceChange.h24 < -50) riskScore += 25;
  
  return Math.min(riskScore, 100);
};

// Format token data for chat display
export const formatTokenDataForChat = (pair: DexscreenerPair): string => {
  const riskScore = calculateRugRiskScore(pair);
  const riskLevel = riskScore > 70 ? '🔴 High' : riskScore > 40 ? '🟡 Medium' : '🟢 Low';
  
  return `📊 **${pair.baseToken.symbol}** Token Data:
💰 Price: $${parseFloat(pair.priceUsd).toFixed(8)} (${pair.priceChange.h24 > 0 ? '+' : ''}${pair.priceChange.h24.toFixed(2)}%)
📈 24h Volume: $${(pair.volume.h24 / 1000000).toFixed(2)}M
💧 Liquidity: $${(pair.liquidity.usd / 1000000).toFixed(2)}M
🐋 Transactions (24h): ${pair.txns.h24.buys} buys, ${pair.txns.h24.sells} sells
⚠️ Risk Level: ${riskLevel} (${riskScore}/100)
🔗 Chart: [View on Dexscreener](${pair.url})`;
}; 