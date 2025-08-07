// Smart Router System - Implements fallback priority strategy
// Following 0rug.com coding guidelines

import { resolveTokenWithFallback, generateTokenPersonaResponse } from './tokenRegistry';

interface SmartRouterConfig {
  enablePaidAPIs: boolean;
  maxRetries: number;
  cacheEnabled: boolean;
  personaEnabled: boolean;
}

interface RouterResult {
  success: boolean;
  data: any;
  source: string;
  fallbackUsed: boolean;
  error?: string;
}

// Default configuration
const DEFAULT_CONFIG: SmartRouterConfig = {
  enablePaidAPIs: true,
  maxRetries: 3,
  cacheEnabled: true,
  personaEnabled: true
};

// Smart router for token metadata resolution
export async function smartTokenResolution(
  address: string,
  config: Partial<SmartRouterConfig> = {}
): Promise<RouterResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  try {
    // 1. Try FREE sources first
    const resolution = await resolveTokenWithFallback(address);
    
    if (resolution && resolution.metadata) {
      return {
        success: true,
        data: resolution.metadata,
        source: resolution.source,
        fallbackUsed: false
      };
    }

    // 2. If FREE sources fail and paid APIs are enabled, try paid sources
    if (finalConfig.enablePaidAPIs) {
      // This is handled in resolveTokenWithFallback already
      // but we can add additional paid API calls here if needed
    }

    return {
      success: false,
      data: null,
      source: 'none',
      fallbackUsed: true,
      error: 'Token not found in any source'
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      source: 'error',
      fallbackUsed: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Smart router for LP data resolution
export async function smartLPResolution(
  tokenAddress: string,
  config: Partial<SmartRouterConfig> = {}
): Promise<RouterResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  try {
    // 1. Try Raydium pairs (FREE)
    try {
      const { findLPPool } = await import('./tokenRegistry');
      const lpPool = await findLPPool(tokenAddress);
      
      if (lpPool) {
        return {
          success: true,
          data: lpPool,
          source: 'raydium',
          fallbackUsed: false
        };
      }
    } catch {
      // Continue to next source
    }

    // 2. Try DexScreener (FREE)
    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);
      if (response.ok) {
        const data = await response.json();
        if (data.pairs && data.pairs.length > 0) {
          const pair = data.pairs[0];
          return {
            success: true,
            data: {
              poolAddress: pair.pairAddress,
              baseToken: pair.baseToken.address,
              quoteToken: pair.quoteToken.address,
              liquidity: pair.liquidity?.usd || 0
            },
            source: 'dexscreeener',
            fallbackUsed: false
          };
        }
      }
    } catch {
      // Continue to next source
    }

    // 3. Try Helius (PAID) - only if enabled
    if (finalConfig.enablePaidAPIs) {
      try {
        const { getHeliusLPSourceIdentification } = await import('./helius');
        const heliusLP = await getHeliusLPSourceIdentification(tokenAddress);
        
        if (heliusLP) {
          return {
            success: true,
            data: heliusLP,
            source: 'helius',
            fallbackUsed: true
          };
        }
      } catch {
        // Continue to next source
      }
    }

    return {
      success: false,
      data: null,
      source: 'none',
      fallbackUsed: true,
      error: 'LP data not found in any source'
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      source: 'error',
      fallbackUsed: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Smart router for wallet analysis
export async function smartWalletAnalysis(
  walletAddress: string,
  config: Partial<SmartRouterConfig> = {}
): Promise<RouterResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  try {
    // 1. Try Solana RPC (FREE)
    try {
      const { getTokenHolderDistribution } = await import('./solana');
      const holderData = await getTokenHolderDistribution(walletAddress);
      
      if (holderData.totalHolders > 0) {
        return {
          success: true,
          data: holderData,
          source: 'solana-rpc',
          fallbackUsed: false
        };
      }
    } catch {
      // Continue to next source
    }

    // 2. Try Helius (PAID) - only if enabled
    if (finalConfig.enablePaidAPIs) {
      try {
        const { getHeliusAdvancedWalletTracking } = await import('./helius');
        const heliusData = await getHeliusAdvancedWalletTracking(walletAddress);
        
        if (heliusData) {
          return {
            success: true,
            data: heliusData,
            source: 'helius',
            fallbackUsed: true
          };
        }
      } catch {
        // Continue to next source
      }
    }

    // 3. Try Moralis (PAID) - only if enabled
    if (finalConfig.enablePaidAPIs) {
      try {
        const { getMoralisWalletProfile } = await import('./moralis');
        const moralisData = await getMoralisWalletProfile(walletAddress);
        
        if (moralisData) {
          return {
            success: true,
            data: moralisData,
            source: 'moralis',
            fallbackUsed: true
          };
        }
      } catch {
        // Continue to next source
      }
    }

    return {
      success: false,
      data: null,
      source: 'none',
      fallbackUsed: true,
      error: 'Wallet analysis not found in any source'
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      source: 'error',
      fallbackUsed: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Smart router for volume spike detection
export async function smartVolumeSpikeDetection(
  config: Partial<SmartRouterConfig> = {}
): Promise<RouterResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  try {
    // 1. Try DexScreener (FREE)
    try {
      const response = await fetch('https://api.dexscreener.com/latest/dex/search?q=solana');
      if (response.ok) {
        const data = await response.json();
        if (data.pairs && data.pairs.length > 0) {
          // Filter for volume spikes
          const spikes = data.pairs.filter((pair: any) => 
            pair.priceChange?.h24 > 50 || pair.volume?.h24 > 1000000
          );
          
          return {
            success: true,
            data: spikes,
            source: 'dexscreeener',
            fallbackUsed: false
          };
        }
      }
    } catch {
      // Continue to next source
    }

    // 2. Try Birdeye (PAID) - only if enabled
    if (finalConfig.enablePaidAPIs) {
      try {
        const { getBirdeyeVolumeSpikes } = await import('./birdeye');
        const birdeyeData = await getBirdeyeVolumeSpikes(20);
        
        if (birdeyeData.length > 0) {
          return {
            success: true,
            data: birdeyeData,
            source: 'birdeye',
            fallbackUsed: true
          };
        }
      } catch {
        // Continue to next source
      }
    }

    return {
      success: false,
      data: null,
      source: 'none',
      fallbackUsed: true,
      error: 'Volume spike data not found in any source'
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      source: 'error',
      fallbackUsed: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Generate AI response with persona if enabled
export async function generateSmartAIResponse(
  address: string,
  query: string,
  config: Partial<SmartRouterConfig> = {}
): Promise<string> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  try {
    // Get token metadata first
    const resolution = await smartTokenResolution(address, config);
    
    if (!resolution.success) {
      return `I couldn't find information for that token address. Please check the address and try again.`;
    }

    // Generate persona response if enabled
    if (finalConfig.personaEnabled) {
      const personaResponse = await generateTokenPersonaResponse(address);
      if (personaResponse) {
        return personaResponse;
      }
    }

    // Fallback to generic response
    const metadata = resolution.data;
    return `Hello! I'm **${metadata.symbol}** (${metadata.name}). How can I help you analyze my performance today?`;
  } catch (error) {
    return `I'm having trouble accessing token information right now. Please try again in a moment.`;
  }
}

// Usage tracking for API optimization
export class SmartRouterTracker {
  private static usage = new Map<string, number>();
  private static dailyLimits = new Map<string, number>();

  static trackUsage(source: string): void {
    const current = this.usage.get(source) || 0;
    this.usage.set(source, current + 1);
  }

  static getUsage(source: string): number {
    return this.usage.get(source) || 0;
  }

  static isWithinLimit(source: string): boolean {
    const usage = this.getUsage(source);
    const limit = this.dailyLimits.get(source) || 1000;
    return usage < limit;
  }

  static resetDailyUsage(): void {
    this.usage.clear();
  }
} 