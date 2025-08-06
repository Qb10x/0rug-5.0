'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { 
  Bot, 
  Bell, 
  Settings,
  RefreshCw,
  Search,
  Eye,
  MessageSquare
} from 'lucide-react';
import { sendAlert } from '@/lib/orc-engine/alerts/alertSender';

// Alert interface
interface Alert {
  id: string;
  type: 'whale_movement' | 'swap_detected' | 'pool_risk' | 'liquidity_change';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
  sent: boolean;
  channel: 'telegram' | 'discord' | 'both';
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Load alerts data
  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAlerts: Alert[] = [
        {
          id: '1',
          type: 'whale_movement',
          title: '🐋 Whale Movement Detected',
          message: 'Large whale activity detected on Solana network',
          priority: 'high',
          timestamp: '2025-01-05T10:30:00Z',
          sent: true,
          channel: 'both'
        },
        {
          id: '2',
          type: 'swap_detected',
          title: '💱 Large Swap Detected',
          message: 'Significant swap detected on Raydium',
          priority: 'medium',
          timestamp: '2025-01-05T09:15:00Z',
          sent: true,
          channel: 'telegram'
        },
        {
          id: '3',
          type: 'pool_risk',
          title: '⚠️ Pool Risk Alert',
          message: 'High risk detected in liquidity pool',
          priority: 'high',
          timestamp: '2025-01-05T08:45:00Z',
          sent: false,
          channel: 'discord'
        }
      ];
      
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || alert.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'high': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'whale_movement': return '🐋';
      case 'swap_detected': return '💱';
      case 'pool_risk': return '⚠️';
      case 'liquidity_change': return '💧';
      default: return '🔔';
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
              <h1 className="text-3xl font-bold text-white mb-2">Real-Time Alerts</h1>
              <p className="text-gray-300">Telegram & Discord notifications for key events</p>
            </div>
            <button
              onClick={loadAlerts}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Loading...' : 'Refresh Alerts'}</span>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search alerts by title or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors duration-200"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors duration-200"
            >
              <option value="all">All Types</option>
              <option value="whale_movement">Whale Movement</option>
              <option value="swap_detected">Swap Detected</option>
              <option value="pool_risk">Pool Risk</option>
              <option value="liquidity_change">Liquidity Change</option>
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
            { label: 'Total Alerts', value: alerts.length, icon: Bot, color: 'from-blue-500 to-cyan-500' },
            { label: 'Sent Today', value: alerts.filter(a => a.sent && new Date(a.timestamp).toDateString() === new Date().toDateString()).length, icon: Bell, color: 'from-green-500 to-emerald-500' },
            { label: 'High Priority', value: alerts.filter(a => a.priority === 'high').length, icon: Settings, color: 'from-red-500 to-pink-500' },
            { label: 'Active Channels', value: 2, icon: MessageSquare, color: 'from-purple-500 to-pink-500' }
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

        {/* Alerts List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Alert History</h2>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
              <p className="text-gray-300">Loading alerts...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="p-8 text-center">
              <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300">No alerts found matching your criteria</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="p-6 hover:bg-white/5 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <span className="text-2xl">{getTypeIcon(alert.type)}</span>
                        <h3 className="text-lg font-semibold text-white">
                          {alert.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                          {alert.priority.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${alert.sent ? 'text-green-400 bg-green-500/20' : 'text-yellow-400 bg-yellow-500/20'}`}>
                          {alert.sent ? 'SENT' : 'PENDING'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center space-x-6 text-sm">
                        <span className="text-gray-300">
                          <span className="text-gray-400">Channel:</span> {alert.channel}
                        </span>
                        <span className="text-gray-300">
                          <span className="text-gray-400">Time:</span> {new Date(alert.timestamp).toLocaleString()}
                        </span>
                        <span className="text-gray-300">
                          <span className="text-gray-400">Type:</span> {alert.type.replace('_', ' ')}
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