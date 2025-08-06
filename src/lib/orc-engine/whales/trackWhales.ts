// ORC Whale Tracker - following 0rug.com coding guidelines

import { PublicKey, Connection } from '@solana/web3.js';
import { createORCConnection, executeORCOperation } from '../shared/solana';
import { WhaleAlert } from '../shared/types';
import { ORC_PROGRAM_ID } from '../shared/orcConstants';

// Track whale movements using ORC data
export async function trackWhaleMovements(): Promise<WhaleAlert[]> {
  return executeORCOperation(async () => {
    const connection = await createORCConnection();
    return await getWhaleActivity(connection);
  });
}

// Get whale activity from ORC program
async function getWhaleActivity(connection: Connection): Promise<WhaleAlert[]> {
  try {
    // Get recent signatures for ORC program
    const signatures = await connection.getSignaturesForAddress(
      ORC_PROGRAM_ID,
      { limit: 50 }
    );

    const whaleAlerts: WhaleAlert[] = [];

    // Process each signature to find whale transactions
    for (const sig of signatures) {
      try {
        const tx = await connection.getTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0
        });
        
        if (tx && isWhaleTransaction(tx)) {
          const whaleData = extractWhaleDataFromTx(tx);
          if (whaleData) {
            whaleAlerts.push(whaleData);
          }
        }
      } catch (error) {
        console.warn(`Error processing signature ${sig.signature}:`, error);
      }
    }

    return whaleAlerts;
  } catch (error) {
    console.error('Error tracking whale movements:', error);
    throw error;
  }
}

// Check if transaction involves whale activity
function isWhaleTransaction(tx: any): boolean {
  // Check for large transactions in log messages
  return tx?.meta?.logMessages?.some((log: string) => 
    log.includes('Transfer') && log.includes('large') ||
    log.includes('Swap') && log.includes('amount')
  ) || false;
}

// Extract whale data from transaction
function extractWhaleDataFromTx(tx: any): WhaleAlert | null {
  try {
    const logs = tx.meta?.logMessages || [];
    
    // Extract basic whale information
    const whaleData: WhaleAlert = {
      whaleAddress: 'Unknown',
      operation: 'transfer',
      amount: 0,
      transactionHash: tx.transaction.signatures[0] || '',
      timestamp: new Date().toISOString(),
      riskLevel: 'low',
      alertType: 'whale_movement'
    };

    // Parse logs for whale details
    for (const log of logs) {
      if (log.includes('Transfer')) {
        // Extract whale address
        const addressMatch = log.match(/([A-Za-z0-9]{32,44})/);
        if (addressMatch) {
          whaleData.whaleAddress = addressMatch[1];
        }

        // Extract amount
        const amountMatch = log.match(/(\d+(?:\.\d+)?)/);
        if (amountMatch) {
          whaleData.amount = parseFloat(amountMatch[1]);
        }
      }
    }

    // Determine risk level based on amount
    if (whaleData.amount > 100000) {
      whaleData.riskLevel = 'high';
    } else if (whaleData.amount > 10000) {
      whaleData.riskLevel = 'medium';
    } else {
      whaleData.riskLevel = 'low';
    }

    return whaleData;
  } catch (error) {
    console.warn('Error extracting whale data:', error);
    return null;
  }
} 