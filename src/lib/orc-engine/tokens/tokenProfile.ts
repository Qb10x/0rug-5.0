// ORC Token Profile Builder - following 0rug.com coding guidelines

import { PublicKey, Connection } from '@solana/web3.js';
import { createORCConnection, executeORCOperation } from '../shared/solana';
import { TokenProfile, TokenTransaction } from '../shared/types';
import { ORC_PROGRAM_ID } from '../shared/orcConstants';

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
    
    // Get token account info
    const accountInfo = await connection.getAccountInfo(publicKey);
    
    // Get recent transactions for this token
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 100 });
    
    // Analyze transaction patterns
    const transactions: TokenTransaction[] = [];
    let totalVolume = 0;
    let swapCount = 0;
    let liquidityCount = 0;
    
    // Process recent transactions
    for (const sig of signatures.slice(0, 20)) {
      try {
        const tx = await connection.getTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0
        });
        
        if (tx) {
          const txAnalysis = analyzeTokenTransaction(tx, tokenAddress);
          transactions.push(txAnalysis);
          
          if (txAnalysis.isSwap) {
            swapCount++;
            totalVolume += txAnalysis.volume;
          }
          
          if (txAnalysis.isLiquidity) {
            liquidityCount++;
          }
        }
      } catch (error) {
        console.warn(`Error analyzing transaction ${sig.signature}:`, error);
      }
    }
    
    // Calculate metrics
    const avgVolume = swapCount > 0 ? totalVolume / swapCount : 0;
    const uniqueTraders = new Set(transactions.map(t => t.poolAddress)).size;
    
    // Build token profile
    const profile: TokenProfile = {
      tokenAddress,
      tokenName: 'Unknown Token',
      tokenSymbol: 'UNK',
      totalSupply: 0,
      circulatingSupply: 0,
      marketCap: 0,
      price: 0,
      volume24h: totalVolume,
      volume7d: totalVolume * 7, // Simplified
      swapCount24h: swapCount,
      liquidityPools: Array.from(new Set(transactions.map(t => t.poolAddress))),
      riskScore: calculateTokenRiskScore(swapCount, liquidityCount, avgVolume),
      lastUpdated: new Date().toISOString(),
      recentTransactions: transactions.slice(0, 10)
    };
    
    return profile;
  } catch (error) {
    console.error('Error building token profile:', error);
    throw error;
  }
}

// Analyze individual token transaction
function analyzeTokenTransaction(tx: any, tokenAddress: string): TokenTransaction {
  try {
    const logs = tx.meta?.logMessages || [];
    let isSwap = false;
    let isLiquidity = false;
    let volume = 0;
    let poolAddress = 'Unknown';
    
    // Analyze transaction logs
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
      
      // Extract pool address
      const poolMatch = log.match(/([A-Za-z0-9]{32,44})/);
      if (poolMatch) {
        poolAddress = poolMatch[1];
      }
    }
    
    return {
      transactionHash: tx.transaction.signatures[0] || '',
      timestamp: new Date().toISOString(),
      isSwap,
      isLiquidity,
      volume,
      poolAddress,
      type: isSwap ? 'swap' : isLiquidity ? 'liquidity' : 'other'
    };
  } catch (error) {
    console.warn('Error analyzing token transaction:', error);
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
export async function getTokenMetadata(tokenAddress: string): Promise<Record<string, unknown>> {
  // This would integrate with token metadata services
  // For now, return basic info
  return {
    name: 'Unknown Token',
    symbol: 'UNKNOWN',
    decimals: 9,
    logoURI: ''
  };
} 