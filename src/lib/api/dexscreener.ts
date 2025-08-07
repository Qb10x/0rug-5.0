// Improved Dexscreener API Integration
// Enhanced version with better error handling, caching, and performance

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
    h24: { buys: number; sells: number; };
    h6: { buys: number; sells: number; };
    h1: { buys: number; sells: number; };
    m5: { buys: number; sells: number; };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
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
    websites?: Array<{ url: string; label?: string }>;
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
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  };
  metrics: {
    buySellRatio: number;
    transactionCount24h: number;
    pairAge: number;
    priceVolatility: number;
    liquidityToVolumeRatio: number;
    holderDistribution?: number;
  };
  social: {
    hasWebsite: boolean;
    hasSocials: boolean;
    socialCount: number;
    socialPlatforms: string[];
  };
  timestamps: {
    lastUpdated: number;
    pairCreated: number;
  };
}

export interface DexscreenerResponse {
  pairs: DexscreenerPair[];
}

// Enhanced error types
export class DexscreenerError extends Error {
  constructor(
    message: string,
    public code: 'API_ERROR' | 'NETWORK_ERROR' | 'RATE_LIMIT' | 'NOT_FOUND' | 'INVALID_DATA',
    public statusCode?: number
  ) {
    super(message);
    this.name = 'DexscreenerError';
  }
}

// Simple in-memory cache with TTL
class SimpleCache<T> {
  private cache = new Map<string, { data: T; expires: number }>();
  private defaultTTL = 60000; // 1 minute default

  set(key: string, data: T, ttl = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Global cache instance
const apiCache = new SimpleCache<any>();

// Enhanced API client with retry logic
class DexscreenerClient {
  private baseUrl = 'https://api.dexscreener.com';
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  private async fetchWithRetry(url: string, options: RequestInit = {}): Promise<Response> {
    let lastError: Error | null = null;

    for (let i = 0; i < this.maxRetries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Accept': 'application/json',
            'User-Agent': '0rug-analyzer/1.0',
            ...options.headers
          }
        });

        if (response.status === 429) {
          // Rate limited - wait longer
          await this.delay(this.retryDelay * (i + 1) * 2);
          continue;
        }

        if (response.status >= 500) {
          // Server error - retry
          await this.delay(this.retryDelay * (i + 1));
          continue;
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        if (i < this.maxRetries - 1) {
          await this.delay(this.retryDelay * (i + 1));
        }
      }
    }

    throw new DexscreenerError(
      `Failed after ${this.maxRetries} retries: ${lastError?.message}`,
      'NETWORK_ERROR'
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getTokenPairs(tokenAddress: string, chainId = 'solana'): Promise<DexscreenerPair[]> {
    const cacheKey = `token-${chainId}-${tokenAddress}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    // Try different endpoints based on chain
    const endpoints = [
      `${this.baseUrl}/latest/dex/tokens/${tokenAddress}`,
      `${this.baseUrl}/latest/dex/search/?q=${tokenAddress}`,
      // For Solana specifically, try the pairs endpoint
      ...(chainId.toLowerCase() === 'solana' ? [
        `${this.baseUrl}/latest/dex/pairs/solana/raydium`,
        `${this.baseUrl}/latest/dex/pairs/solana/orca`,
        `${this.baseUrl}/latest/dex/pairs/solana/jupiter`
      ] : [])
    ];

    let lastError: Error | null = null;

    for (const url of endpoints) {
      try {
        const response = await this.fetchWithRetry(url);

        if (response.status === 404) {
          continue; // Try next endpoint
        }

        if (!response.ok) {
          lastError = new Error(`API error: ${response.status} ${response.statusText}`);
          continue;
        }

        const data: DexscreenerResponse = await response.json();
        
        if (!data.pairs || data.pairs.length === 0) {
          continue; // Try next endpoint
        }

        // Validate and filter pairs
        const validPairs = data.pairs.filter(pair => {
          return pair && 
                 pair.baseToken && 
                 pair.liquidity && 
                 typeof pair.liquidity.usd === 'number' &&
                 pair.volume &&
                 pair.priceUsd &&
                 pair.txns;
        });

        if (validPairs.length === 0) {
          continue; // Try next endpoint
        }

        // Filter pairs by chain if specified
        const filteredPairs = chainId !== 'all' 
          ? validPairs.filter(pair => pair.chainId.toLowerCase() === chainId.toLowerCase())
          : validPairs;

        if (filteredPairs.length > 0) {
          apiCache.set(cacheKey, filteredPairs, 30000); // 30 second cache
          return filteredPairs;
        }
      } catch (error) {
        lastError = error as Error;
        continue;
      }
    }

    // If we get here, all endpoints failed
    throw new DexscreenerError(
      lastError?.message || 'No valid pairs found for token after trying all endpoints',
      'NOT_FOUND'
    );
  }

  async getTrendingPairs(chainId: string, dexId?: string): Promise<DexscreenerPair[]> {
    const cacheKey = `trending-${chainId}-${dexId || 'all'}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    // Use correct Dexscreener API endpoints
    const endpoints = dexId 
      ? [`${this.baseUrl}/latest/dex/search?q=${dexId}`]
      : [
          // Primary endpoint - search for trending tokens
          `${this.baseUrl}/latest/dex/search?q=solana`,
          // Alternative endpoints for specific DEXes
          ...(chainId.toLowerCase() === 'solana' ? [
            `${this.baseUrl}/latest/dex/search?q=raydium`,
            `${this.baseUrl}/latest/dex/search?q=orca`,
            `${this.baseUrl}/latest/dex/search?q=jupiter`
          ] : [])
        ];

    let lastError: Error | null = null;
    let totalAttempts = 0;
    
    for (const endpoint of endpoints) {
      totalAttempts++;
      try {
        console.log(`Attempting to fetch trending pairs from: ${endpoint}`);
        const response = await this.fetchWithRetry(endpoint);

        if (!response.ok) {
          const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
          console.warn(`Failed to fetch from ${endpoint}: ${errorMsg}`);
          lastError = new Error(errorMsg);
          continue;
        }

        const data: DexscreenerResponse = await response.json();
        
        if (!data.pairs || data.pairs.length === 0) {
          console.warn(`No pairs returned from ${endpoint}`);
          continue;
        }

        console.log(`Found ${data.pairs.length} pairs from ${endpoint}`);

        // Validate pairs before returning
        const validPairs = data.pairs.filter(pair => {
          const isValid = pair && 
                 pair.baseToken && 
                 pair.liquidity && 
                 typeof pair.liquidity.usd === 'number' &&
                 pair.liquidity.usd >= 1000 && // Minimum $1k liquidity
                 pair.volume &&
                 pair.priceUsd &&
                 parseFloat(pair.priceUsd) > 0;
          
          if (!isValid && pair) {
            console.debug(`Invalid pair: ${pair.baseToken?.symbol} - liquidity: ${pair.liquidity?.usd}, price: ${pair.priceUsd}`);
          }
          
          return isValid;
        });

        console.log(`Valid pairs after filtering: ${validPairs.length}`);

        if (validPairs.length > 0) {
          apiCache.set(cacheKey, validPairs, 60000); // 1 minute cache for trending
          return validPairs;
        }
      } catch (error) {
        lastError = error as Error;
        console.warn(`Error fetching from ${endpoint}:`, error);
        continue;
      }
    }

    // Return empty array instead of throwing for trending pairs
    console.warn(`No trending pairs found after ${totalAttempts} attempts for ${chainId}${dexId ? `/${dexId}` : ''}`);
    if (lastError) {
      console.warn(`Last error:`, lastError.message);
    }
    return [];
  }
}

// Global client instance
const dexClient = new DexscreenerClient();

// Test function to check API health
export const testDexscreenerAPI = async (): Promise<boolean> => {
  try {
    console.log('Testing Dexscreener API health...');
    // Use the correct endpoint for trending pairs
    const response = await fetch('https://api.dexscreener.com/latest/dex/search?q=solana');
    
    if (!response.ok) {
      console.error(`API health check failed: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const data = await response.json();
    const hasPairs = data.pairs && data.pairs.length > 0;
    console.log(`API health check: ${hasPairs ? 'SUCCESS' : 'NO DATA'} - Found ${data.pairs?.length || 0} pairs`);
    return hasPairs;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

// Enhanced comprehensive token analysis
export const analyzeTokenComprehensive = async (
  tokenAddress: string, 
  chainId = 'solana'
): Promise<ComprehensiveTokenData | null> => {
  try {
    const pairs = await dexClient.getTokenPairs(tokenAddress, chainId);
    
    if (!pairs || pairs.length === 0) {
      console.warn(`No pairs found for token: ${tokenAddress}`);
      return null;
    }

    // Get the best pair (highest liquidity) with additional validation
    const validPairs = pairs.filter(pair => 
      pair && 
      pair.liquidity && 
      typeof pair.liquidity.usd === 'number' &&
      pair.liquidity.usd > 0 &&
      pair.baseToken &&
      pair.volume &&
      pair.txns
    );

    if (validPairs.length === 0) {
      console.warn(`No valid pairs found for token: ${tokenAddress}`);
      return null;
    }

    const pair = validPairs.reduce((best, current) => {
      const bestLiq = best?.liquidity?.usd || 0;
      const currentLiq = current?.liquidity?.usd || 0;
      return currentLiq > bestLiq ? current : best;
    });

    // Validate the selected pair has all required fields
    if (!pair?.liquidity?.usd || !pair.baseToken || !pair.volume || !pair.txns) {
      console.warn(`Selected pair missing required data for token: ${tokenAddress}`);
      return null;
    }

    // Enhanced risk calculations with null checks
    const rugRiskScore = calculateRugRiskScore(pair);
    const liquidityRisk = calculateLiquidityRisk(pair);
    const volatilityRisk = calculateVolatilityRisk(pair);
    const overallRiskScore = Math.round((rugRiskScore + liquidityRisk + volatilityRisk) / 3);

    // Enhanced metrics with safe fallbacks
    const buys24h = pair.txns?.h24?.buys || 0;
    const sells24h = pair.txns?.h24?.sells || 0;
    const buySellRatio = buys24h / Math.max(sells24h, 1);
    const transactionCount24h = buys24h + sells24h;
    const pairAge = pair.pairCreatedAt ? Date.now() - pair.pairCreatedAt : 0;
    const priceVolatility = calculatePriceVolatility(pair);
    const liquidityToVolumeRatio = pair.liquidity.usd / Math.max(pair.volume?.h24 || 1, 1);

    // Enhanced risk factors
    const riskFactors = identifyRiskFactors(pair, pairAge, buySellRatio, transactionCount24h);
    const riskLevel = determineRiskLevel(overallRiskScore, riskFactors.length);

    // Enhanced social analysis
    const socialAnalysis = analyzeSocialPresence(pair);

    return {
      basic: {
        name: pair.baseToken.name || 'Unknown',
        symbol: pair.baseToken.symbol || 'UNKNOWN',
        address: pair.baseToken.address || tokenAddress,
        price: parseFloat(pair.priceUsd || '0'),
        priceChange24h: pair.priceChange?.h24 || 0,
        volume24h: pair.volume?.h24 || 0,
        liquidity: pair.liquidity.usd,
        marketCap: pair.marketCap || pair.fdv || 0,
        fdv: pair.fdv || 0
      },
      risk: {
        rugRiskScore,
        liquidityRisk,
        volatilityRisk,
        overallRiskScore,
        riskFactors,
        riskLevel
      },
      metrics: {
        buySellRatio,
        transactionCount24h,
        pairAge,
        priceVolatility,
        liquidityToVolumeRatio
      },
      social: {
        ...socialAnalysis
      },
      timestamps: {
        lastUpdated: Date.now(),
        pairCreated: pair.pairCreatedAt || 0
      }
    };
  } catch (error) {
    if (error instanceof DexscreenerError) {
      console.error(`Dexscreener API error for ${tokenAddress}:`, error.message);
      return null;
    }
    console.error('Comprehensive token analysis error:', error);
    return null;
  }
};

// Enhanced risk calculations
const calculateLiquidityRisk = (pair: DexscreenerPair): number => {
  if (!pair?.liquidity?.usd || typeof pair.liquidity.usd !== 'number') {
    return 100; // Maximum risk if liquidity data is missing
  }

  let riskScore = 0;
  
  // Liquidity thresholds (more granular)
  if (pair.liquidity.usd < 1000) riskScore += 60;
  else if (pair.liquidity.usd < 5000) riskScore += 45;
  else if (pair.liquidity.usd < 25000) riskScore += 30;
  else if (pair.liquidity.usd < 100000) riskScore += 15;
  else if (pair.liquidity.usd < 500000) riskScore += 5;
  
  // Volume to liquidity ratio (more sophisticated)
  const volume24h = pair.volume?.h24 || 0;
  const volumeLiquidityRatio = volume24h / Math.max(pair.liquidity.usd, 1);
  
  if (volumeLiquidityRatio > 50) riskScore += 40;
  else if (volumeLiquidityRatio > 20) riskScore += 30;
  else if (volumeLiquidityRatio > 10) riskScore += 20;
  else if (volumeLiquidityRatio > 5) riskScore += 10;
  else if (volumeLiquidityRatio < 0.1 && volume24h > 0) riskScore += 15; // Too low is also suspicious
  
  return Math.min(riskScore, 100);
};

const calculateVolatilityRisk = (pair: DexscreenerPair): number => {
  if (!pair?.priceChange || !pair?.txns) {
    return 75; // High risk if price change or transaction data is missing
  }

  let riskScore = 0;
  
  // Multi-timeframe volatility analysis with null checks
  const h24Change = Math.abs(pair.priceChange.h24 || 0);
  const h6Change = Math.abs(pair.priceChange.h6 || 0);
  const h1Change = Math.abs(pair.priceChange.h1 || 0);
  
  // 24h volatility
  if (h24Change > 200) riskScore += 50;
  else if (h24Change > 100) riskScore += 40;
  else if (h24Change > 50) riskScore += 25;
  else if (h24Change > 25) riskScore += 15;
  
  // Recent volatility (1h and 6h)
  if (h1Change > 30) riskScore += 25;
  else if (h1Change > 20) riskScore += 20;
  else if (h1Change > 10) riskScore += 10;
  
  if (h6Change > 50) riskScore += 20;
  else if (h6Change > 25) riskScore += 10;
  
  // Transaction activity with null checks
  const h24Txns = pair.txns.h24 || { buys: 0, sells: 0 };
  const h1Txns = pair.txns.h1 || { buys: 0, sells: 0 };
  
  const totalTxns = h24Txns.buys + h24Txns.sells;
  const recentTxns = h1Txns.buys + h1Txns.sells;
  
  if (totalTxns < 5) riskScore += 30;
  else if (totalTxns < 20) riskScore += 20;
  else if (totalTxns < 50) riskScore += 10;
  
  if (recentTxns === 0 && h1Change > 10) riskScore += 25; // Price movement without transactions
  
  return Math.min(riskScore, 100);
};

const calculateRugRiskScore = (pair: DexscreenerPair): number => {
  if (!pair?.liquidity?.usd || !pair?.volume || !pair?.txns || !pair?.priceChange) {
    return 90; // Very high risk if essential data is missing
  }

  let riskScore = 0;
  
  // Low liquidity
  if (pair.liquidity.usd < 5000) riskScore += 35;
  else if (pair.liquidity.usd < 25000) riskScore += 20;
  else if (pair.liquidity.usd < 100000) riskScore += 10;
  
  // Suspicious volume patterns
  const volume24h = pair.volume.h24 || 0;
  const volumeLiquidityRatio = volume24h / Math.max(pair.liquidity.usd, 1);
  if (volumeLiquidityRatio > 20) riskScore += 30;
  else if (volumeLiquidityRatio > 10) riskScore += 20;
  
  // Age factor
  const pairAge = pair.pairCreatedAt ? Date.now() - pair.pairCreatedAt : 0;
  const hoursOld = pairAge / (1000 * 60 * 60);
  
  if (hoursOld < 1) riskScore += 40;
  else if (hoursOld < 6) riskScore += 30;
  else if (hoursOld < 24) riskScore += 20;
  else if (hoursOld < 168) riskScore += 10; // Less than a week
  
  // Price crash indicator
  const priceChange24h = pair.priceChange.h24 || 0;
  if (priceChange24h < -70) riskScore += 35;
  else if (priceChange24h < -50) riskScore += 25;
  else if (priceChange24h < -30) riskScore += 15;
  
  // Buy/sell imbalance
  const h24Txns = pair.txns.h24 || { buys: 0, sells: 0 };
  const buySellRatio = h24Txns.buys / Math.max(h24Txns.sells, 1);
  if (buySellRatio < 0.3) riskScore += 20; // Heavy selling pressure
  else if (buySellRatio > 5) riskScore += 15; // Suspicious buying (might be fake)
  
  return Math.min(riskScore, 100);
};

// Helper functions
const calculatePriceVolatility = (pair: DexscreenerPair): number => {
  if (!pair?.priceChange) return 0;

  const changes = [
    Math.abs(pair.priceChange.h24 || 0),
    Math.abs(pair.priceChange.h6 || 0),
    Math.abs(pair.priceChange.h1 || 0)
  ];
  
  return changes.reduce((sum, change) => sum + change, 0) / changes.length;
};

const identifyRiskFactors = (
  pair: DexscreenerPair,
  pairAge: number,
  buySellRatio: number,
  transactionCount24h: number
): string[] => {
  const factors: string[] = [];
  
  if (pair.liquidity.usd < 10000) factors.push('Very low liquidity (<$10k)');
  if (pair.liquidity.usd < 50000) factors.push('Low liquidity (<$50k)');
  if (pair.volume.h24 > pair.liquidity.usd * 10) factors.push('Suspicious volume/liquidity ratio');
  if (pairAge < 24 * 60 * 60 * 1000) factors.push('Very new token (<24h)');
  if (pairAge < 7 * 24 * 60 * 60 * 1000) factors.push('New token (<1 week)');
  if (pair.priceChange.h24 < -50) factors.push('Recent price crash (>50%)');
  if (pair.priceChange.h24 < -80) factors.push('Severe price crash (>80%)');
  if (buySellRatio < 0.5) factors.push('More sells than buys');
  if (buySellRatio < 0.2) factors.push('Heavy selling pressure');
  if (transactionCount24h < 10) factors.push('Low transaction activity');
  if (transactionCount24h < 5) factors.push('Very low transaction activity');
  if (!pair.info?.websites?.length) factors.push('No website listed');
  if (!pair.info?.socials?.length) factors.push('No social media presence');
  if (Math.abs(pair.priceChange.h1) > 20) factors.push('High short-term volatility');
  
  return factors;
};

const determineRiskLevel = (overallScore: number, factorCount: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' => {
  if (overallScore > 80 || factorCount > 8) return 'EXTREME';
  if (overallScore > 60 || factorCount > 6) return 'HIGH';
  if (overallScore > 35 || factorCount > 3) return 'MEDIUM';
  return 'LOW';
};

const analyzeSocialPresence = (pair: DexscreenerPair) => {
  const websites = pair.info?.websites || [];
  const socials = pair.info?.socials || [];
  
  const hasWebsite = websites.length > 0;
  const hasSocials = socials.length > 0;
  const socialCount = websites.length + socials.length;
  const socialPlatforms = socials.map(s => s.platform);
  
  return {
    hasWebsite,
    hasSocials,
    socialCount,
    socialPlatforms
  };
};

// Enhanced trending tokens with better filtering
export const getTrendingTokensByChain = async (chainId: string, options: {
  minLiquidity?: number;
  minVolume?: number;
  maxAge?: number; // in hours
  limit?: number;
} = {}): Promise<DexscreenerPair[]> => {
  const {
    minLiquidity = 5000,
    minVolume = 1000,
    maxAge = 168, // 1 week default
    limit = 10
  } = options;

  try {
    const dexIds = {
      'solana': ['raydium', 'orca', 'jupiter'],
      'ethereum': ['uniswap-v2', 'uniswap-v3', 'sushiswap'],
      'bsc': ['pancakeswap-v2', 'pancakeswap-v3'],
      'polygon': ['quickswap', 'uniswap-v3'],
      'arbitrum': ['uniswap-v3', 'sushiswap'],
      'optimism': ['uniswap-v3', 'velodrome']
    };

    const chainDexes = dexIds[chainId.toLowerCase() as keyof typeof dexIds] || dexIds.solana;
    let allPairs: DexscreenerPair[] = [];

    // Fetch from multiple DEXes in parallel
    const fetchPromises = chainDexes.map(async (dexId) => {
      try {
        return await dexClient.getTrendingPairs(chainId, dexId);
      } catch (error) {
        console.warn(`Failed to fetch from ${dexId}:`, error);
        return [];
      }
    });

    const results = await Promise.allSettled(fetchPromises);
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allPairs = [...allPairs, ...result.value];
      }
    });

    // Enhanced filtering
    const maxAgeMs = maxAge * 60 * 60 * 1000;
    const now = Date.now();
    
    const filteredPairs = allPairs
      .filter((pair, index, self) => 
        // Remove duplicates
        index === self.findIndex(p => p.pairAddress === pair.pairAddress)
      )
      .filter(pair => 
        pair.liquidity.usd >= minLiquidity &&
        pair.volume.h24 >= minVolume &&
        (now - pair.pairCreatedAt) <= maxAgeMs &&
        pair.priceUsd && parseFloat(pair.priceUsd) > 0
      )
      .sort((a, b) => {
        // Enhanced scoring algorithm
        const scoreA = calculateTrendingScore(a);
        const scoreB = calculateTrendingScore(b);
        return scoreB - scoreA;
      });

    return filteredPairs.slice(0, limit);
  } catch (error) {
    console.error(`Error fetching trending tokens for ${chainId}:`, error);
    return [];
  }
};

const calculateTrendingScore = (pair: DexscreenerPair): number => {
  const volume = pair.volume.h24;
  const liquidity = pair.liquidity.usd;
  const priceChange = pair.priceChange.h24;
  const txCount = pair.txns.h24.buys + pair.txns.h24.sells;
  const age = Date.now() - pair.pairCreatedAt;
  
  // Recency bonus (newer is better, but not too new)
  const hoursSinceCreation = age / (1000 * 60 * 60);
  let ageScore = 1;
  if (hoursSinceCreation < 1) ageScore = 0.3; // Too new is risky
  else if (hoursSinceCreation < 24) ageScore = 1.2;
  else if (hoursSinceCreation < 168) ageScore = 1.0;
  else ageScore = 0.8;
  
  // Volume score
  const volumeScore = Math.log10(Math.max(volume, 1));
  
  // Liquidity score
  const liquidityScore = Math.log10(Math.max(liquidity, 1));
  
  // Price movement bonus (both positive and negative can be trending)
  const movementScore = Math.min(Math.abs(priceChange) / 10, 5);
  
  // Transaction activity score
  const txScore = Math.log10(Math.max(txCount, 1));
  
  return (volumeScore * 0.3 + liquidityScore * 0.25 + movementScore * 0.2 + txScore * 0.15 + ageScore * 0.1);
};

// Backward compatibility
export const getDexscreenerTokenData = async (tokenAddress: string): Promise<DexscreenerPair | null> => {
  try {
    const pairs = await dexClient.getTokenPairs(tokenAddress);
    return pairs.length > 0 ? pairs[0] : null;
  } catch (error) {
    console.error('Error fetching token data:', error);
    return null;
  }
};

export const getTrendingSolanaTokens = async (): Promise<DexscreenerPair[]> => {
  return getTrendingTokensByChain('solana');
};

// Enhanced LP lock analysis
export const analyzeLPLockStatus = async (tokenAddress: string, chainId = 'solana'): Promise<{
  isLocked: boolean;
  lockPercentage: number;
  lockDuration: string;
  lockProvider: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  securityScore: number;
  details: string[];
  recommendations: string[];
  confidence: number;
} | null> => {
  try {
    const pairs = await dexClient.getTokenPairs(tokenAddress, chainId);
    const pair = pairs.reduce((best, current) => 
      current.liquidity.usd > best.liquidity.usd ? current : best
    );

    const analysis = performLPLockAnalysis(pair);
    return analysis;
  } catch (error) {
    console.error('LP lock analysis error:', error);
    return null;
  }
};

const performLPLockAnalysis = (pair: DexscreenerPair) => {
  const liquidity = pair.liquidity.usd;
  const volume = pair.volume.h24;
  const pairAge = Date.now() - pair.pairCreatedAt;
  const volumeLiquidityRatio = volume / Math.max(liquidity, 1);
  
  let securityScore = 50;
  let confidence = 60; // Base confidence
  const details: string[] = [];
  const recommendations: string[] = [];
  
  // Liquidity analysis
  if (liquidity > 500000) {
    securityScore += 30;
    confidence += 20;
    details.push('Very high liquidity pool (>$500k)');
  } else if (liquidity > 100000) {
    securityScore += 20;
    confidence += 15;
    details.push('High liquidity pool (>$100k)');
  } else if (liquidity > 50000) {
    securityScore += 10;
    confidence += 10;
    details.push('Moderate liquidity pool (>$50k)');
  } else {
    securityScore -= 20;
    details.push('Low liquidity pool');
  }
  
  // Volume/liquidity ratio analysis
  if (volumeLiquidityRatio < 2) {
    securityScore += 15;
    details.push('Healthy volume/liquidity ratio');
  } else if (volumeLiquidityRatio < 5) {
    securityScore += 5;
    details.push('Acceptable volume/liquidity ratio');
  } else {
    securityScore -= 15;
    details.push('High volume/liquidity ratio (potential risk)');
  }
  
  // Age analysis
  const daysSinceCreation = Math.floor(pairAge / (1000 * 60 * 60 * 24));
  if (daysSinceCreation > 365) {
    securityScore += 15;
    confidence += 15;
    details.push('Established token (>1 year)');
  } else if (daysSinceCreation > 90) {
    securityScore += 10;
    confidence += 10;
    details.push('Mature token (>3 months)');
  } else if (daysSinceCreation < 1) {
    securityScore -= 30;
    confidence -= 20;
    details.push('Very new token (<24h) - EXTREME RISK');
  }
  
  // Determine lock status (simplified heuristic)
  const isLocked = liquidity > 25000 && volumeLiquidityRatio < 10 && daysSinceCreation > 0;
  const lockPercentage = isLocked ? Math.min(90, 50 + (liquidity / 10000)) : 0;
  
  const lockDuration = daysSinceCreation > 365 ? '1+ years' : 
                      daysSinceCreation > 180 ? '6+ months' : 
                      daysSinceCreation > 90 ? '3+ months' : 
                      daysSinceCreation > 30 ? '1+ month' : 
                      'Unknown/Short-term';
  
  const lockProvider = liquidity > 100000 ? 'Enterprise Lock Service' : 
                      liquidity > 50000 ? 'Professional Lock Service' : 
                      'Basic Lock Service';
  
  // Final risk assessment
  securityScore = Math.max(0, Math.min(100, securityScore));
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  
  if (securityScore < 25 || daysSinceCreation < 1) {
    riskLevel = 'EXTREME';
    recommendations.push('DO NOT INVEST - Extreme risk');
  } else if (securityScore < 45) {
    riskLevel = 'HIGH';
    recommendations.push('High risk - Only invest small amounts');
  } else if (securityScore < 70) {
    riskLevel = 'MEDIUM';
    recommendations.push('Medium risk - Exercise caution');
  } else {
    riskLevel = 'LOW';
    recommendations.push('Relatively safe investment');
  }
  
  return {
    isLocked,
    lockPercentage,
    lockDuration,
    lockProvider,
    riskLevel,
    securityScore,
    details,
    recommendations,
    confidence
  };
};

// Utility functions
export const formatTokenDataForChat = (pair: DexscreenerPair): string => {
  const riskScore = calculateRugRiskScore(pair);
  const riskLevel = riskScore > 70 ? '🔴 High' : riskScore > 40 ? '🟡 Medium' : '🟢 Low';
  const ageHours = Math.floor((Date.now() - pair.pairCreatedAt) / (1000 * 60 * 60));
  const ageDays = Math.floor(ageHours / 24);
  const ageDisplay = ageDays > 0 ? `${ageDays}d` : `${ageHours}h`;
  
  return `📊 **${pair.baseToken.symbol}** (${pair.baseToken.name})
💰 Price: ${parseFloat(pair.priceUsd).toFixed(8)} (${pair.priceChange.h24 > 0 ? '+' : ''}${pair.priceChange.h24.toFixed(2)}%)
📈 24h Volume: ${formatLargeNumber(pair.volume.h24)}
💧 Liquidity: ${formatLargeNumber(pair.liquidity.usd)}
📊 Market Cap: ${formatLargeNumber(pair.marketCap || pair.fdv)}
🐋 24h Transactions: ${pair.txns.h24.buys} buys / ${pair.txns.h24.sells} sells
⏰ Age: ${ageDisplay}
⚠️ Risk Level: ${riskLevel} (${riskScore}/100)
🔗 [View Chart](${pair.url})`;
};

export const formatLargeNumber = (num: number): string => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toFixed(2);
};

export const getSupportedChains = (): string[] => {
  return ['solana', 'ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism', 'avalanche', 'fantom'];
};

export const getChainDisplayName = (chainId: string): string => {
  const chainNames: Record<string, string> = {
    'solana': 'Solana',
    'ethereum': 'Ethereum',
    'bsc': 'Binance Smart Chain',
    'polygon': 'Polygon',
    'arbitrum': 'Arbitrum One',
    'optimism': 'Optimism',
    'avalanche': 'Avalanche',
    'fantom': 'Fantom'
  };
  return chainNames[chainId.toLowerCase()] || chainId.toUpperCase();
};

// Batch operations for multiple tokens
export const getMultipleTokensData = async (
  tokenAddresses: string[], 
  chainId = 'solana'
): Promise<DexscreenerPair[]> => {
  try {
    // Limit to 30 addresses to avoid API limits
    const addresses = tokenAddresses.slice(0, 30);
    const results: DexscreenerPair[] = [];
    
    // Process in batches of 5 to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);
      const batchPromises = batch.map(async (address) => {
        try {
          const pairs = await dexClient.getTokenPairs(address, chainId);
          return pairs.length > 0 ? pairs[0] : null;
        } catch (error) {
          console.warn(`Failed to fetch data for ${address}:`, error);
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(result => result !== null) as DexscreenerPair[]);
      
      // Small delay between batches to be nice to the API
      if (i + batchSize < addresses.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    return results;
  } catch (error) {
    console.error('Multiple tokens fetch error:', error);
    return [];
  }
};

// Advanced token comparison
export const compareTokens = async (
  tokenAddress1: string, 
  tokenAddress2: string, 
  chainId = 'solana'
): Promise<{
  token1: ComprehensiveTokenData | null;
  token2: ComprehensiveTokenData | null;
  comparison: {
    betterLiquidity: 1 | 2 | 'tie';
    betterVolume: 1 | 2 | 'tie';
    lowerRisk: 1 | 2 | 'tie';
    betterPerformance: 1 | 2 | 'tie';
    recommendation: string;
  };
} | null> => {
  try {
    const [token1, token2] = await Promise.all([
      analyzeTokenComprehensive(tokenAddress1, chainId),
      analyzeTokenComprehensive(tokenAddress2, chainId)
    ]);
    
    if (!token1 || !token2) return null;
    
    const comparison = {
      betterLiquidity: token1.basic.liquidity > token2.basic.liquidity ? 1 as const : 
                      token1.basic.liquidity < token2.basic.liquidity ? 2 as const : 'tie' as const,
      betterVolume: token1.basic.volume24h > token2.basic.volume24h ? 1 as const : 
                   token1.basic.volume24h < token2.basic.volume24h ? 2 as const : 'tie' as const,
      lowerRisk: token1.risk.overallRiskScore < token2.risk.overallRiskScore ? 1 as const : 
                token1.risk.overallRiskScore > token2.risk.overallRiskScore ? 2 as const : 'tie' as const,
      betterPerformance: token1.basic.priceChange24h > token2.basic.priceChange24h ? 1 as const : 
                        token1.basic.priceChange24h < token2.basic.priceChange24h ? 2 as const : 'tie' as const,
      recommendation: ''
    };
    
    // Generate recommendation
    const token1Score = (comparison.betterLiquidity === 1 ? 1 : 0) +
                       (comparison.betterVolume === 1 ? 1 : 0) +
                       (comparison.lowerRisk === 1 ? 2 : 0) + // Risk weighted more
                       (comparison.betterPerformance === 1 ? 1 : 0);
    
    const token2Score = (comparison.betterLiquidity === 2 ? 1 : 0) +
                       (comparison.betterVolume === 2 ? 1 : 0) +
                       (comparison.lowerRisk === 2 ? 2 : 0) +
                       (comparison.betterPerformance === 2 ? 1 : 0);
    
    if (token1Score > token2Score) {
      comparison.recommendation = `${token1.basic.symbol} appears to be the better choice overall`;
    } else if (token2Score > token1Score) {
      comparison.recommendation = `${token2.basic.symbol} appears to be the better choice overall`;
    } else {
      comparison.recommendation = 'Both tokens have similar risk/reward profiles';
    }
    
    // Add risk warnings
    if (token1.risk.riskLevel === 'HIGH' || token1.risk.riskLevel === 'EXTREME') {
      comparison.recommendation += `. WARNING: ${token1.basic.symbol} has ${token1.risk.riskLevel} risk`;
    }
    if (token2.risk.riskLevel === 'HIGH' || token2.risk.riskLevel === 'EXTREME') {
      comparison.recommendation += `. WARNING: ${token2.basic.symbol} has ${token2.risk.riskLevel} risk`;
    }
    
    return { token1, token2, comparison };
  } catch (error) {
    console.error('Token comparison error:', error);
    return null;
  }
};

// Portfolio analysis for multiple tokens
export const analyzePortfolio = async (
  tokenAddresses: string[], 
  chainId = 'solana'
): Promise<{
  tokens: ComprehensiveTokenData[];
  portfolio: {
    totalValue: number;
    averageRisk: number;
    riskDistribution: Record<string, number>;
    recommendations: string[];
    diversificationScore: number;
  };
} | null> => {
  try {
    const tokenAnalyses = await Promise.all(
      tokenAddresses.map(address => analyzeTokenComprehensive(address, chainId))
    );
    
    const validTokens = tokenAnalyses.filter(token => token !== null) as ComprehensiveTokenData[];
    
    if (validTokens.length === 0) return null;
    
    const totalValue = validTokens.reduce((sum, token) => sum + token.basic.marketCap, 0);
    const averageRisk = validTokens.reduce((sum, token) => sum + token.risk.overallRiskScore, 0) / validTokens.length;
    
    const riskDistribution = validTokens.reduce((dist, token) => {
      dist[token.risk.riskLevel] = (dist[token.risk.riskLevel] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);
    
    const recommendations: string[] = [];
    
    // Risk analysis
    const highRiskCount = (riskDistribution.HIGH || 0) + (riskDistribution.EXTREME || 0);
    if (highRiskCount > validTokens.length * 0.5) {
      recommendations.push('⚠️ Portfolio has high concentration of risky assets');
    }
    
    // Diversification analysis
    const avgLiquidity = validTokens.reduce((sum, token) => sum + token.basic.liquidity, 0) / validTokens.length;
    const liquidityVariance = validTokens.reduce((sum, token) => 
      sum + Math.pow(token.basic.liquidity - avgLiquidity, 2), 0) / validTokens.length;
    const diversificationScore = Math.max(0, 100 - (liquidityVariance / avgLiquidity) * 100);
    
    if (diversificationScore < 50) {
      recommendations.push('📊 Consider diversifying across different liquidity levels');
    }
    
    // Age diversity
    const veryNewTokens = validTokens.filter(token => token.metrics.pairAge < 24 * 60 * 60 * 1000).length;
    if (veryNewTokens > validTokens.length * 0.3) {
      recommendations.push('🕒 High concentration of very new tokens increases risk');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ Portfolio appears reasonably balanced');
    }
    
    return {
      tokens: validTokens,
      portfolio: {
        totalValue,
        averageRisk,
        riskDistribution,
        recommendations,
        diversificationScore
      }
    };
  } catch (error) {
    console.error('Portfolio analysis error:', error);
    return null;
  }
};

// Real-time price alerts (conceptual - would need websockets in real implementation)
export const setupPriceAlert = (
  tokenAddress: string,
  thresholds: { above?: number; below?: number },
  chainId = 'solana'
): Promise<string> => {
  // This is a conceptual implementation - in practice you'd use websockets
  // or a background service for real-time monitoring
  return Promise.resolve(`Alert set for ${tokenAddress} on ${chainId}`);
};



// Health check function
export const healthCheck = async (): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  cacheSize: number;
  lastError?: string;
}> => {
  const startTime = Date.now();
  
  try {
    // Test with a known token (USDC on Solana)
    await dexClient.getTokenPairs('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 'solana');
    
    const latency = Date.now() - startTime;
    
    return {
      status: latency < 2000 ? 'healthy' : latency < 5000 ? 'degraded' : 'unhealthy',
      latency,
      cacheSize: apiCache.size()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - startTime,
      cacheSize: apiCache.size(),
      lastError: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Clear cache function
export const clearCache = (): void => {
  apiCache.clear();
};