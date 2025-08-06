'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { 
  BarChart3, 
  Eye, 
  AlertTriangle, 
  TrendingUp,
  RefreshCw,
  Search
} from 'lucide-react';


// Pool interface
interface Pool {
  address: string;
  tokenA: string;
  tokenB: string;
  liquidity: number;
  volume24h: number;
  createdAt: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export default function PoolsPage() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  // Load pools data
  const loadPools = async () => {
    setIsLoading(true);
    try {
      // Simulate ORC data - replace with real detectNewPools() call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockPools: Pool[] = [
        {
          address: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
          tokenA: 'USDC',
          tokenB: 'SOL',
          liquidity: 2500000,
          volume24h: 450000,
          createdAt: '2025-01-05T10:30:00Z',
          riskLevel: 'low'
        },
        {
          address: '8HoQnePLqP9oTw8P7WY5J9oMLq1WzoHjJmrbvWcrTkz',
          tokenA: 'RAY',
          tokenB: 'USDC',
          liquidity: 1800000,
          volume24h: 320000,
          createdAt: '2025-01-05T09:15:00Z',
          riskLevel: 'medium'
        },
        {
          address: '2QK9vxydd7oDwvKJ6FK5UqGqyNqRF6JMC6oSVR9rJ3rL',
          tokenA: 'BONK',
          tokenB: 'SOL',
          liquidity: 950000,
          volume24h: 180000,
          createdAt: '2025-01-05T08:45:00Z',
          riskLevel: 'high'
        }
      ];
      
      setPools(mockPools);
    } catch {
      // Handle error silently for now
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPools();
  }, []);

  // Filter pools based on search and risk level
  const filteredPools = pools.filter(pool => {
    const matchesSearch = pool.tokenA.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pool.tokenB.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pool.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRisk = filterRisk === 'all' || pool.riskLevel === filterRisk;
    
    return matchesSearch && matchesRisk;
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-primary bg-primary/20';
      case 'medium': return 'text-accent bg-accent/20';
      case 'high': return 'text-destructive bg-destructive/20';
      default: return 'text-muted-foreground bg-muted';
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
              <h1 className="text-3xl font-bold text-foreground mb-2">LP Pool Scanner</h1>
              <p className="text-muted-foreground">Real-time liquidity pool detection and analysis</p>
            </div>
            <button
              onClick={loadPools}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:opacity-50 text-primary-foreground rounded-xl font-semibold transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Scanning...' : 'Scan Pools'}</span>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search pools by token or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors duration-200"
              />
            </div>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value as 'all' | 'low' | 'medium' | 'high')}
              className="px-4 py-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:border-primary transition-colors duration-200"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
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
            { label: 'Total Pools', value: pools.length, icon: BarChart3 },
            { label: 'New Today', value: pools.filter(p => new Date(p.createdAt).toDateString() === new Date().toDateString()).length, icon: TrendingUp },
            { label: 'High Risk', value: pools.filter(p => p.riskLevel === 'high').length, icon: AlertTriangle },
            { label: 'Total Liquidity', value: `$${(pools.reduce((sum, p) => sum + p.liquidity, 0) / 1000000).toFixed(1)}M`, icon: Eye }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center mb-4">
                <stat.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Pools List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-card backdrop-blur-sm rounded-2xl border border-border overflow-hidden"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Detected Pools</h2>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 text-foreground animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Scanning for new pools...</p>
            </div>
          ) : filteredPools.length === 0 ? (
            <div className="p-8 text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pools found matching your criteria</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredPools.map((pool, index) => (
                <motion.div
                  key={pool.address}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="p-6 hover:bg-muted transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {pool.tokenA} / {pool.tokenB}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(pool.riskLevel)}`}>
                          {pool.riskLevel.toUpperCase()} RISK
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Address: {pool.address.slice(0, 8)}...{pool.address.slice(-8)}
                      </p>
                      <div className="flex items-center space-x-6 text-sm">
                        <span className="text-foreground">
                          <span className="text-muted-foreground">Liquidity:</span> ${(pool.liquidity / 1000000).toFixed(1)}M
                        </span>
                        <span className="text-foreground">
                          <span className="text-muted-foreground">24h Volume:</span> ${(pool.volume24h / 1000).toFixed(0)}K
                        </span>
                        <span className="text-foreground">
                          <span className="text-muted-foreground">Created:</span> {new Date(pool.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors duration-200">
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