// ORC Engine Types - following 0rug.com coding guidelines

import { PublicKey, VersionedTransactionResponse, CompiledInstruction } from '@solana/web3.js';

// Pool data interface
export interface PoolData {
  address: string;
  tokenA: string;
  tokenB: string;
  liquidity: number;
  volume24h: number;
  riskScore: number;
  createdAt: string;
  lastUpdated: string;
}

// Whale alert interface
export interface WhaleAlert {
  whaleAddress: string;
  operation: string;
  amount: number;
  transactionHash: string;
  timestamp: string;
  riskLevel: 'high' | 'medium' | 'low';
  alertType: string;
}

// Swap alert interface
export interface SwapAlert {
  dexName: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  amountOut: number;
  swapSize: number;
  sizeCategory: string;
  transactionHash: string;
  timestamp: string;
  riskLevel: 'high' | 'medium' | 'low';
  alertType: string;
}

// Token profile interface
export interface TokenProfile {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  totalSupply: number;
  circulatingSupply: number;
  marketCap: number;
  price: number;
  volume24h: number;
  volume7d: number;
  swapCount24h: number;
  liquidityPools: string[];
  riskScore: number;
  lastUpdated: string;
  recentTransactions: TokenTransaction[];
}

// Token transaction interface
export interface TokenTransaction {
  transactionHash: string;
  timestamp: string;
  isSwap: boolean;
  isLiquidity: boolean;
  volume: number;
  poolAddress: string;
  type: 'swap' | 'liquidity' | 'other' | 'unknown';
}

// Risk score interface
export interface RiskScore {
  riskScore: number;
  riskLevel: 'safe' | 'warning' | 'danger';
  riskFactors: string[];
  recommendations: string[];
}

// Alert configuration interface
export interface AlertConfig {
  maxRetries: number;
  cooldownMs: number;
  batchSize: number;
}

// ORC connection configuration interface
export interface ORCConnectionConfig {
  maxRetries: number;
  timeoutMs: number;
  backoffMultiplier: number;
  maxBackoffMs: number;
  commitment: string;
  requestTimeout: number;
}

// Test result interface
export interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: unknown;
}

// Solana transaction interface - using actual web3.js types
export type SolanaTransaction = VersionedTransactionResponse;

// Solana instruction interface - using actual web3.js types
export type SolanaInstruction = CompiledInstruction;

// Solana account info interface
export interface SolanaAccountInfo {
  lamports: number;
  owner: PublicKey;
  executable: boolean;
  rentEpoch: number;
  data: Buffer;
}

// Solana signature interface - using actual web3.js types
export interface SolanaSignature {
  signature: string;
  slot: number;
  err: unknown;
  memo: string | null;
  blockTime: number | null | undefined;
}

// Connection interface for ORC operations - using actual Connection type
export interface ORCConnection {
  getSignaturesForAddress: (address: PublicKey, options: { limit: number }) => Promise<SolanaSignature[]>;
  getTransaction: (signature: string, options: { maxSupportedTransactionVersion: number }) => Promise<SolanaTransaction | null>;
  getAccountInfo: (address: PublicKey) => Promise<SolanaAccountInfo | null>;
  getBlockHeight: () => Promise<number>;
} 