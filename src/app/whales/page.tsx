'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { 
  Users, 
  AlertTriangle, 
  DollarSign,
  RefreshCw,
  Search,
  Eye,
  Activity
} from 'lucide-react';


// Whale interface
interface Whale {
  address: string;
  name: string;
  balance: number;
  lastActivity: string;
  movementType: 'buy' | 'sell' | 'transfer';
  amount: number;
  token: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export default function WhalesPage() {
  const [whales, setWhales] = useState<Whale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell' | 'transfer'>('all');

  // Load whales data
  const loadWhales = async () => {
    setIsLoading(true);
    try {
      // Simulate ORC data - replace with real trackWhaleMovements() call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockWhales: Whale[] = [
        {
          address: '11111111111111111111111111111112',
          name: 'Whale #1',
          balance: 2500000,
          lastActivity: '2025-01-05T10:30:00Z',
          movementType: 'buy',
          amount: 500000,
          token: 'SOL',
          riskLevel: 'high'
        },
        {
          address: '22222222222222222222222222222223',
          name: 'Whale #2',
          balance: 1800000,
          lastActivity: '2025-01-05T09:15:00Z',
          movementType: 'sell',
          amount: 320000,
          token: 'USDC',
          riskLevel: 'medium'
        },
        {
          address: '33333333333333333333333333333334',
          name: 'Whale #3',
          balance: 950000,
          lastActivity: '2025-01-05T08:45:00Z',
          movementType: 'transfer',
          amount: 180000,
          token: 'RAY',
          riskLevel: 'low'
        }
      ];
      
      setWhales(mockWhales);
    } catch {
      // Handle error silently for now
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWhales();
  }, []);

  // Filter whales based on search and movement type
  const filteredWhales = whales.filter(whale => {
    const matchesSearch = whale.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         whale.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         whale.token.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || whale.movementType === filterType;
    
    return matchesSearch && matchesType;
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-primary bg-primary/20';
      case 'medium': return 'text-accent bg-accent/20';
      case 'high': return 'text-destructive bg-destructive/20';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'buy': return 'text-primary';
      case 'sell': return 'text-destructive';
      case 'transfer': return 'text-accent';
      default: return 'text-muted-foreground';
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
              <h1 className="text-3xl font-bold text-foreground mb-2">Whale Tracker</h1>
              <p className="text-muted-foreground">Monitor large wallet movements and activities</p>
            </div>
            <button
              onClick={loadWhales}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:opacity-50 text-primary-foreground rounded-xl font-semibold transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Tracking...' : 'Track Whales'}</span>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search whales by name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors duration-200"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'buy' | 'sell' | 'transfer')}
              className="px-4 py-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:border-primary transition-colors duration-200"
            >
              <option value="all">All Movements</option>
              <option value="buy">Buys</option>
              <option value="sell">Sells</option>
              <option value="transfer">Transfers</option>
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
            { label: 'Active Whales', value: whales.length, icon: Users },
            { label: 'Total Balance', value: `$${(whales.reduce((sum, w) => sum + w.balance, 0) / 1000000).toFixed(1)}M`, icon: DollarSign },
            { label: 'High Risk', value: whales.filter(w => w.riskLevel === 'high').length, icon: AlertTriangle },
            { label: 'Recent Activity', value: whales.filter(w => new Date(w.lastActivity) > new Date(Date.now() - 24*60*60*1000)).length, icon: Activity }
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

        {/* Whales List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-card backdrop-blur-sm rounded-2xl border border-border overflow-hidden"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Tracked Whales</h2>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 text-foreground animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Tracking whale movements...</p>
            </div>
          ) : filteredWhales.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No whales found matching your criteria</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredWhales.map((whale, index) => (
                <motion.div
                  key={whale.address}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="p-6 hover:bg-muted transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {whale.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(whale.riskLevel)}`}>
                          {whale.riskLevel.toUpperCase()} RISK
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMovementColor(whale.movementType)} bg-muted`}>
                          {whale.movementType.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Address: {whale.address.slice(0, 8)}...{whale.address.slice(-8)}
                      </p>
                      <div className="flex items-center space-x-6 text-sm">
                        <span className="text-foreground">
                          <span className="text-muted-foreground">Balance:</span> ${(whale.balance / 1000000).toFixed(1)}M
                        </span>
                        <span className="text-foreground">
                          <span className="text-muted-foreground">Last Move:</span> ${(whale.amount / 1000).toFixed(0)}K {whale.token}
                        </span>
                        <span className="text-foreground">
                          <span className="text-muted-foreground">Activity:</span> {new Date(whale.lastActivity).toLocaleDateString()}
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