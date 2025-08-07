// Birdeye API Integration - Real-time volume and transaction patterns
// Following 0rug.com coding guidelines - PAID API (1k/day limit)

interface BirdeyeTokenData {
  address: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  volumeChange24h: number;
  marketCap: number;
  fdv: number;
  liquidity: number;
  holders: number;
  supply: number;
}

interface BirdeyeVolumeSpike {
  address: string;
  symbol: string;
  volume24h: number;
  volumeChange24h: number;
  priceChange24h: number;
  spikeLevel: 'MASSIVE' | 'LARGE' | 'MEDIUM' | 'SMALL' | 'NONE';
  riskScore: number;
  recommendations: string[];
}

interface BirdeyeTransactionPattern {
  address: string;
  buyCount: number;
  sellCount: number;
  totalVolume: number;
  averageTransactionSize: number;
  largestTransaction: number;
  pattern: 'PUMP_AND_DUMP' | 'ORGANIC_GROWTH' | 'MANIPULATION' | 'STABLE';
  riskScore: number;
}

// Get real-time token data from Birdeye
export async function getBirdeyeTokenData(tokenAddress: string): Promise<BirdeyeTokenData | null> {
  try {
    const response = await fetch(`https://public-api.birdeye.so/public/price?address=${tokenAddress}`, {
      headers: {
        'X-API-KEY': process.env.BIRDEYE_API_KEY || '',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Birdeye API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.success) {
      return null;
    }

    const token = data.data;
    
    return {
      address: tokenAddress,
      name: token.name || 'Unknown',
      symbol: token.symbol || 'UNKNOWN',
      price: token.value || 0,
      priceChange24h: token.change24h || 0,
      volume24h: token.volume24h || 0,
      volumeChange24h: token.volumeChange24h || 0,
      marketCap: token.mc || 0,
      fdv: token.fdv || 0,
      liquidity: token.liquidity || 0,
      holders: token.holders || 0,
      supply: token.supply || 0
    };
  } catch (error) {
    console.error('Birdeye token data error:', error);
    return null;
  }
}

// Get volume spike analysis from Birdeye
export async function getBirdeyeVolumeSpikes(limit: number = 20): Promise<BirdeyeVolumeSpike[]> {
  try {
    const response = await fetch(`https://public-api.birdeye.so/public/tokenlist?sort_by=volume&sort_type=desc&offset=0&limit=${limit}`, {
      headers: {
        'X-API-KEY': process.env.BIRDEYE_API_KEY || '',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Birdeye API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.success || !Array.isArray(data.data)) {
      return [];
    }

    return data.data.map((token: any) => {
      // Calculate spike level based on volume change
      let spikeLevel: 'MASSIVE' | 'LARGE' | 'MEDIUM' | 'SMALL' | 'NONE' = 'NONE';
      const volumeChange = token.volumeChange24h || 0;
      
      if (volumeChange > 1000) spikeLevel = 'MASSIVE';
      else if (volumeChange > 500) spikeLevel = 'LARGE';
      else if (volumeChange > 100) spikeLevel = 'MEDIUM';
      else if (volumeChange > 50) spikeLevel = 'SMALL';

      // Calculate risk score
      let riskScore = 0;
      if (spikeLevel === 'MASSIVE') riskScore = 80;
      else if (spikeLevel === 'LARGE') riskScore = 60;
      else if (spikeLevel === 'MEDIUM') riskScore = 40;
      else if (spikeLevel === 'SMALL') riskScore = 20;

      // Add price manipulation risk
      const priceChange = token.priceChange24h || 0;
      if (Math.abs(priceChange) > 50) riskScore += 20;
      else if (Math.abs(priceChange) > 20) riskScore += 10;

      const recommendations: string[] = [];
      
      if (spikeLevel === 'MASSIVE') {
        recommendations.push('Massive volume spike detected - high risk of manipulation');
      } else if (spikeLevel === 'LARGE') {
        recommendations.push('Large volume spike - monitor closely');
      } else if (spikeLevel === 'MEDIUM') {
        recommendations.push('Moderate volume spike - proceed with caution');
      }

      if (Math.abs(priceChange) > 50) {
        recommendations.push('Extreme price movement - potential pump and dump');
      }

      return {
        address: token.address,
        symbol: token.symbol,
        volume24h: token.volume24h || 0,
        volumeChange24h: volumeChange,
        priceChange24h: priceChange,
        spikeLevel,
        riskScore: Math.min(100, riskScore),
        recommendations
      };
    });
  } catch (error) {
    console.error('Birdeye volume spikes error:', error);
    return [];
  }
}

// Get transaction pattern analysis from Birdeye
export async function getBirdeyeTransactionPattern(tokenAddress: string): Promise<BirdeyeTransactionPattern | null> {
  try {
    const response = await fetch(`https://public-api.birdeye.so/public/transaction?address=${tokenAddress}&limit=100`, {
      headers: {
        'X-API-KEY': process.env.BIRDEYE_API_KEY || '',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Birdeye API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.success || !Array.isArray(data.data)) {
      return null;
    }

    const transactions = data.data;
    let buyCount = 0;
    let sellCount = 0;
    let totalVolume = 0;
    let largestTransaction = 0;

    transactions.forEach((tx: any) => {
      const amount = tx.amount || 0;
      totalVolume += amount;
      largestTransaction = Math.max(largestTransaction, amount);

      if (tx.type === 'buy') {
        buyCount++;
      } else if (tx.type === 'sell') {
        sellCount++;
      }
    });

    const averageTransactionSize = totalVolume / transactions.length;
    const buyRatio = buyCount / (buyCount + sellCount);

    // Determine pattern based on transaction analysis
    let pattern: 'PUMP_AND_DUMP' | 'ORGANIC_GROWTH' | 'MANIPULATION' | 'STABLE' = 'STABLE';
    let riskScore = 0;

    if (buyRatio > 0.8 && transactions.length > 50) {
      pattern = 'PUMP_AND_DUMP';
      riskScore = 80;
    } else if (buyRatio > 0.6 && averageTransactionSize > 1000) {
      pattern = 'ORGANIC_GROWTH';
      riskScore = 30;
    } else if (largestTransaction > 10000) {
      pattern = 'MANIPULATION';
      riskScore = 70;
    }

    return {
      address: tokenAddress,
      buyCount,
      sellCount,
      totalVolume,
      averageTransactionSize,
      largestTransaction,
      pattern,
      riskScore
    };
  } catch (error) {
    console.error('Birdeye transaction pattern error:', error);
    return null;
  }
}

// Get real-time trending tokens from Birdeye
export async function getBirdeyeTrendingTokens(limit: number = 20): Promise<BirdeyeTokenData[]> {
  try {
    const response = await fetch(`https://public-api.birdeye.so/public/tokenlist?sort_by=price&sort_type=desc&offset=0&limit=${limit}`, {
      headers: {
        'X-API-KEY': process.env.BIRDEYE_API_KEY || '',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Birdeye API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.success || !Array.isArray(data.data)) {
      return [];
    }

    return data.data.map((token: any) => ({
      address: token.address,
      name: token.name || 'Unknown',
      symbol: token.symbol || 'UNKNOWN',
      price: token.price || 0,
      priceChange24h: token.priceChange24h || 0,
      volume24h: token.volume24h || 0,
      volumeChange24h: token.volumeChange24h || 0,
      marketCap: token.mc || 0,
      fdv: token.fdv || 0,
      liquidity: token.liquidity || 0,
      holders: token.holders || 0,
      supply: token.supply || 0
    }));
  } catch (error) {
    console.error('Birdeye trending tokens error:', error);
    return [];
  }
}

// Get whale purchase alerts from Birdeye
export async function getBirdeyeWhaleAlerts(tokenAddress: string): Promise<{
  whaleTransactions: Array<{
    wallet: string;
    amount: number;
    type: 'BUY' | 'SELL';
    timestamp: Date;
  }>;
  totalWhaleVolume: number;
  whaleCount: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
} | null> {
  try {
    const response = await fetch(`https://public-api.birdeye.so/public/transaction?address=${tokenAddress}&limit=50`, {
      headers: {
        'X-API-KEY': process.env.BIRDEYE_API_KEY || '',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Birdeye API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.success || !Array.isArray(data.data)) {
      return null;
    }

    // Filter for whale transactions (large amounts)
    const whaleTransactions = data.data
      .filter((tx: any) => (tx.amount || 0) > 1000) // Whale threshold
      .map((tx: any) => ({
        wallet: tx.wallet || 'Unknown',
        amount: tx.amount || 0,
        type: tx.type === 'buy' ? 'BUY' : 'SELL',
        timestamp: new Date(tx.timestamp || Date.now())
      }));

    const totalWhaleVolume = whaleTransactions.reduce((sum: number, tx: any) => sum + tx.amount, 0);
    const whaleCount = whaleTransactions.length;

    // Calculate risk level
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (whaleCount > 10 || totalWhaleVolume > 100000) {
      riskLevel = 'HIGH';
    } else if (whaleCount > 5 || totalWhaleVolume > 50000) {
      riskLevel = 'MEDIUM';
    }

    return {
      whaleTransactions,
      totalWhaleVolume,
      whaleCount,
      riskLevel
    };
  } catch (error) {
    console.error('Birdeye whale alerts error:', error);
    return null;
  }
} 