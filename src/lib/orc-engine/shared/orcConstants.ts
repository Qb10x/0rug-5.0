// ORC constants and configuration - following 0rug.com coding guidelines

import { PublicKey } from '@solana/web3.js';

// ORC Program ID (Raydium AMM v4) - using a valid Solana address
export const ORC_PROGRAM_ID = new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8');

// RPC Provider Configuration with 1k requests/day limits
export const RPC_PROVIDERS = {
  HELIUS: {
    name: 'Helius',
    url: process.env.HELIUS_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY',
    dailyLimit: 1000,
    priority: 1, // Highest priority for ORC operations
    features: ['getProgramAccounts', 'getLogs', 'onLogs']
  },
  QUICKNODE: {
    name: 'QuickNode',
    url: process.env.QUICKNODE_RPC_URL || 'https://solana-mainnet.quiknode.pro/YOUR_KEY/',
    dailyLimit: 1000,
    priority: 2, // Second priority for general operations
    features: ['getProgramAccounts', 'getLogs', 'onLogs']
  },
  MORALIS: {
    name: 'Moralis',
    url: process.env.MORALIS_RPC_URL || 'https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY',
    dailyLimit: 1000,
    priority: 3, // Third priority for basic queries
    features: ['getProgramAccounts', 'getLogs']
  },
  BIRDEYE: {
    name: 'Birdeye',
    url: process.env.BIRDEYE_RPC_URL || 'https://public-api.birdeye.so/public',
    dailyLimit: 1000,
    priority: 4, // Fourth priority for DEX-specific data
    features: ['getProgramAccounts', 'dexData']
  }
};

// ORC Connection configuration for direct chain access
export const ORC_CONNECTION_CONFIG = {
  maxRetries: 3,
  timeoutMs: 15000,
  backoffMultiplier: 2,
  maxBackoffMs: 5000,
  commitment: 'confirmed',
  requestTimeout: 10000
};

// ORC-specific constants for Raydium AMM v4
export const ORC_AMM_V4_CONFIG = {
  programId: ORC_PROGRAM_ID,
  ammId: 'ammv4U8rLxYtNrbXZjKxzzmKKMUck3GZx5BHKReZxCw',
  version: 'v4'
};

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  maxRequestsPerDay: 1000,
  maxRequestsPerHour: 42, // 1000/24
  cooldownMs: 5000,
  retryAttempts: 3
};

// Risk scoring thresholds
export const RISK_THRESHOLDS = {
  safe: { min: 70, max: 100 },
  warning: { min: 40, max: 69 },
  danger: { min: 0, max: 39 }
};

// Whale reputation thresholds
export const WHALE_REPUTATION_THRESHOLDS = {
  high: 80,
  medium: 60,
  low: 40
};

// Swap size thresholds (USD)
export const SWAP_SIZE_THRESHOLDS = {
  whale: 10000,
  large: 5000,
  medium: 1000,
  small: 100
};

// Alert configuration
export const ALERT_CONFIG = {
  maxRetries: 3,
  cooldownMs: 5000,
  batchSize: 10
}; 