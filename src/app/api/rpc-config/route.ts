// Server-side API route for RPC configuration - following 0rug.com coding guidelines

import { NextResponse } from 'next/server';

// Get RPC configuration from environment variables
export async function GET() {
  const rpcConfig = {
    HELIUS: {
      name: 'Helius',
      url: process.env.HELIUS_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY',
      dailyLimit: 1000,
      priority: 1,
      features: ['getProgramAccounts', 'getLogs', 'onLogs']
    },
    QUICKNODE: {
      name: 'QuickNode',
      url: process.env.QUICKNODE_RPC_URL || 'https://solana-mainnet.quiknode.pro/YOUR_KEY/',
      dailyLimit: 1000,
      priority: 2,
      features: ['getProgramAccounts', 'getLogs', 'onLogs']
    },
    MORALIS: {
      name: 'Moralis',
      url: process.env.MORALIS_RPC_URL || 'https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY',
      dailyLimit: 1000,
      priority: 3,
      features: ['getProgramAccounts', 'getLogs']
    },
    BIRDEYE: {
      name: 'Birdeye',
      url: process.env.BIRDEYE_RPC_URL || 'https://public-api.birdeye.so/public',
      dailyLimit: 1000,
      priority: 4,
      features: ['getProgramAccounts', 'dexData']
    }
  };

  return NextResponse.json(rpcConfig);
} 