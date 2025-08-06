// Main MemeBot Chat Interface
// Following 0rug.com coding guidelines

'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { NewMemeBotLayout } from '@/components/trading/NewMemeBotLayout';
import { NewbieTokenExplorer } from '@/components/trading/NewbieTokenExplorer';
import { Bot, Shield, TrendingUp } from 'lucide-react';

// Simple trading interface placeholder
function SimpleTradingInterface() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <TrendingUp className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Advanced Trading
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Professional trading features coming soon!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Swap Tokens</h3>
              <p className="text-gray-600 dark:text-gray-400">Instant token swaps with best rates</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Portfolio</h3>
              <p className="text-gray-600 dark:text-gray-400">Track your token holdings</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400">Advanced trading analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TradingPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'explorer' | 'trading'>('chat');

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Navigation Tabs */}
        <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex space-x-1 py-4">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'chat'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>AI Chat</span>
              </button>
              
              <button
                onClick={() => setActiveTab('explorer')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'explorer'
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Token Explorer</span>
              </button>
              
              <button
                onClick={() => setActiveTab('trading')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'trading'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Advanced Trading</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'chat' && <NewMemeBotLayout />}
          {activeTab === 'explorer' && <NewbieTokenExplorer />}
          {activeTab === 'trading' && <SimpleTradingInterface />}
        </div>
      </div>
    </Layout>
  );
} 