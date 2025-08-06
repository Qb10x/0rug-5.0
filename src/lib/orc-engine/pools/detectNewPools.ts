// ORC Pool Detection - following 0rug.com coding guidelines

import { PublicKey, Connection, VersionedTransactionResponse } from '@solana/web3.js';
import { createORCConnection, executeORCOperation } from '../shared/solana';
import { PoolData, SolanaTransaction } from '../shared/types';
import { ORC_PROGRAM_ID } from '../shared/orcConstants';

// Detect new liquidity pools using ORC data
export async function detectNewPools(): Promise<PoolData[]> {
  return executeORCOperation(async () => {
    const connection = await createORCConnection();
    return await scanForNewPools(connection);
  });
}

// Scan for new pools using ORC program signatures
async function scanForNewPools(connection: Connection): Promise<PoolData[]> {
  try {
    // Get recent signatures for ORC program using PublicKey
    const signatures = await connection.getSignaturesForAddress(
      ORC_PROGRAM_ID,
      { limit: 10 }
    );

    const pools: PoolData[] = [];

    // Process each signature to find pool creation
    for (const sig of signatures) {
      try {
        const tx = await connection.getTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0
        });
        
        if (tx && isPoolCreationTransaction(tx)) {
          const poolAddress = extractPoolAddressFromTx(tx);
          if (poolAddress) {
            const poolData = await enrichPoolData(connection, poolAddress);
            pools.push(poolData);
          }
        }
      } catch (error) {
        console.warn(`Error processing signature ${sig.signature}:`, error);
      }
    }

    return pools;
  } catch (error) {
    console.error('Error scanning for new pools:', error);
    throw error;
  }
}

// Check if transaction is pool creation
function isPoolCreationTransaction(tx: VersionedTransactionResponse): boolean {
  // Check for ORC program instructions in log messages
  return tx?.meta?.logMessages?.some((log: string) => 
    log.includes('Initialize') || log.includes('CreatePool')
  ) || false;
}

// Extract pool address from transaction
function extractPoolAddressFromTx(tx: VersionedTransactionResponse): string | null {
  try {
    // Look for pool address in log messages
    const logs = tx.meta?.logMessages || [];
    for (const log of logs) {
      if (log.includes('Pool created') || log.includes('Address:')) {
        // Extract address from log
        const match = log.match(/Address:\s*([A-Za-z0-9]{32,44})/);
        return match ? match[1] : null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// Enrich pool data with additional information
async function enrichPoolData(connection: Connection, poolAddress: string): Promise<PoolData> {
  try {
    const publicKey = new PublicKey(poolAddress);
    const accountInfo = await connection.getAccountInfo(publicKey);
    
    return {
      address: poolAddress,
      tokenA: 'Unknown', // Would need to parse from account data
      tokenB: 'Unknown',
      liquidity: 0,
      volume24h: 0,
      riskScore: calculatePoolRiskScore(0, 0),
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.warn(`Error enriching pool data for ${poolAddress}:`, error);
    return {
      address: poolAddress,
      tokenA: 'Unknown',
      tokenB: 'Unknown',
      liquidity: 0,
      volume24h: 0,
      riskScore: calculatePoolRiskScore(0, 0),
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
  }
}

// Calculate pool risk score based on liquidity and volume
function calculatePoolRiskScore(liquidity: number, volume24h: number): number {
  // Simple risk calculation (0-100 scale)
  let score = 50; // Base score
  
  if (liquidity > 1000000) score += 20; // High liquidity
  else if (liquidity < 10000) score -= 20; // Low liquidity
  
  if (volume24h > 100000) score += 15; // High volume
  else if (volume24h < 1000) score -= 15; // Low volume
  
  return Math.max(0, Math.min(100, score));
} 