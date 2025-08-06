'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { 
  Bot, 
  MessageSquare, 
  TrendingUp,
  Shield,
  Sparkles,
  ArrowRight,
  Users,
  Zap,
  Star,
  Play
} from 'lucide-react';

// Chat stats interface
interface ChatStats {
  totalConversations: number;
  tokensAnalyzed: number;
  aiResponses: number;
  userSatisfaction: number;
  conversationsChange: number;
  tokensChange: number;
  responsesChange: number;
  satisfactionChange: number;
}

// Dashboard page component
export default function DashboardPage() {
  const [stats, setStats] = useState<ChatStats>({
    totalConversations: 0,
    tokensAnalyzed: 0,
    aiResponses: 0,
    userSatisfaction: 0,
    conversationsChange: 0,
    tokensChange: 0,
    responsesChange: 0,
    satisfactionChange: 0
  });

  const [error, setError] = useState<string | null>(null);

  // Load chat stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        // Mock API call - replace with actual data fetching
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          totalConversations: 1247,
          tokensAnalyzed: 89,
          aiResponses: 2341,
          userSatisfaction: 98.5,
          conversationsChange: 12.5,
          tokensChange: 8.3,
          responsesChange: 15.2,
          satisfactionChange: 2.1
        });
        setError(null);
      } catch {
        setError('Failed to load chat stats. Please try again.');
      }
    };

    loadStats();
  }, []);

  // Format number for display
  const formatNumber = (num: number): string => {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toFixed(0);
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Chat Stats</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mr-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                MemeBot Chat
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Your AI-powered companion for token analysis and crypto insights. 
              Ask questions, discover trending tokens, and get newbie-friendly explanations.
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {/* Total Conversations */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div className={`text-sm font-medium ${
                  stats.conversationsChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(stats.conversationsChange)}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {formatNumber(stats.totalConversations)}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Conversations</p>
            </div>

            {/* Tokens Analyzed */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className={`text-sm font-medium ${
                  stats.tokensChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(stats.tokensChange)}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {formatNumber(stats.tokensAnalyzed)}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Tokens Analyzed</p>
            </div>

            {/* AI Responses */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className={`text-sm font-medium ${
                  stats.responsesChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(stats.responsesChange)}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {formatNumber(stats.aiResponses)}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">AI Responses</p>
            </div>

            {/* User Satisfaction */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className={`text-sm font-medium ${
                  stats.satisfactionChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(stats.satisfactionChange)}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stats.userSatisfaction}%
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">User Satisfaction</p>
            </div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Start Chatting */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Start Chatting
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Ask me anything about tokens! Get real-time analysis, trending insights, and newbie-friendly explanations.
              </p>
              <a 
                href="/trading"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Chat
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>

            {/* Token Explorer */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Token Explorer
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Discover trending tokens across multiple chains with smart filtering and quality scoring.
              </p>
              <a 
                href="/trading"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Explore Tokens
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>

            {/* AI Features */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                AI Features
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Multi-chain support, smart filtering, risk assessment, and educational explanations powered by DeepSeek AI.
              </p>
              <a 
                href="/trading"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-medium hover:from-pink-600 hover:to-rose-600 transition-all duration-200 shadow-lg"
              >
                <Bot className="w-4 h-4 mr-2" />
                Learn More
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700 hover:from-purple-200 hover:to-blue-200 dark:hover:from-purple-800/30 dark:hover:to-blue-800/30 transition-all duration-200">
                <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3" />
                <span className="text-purple-700 dark:text-purple-300 font-medium">Ask about trending tokens</span>
              </button>
              <button className="flex items-center justify-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700 hover:from-green-200 hover:to-emerald-200 dark:hover:from-green-800/30 dark:hover:to-emerald-800/30 transition-all duration-200">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                <span className="text-green-700 dark:text-green-300 font-medium">Get risk assessment</span>
              </button>
              <button className="flex items-center justify-center p-4 bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg border border-pink-200 dark:border-pink-700 hover:from-pink-200 hover:to-rose-200 dark:hover:from-pink-800/30 dark:hover:to-rose-800/30 transition-all duration-200">
                <Sparkles className="w-5 h-5 text-pink-600 dark:text-pink-400 mr-3" />
                <span className="text-pink-700 dark:text-pink-300 font-medium">Learn about tokens</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
} 