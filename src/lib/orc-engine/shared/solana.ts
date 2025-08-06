// ORC Solana utilities with smart RPC rotation - following 0rug.com coding guidelines

import { Connection, PublicKey } from '@solana/web3.js';
import { ORC_CONNECTION_CONFIG } from './orcConstants';
import { rpcManager } from './rpcManager';

// Initialize RPC manager (call this once at app startup)
let rpcManagerInitialized = false;

// Initialize RPC manager if not already done
async function ensureRPCManagerInitialized(): Promise<void> {
  if (!rpcManagerInitialized) {
    await rpcManager.initialize();
    rpcManagerInitialized = true;
  }
}

// Create resilient ORC connection with smart RPC rotation
export async function createORCConnection(): Promise<Connection> {
  await ensureRPCManagerInitialized();
  const bestProvider = rpcManager.getBestProvider();
  const connection = rpcManager.createConnection(bestProvider);
  
  // Record the request for rate limiting
  rpcManager.recordRequest(bestProvider);
  
  return connection;
}

// Create connection for specific operation type
export async function createConnectionForOperation(operation: string): Promise<Connection> {
  await ensureRPCManagerInitialized();
  const bestProvider = rpcManager.getBestProvider();
  const connection = rpcManager.createConnection(bestProvider);
  
  // Record the request for rate limiting
  rpcManager.recordRequest(bestProvider);
  
  return connection;
}

// Validate Solana address format
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

// Execute ORC operation with exponential backoff retry and RPC rotation
export async function executeORCOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = ORC_CONNECTION_CONFIG.maxRetries
): Promise<T> {
  let lastError: Error;

  for (let attempts = 0; attempts < maxRetries; attempts++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (shouldRetryWithDifferentProvider(error, attempts + 1, maxRetries)) {
        await handleRPCError(attempts);
        continue;
      }



      await performExponentialBackoff(attempts);
    }
  }

  throw lastError!;
}

// Check if we should retry with a different provider
function shouldRetryWithDifferentProvider(
  error: unknown,
  attempts: number,
  maxRetries: number
): boolean {
  return isRPCError(error) && attempts < maxRetries;
}

// Handle RPC error by waiting before retry
async function handleRPCError(attempts: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ORC_CONNECTION_CONFIG.maxBackoffMs));
}

// Perform exponential backoff
async function performExponentialBackoff(attempts: number): Promise<void> {
  const backoffMs = Math.min(
    ORC_CONNECTION_CONFIG.backoffMultiplier ** attempts * 1000,
    ORC_CONNECTION_CONFIG.maxBackoffMs
  );
  await new Promise(resolve => setTimeout(resolve, backoffMs));
}

// Check if error is RPC-related
function isRPCError(error: unknown): boolean {
  const errorMessage = String(error);
  const rpcErrorPatterns = [
    '403',
    '429',
    'rate limit',
    'timeout',
    'connection'
  ];
  
  return rpcErrorPatterns.some(pattern => errorMessage.includes(pattern));
}

// Test ORC connection health with RPC rotation
export async function testORCConnectionHealth(): Promise<boolean> {
  try {
    const connection = await createORCConnection();
    const blockHeight = await connection.getBlockHeight();
    return blockHeight > 0;
  } catch {
    return false;
  }
}

// Get RPC usage statistics
export function getRPCStats() {
  return rpcManager.getRequestStats();
}

// Get RPC provider configuration
export function getRPCProviders() {
  return rpcManager.getRPCProviders();
}