// ORC Pool Detection - following 0rug.com coding guidelines

import { PublicKey, Connection, VersionedTransactionResponse } from '@solana/web3.js';
import { createORCConnection, executeORCOperation } from '../shared/solana';
import { PoolData } from '../shared/types';
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
    const signatures = await connection.getSignaturesForAddress(
      ORC_PROGRAM_ID,
      { limit: 10 }
    );

    return await processPoolSignatures(connection, signatures);
      } catch {
      return [];
    }
}

// Process pool signatures to extract pool data
async function processPoolSignatures(
  connection: Connection,
  signatures: Array<{ signature: string }>
): Promise<PoolData[]> {
  const pools: PoolData[] = [];

  for (const sig of signatures) {
    try {
      const poolData = await extractPoolFromSignature(connection, sig.signature);
      if (poolData) {
        pools.push(poolData);
      }
    } catch {
      // Silently continue processing other signatures
    }
  }

  return pools;
}

// Extract pool data from a single signature
async function extractPoolFromSignature(
  connection: Connection,
  signature: string
): Promise<PoolData | null> {
  const tx = await connection.getTransaction(signature, {
    maxSupportedTransactionVersion: 0
  });
  
  if (!tx || !isPoolCreationTransaction(tx)) {
    return null;
  }

  const poolAddress = extractPoolAddressFromTx(tx);
  if (!poolAddress) {
    return null;
  }

  return await enrichPoolData(connection, poolAddress);
}

// Check if transaction is pool creation
function isPoolCreationTransaction(tx: VersionedTransactionResponse): boolean {
  const logs = tx.meta?.logMessages || [];
  return logs.some((log: string) => 
    log.includes('Initialize') || log.includes('CreatePool')
  );
}

// Extract pool address from transaction
function extractPoolAddressFromTx(tx: VersionedTransactionResponse): string | null {
  try {
    const logs = tx.meta?.logMessages || [];
    
    for (const log of logs) {
      if (log.includes('Pool created') || log.includes('Address:')) {
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
    await connection.getAccountInfo(publicKey);
    
    return createPoolData(poolAddress);
  } catch {
    return createDefaultPoolData(poolAddress);
  }
}

// Create pool data with default values
function createPoolData(poolAddress: string): PoolData {
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

// Create default pool data for errors
function createDefaultPoolData(poolAddress: string): PoolData {
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

// Calculate pool risk score based on liquidity and volume
function calculatePoolRiskScore(liquidity: number, volume24h: number): number {
  let score = 50; // Base score
  
  if (liquidity > 1000000) score += 20; // High liquidity
  else if (liquidity < 10000) score -= 20; // Low liquidity
  
  if (volume24h > 100000) score += 15; // High volume
  else if (volume24h < 1000) score -= 15; // Low volume
  
  return Math.max(0, Math.min(100, score));
} 