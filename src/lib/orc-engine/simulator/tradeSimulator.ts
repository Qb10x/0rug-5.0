// ORC Trade Simulator with Jupiter - following 0rug.com coding guidelines

import { PublicKey } from '@solana/web3.js';
import { createORCConnection, executeORCOperation } from '../shared/solana';

// Trade simulation result interface
interface TradeSimulation {
  inputToken: string;
  outputToken: string;
  inputAmount: number;
  estimatedOutput: number;
  priceImpact: number;
  fee: number;
  route: string[];
  success: boolean;
  error?: string;
}

// Jupiter quote interface
interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  amount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee: {
    feeBps: number;
    feeAccounts: Record<string, string>;
  };
  priceImpactPct: number;
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label: string;
      inputMint: string;
      outputMint: string;
      inAmount: string;
      outAmount: string;
      feeAmount: string;
      feeMint: string;
    };
    percent: number;
  }>;
  contextSlot: number;
  timeTaken: number;
}

// Simulate trade using Jupiter API
export async function simulateTrade(
  inputToken: string,
  outputToken: string,
  amount: number
): Promise<TradeSimulation> {
  return executeORCOperation(async () => {
    return await getJupiterQuote(inputToken, outputToken, amount);
  });
}

// Get quote from Jupiter API
async function getJupiterQuote(
  inputToken: string,
  outputToken: string,
  amount: number
): Promise<TradeSimulation> {
  try {
    // Jupiter API endpoint for quotes
    const jupiterQuoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${inputToken}&outputMint=${outputToken}&amount=${amount}&slippageBps=50`;

    const response = await fetch(jupiterQuoteUrl);
    
    if (!response.ok) {
      throw new Error(`Jupiter API error: ${response.status}`);
    }

    const quote: JupiterQuote = await response.json();

    // Extract route information
    const route = quote.routePlan.map(step => step.swapInfo.label);
    
    // Calculate price impact
    const priceImpact = quote.priceImpactPct;
    
    // Calculate fee (simplified)
    const fee = parseFloat(quote.routePlan[0]?.swapInfo.feeAmount || '0');

    return {
      inputToken,
      outputToken,
      inputAmount: amount,
      estimatedOutput: parseFloat(quote.otherAmountThreshold),
      priceImpact,
      fee,
      route,
      success: true
    };
  } catch (error) {
    console.error('Error getting Jupiter quote:', error);
    return {
      inputToken,
      outputToken,
      inputAmount: amount,
      estimatedOutput: 0,
      priceImpact: 0,
      fee: 0,
      route: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get supported tokens from Jupiter
export async function getSupportedTokens(): Promise<Array<{
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}>> {
  try {
    const response = await fetch('https://token.jup.ag/all');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch supported tokens: ${response.status}`);
    }

    const tokens = await response.json();
    
    // Return simplified token list
    return tokens.slice(0, 100).map((token: any) => ({
      address: token.address,
      symbol: token.symbol,
      name: token.name,
      decimals: token.decimals
    }));
  } catch (error) {
    console.error('Error fetching supported tokens:', error);
    return [];
  }
}

// Validate token addresses
export function validateTokenAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

// Calculate optimal trade size based on liquidity
export async function calculateOptimalTradeSize(
  inputToken: string,
  outputToken: string
): Promise<number> {
  try {
    // Simulate different trade sizes to find optimal
    const testAmounts = [1000, 5000, 10000, 50000, 100000];
    let bestPriceImpact = Infinity;
    let optimalAmount = 1000;

    for (const amount of testAmounts) {
      const simulation = await simulateTrade(inputToken, outputToken, amount);
      
      if (simulation.success && simulation.priceImpact < bestPriceImpact) {
        bestPriceImpact = simulation.priceImpact;
        optimalAmount = amount;
      }
    }

    return optimalAmount;
  } catch (error) {
    console.error('Error calculating optimal trade size:', error);
    return 1000; // Default fallback
  }
}

// Get trade history for analysis
export async function getTradeHistory(
  walletAddress: string,
  limit: number = 20
): Promise<Array<{
  transactionHash: string;
  inputToken: string;
  outputToken: string;
  inputAmount: number;
  outputAmount: number;
  timestamp: string;
}>> {
  try {
    const connection = await createORCConnection();
    const publicKey = new PublicKey(walletAddress);
    
    const signatures = await connection.getSignaturesForAddress(
      publicKey,
      { limit }
    );

    const trades: Array<{
      transactionHash: string;
      inputToken: string;
      outputToken: string;
      inputAmount: number;
      outputAmount: number;
      timestamp: string;
    }> = [];

    for (const sig of signatures) {
      try {
        const tx = await connection.getTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0
        });

        if (tx && isSwapTransaction(tx)) {
          const tradeData = extractTradeData(tx);
          if (tradeData) {
            trades.push({
              transactionHash: sig.signature,
              ...tradeData,
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.warn(`Error processing trade ${sig.signature}:`, error);
      }
    }

    return trades;
  } catch (error) {
    console.error('Error getting trade history:', error);
    return [];
  }
}

// Check if transaction is a swap
function isSwapTransaction(tx: any): boolean {
  try {
    const logs = tx.meta?.logMessages || [];
    return logs.some((log: string) => 
      log.includes('Swap') || 
      log.includes('Exchange') ||
      log.includes('Trade')
    );
  } catch {
    return false;
  }
}

// Extract trade data from transaction
function extractTradeData(tx: any): {
  inputToken: string;
  outputToken: string;
  inputAmount: number;
  outputAmount: number;
} | null {
  try {
    const logs = tx.meta?.logMessages || [];
    let inputToken = '';
    let outputToken = '';
    let inputAmount = 0;
    let outputAmount = 0;

    for (const log of logs) {
      if (log.includes('Swap')) {
        // Extract token addresses and amounts
        const tokenMatch = log.match(/([A-Za-z0-9]{32,44})/g);
        if (tokenMatch && tokenMatch.length >= 2) {
          inputToken = tokenMatch[0];
          outputToken = tokenMatch[1];
        }

        const amountMatch = log.match(/(\d+(?:\.\d+)?)/g);
        if (amountMatch && amountMatch.length >= 2) {
          inputAmount = parseFloat(amountMatch[0]);
          outputAmount = parseFloat(amountMatch[1]);
        }
      }
    }

    if (inputToken && outputToken) {
      return {
        inputToken,
        outputToken,
        inputAmount,
        outputAmount
      };
    }

    return null;
  } catch (error) {
    console.warn('Error extracting trade data:', error);
    return null;
  }
} 