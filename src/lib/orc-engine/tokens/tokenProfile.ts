// ORC Token Profile Builder - following 0rug.com coding guidelines

import { PublicKey, Connection, VersionedTransactionResponse } from '@solana/web3.js';
import { createORCConnection, executeORCOperation } from '../shared/solana';
import { TokenProfile, TokenTransaction } from '../shared/types';


// Build comprehensive token profile using ORC data
export async function getTokenProfile(tokenAddress: string): Promise<TokenProfile> {
  return executeORCOperation(async () => {
    const connection = await createORCConnection();
    return await buildTokenProfile(connection, tokenAddress);
  });
}

// Build token profile from ORC data
async function buildTokenProfile(connection: Connection, tokenAddress: string): Promise<TokenProfile> {
  try {
    const publicKey = new PublicKey(tokenAddress);
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 100 });
    
    const transactionAnalysis = await analyzeTokenTransactions(connection, signatures, tokenAddress);
    const metrics = calculateTokenMetrics(transactionAnalysis);
    
    return createTokenProfile(tokenAddress, transactionAnalysis, metrics);
  } catch {
    return createDefaultTokenProfile(tokenAddress);
  }
}

// Analyze token transactions
async function analyzeTokenTransactions(
  connection: Connection,
  signatures: Array<{ signature: string }>,
  tokenAddress: string
): Promise<TokenTransaction[]> {
  const transactions: TokenTransaction[] = [];

  for (const sig of signatures.slice(0, 20)) {
    try {
      const tx = await connection.getTransaction(sig.signature, {
        maxSupportedTransactionVersion: 0
      });
      
      if (tx) {
        const txAnalysis = analyzeTokenTransaction(tx);
        transactions.push(txAnalysis);
      }
    } catch {
      // Silently continue processing other transactions
    }
  }

  return transactions;
}

// Calculate token metrics from transactions
function calculateTokenMetrics(transactions: TokenTransaction[]): {
  totalVolume: number;
  swapCount: number;
  liquidityCount: number;
  avgVolume: number;
  uniquePools: number;
} {
  let totalVolume = 0;
  let swapCount = 0;
  let liquidityCount = 0;

  for (const tx of transactions) {
    if (tx.isSwap) {
      swapCount++;
      totalVolume += tx.volume;
    }
    
    if (tx.isLiquidity) {
      liquidityCount++;
    }
  }

  const avgVolume = swapCount > 0 ? totalVolume / swapCount : 0;
  const uniquePools = new Set(transactions.map(t => t.poolAddress)).size;

  return {
    totalVolume,
    swapCount,
    liquidityCount,
    avgVolume,
    uniquePools
  };
}

// Create token profile from analysis
function createTokenProfile(
  tokenAddress: string,
  transactions: TokenTransaction[],
  metrics: {
    totalVolume: number;
    swapCount: number;
    liquidityCount: number;
    avgVolume: number;
    uniquePools: number;
  }
): TokenProfile {
  const riskScore = calculateTokenRiskScore(
    metrics.swapCount,
    metrics.liquidityCount,
    metrics.avgVolume
  );

  return {
    tokenAddress,
    tokenName: 'Unknown Token',
    tokenSymbol: 'UNK',
    totalSupply: 0,
    circulatingSupply: 0,
    marketCap: 0,
    price: 0,
    volume24h: metrics.totalVolume,
    volume7d: metrics.totalVolume * 7, // Simplified
    swapCount24h: metrics.swapCount,
    liquidityPools: Array.from(new Set(transactions.map(t => t.poolAddress))),
    riskScore,
    lastUpdated: new Date().toISOString(),
    recentTransactions: transactions.slice(0, 10)
  };
}

// Create default token profile for errors
function createDefaultTokenProfile(tokenAddress: string): TokenProfile {
  return {
    tokenAddress,
    tokenName: 'Unknown Token',
    tokenSymbol: 'UNK',
    totalSupply: 0,
    circulatingSupply: 0,
    marketCap: 0,
    price: 0,
    volume24h: 0,
    volume7d: 0,
    swapCount24h: 0,
    liquidityPools: [],
    riskScore: 50,
    lastUpdated: new Date().toISOString(),
    recentTransactions: []
  };
}

// Analyze individual token transaction
function analyzeTokenTransaction(tx: VersionedTransactionResponse): TokenTransaction {
  try {
    const logs = tx.meta?.logMessages || [];
    const analysis = parseTransactionLogs(logs);
    
    return {
      transactionHash: tx.transaction.signatures[0] || '',
      timestamp: new Date().toISOString(),
      ...analysis
    };
  } catch {
    return createDefaultTransaction();
  }
}

// Parse transaction logs to extract transaction type and data
function parseTransactionLogs(logs: string[]): {
  isSwap: boolean;
  isLiquidity: boolean;
  volume: number;
  poolAddress: string;
  type: 'swap' | 'liquidity' | 'other';
} {
  let isSwap = false;
  let isLiquidity = false;
  let volume = 0;
  let poolAddress = 'Unknown';

  for (const log of logs) {
    if (log.includes('Swap') || log.includes('Exchange')) {
      isSwap = true;
      const volumeMatch = log.match(/(\d+(?:\.\d+)?)/);
      if (volumeMatch) {
        volume = parseFloat(volumeMatch[1]);
      }
    }
    
    if (log.includes('Liquidity') || log.includes('AddLiquidity') || log.includes('RemoveLiquidity')) {
      isLiquidity = true;
    }
    
    const poolMatch = log.match(/([A-Za-z0-9]{32,44})/);
    if (poolMatch) {
      poolAddress = poolMatch[1];
    }
  }

  const type = isSwap ? 'swap' : isLiquidity ? 'liquidity' : 'other';

  return {
    isSwap,
    isLiquidity,
    volume,
    poolAddress,
    type
  };
}

// Create default transaction for errors
function createDefaultTransaction(): TokenTransaction {
  return {
    transactionHash: '',
    timestamp: new Date().toISOString(),
    isSwap: false,
    isLiquidity: false,
    volume: 0,
    poolAddress: 'Unknown',
    type: 'unknown'
  };
}

// Calculate token risk score
function calculateTokenRiskScore(swapCount: number, liquidityCount: number, avgVolume: number): number {
  let score = 50; // Base score
  
  // Activity factor
  if (swapCount > 50) score += 20;
  else if (swapCount < 5) score -= 20;
  
  // Liquidity factor
  if (liquidityCount > 10) score += 15;
  else if (liquidityCount < 2) score -= 15;
  
  // Volume factor
  if (avgVolume > 10000) score += 15;
  else if (avgVolume < 100) score -= 15;
  
  return Math.max(0, Math.min(100, score));
}

// Get token metadata (placeholder for future implementation)
export async function getTokenMetadata(): Promise<Record<string, unknown>> {
  // This would integrate with token metadata services
  // For now, return basic info
  return {
    name: 'Unknown Token',
    symbol: 'UNKNOWN',
    decimals: 9,
    logoURI: ''
  };
} 