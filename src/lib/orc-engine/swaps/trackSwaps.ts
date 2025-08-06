// ORC Swap Tracker - following 0rug.com coding guidelines

import { PublicKey, Connection } from '@solana/web3.js';
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
    // Get recent signatures for ORC program
    const signatures = await connection.getSignaturesForAddress(
      ORC_PROGRAM_ID,
      { limit: 20 }
    );

    const swaps: SwapAlert[] = [];

    // Process each signature to find swap transactions
    for (const sig of signatures) {
      try {
        const tx = await connection.getTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0
        });
        
        if (tx && isSwapTransaction(tx)) {
          const swapData = extractSwapDataFromTx(tx);
          if (swapData) {
            swaps.push(swapData);
          }
        }
      } catch (error) {
        console.warn(`Error processing signature ${sig.signature}:`, error);
      }
    }

    return swaps;
  } catch (error) {
    console.error('Error tracking swaps:', error);
    throw error;
  }
}

// Check if transaction is a swap
function isSwapTransaction(tx: any): boolean {
  // Check for swap-related log messages
  return tx?.meta?.logMessages?.some((log: string) => 
    log.includes('Swap') || log.includes('Exchange')
  ) || false;
}

// Extract swap data from transaction
function extractSwapDataFromTx(tx: any): SwapAlert | null {
  try {
    const logs = tx.meta?.logMessages || [];
    
    // Extract basic swap information
    const swapData: SwapAlert = {
      dexName: 'ORC',
      tokenIn: 'Unknown',
      tokenOut: 'Unknown',
      amountIn: 0,
      amountOut: 0,
      swapSize: 0,
      sizeCategory: 'small',
      transactionHash: tx.transaction.signatures[0] || '',
      timestamp: new Date().toISOString(),
      riskLevel: 'low',
      alertType: 'swap'
    };

    // Parse logs for swap details
    for (const log of logs) {
      if (log.includes('Swap')) {
        // Extract token information
        const tokenMatch = log.match(/([A-Za-z0-9]{32,44})/g);
        if (tokenMatch && tokenMatch.length >= 2) {
          swapData.tokenIn = tokenMatch[0];
          swapData.tokenOut = tokenMatch[1];
        }

        // Extract amount information
        const amountMatch = log.match(/(\d+(?:\.\d+)?)/);
        if (amountMatch) {
          swapData.amountIn = parseFloat(amountMatch[1]);
          swapData.swapSize = swapData.amountIn;
        }
      }
    }

    // Determine size category
    if (swapData.swapSize > 10000) {
      swapData.sizeCategory = 'whale';
      swapData.riskLevel = 'high';
    } else if (swapData.swapSize > 1000) {
      swapData.sizeCategory = 'large';
      swapData.riskLevel = 'medium';
    } else if (swapData.swapSize > 100) {
      swapData.sizeCategory = 'medium';
      swapData.riskLevel = 'low';
    } else {
      swapData.sizeCategory = 'small';
      swapData.riskLevel = 'low';
    }

    return swapData;
  } catch (error) {
    console.warn('Error extracting swap data:', error);
    return null;
  }
} 