// ORC RPC Manager - following 0rug.com coding guidelines

import { Connection, Commitment } from '@solana/web3.js';
import { ORC_CONNECTION_CONFIG } from './orcConstants';

// RPC provider interface
interface RPCProvider {
  name: string;
  url: string;
  weight: number;
  requestCount: number;
  lastRequestTime: number;
  isHealthy: boolean;
}

// RPC manager class for load balancing and failover
class RPCManager {
  private providers: RPCProvider[] = [];
  private currentProviderIndex = 0;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  // Initialize RPC manager with providers
  async initialize(): Promise<void> {
    this.providers = createDefaultProviders();
    this.startHealthMonitoring();
  }

  // Get best provider for operation type
  getBestProvider(): RPCProvider {
    const healthyProviders = this.providers.filter(p => p.isHealthy);
    
    if (healthyProviders.length === 0) {
      return this.providers[0];
    }

    return selectBestProvider(healthyProviders);
  }

  // Create connection with best provider
  createConnection(provider: RPCProvider): Connection {
    const commitment: Commitment = ORC_CONNECTION_CONFIG.commitment as Commitment;

    return new Connection(provider.url, {
      commitment,
      confirmTransactionInitialTimeout: ORC_CONNECTION_CONFIG.timeoutMs
    });
  }

  // Record request for rate limiting
  recordRequest(provider: RPCProvider): void {
    provider.requestCount++;
    provider.lastRequestTime = Date.now();
  }

  // Start health monitoring
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(() => {
      this.checkProviderHealth();
    }, 30000); // Check every 30 seconds
  }

  // Check health of all providers
  private async checkProviderHealth(): Promise<void> {
    for (const provider of this.providers) {
      try {
        const connection = new Connection(provider.url);
        const blockHeight = await connection.getBlockHeight();
        provider.isHealthy = blockHeight > 0;
      } catch {
        provider.isHealthy = false;
      }
    }
  }

  // Get request statistics
  getRequestStats(): Record<string, unknown> {
    return {
      totalProviders: this.providers.length,
      healthyProviders: this.providers.filter(p => p.isHealthy).length,
      providerStats: this.providers.map(p => ({
        name: p.name,
        requestCount: p.requestCount,
        isHealthy: p.isHealthy,
        lastRequestTime: p.lastRequestTime
      }))
    };
  }

  // Get RPC providers configuration
  getRPCProviders(): RPCProvider[] {
    return this.providers.map(p => ({ ...p }));
  }

  // Cleanup resources
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}

// Create default RPC providers
function createDefaultProviders(): RPCProvider[] {
  return [
    {
      name: 'Helius',
      url: process.env.HELIUS_RPC_URL || 'https://rpc.helius.xyz/?api-key=your-api-key',
      weight: 3,
      requestCount: 0,
      lastRequestTime: 0,
      isHealthy: true
    },
    {
      name: 'QuickNode',
      url: process.env.QUICKNODE_RPC_URL || 'https://your-endpoint.solana-mainnet.quiknode.pro/your-api-key/',
      weight: 2,
      requestCount: 0,
      lastRequestTime: 0,
      isHealthy: true
    },
    {
      name: 'Alchemy',
      url: process.env.ALCHEMY_RPC_URL || 'https://solana-mainnet.g.alchemy.com/v2/your-api-key',
      weight: 2,
      requestCount: 0,
      lastRequestTime: 0,
      isHealthy: true
    },
    {
      name: 'Public RPC',
      url: 'https://api.mainnet-beta.solana.com',
      weight: 1,
      requestCount: 0,
      lastRequestTime: 0,
      isHealthy: true
    }
  ];
}

// Select best provider based on weight and request count
function selectBestProvider(providers: RPCProvider[]): RPCProvider {
  const sortedProviders = providers.sort((a, b) => {
    const aScore = a.weight / (a.requestCount + 1);
    const bScore = b.weight / (b.requestCount + 1);
    return bScore - aScore;
  });

  return sortedProviders[0];
}

// Export singleton instance
export const rpcManager = new RPCManager(); 