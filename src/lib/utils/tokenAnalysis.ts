// Token Analysis Utility - Combines all data sources
// Following 0rug.com coding guidelines

import { getJupiterTokenData } from '../api/jupiter';
import { getRaydiumLiquidityInfo, checkRaydiumLPLock } from '../api/raydium';
import { getSolanaTokenData, checkMintRenounced, getTokenAge, getTokenHolderDistribution } from '../api/solana';
import { cacheManager, CACHE_TTL } from '../cache/cacheManager';

// Comprehensive token data interface
export interface TokenAnalysisData {
  // Basic info
  address: string;
  name: string;
  symbol: string;
  price: number;
  marketCap: number;
  volume24h: number;
  
  // Security metrics
  lpLocked: boolean;
  lpLockPercentage: number;
  mintRenounced: boolean;
  riskScore: number;
  
  // Holder data
  totalHolders: number;
  whaleCount: number;
  averageBalance: number;
  botHolders: number;
  
  // Age and activity
  ageInDays: number;
  creationDate: Date | null;
  
  // Liquidity data
  totalLiquidity: number;
  poolCount: number;
  
  // Cache info
  isCached: boolean;
  lastUpdated: number;
}

// Analyze token comprehensively
export async function analyzeToken(tokenAddress: string): Promise<TokenAnalysisData | null> {
  const cacheKey = `token_analysis_${tokenAddress}`;
  
  // Check cache first
  const cached = cacheManager.get<TokenAnalysisData>(cacheKey);
  if (cached) {
    return { ...cached, isCached: true };
  }
  
  try {
    // Fetch data from all sources in parallel
    const [jupiterData, raydiumData, solanaData, holderData, ageData, lpLockData] = await Promise.all([
      getJupiterTokenData(tokenAddress),
      getRaydiumLiquidityInfo(tokenAddress),
      getSolanaTokenData(tokenAddress),
      getTokenHolderDistribution(tokenAddress),
      getTokenAge(tokenAddress),
      checkRaydiumLPLock(tokenAddress)
    ]);
    
    // Calculate risk score
    const riskScore = calculateRiskScore({
      lpLocked: lpLockData?.isLocked || false,
      mintRenounced: solanaData ? await checkMintRenounced(tokenAddress) : false,
      botHolders: holderData ? calculateBotPercentage(holderData) : 0,
      liquidity: raydiumData?.totalLiquidity || 0,
      age: ageData?.ageInDays || 0,
      holders: holderData?.totalHolders || 0
    });
    
    // Build comprehensive token data
    const tokenData: TokenAnalysisData = {
      address: tokenAddress,
      name: jupiterData?.mintSymbol || 'Unknown',
      symbol: jupiterData?.mintSymbol || 'UNKNOWN',
      price: jupiterData?.price || 0,
      marketCap: jupiterData?.marketCap || 0,
      volume24h: jupiterData?.volume24h || 0,
      
      lpLocked: lpLockData?.isLocked || false,
      lpLockPercentage: lpLockData?.lockPercentage || 0,
      mintRenounced: solanaData ? await checkMintRenounced(tokenAddress) : false,
      riskScore,
      
      totalHolders: holderData?.totalHolders || 0,
      whaleCount: holderData?.whaleCount || 0,
      averageBalance: holderData?.averageBalance || 0,
      botHolders: holderData ? calculateBotPercentage(holderData) : 0,
      
      ageInDays: ageData?.ageInDays || 0,
      creationDate: ageData?.creationDate || null,
      
      totalLiquidity: raydiumData?.totalLiquidity || 0,
      poolCount: raydiumData?.poolCount || 0,
      
      isCached: false,
      lastUpdated: Date.now()
    };
    
    // Cache the result
    cacheManager.set(cacheKey, tokenData, CACHE_TTL.ANALYSIS);
    
    return tokenData;
  } catch {
    return null;
  }
}

// Calculate risk score (0-100)
function calculateRiskScore(data: {
  lpLocked: boolean;
  mintRenounced: boolean;
  botHolders: number;
  liquidity: number;
  age: number;
  holders: number;
}): number {
  let score = 50; // Base score
  
  // LP Lock (30 points)
  if (data.lpLocked) score += 30;
  else score -= 20;
  
  // Mint Renounced (20 points)
  if (data.mintRenounced) score += 20;
  else score -= 15;
  
  // Bot Holders (20 points)
  if (data.botHolders < 10) score += 20;
  else if (data.botHolders < 30) score += 10;
  else if (data.botHolders > 70) score -= 20;
  
  // Liquidity (15 points)
  if (data.liquidity > 10000) score += 15;
  else if (data.liquidity > 1000) score += 5;
  else score -= 10;
  
  // Age (10 points)
  if (data.age > 30) score += 10;
  else if (data.age > 7) score += 5;
  else score -= 5;
  
  // Holders (5 points)
  if (data.holders > 100) score += 5;
  else if (data.holders < 10) score -= 5;
  
  return Math.max(0, Math.min(100, score));
}

// Calculate bot percentage from holder data
function calculateBotPercentage(holderData: Record<string, unknown>): number {
  // Simple heuristic: if average balance is very high, likely bots
  const avgBalance = (holderData.averageBalance as number) || 0;
  const totalHolders = (holderData.totalHolders as number) || 0;
  
  if (avgBalance > 1000000 && totalHolders < 50) return 80;
  if (avgBalance > 100000 && totalHolders < 100) return 60;
  if (avgBalance > 10000 && totalHolders < 200) return 40;
  
  return 20; // Default low bot percentage
}

// Get popular tokens list
export async function getPopularTokens(): Promise<Array<{ address: string; name: string; symbol: string }>> {
  const cacheKey = 'popular_tokens_list';
  
  const cached = cacheManager.get<Array<{ address: string; name: string; symbol: string }>>(cacheKey);
  if (cached) return cached;
  
  // Popular Solana tokens
  const popularTokens = [
    { address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', name: 'USD Coin', symbol: 'USDC' },
    { address: 'So11111111111111111111111111111111111111112', name: 'Wrapped SOL', symbol: 'SOL' },
    { address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', name: 'Bonk', symbol: 'BONK' },
    { address: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr', name: 'Pepe', symbol: 'PEPE' },
    { address: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs', name: 'Dogwifhat', symbol: 'WIF' },
    { address: 'HZ1JovNiVvGrGNiiYvEozEVg58WUyWJf1VqJqJqJqJqJ', name: 'Jupiter', symbol: 'JUP' },
    { address: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', name: 'Marinade Staked SOL', symbol: 'mSOL' },
    { address: '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj', name: 'Staked SOL', symbol: 'stSOL' }
  ];
  
  cacheManager.set(cacheKey, popularTokens, CACHE_TTL.METADATA);
  return popularTokens;
} 