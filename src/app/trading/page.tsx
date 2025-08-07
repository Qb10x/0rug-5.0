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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 shadow-lg p-8 text-center">
          <TrendingUp className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">
            Advanced Trading
          </h1>
          <p className="text-gray-300 mb-6">
            Professional trading features coming soon!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <h3 className="font-semibold text-white mb-2">Swap Tokens</h3>
              <p className="text-gray-300">Instant token swaps with best rates</p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <h3 className="font-semibold text-white mb-2">Portfolio</h3>
              <p className="text-gray-300">Track your token holdings</p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <h3 className="font-semibold text-white mb-2">Analytics</h3>
              <p className="text-gray-300">Advanced trading analytics</p>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Navigation Tabs */}
        <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex space-x-1 py-4">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'chat'
                    ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>AI Chat</span>
              </button>
              
              <button
                onClick={() => setActiveTab('explorer')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'explorer'
                    ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Token Explorer</span>
              </button>
              
              <button
                onClick={() => setActiveTab('trading')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'trading'
                    ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
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