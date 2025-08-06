// Solana RPC Integration - Free blockchain data source
// Following 0rug.com coding guidelines

import { Connection, PublicKey } from '@solana/web3.js';

// Solana connection configuration
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Rate limiting configuration
const RPC_RATE_LIMIT = parseInt(process.env.NEXT_PUBLIC_SOLANA_RPC_RATE_LIMIT || '6000');

// Solana token data interface
interface SolanaTokenData {
  supply: {
    amount: string;
    decimals: number;
    uiAmount: number | null;
    uiAmountString: string;
  };
  decimals: number;
  accountInfo: {
    data: Uint8Array;
    executable: boolean;
    lamports: number;
    owner: PublicKey;
    rentEpoch?: number;
  } | null;
  mintAuthority?: string;
  freezeAuthority?: string;
}

// Get token supply and basic info from Solana
export async function getSolanaTokenData(tokenAddress: string): Promise<SolanaTokenData | null> {
  try {
    const publicKey = new PublicKey(tokenAddress);
    
    // Get token supply
    const tokenInfo = await connection.getTokenSupply(publicKey);
    
    // Get account info
    const accountInfo = await connection.getAccountInfo(publicKey);
    
    // Get mint authority (if available)
    let mintAuthority: string | undefined;
    let freezeAuthority: string | undefined;
    
    try {
      const mintData = await connection.getParsedAccountInfo(publicKey);
      if (mintData.value?.data && 'parsed' in mintData.value.data) {
        const parsed = mintData.value.data.parsed as Record<string, unknown>;
        mintAuthority = (parsed.info as Record<string, unknown>)?.mintAuthority as string;
        freezeAuthority = (parsed.info as Record<string, unknown>)?.freezeAuthority as string;
      }
    } catch {
      // Mint authority info not available
    }
    
    return {
      supply: {
        amount: tokenInfo.value.amount,
        decimals: tokenInfo.value.decimals,
        uiAmount: tokenInfo.value.uiAmount,
        uiAmountString: tokenInfo.value.uiAmountString || tokenInfo.value.amount
      },
      decimals: tokenInfo.value.decimals,
      accountInfo: accountInfo ? {
        data: accountInfo.data,
        executable: accountInfo.executable,
        lamports: accountInfo.lamports,
        owner: accountInfo.owner,
        rentEpoch: accountInfo.rentEpoch
      } : null,
      mintAuthority,
      freezeAuthority
    };
  } catch {
    return null;
  }
}

// Check if mint is renounced (no mint authority)
export async function checkMintRenounced(tokenAddress: string): Promise<boolean> {
  try {
    const tokenData = await getSolanaTokenData(tokenAddress);
    
    if (!tokenData) {
      return false;
    }
    
    // If mint authority is null or undefined, mint is renounced
    return !tokenData.mintAuthority;
  } catch {
    return false;
  }
}

// Get token age (creation time)
export async function getTokenAge(tokenAddress: string): Promise<{
  ageInDays: number;
  creationDate: Date | null;
}> {
  try {
    const publicKey = new PublicKey(tokenAddress);
    
    // Get recent signatures to estimate creation time
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 100 });
    
    if (signatures.length === 0) {
      return {
        ageInDays: 0,
        creationDate: null
      };
    }
    
    // Sort by block time to find earliest transaction
    const sortedSignatures = signatures.sort((a, b) => 
      (a.blockTime || 0) - (b.blockTime || 0)
    );
    
    const earliestSignature = sortedSignatures[0];
    const creationTime = earliestSignature.blockTime;
    
    if (!creationTime) {
      return {
        ageInDays: 0,
        creationDate: null
      };
    }
    
    const creationDate = new Date(creationTime * 1000);
    const now = new Date();
    const ageInDays = Math.floor((now.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      ageInDays,
      creationDate
    };
  } catch {
    return {
      ageInDays: 0,
      creationDate: null
    };
  }
}

// Get recent transactions for a token
export async function getTokenTransactions(tokenAddress: string, limit: number = 20): Promise<Array<Record<string, unknown>>> {
  try {
    const publicKey = new PublicKey(tokenAddress);
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit });
    
    const transactions = await Promise.all(
      signatures.map(async (sig) => {
        try {
          const tx = await connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0
          });
          return {
            signature: sig.signature,
            blockTime: sig.blockTime,
            transaction: tx
          };
        } catch {
          return null;
        }
      })
    );
    
    return transactions.filter(tx => tx !== null);
  } catch {
    return [];
  }
}

// Calculate token holder distribution
export async function getTokenHolderDistribution(tokenAddress: string): Promise<{
  totalHolders: number;
  whaleCount: number;
  averageBalance: number;
  topHolders: Array<{ address: string; balance: number }>;
}> {
  try {
    const publicKey = new PublicKey(tokenAddress);
    
    // Get token accounts - using getProgramAccounts instead
    const tokenAccounts = await connection.getProgramAccounts(
      new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      {
        filters: [
          {
            dataSize: 165,
          },
          {
            memcmp: {
              offset: 0,
              bytes: publicKey.toBase58(),
            },
          },
        ],
      }
    );
    
    if (tokenAccounts.length === 0) {
      return {
        totalHolders: 0,
        whaleCount: 0,
        averageBalance: 0,
        topHolders: []
      };
    }
    
    // Parse account data
    const holders = tokenAccounts.map(account => {
      const accountInfo = account.account.data;
      const balance = accountInfo.readBigUInt64LE(64);
      return {
        address: account.pubkey.toString(),
        balance: Number(balance)
      };
    });
    
    // Filter out zero balances
    const activeHolders = holders.filter(h => h.balance > 0);
    
    // Calculate statistics
    const totalHolders = activeHolders.length;
    const totalBalance = activeHolders.reduce((sum, h) => sum + h.balance, 0);
    const averageBalance = totalBalance / totalHolders;
    
    // Define whale threshold (top 10% of holders)
    const sortedHolders = activeHolders.sort((a, b) => b.balance - a.balance);
    const whaleThreshold = sortedHolders[Math.floor(totalHolders * 0.1)]?.balance || 0;
    const whaleCount = sortedHolders.filter(h => h.balance >= whaleThreshold).length;
    
    // Get top 10 holders
    const topHolders = sortedHolders.slice(0, 10).map(h => ({
      address: h.address,
      balance: h.balance
    }));
    
    return {
      totalHolders,
      whaleCount,
      averageBalance,
      topHolders
    };
  } catch {
    return {
      totalHolders: 0,
      whaleCount: 0,
      averageBalance: 0,
      topHolders: []
    };
  }
} 