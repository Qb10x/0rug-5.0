// Helius API Integration - Advanced wallet tracking and NFT indexing
// Following 0rug.com coding guidelines - PAID API (1k/day limit)

interface HeliusWalletActivity {
  address: string;
  activityType: 'BUYING' | 'SELLING' | 'LP_ADD' | 'LP_REMOVE' | 'HOLDING';
  tokenAddress?: string;
  amount?: number;
  timestamp: Date;
  transactionSignature: string;
  reputation: 'LEGENDARY' | 'EXPERT' | 'PROFICIENT' | 'NOVICE';
}

interface HeliusLPData {
  poolAddress: string;
  tokenA: string;
  tokenB: string;
  tokenAAmount: number;
  tokenBAmount: number;
  lpSupply: number;
  lockStatus: 'LOCKED' | 'UNLOCKED' | 'PARTIAL';
  lockDuration?: number;
  lockSource?: string;
}

interface HeliusWalletGraph {
  address: string;
  connections: string[];
  transactionCount: number;
  totalValue: number;
  riskScore: number;
  cluster: string;
}

// Get advanced wallet activity from Helius
export async function getHeliusWalletActivity(walletAddress: string, limit: number = 50): Promise<HeliusWalletActivity[]> {
  try {
    const response = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=${process.env.HELIUS_API_KEY}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Helius API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data)) {
      return [];
    }

    // Process transactions to identify activity types
    const activities: HeliusWalletActivity[] = data.slice(0, limit).map((tx: any) => {
      let activityType: 'BUYING' | 'SELLING' | 'LP_ADD' | 'LP_REMOVE' | 'HOLDING' = 'HOLDING';
      let tokenAddress: string | undefined;
      let amount: number | undefined;

      // Analyze transaction to determine activity type
      if (tx.type === 'SWAP' && tx.tokenTransfers) {
        const transfer = tx.tokenTransfers[0];
        if (transfer.fromUserAccount === walletAddress) {
          activityType = 'SELLING';
        } else if (transfer.toUserAccount === walletAddress) {
          activityType = 'BUYING';
        }
        tokenAddress = transfer.mint;
        amount = transfer.amount;
      } else if (tx.type === 'LIQUIDITY') {
        if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
          activityType = 'LP_ADD';
        } else {
          activityType = 'LP_REMOVE';
        }
      }

      // Calculate reputation based on transaction value and frequency
      let reputation: 'LEGENDARY' | 'EXPERT' | 'PROFICIENT' | 'NOVICE' = 'NOVICE';
      if (amount && amount > 10000) reputation = 'LEGENDARY';
      else if (amount && amount > 5000) reputation = 'EXPERT';
      else if (amount && amount > 1000) reputation = 'PROFICIENT';

      return {
        address: walletAddress,
        activityType,
        tokenAddress,
        amount,
        timestamp: new Date(tx.timestamp * 1000),
        transactionSignature: tx.signature,
        reputation
      };
    });

    return activities;
  } catch (error) {
    console.error('Helius wallet activity error:', error);
    return [];
  }
}

// Get LP data from Helius
export async function getHeliusLPData(poolAddress: string): Promise<HeliusLPData | null> {
  try {
    const response = await fetch(`https://api.helius.xyz/v0/addresses/${poolAddress}/transactions?api-key=${process.env.HELIUS_API_KEY}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Helius API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data)) {
      return null;
    }

    // Analyze LP transactions to determine lock status
    let lockStatus: 'LOCKED' | 'UNLOCKED' | 'PARTIAL' = 'UNLOCKED';
    let lockDuration: number | undefined;
    let lockSource: string | undefined;

    // Look for lock-related transactions
    const lockTransactions = data.filter((tx: any) => 
      tx.type === 'LIQUIDITY' && tx.description?.includes('lock')
    );

    if (lockTransactions.length > 0) {
      lockStatus = 'LOCKED';
      lockSource = 'Helius Analysis';
      // Estimate lock duration based on transaction patterns
      lockDuration = 30; // Default 30 days
    }

    return {
      poolAddress,
      tokenA: '', // Would need additional API call to get token details
      tokenB: '',
      tokenAAmount: 0,
      tokenBAmount: 0,
      lpSupply: 0,
      lockStatus,
      lockDuration,
      lockSource
    };
  } catch (error) {
    console.error('Helius LP data error:', error);
    return null;
  }
}

// Get wallet graph data from Helius
export async function getHeliusWalletGraph(walletAddress: string): Promise<HeliusWalletGraph | null> {
  try {
    const response = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=${process.env.HELIUS_API_KEY}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Helius API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data)) {
      return null;
    }

    // Extract connections from transactions
    const connections = new Set<string>();
    let totalValue = 0;
    let transactionCount = data.length;

    data.forEach((tx: any) => {
      if (tx.tokenTransfers) {
        tx.tokenTransfers.forEach((transfer: any) => {
          if (transfer.fromUserAccount && transfer.fromUserAccount !== walletAddress) {
            connections.add(transfer.fromUserAccount);
          }
          if (transfer.toUserAccount && transfer.toUserAccount !== walletAddress) {
            connections.add(transfer.toUserAccount);
          }
          if (transfer.amount) {
            totalValue += transfer.amount;
          }
        });
      }
    });

    // Calculate risk score based on activity patterns
    const riskScore = Math.min(100, Math.max(0,
      (connections.size / 100) * 30 +
      (transactionCount / 1000) * 40 +
      (totalValue > 10000 ? 30 : 0)
    ));

    return {
      address: walletAddress,
      connections: Array.from(connections),
      transactionCount,
      totalValue,
      riskScore,
      cluster: 'main' // Would need additional analysis for clustering
    };
  } catch (error) {
    console.error('Helius wallet graph error:', error);
    return null;
  }
}

// Enhanced LP source identification from Helius
export async function getHeliusLPSourceIdentification(poolAddress: string): Promise<{
  source: string;
  lockProvider?: string;
  lockDuration?: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendations: string[];
} | null> {
  try {
    const lpData = await getHeliusLPData(poolAddress);
    
    if (!lpData) {
      return null;
    }

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
    const recommendations: string[] = [];

    if (lpData.lockStatus === 'LOCKED') {
      riskLevel = 'LOW';
      recommendations.push('LP is locked - good security');
    } else if (lpData.lockStatus === 'PARTIAL') {
      riskLevel = 'MEDIUM';
      recommendations.push('LP is partially locked - moderate risk');
    } else {
      riskLevel = 'HIGH';
      recommendations.push('LP is unlocked - high risk');
    }

    return {
      source: 'Helius Analysis',
      lockProvider: lpData.lockSource,
      lockDuration: lpData.lockDuration,
      riskLevel,
      recommendations
    };
  } catch (error) {
    console.error('Helius LP source identification error:', error);
    return null;
  }
}

// Get advanced wallet tracking from Helius
export async function getHeliusAdvancedWalletTracking(walletAddress: string): Promise<{
  walletType: 'WHALE' | 'DEVELOPER' | 'BOT' | 'REGULAR';
  activityPattern: string;
  riskScore: number;
  recommendations: string[];
} | null> {
  try {
    const activities = await getHeliusWalletActivity(walletAddress, 100);
    
    if (activities.length === 0) {
      return null;
    }

    // Analyze activity patterns
    const buyCount = activities.filter(a => a.activityType === 'BUYING').length;
    const sellCount = activities.filter(a => a.activityType === 'SELLING').length;
    const lpCount = activities.filter(a => a.activityType === 'LP_ADD' || a.activityType === 'LP_REMOVE').length;

    let walletType: 'WHALE' | 'DEVELOPER' | 'BOT' | 'REGULAR' = 'REGULAR';
    let activityPattern = 'REGULAR';
    let riskScore = 0;

    // Determine wallet type based on activity patterns
    if (lpCount > buyCount + sellCount) {
      walletType = 'DEVELOPER';
      activityPattern = 'LP_MANAGEMENT';
      riskScore = 80;
    } else if (buyCount + sellCount > 50) {
      walletType = 'BOT';
      activityPattern = 'HIGH_FREQUENCY_TRADING';
      riskScore = 60;
    } else if (activities.some(a => a.amount && a.amount > 10000)) {
      walletType = 'WHALE';
      activityPattern = 'LARGE_TRANSACTIONS';
      riskScore = 40;
    }

    const recommendations: string[] = [];
    
    if (walletType === 'DEVELOPER') {
      recommendations.push('This appears to be a developer wallet - monitor closely');
    } else if (walletType === 'BOT') {
      recommendations.push('This appears to be a trading bot - be cautious');
    } else if (walletType === 'WHALE') {
      recommendations.push('This is a whale wallet - follow their moves');
    }

    return {
      walletType,
      activityPattern,
      riskScore,
      recommendations
    };
  } catch (error) {
    console.error('Helius advanced wallet tracking error:', error);
    return null;
  }
} 