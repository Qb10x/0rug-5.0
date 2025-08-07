// Moralis API Integration - Enhanced wallet profiling and token metadata
// Following 0rug.com coding guidelines - PAID API (1k/day limit)

interface MoralisTokenMetadata {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  tags: string[];
  verified: boolean;
}

interface MoralisWalletProfile {
  address: string;
  balance: number;
  tokenCount: number;
  nftCount: number;
  transactionCount: number;
  firstTransaction: Date;
  lastTransaction: Date;
  reputation: 'LEGENDARY' | 'EXPERT' | 'PROFICIENT' | 'NOVICE';
  riskScore: number;
}

interface MoralisTokenAge {
  address: string;
  creationDate: Date;
  ageInDays: number;
  firstTransaction: string;
  creator: string;
}

// Enhanced token metadata from Moralis
export async function getMoralisTokenMetadata(tokenAddress: string): Promise<MoralisTokenMetadata | null> {
  try {
    const response = await fetch(`https://deep-index.moralis.io/api/v2.2/erc20/metadata?chain=solana&addresses=${tokenAddress}`, {
      headers: {
        'X-API-Key': process.env.MORALIS_API_KEY || '',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Moralis API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      return null;
    }

    const token = data[0];
    
    return {
      address: token.address,
      name: token.name || 'Unknown',
      symbol: token.symbol || 'UNKNOWN',
      decimals: token.decimals || 0,
      logoURI: token.logoURI,
      tags: token.tags || [],
      verified: token.verified || false
    };
  } catch (error) {
    console.error('Moralis token metadata error:', error);
    return null;
  }
}

// Enhanced wallet profiling from Moralis
export async function getMoralisWalletProfile(walletAddress: string): Promise<MoralisWalletProfile | null> {
  try {
    const response = await fetch(`https://deep-index.moralis.io/api/v2.2/${walletAddress}?chain=solana`, {
      headers: {
        'X-API-Key': process.env.MORALIS_API_KEY || '',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Moralis API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data) {
      return null;
    }

    // Calculate reputation based on transaction count and balance
    let reputation: 'LEGENDARY' | 'EXPERT' | 'PROFICIENT' | 'NOVICE' = 'NOVICE';
    if (data.transaction_count > 1000 && data.balance > 10000) reputation = 'LEGENDARY';
    else if (data.transaction_count > 500 && data.balance > 5000) reputation = 'EXPERT';
    else if (data.transaction_count > 100 && data.balance > 1000) reputation = 'PROFICIENT';

    // Calculate risk score (0-100)
    const riskScore = Math.min(100, Math.max(0, 
      (data.transaction_count / 1000) * 30 + 
      (data.balance > 10000 ? 20 : 0) +
      (data.token_count > 50 ? 25 : 0) +
      (data.nft_count > 10 ? 25 : 0)
    ));

    return {
      address: walletAddress,
      balance: data.balance || 0,
      tokenCount: data.token_count || 0,
      nftCount: data.nft_count || 0,
      transactionCount: data.transaction_count || 0,
      firstTransaction: data.first_transaction ? new Date(data.first_transaction) : new Date(),
      lastTransaction: data.last_transaction ? new Date(data.last_transaction) : new Date(),
      reputation,
      riskScore
    };
  } catch (error) {
    console.error('Moralis wallet profile error:', error);
    return null;
  }
}

// Get token age and creation details from Moralis
export async function getMoralisTokenAge(tokenAddress: string): Promise<MoralisTokenAge | null> {
  try {
    const response = await fetch(`https://deep-index.moralis.io/api/v2.2/erc20/${tokenAddress}?chain=solana`, {
      headers: {
        'X-API-Key': process.env.MORALIS_API_KEY || '',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Moralis API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data) {
      return null;
    }

    const creationDate = new Date(data.created_at || Date.now());
    const now = new Date();
    const ageInDays = Math.floor((now.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      address: tokenAddress,
      creationDate,
      ageInDays,
      firstTransaction: data.first_transaction || '',
      creator: data.creator || 'Unknown'
    };
  } catch (error) {
    console.error('Moralis token age error:', error);
    return null;
  }
}

// Get wallet transaction history from Moralis
export async function getMoralisWalletTransactions(walletAddress: string, limit: number = 50): Promise<Array<Record<string, unknown>>> {
  try {
    const response = await fetch(`https://deep-index.moralis.io/api/v2.2/${walletAddress}?chain=solana&limit=${limit}`, {
      headers: {
        'X-API-Key': process.env.MORALIS_API_KEY || '',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Moralis API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.result || [];
  } catch (error) {
    console.error('Moralis wallet transactions error:', error);
    return [];
  }
}

// Enhanced rug pull detection using Moralis data
export async function getMoralisRugPullAnalysis(tokenAddress: string): Promise<{
  devWalletActivity: number;
  suspiciousTransactions: number;
  riskScore: number;
  recommendations: string[];
} | null> {
  try {
    // Get token metadata
    const metadata = await getMoralisTokenMetadata(tokenAddress);
    if (!metadata) return null;

    // Get token age
    const tokenAge = await getMoralisTokenAge(tokenAddress);
    if (!tokenAge) return null;

    // Calculate risk factors
    let devWalletActivity = 0;
    let suspiciousTransactions = 0;
    let riskScore = 0;

    // Age-based risk
    if (tokenAge.ageInDays < 1) riskScore += 30;
    else if (tokenAge.ageInDays < 7) riskScore += 20;
    else if (tokenAge.ageInDays < 30) riskScore += 10;

    // Verification risk
    if (!metadata.verified) riskScore += 25;

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (tokenAge.ageInDays < 7) {
      recommendations.push('Token is very new - high risk');
    }
    
    if (!metadata.verified) {
      recommendations.push('Token is not verified - proceed with caution');
    }
    
    if (riskScore > 70) {
      recommendations.push('High risk token - consider avoiding');
    }

    return {
      devWalletActivity,
      suspiciousTransactions,
      riskScore: Math.min(100, riskScore),
      recommendations
    };
  } catch (error) {
    console.error('Moralis rug pull analysis error:', error);
    return null;
  }
} 