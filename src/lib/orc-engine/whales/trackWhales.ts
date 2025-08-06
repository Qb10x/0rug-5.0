// ORC Whale Tracker - following 0rug.com coding guidelines

import { Connection, VersionedTransactionResponse } from '@solana/web3.js';
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
    const signatures = await connection.getSignaturesForAddress(
      ORC_PROGRAM_ID,
      { limit: 50 }
    );

    return await processWhaleSignatures(connection, signatures);
      } catch {
      return [];
    }
}

// Process whale signatures to extract whale data
async function processWhaleSignatures(
  connection: Connection,
  signatures: Array<{ signature: string }>
): Promise<WhaleAlert[]> {
  const whaleAlerts: WhaleAlert[] = [];

  for (const sig of signatures) {
    try {
      const whaleData = await extractWhaleFromSignature(connection, sig.signature);
      if (whaleData) {
        whaleAlerts.push(whaleData);
      }
    } catch {
      // Silently continue processing other signatures
    }
  }

  return whaleAlerts;
}

// Extract whale data from a single signature
async function extractWhaleFromSignature(
  connection: Connection,
  signature: string
): Promise<WhaleAlert | null> {
  const tx = await connection.getTransaction(signature, {
    maxSupportedTransactionVersion: 0
  });
  
  if (!tx || !isWhaleTransaction(tx)) {
    return null;
  }

  return extractWhaleDataFromTx(tx, signature);
}

// Check if transaction involves whale activity
function isWhaleTransaction(tx: VersionedTransactionResponse): boolean {
  const logs = tx.meta?.logMessages || [];
  return logs.some((log: string) => 
    (log.includes('Transfer') && log.includes('large')) ||
    (log.includes('Swap') && log.includes('amount'))
  );
}

// Extract whale data from transaction
function extractWhaleDataFromTx(
  tx: VersionedTransactionResponse,
  signature: string
): WhaleAlert | null {
  try {
    const logs = tx.meta?.logMessages || [];
    const whaleInfo = parseWhaleLogs(logs);
    
    if (!whaleInfo.whaleAddress || whaleInfo.amount === 0) {
      return null;
    }

    const whaleData = createWhaleAlert(whaleInfo, signature);
    return categorizeWhaleRisk(whaleData);
      } catch {
      return null;
    }
}

// Parse whale logs to extract whale information
function parseWhaleLogs(logs: string[]): {
  whaleAddress: string;
  amount: number;
} {
  let whaleAddress = '';
  let amount = 0;

  for (const log of logs) {
    if (log.includes('Transfer')) {
      const addressMatch = log.match(/([A-Za-z0-9]{32,44})/);
      if (addressMatch) {
        whaleAddress = addressMatch[1];
      }

      const amountMatch = log.match(/(\d+(?:\.\d+)?)/);
      if (amountMatch) {
        amount = parseFloat(amountMatch[1]);
      }
    }
  }

  return { whaleAddress, amount };
}

// Create base whale alert
function createWhaleAlert(
  whaleInfo: { whaleAddress: string; amount: number },
  signature: string
): WhaleAlert {
  return {
    whaleAddress: whaleInfo.whaleAddress,
    operation: 'transfer',
    amount: whaleInfo.amount,
    transactionHash: signature,
    timestamp: new Date().toISOString(),
    riskLevel: 'low',
    alertType: 'whale_movement'
  };
}

// Categorize whale risk based on amount
function categorizeWhaleRisk(whaleData: WhaleAlert): WhaleAlert {
  const { amount } = whaleData;

  if (amount > 100000) {
    whaleData.riskLevel = 'high';
  } else if (amount > 10000) {
    whaleData.riskLevel = 'medium';
  } else {
    whaleData.riskLevel = 'low';
  }

  return whaleData;
} 