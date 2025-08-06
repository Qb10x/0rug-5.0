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
  const bestProvider = rpcManager.getBestProvider('orc');
  const connection = rpcManager.createConnection(bestProvider);
  
  // Record the request for rate limiting
  rpcManager.recordRequest(bestProvider);
  
  return connection;
}

// Create connection for specific operation type
export async function createConnectionForOperation(operation: string): Promise<Connection> {
  await ensureRPCManagerInitialized();
  const bestProvider = rpcManager.getBestProvider(operation);
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
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      attempts++;

      // If it's an RPC error, try switching providers
      if (isRPCError(error) && attempts < maxRetries) {
        console.warn(`RPC error on attempt ${attempts}, retrying with different provider...`);
        await new Promise(resolve => setTimeout(resolve, ORC_CONNECTION_CONFIG.maxBackoffMs));
        continue;
      }

      // If we've exhausted retries, throw the error
      if (attempts >= maxRetries) {
        break;
      }

      // Exponential backoff
      const backoffMs = Math.min(
        ORC_CONNECTION_CONFIG.backoffMultiplier ** attempts * 1000,
        ORC_CONNECTION_CONFIG.maxBackoffMs
      );
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }

  throw lastError!;
}

// Check if error is RPC-related
function isRPCError(error: any): boolean {
  const errorMessage = error?.message || error?.toString() || '';
  return errorMessage.includes('403') || 
         errorMessage.includes('429') || 
         errorMessage.includes('rate limit') ||
         errorMessage.includes('timeout') ||
         errorMessage.includes('connection');
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