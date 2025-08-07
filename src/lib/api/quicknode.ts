// QuickNode API Integration - Fast RPC and historical data
// Following 0rug.com coding guidelines - PAID API (1k/day limit)

interface QuickNodeTransaction {
  signature: string;
  blockTime: number;
  slot: number;
  err: any;
  memo: string | null;
  fee: number;
  postBalance: number;
  preBalance: number;
  status: 'SUCCESS' | 'FAILED';
}

interface QuickNodeAccountInfo {
  address: string;
  balance: number;
  owner: string;
  executable: boolean;
  rentEpoch: number;
  data: Uint8Array;
}

interface QuickNodeHistoricalData {
  address: string;
  transactions: QuickNodeTransaction[];
  balanceHistory: Array<{
    timestamp: number;
    balance: number;
  }>;
  firstTransaction: QuickNodeTransaction | null;
  lastTransaction: QuickNodeTransaction | null;
}

// Get fast transaction data from QuickNode
export async function getQuickNodeTransactions(address: string, limit: number = 50): Promise<QuickNodeTransaction[]> {
  try {
    const response = await fetch(process.env.QUICKNODE_RPC_URL || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getSignaturesForAddress',
        params: [
          address,
          {
            limit: limit
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`QuickNode API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.result) {
      return [];
    }

    // Get detailed transaction data
    const transactionPromises = data.result.map(async (sig: any) => {
      try {
        const txResponse = await fetch(process.env.QUICKNODE_RPC_URL || '', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getTransaction',
            params: [
              sig.signature,
              {
                maxSupportedTransactionVersion: 0
              }
            ]
          })
        });

        if (!txResponse.ok) return null;

        const txData = await txResponse.json();
        
        if (!txData.result) return null;

        return {
          signature: sig.signature,
          blockTime: sig.blockTime,
          slot: sig.slot,
          err: txData.result.err,
          memo: txData.result.transaction?.message?.memo || null,
          fee: txData.result.meta?.fee || 0,
          postBalance: txData.result.meta?.postBalances?.[0] || 0,
          preBalance: txData.result.meta?.preBalances?.[0] || 0,
          status: txData.result.err ? 'FAILED' : 'SUCCESS'
        };
      } catch {
        return null;
      }
    });

    const transactions = await Promise.all(transactionPromises);
    return transactions.filter(tx => tx !== null);
  } catch (error) {
    console.error('QuickNode transactions error:', error);
    return [];
  }
}

// Get account info from QuickNode
export async function getQuickNodeAccountInfo(address: string): Promise<QuickNodeAccountInfo | null> {
  try {
    const response = await fetch(process.env.QUICKNODE_RPC_URL || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getAccountInfo',
        params: [
          address,
          {
            encoding: 'base64'
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`QuickNode API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.result || !data.result.value) {
      return null;
    }

    const account = data.result.value;
    
    return {
      address,
      balance: account.lamports,
      owner: account.owner,
      executable: account.executable,
      rentEpoch: account.rentEpoch,
      data: new Uint8Array(Buffer.from(account.data[0], 'base64'))
    };
  } catch (error) {
    console.error('QuickNode account info error:', error);
    return null;
  }
}

// Get historical data from QuickNode
export async function getQuickNodeHistoricalData(address: string, days: number = 30): Promise<QuickNodeHistoricalData | null> {
  try {
    const transactions = await getQuickNodeTransactions(address, 1000);
    
    if (transactions.length === 0) {
      return null;
    }

    // Sort transactions by time
    const sortedTransactions = transactions.sort((a, b) => a.blockTime - b.blockTime);
    
    // Create balance history
    const balanceHistory = sortedTransactions.map(tx => ({
      timestamp: tx.blockTime,
      balance: tx.postBalance
    }));

    return {
      address,
      transactions: sortedTransactions,
      balanceHistory,
      firstTransaction: sortedTransactions[0] || null,
      lastTransaction: sortedTransactions[sortedTransactions.length - 1] || null
    };
  } catch (error) {
    console.error('QuickNode historical data error:', error);
    return null;
  }
}

// Get wallet launch tracker from QuickNode
export async function getQuickNodeWalletLaunchTracker(walletAddress: string): Promise<{
  launchDate: Date | null;
  firstToken: string | null;
  successRate: number;
  totalLaunches: number;
  recommendations: string[];
} | null> {
  try {
    const historicalData = await getQuickNodeHistoricalData(walletAddress, 365);
    
    if (!historicalData || historicalData.transactions.length === 0) {
      return null;
    }

    const firstTransaction = historicalData.firstTransaction;
    const launchDate = firstTransaction ? new Date(firstTransaction.blockTime * 1000) : null;

    // Analyze transactions to find token launches
    const tokenLaunches = historicalData.transactions.filter(tx => 
      tx.memo && tx.memo.toLowerCase().includes('launch')
    );

    const totalLaunches = tokenLaunches.length;
    const successRate = totalLaunches > 0 ? (tokenLaunches.filter(tx => tx.status === 'SUCCESS').length / totalLaunches) * 100 : 0;

    const recommendations: string[] = [];
    
    if (totalLaunches > 10) {
      recommendations.push('This wallet has launched many tokens - high risk');
    } else if (totalLaunches > 5) {
      recommendations.push('This wallet has launched several tokens - moderate risk');
    } else if (totalLaunches > 0) {
      recommendations.push('This wallet has launched tokens - proceed with caution');
    }

    if (successRate < 50) {
      recommendations.push('Low success rate for launched tokens');
    }

    return {
      launchDate,
      firstToken: tokenLaunches[0]?.signature || null,
      successRate,
      totalLaunches,
      recommendations
    };
  } catch (error) {
    console.error('QuickNode wallet launch tracker error:', error);
    return null;
  }
}

// Get transaction replay debugging from QuickNode
export async function getQuickNodeTransactionReplay(signature: string): Promise<{
  success: boolean;
  error?: string;
  details: {
    fee: number;
    instructions: number;
    accounts: number;
    logs: string[];
  };
} | null> {
  try {
    const response = await fetch(process.env.QUICKNODE_RPC_URL || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransaction',
        params: [
          signature,
          {
            maxSupportedTransactionVersion: 0,
            encoding: 'jsonParsed'
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`QuickNode API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.result) {
      return {
        success: false,
        error: 'Transaction not found',
        details: {
          fee: 0,
          instructions: 0,
          accounts: 0,
          logs: []
        }
      };
    }

    const transaction = data.result;
    const meta = transaction.meta;
    const message = transaction.transaction?.message;

    return {
      success: !meta.err,
      error: meta.err ? JSON.stringify(meta.err) : undefined,
      details: {
        fee: meta.fee || 0,
        instructions: message?.instructions?.length || 0,
        accounts: message?.accountKeys?.length || 0,
        logs: meta.logs || []
      }
    };
  } catch (error) {
    console.error('QuickNode transaction replay error:', error);
    return null;
  }
}

// Fast RPC fallback for when Solana RPC fails
export async function getQuickNodeFastRPC<T>(method: string, params: any[]): Promise<T | null> {
  try {
    const response = await fetch(process.env.QUICKNODE_RPC_URL || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params
      })
    });

    if (!response.ok) {
      throw new Error(`QuickNode API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.result) {
      return null;
    }

    return data.result;
  } catch (error) {
    console.error('QuickNode fast RPC error:', error);
    return null;
  }
} 