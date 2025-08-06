// ORC Swap Tracker - following 0rug.com coding guidelines

import { Connection, VersionedTransactionResponse } from '@solana/web3.js';
import { createORCConnection, executeORCOperation } from '../shared/solana';
import { SwapAlert } from '../shared/types';
import { ORC_PROGRAM_ID } from '../shared/orcConstants';

// Track recent swaps using ORC data
export async function trackSwaps(): Promise<SwapAlert[]> {
  return executeORCOperation(async () => {
    const connection = await createORCConnection();
    return await getRecentSwaps(connection);
  });
}

// Get recent swaps from ORC program
async function getRecentSwaps(connection: Connection): Promise<SwapAlert[]> {
  try {
    const signatures = await connection.getSignaturesForAddress(
      ORC_PROGRAM_ID,
      { limit: 20 }
    );

    return await processSwapSignatures(connection, signatures);
      } catch {
      return [];
    }
}

// Process swap signatures to extract swap data
async function processSwapSignatures(
  connection: Connection,
  signatures: Array<{ signature: string }>
): Promise<SwapAlert[]> {
  const swaps: SwapAlert[] = [];

  for (const sig of signatures) {
    try {
      const swapData = await extractSwapFromSignature(connection, sig.signature);
      if (swapData) {
        swaps.push(swapData);
      }
    } catch {
      // Silently continue processing other signatures
    }
  }

  return swaps;
}

// Extract swap data from a single signature
async function extractSwapFromSignature(
  connection: Connection,
  signature: string
): Promise<SwapAlert | null> {
  const tx = await connection.getTransaction(signature, {
    maxSupportedTransactionVersion: 0
  });
  
  if (!tx || !isSwapTransaction(tx)) {
    return null;
  }

  return extractSwapDataFromTx(tx, signature);
}

// Check if transaction is a swap
function isSwapTransaction(tx: VersionedTransactionResponse): boolean {
  const logs = tx.meta?.logMessages || [];
  return logs.some((log: string) => 
    log.includes('Swap') || log.includes('Exchange')
  );
}

// Extract swap data from transaction
function extractSwapDataFromTx(
  tx: VersionedTransactionResponse,
  signature: string
): SwapAlert | null {
  try {
    const logs = tx.meta?.logMessages || [];
    const swapInfo = parseSwapLogs(logs);
    
    if (!swapInfo.tokenIn || !swapInfo.tokenOut) {
      return null;
    }

    const swapData = createSwapAlert(swapInfo, signature);
    return categorizeSwapSize(swapData);
      } catch {
      return null;
    }
}

// Parse swap logs to extract token and amount information
function parseSwapLogs(logs: string[]): {
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
} {
  let tokenIn = '';
  let tokenOut = '';
  let amountIn = 0;

  for (const log of logs) {
    if (log.includes('Swap')) {
      const tokenMatch = log.match(/([A-Za-z0-9]{32,44})/g);
      if (tokenMatch && tokenMatch.length >= 2) {
        tokenIn = tokenMatch[0];
        tokenOut = tokenMatch[1];
      }

      const amountMatch = log.match(/(\d+(?:\.\d+)?)/);
      if (amountMatch) {
        amountIn = parseFloat(amountMatch[1]);
      }
    }
  }

  return { tokenIn, tokenOut, amountIn };
}

// Create base swap alert
function createSwapAlert(
  swapInfo: { tokenIn: string; tokenOut: string; amountIn: number },
  signature: string
): SwapAlert {
  return {
    dexName: 'ORC',
    tokenIn: swapInfo.tokenIn,
    tokenOut: swapInfo.tokenOut,
    amountIn: swapInfo.amountIn,
    amountOut: 0,
    swapSize: swapInfo.amountIn,
    sizeCategory: 'small',
    transactionHash: signature,
    timestamp: new Date().toISOString(),
    riskLevel: 'low',
    alertType: 'swap'
  };
}

// Categorize swap size and set risk level
function categorizeSwapSize(swapData: SwapAlert): SwapAlert {
  const { swapSize } = swapData;

  if (swapSize > 10000) {
    swapData.sizeCategory = 'whale';
    swapData.riskLevel = 'high';
  } else if (swapSize > 1000) {
    swapData.sizeCategory = 'large';
    swapData.riskLevel = 'medium';
  } else if (swapSize > 100) {
    swapData.sizeCategory = 'medium';
    swapData.riskLevel = 'low';
  } else {
    swapData.sizeCategory = 'small';
    swapData.riskLevel = 'low';
  }

  return swapData;
} 