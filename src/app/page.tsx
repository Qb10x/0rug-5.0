'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { 
  TrendingUp, 
  DollarSign, 
  Activity,
  Users,
  BarChart3,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Clock
} from 'lucide-react';

// Dashboard stats interface
interface DashboardStats {
  totalVolume: number;
  activePools: number;
  whaleAlerts: number;
  successRate: number;
  volumeChange: number;
  poolsChange: number;
  alertsChange: number;
  rateChange: number;
}

// Dashboard page component
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVolume: 0,
    activePools: 0,
    whaleAlerts: 0,
    successRate: 0,
    volumeChange: 0,
    poolsChange: 0,
    alertsChange: 0,
    rateChange: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        // Mock API call - replace with actual data fetching
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          totalVolume: 2.4,
          activePools: 1247,
          whaleAlerts: 89,
          successRate: 99.8,
          volumeChange: 12.5,
          poolsChange: -2.1,
          alertsChange: 8.3,
          rateChange: 0.2
        });
        setError(null);
      } catch (error) {
        setError('Failed to load dashboard stats. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  // Format number for display
  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toFixed(1);
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-gray-900 dark:text-white mb-2"
            >
              Welcome to 0rug Analytics
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 dark:text-gray-400"
            >
              Real-time Solana DEX analytics and trading intelligence
            </motion.p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Volume */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Volume</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${formatNumber(stats.totalVolume)}M
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <ArrowUpRight className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500 ml-1">
                  {formatPercentage(stats.volumeChange)}
                </span>
              </div>
            </motion.div>

            {/* Active Pools */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Pools</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(stats.activePools)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <ArrowDownRight className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-500 ml-1">
                  {formatPercentage(stats.poolsChange)}
                </span>
              </div>
            </motion.div>

            {/* Whale Alerts */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Whale Alerts</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.whaleAlerts}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <ArrowUpRight className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500 ml-1">
                  {formatPercentage(stats.alertsChange)}
                </span>
              </div>
            </motion.div>

            {/* Success Rate */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.successRate}%
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                  <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <ArrowUpRight className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500 ml-1">
                  {formatPercentage(stats.rateChange)}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trading</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Execute trades with the best rates and minimal slippage
              </p>
              <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                Start Trading
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Monitor pools, track whales, and analyze market trends
              </p>
              <button className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                View Analytics
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alerts</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Set up real-time alerts for whale movements and opportunities
              </p>
              <button className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors">
                Configure Alerts
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
} 