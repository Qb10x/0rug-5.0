'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { 
  Activity, 
  TrendingUp, 
  DollarSign,
  RefreshCw,
  Search,
  Eye,
  BarChart3
} from 'lucide-react';
import { trackSwaps } from '@/lib/orc-engine/swaps/trackSwaps';

// Swap interface
interface Swap {
  id: string;
  dexName: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  amountOut: number;
  priceImpact: number;
  timestamp: string;
  sizeCategory: 'small' | 'medium' | 'large';
}

export default function SwapsPage() {
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDex, setFilterDex] = useState<string>('all');

  // Load swaps data
  const loadSwaps = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockSwaps: Swap[] = [
        {
          id: '1',
          dexName: 'Raydium',
          tokenIn: 'USDC',
          tokenOut: 'SOL',
          amountIn: 1000,
          amountOut: 0.5,
          priceImpact: 0.12,
          timestamp: '2025-01-05T10:30:00Z',
          sizeCategory: 'medium'
        },
        {
          id: '2',
          dexName: 'Jupiter',
          tokenIn: 'SOL',
          tokenOut: 'RAY',
          amountIn: 2.5,
          amountOut: 150,
          priceImpact: 0.08,
          timestamp: '2025-01-05T09:15:00Z',
          sizeCategory: 'large'
        },
        {
          id: '3',
          dexName: 'Orca',
          tokenIn: 'USDC',
          tokenOut: 'BONK',
          amountIn: 500,
          amountOut: 1000000,
          priceImpact: 0.25,
          timestamp: '2025-01-05T08:45:00Z',
          sizeCategory: 'small'
        }
      ];
      
      setSwaps(mockSwaps);
    } catch (error) {
      console.error('Error loading swaps:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSwaps();
  }, []);

  const filteredSwaps = swaps.filter(swap => {
    const matchesSearch = swap.tokenIn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         swap.tokenOut.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         swap.dexName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDex = filterDex === 'all' || swap.dexName === filterDex;
    
    return matchesSearch && matchesDex;
  });

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'small': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'large': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
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
              <h1 className="text-3xl font-bold text-white mb-2">Swap Tracker</h1>
              <p className="text-gray-300">Track DEX swaps across all major protocols</p>
            </div>
            <button
              onClick={loadSwaps}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Tracking...' : 'Track Swaps'}</span>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search swaps by token or DEX..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors duration-200"
              />
            </div>
            <select
              value={filterDex}
              onChange={(e) => setFilterDex(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors duration-200"
            >
              <option value="all">All DEXes</option>
              <option value="Raydium">Raydium</option>
              <option value="Jupiter">Jupiter</option>
              <option value="Orca">Orca</option>
            </select>
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
            { label: 'Total Swaps', value: swaps.length, icon: Activity, color: 'from-blue-500 to-cyan-500' },
            { label: 'Total Volume', value: `$${(swaps.reduce((sum, s) => sum + s.amountIn, 0) / 1000).toFixed(0)}K`, icon: DollarSign, color: 'from-green-500 to-emerald-500' },
            { label: 'Avg Impact', value: `${(swaps.reduce((sum, s) => sum + s.priceImpact, 0) / swaps.length * 100).toFixed(2)}%`, icon: TrendingUp, color: 'from-red-500 to-pink-500' },
            { label: 'Large Swaps', value: swaps.filter(s => s.sizeCategory === 'large').length, icon: BarChart3, color: 'from-purple-500 to-pink-500' }
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

        {/* Swaps List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Recent Swaps</h2>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
              <p className="text-gray-300">Tracking swaps...</p>
            </div>
          ) : filteredSwaps.length === 0 ? (
            <div className="p-8 text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300">No swaps found matching your criteria</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredSwaps.map((swap, index) => (
                <motion.div
                  key={swap.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="p-6 hover:bg-white/5 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {swap.tokenIn} → {swap.tokenOut}
                        </h3>
                        <span className="text-sm text-gray-400">{swap.dexName}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSizeColor(swap.sizeCategory)}`}>
                          {swap.sizeCategory.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <span className="text-gray-300">
                          <span className="text-gray-400">Amount:</span> {swap.amountIn} {swap.tokenIn} → {swap.amountOut} {swap.tokenOut}
                        </span>
                        <span className="text-gray-300">
                          <span className="text-gray-400">Impact:</span> {(swap.priceImpact * 100).toFixed(2)}%
                        </span>
                        <span className="text-gray-300">
                          <span className="text-gray-400">Time:</span> {new Date(swap.timestamp).toLocaleTimeString()}
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