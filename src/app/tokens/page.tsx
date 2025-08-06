'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { 
  TrendingUp, 
  DollarSign, 
  BarChart3,
  RefreshCw,
  Search,
  Eye,
  Activity
} from 'lucide-react';
import { getTokenProfile } from '@/lib/orc-engine/tokens/tokenProfile';

// Token interface
interface Token {
  address: string;
  name: string;
  symbol: string;
  price: number;
  marketCap: number;
  volume24h: number;
  liquidity: number;
  riskScore: number;
  lastUpdated: string;
}

export default function TokensPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load tokens data
  const loadTokens = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockTokens: Token[] = [
        {
          address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          name: 'USD Coin',
          symbol: 'USDC',
          price: 1.00,
          marketCap: 25000000000,
          volume24h: 1500000000,
          liquidity: 5000000000,
          riskScore: 95,
          lastUpdated: '2025-01-05T10:30:00Z'
        },
        {
          address: 'So11111111111111111111111111111111111111112',
          name: 'Solana',
          symbol: 'SOL',
          price: 98.50,
          marketCap: 45000000000,
          volume24h: 2500000000,
          liquidity: 8000000000,
          riskScore: 85,
          lastUpdated: '2025-01-05T09:15:00Z'
        },
        {
          address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
          name: 'Bonk',
          symbol: 'BONK',
          price: 0.00001234,
          marketCap: 800000000,
          volume24h: 50000000,
          liquidity: 200000000,
          riskScore: 65,
          lastUpdated: '2025-01-05T08:45:00Z'
        }
      ];
      
      setTokens(mockTokens);
    } catch (error) {
      console.error('Error loading tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTokens();
  }, []);

  const filteredTokens = tokens.filter(token => 
    token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-500/20';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Token Profiles</h1>
              <p className="text-muted-foreground">Comprehensive token analytics and insights</p>
            </div>
            <button
              onClick={loadTokens}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:opacity-50 text-primary-foreground rounded-xl font-semibold transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Loading...' : 'Refresh Data'}</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tokens by name, symbol, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors duration-200"
            />
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Tokens', value: tokens.length, icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
            { label: 'Total Market Cap', value: `$${(tokens.reduce((sum, t) => sum + t.marketCap, 0) / 1000000000).toFixed(1)}B`, icon: DollarSign, color: 'from-green-500 to-emerald-500' },
            { label: '24h Volume', value: `$${(tokens.reduce((sum, t) => sum + t.volume24h, 0) / 1000000000).toFixed(1)}B`, icon: Activity, color: 'from-red-500 to-pink-500' },
            { label: 'Avg Risk Score', value: `${Math.round(tokens.reduce((sum, t) => sum + t.riskScore, 0) / tokens.length)}/100`, icon: BarChart3, color: 'from-purple-500 to-pink-500' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tokens List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Token Analytics</h2>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
              <p className="text-gray-300">Loading token data...</p>
            </div>
          ) : filteredTokens.length === 0 ? (
            <div className="p-8 text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300">No tokens found matching your criteria</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredTokens.map((token, index) => (
                <motion.div
                  key={token.address}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="p-6 hover:bg-white/5 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {token.name} ({token.symbol})
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(token.riskScore)}`}>
                          Risk: {token.riskScore}/100
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        Address: {token.address.slice(0, 8)}...{token.address.slice(-8)}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <span className="text-gray-300">
                          <span className="text-gray-400">Price:</span> ${token.price.toLocaleString()}
                        </span>
                        <span className="text-gray-300">
                          <span className="text-gray-400">Market Cap:</span> ${(token.marketCap / 1000000).toFixed(0)}M
                        </span>
                        <span className="text-gray-300">
                          <span className="text-gray-400">24h Volume:</span> ${(token.volume24h / 1000000).toFixed(0)}M
                        </span>
                        <span className="text-gray-300">
                          <span className="text-gray-400">Liquidity:</span> ${(token.liquidity / 1000000).toFixed(0)}M
                        </span>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
} 