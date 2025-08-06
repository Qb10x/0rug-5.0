// Newbie Token Explorer - Simple Interface for Beginners
// Following 0rug.com coding guidelines

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Diamond, Shield, AlertTriangle, XCircle, TrendingUp, HelpCircle, Star, Eye, Globe } from 'lucide-react';
import { getTrendingSolanaTokens, getTrendingTokensByChain, getSupportedChains, getChainDisplayName } from '@/lib/api/dexscreener';
import { filterTokensForNewbies, analyzeTokenForNewbies, generateNewbieAnalysis } from '@/lib/utils/tokenFiltering';
import { generateNewbieTokenAnalysis, explainLikeIm5 } from '@/lib/api/ai';
import { DexscreenerPair } from '@/lib/api/dexscreener';

interface TokenCardProps {
  token: DexscreenerPair;
  quality: any;
  onSelect: (token: DexscreenerPair) => void;
}

// Token card component with newbie-friendly display
function TokenCard({ token, quality, onSelect }: TokenCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'DIAMOND': return <Diamond className="w-5 h-5 text-blue-500" />;
      case 'SAFE': return <Shield className="w-5 h-5 text-green-500" />;
      case 'RISKY': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'SCAM': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Eye className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'DIAMOND': return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20';
      case 'SAFE': return 'border-green-200 bg-green-50 dark:bg-green-900/20';
      case 'RISKY': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20';
      case 'SCAM': return 'border-red-200 bg-red-50 dark:bg-red-900/20';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(token)}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${getCategoryColor(quality.category)}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getCategoryIcon(quality.category)}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {token.baseToken.symbol}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {token.baseToken.name}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            ${parseFloat(token.priceUsd).toFixed(8)}
          </div>
          <div className={`text-sm font-medium ${
            token.priceChange.h24 > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {token.priceChange.h24 > 0 ? '+' : ''}{token.priceChange.h24.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Quality Score:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {quality.score}/100
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              quality.score >= 80 ? 'bg-blue-500' :
              quality.score >= 60 ? 'bg-green-500' :
              quality.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${quality.score}%` }}
          />
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Volume:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            ${(token.volume.h24 / 1000000).toFixed(2)}M
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Liquidity:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            ${(token.liquidity.usd / 1000000).toFixed(2)}M
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {quality.recommendation}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            quality.category === 'DIAMOND' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
            quality.category === 'SAFE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            quality.category === 'RISKY' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {quality.category}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// Main Newbie Token Explorer component
export function NewbieTokenExplorer() {
  const [tokens, setTokens] = useState<DexscreenerPair[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<{
    diamonds: DexscreenerPair[];
    safe: DexscreenerPair[];
    trending: DexscreenerPair[];
    avoid: DexscreenerPair[];
  }>({ diamonds: [], safe: [], trending: [], avoid: [] });
  const [selectedToken, setSelectedToken] = useState<DexscreenerPair | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'diamonds' | 'safe' | 'trending' | 'avoid'>('diamonds');
  const [selectedChain, setSelectedChain] = useState<string>('solana');
  
  const supportedChains = getSupportedChains();

  // Load and filter tokens
  useEffect(() => {
    loadTokens();
  }, [selectedChain]);

  const loadTokens = async () => {
    setIsLoading(true);
    try {
      const trendingTokens = await getTrendingTokensByChain(selectedChain);
      setTokens(trendingTokens);
      
      const filtered = filterTokensForNewbies(trendingTokens);
      setFilteredTokens(filtered);
    } catch (error) {
      console.error('Failed to load tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenSelect = async (token: DexscreenerPair) => {
    setSelectedToken(token);
    setIsLoading(true);
    
    try {
      const quality = analyzeTokenForNewbies(token);
      const analysis = await generateNewbieTokenAnalysis(
        {
          name: token.baseToken.name,
          symbol: token.baseToken.symbol,
          price: token.priceUsd,
          priceChange: token.priceChange.h24,
          volume: token.volume.h24,
          liquidity: token.liquidity.usd,
          marketCap: token.fdv
        },
        quality.score,
        quality.category
      );
      
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Failed to generate analysis:', error);
      setAiAnalysis('Sorry, I encountered an error generating the analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTabTokens = () => {
    switch (activeTab) {
      case 'diamonds': return filteredTokens.diamonds;
      case 'safe': return filteredTokens.safe;
      case 'trending': return filteredTokens.trending;
      case 'avoid': return filteredTokens.avoid;
      default: return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🎯 Newbie Token Explorer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Find the best tokens from Dexscreener - simplified for beginners
          </p>
          
          {/* Chain Selector */}
          <div className="flex justify-center mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Chain:</span>
                <select
                  value={selectedChain}
                  onChange={(e) => setSelectedChain(e.target.value)}
                  className="px-3 py-1 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {supportedChains.map(chain => (
                    <option key={chain} value={chain}>
                      {getChainDisplayName(chain)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Token List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              {/* Tabs */}
              <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('diamonds')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'diamonds' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  💎 Diamonds ({filteredTokens.diamonds.length})
                </button>
                <button
                  onClick={() => setActiveTab('safe')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'safe' 
                      ? 'bg-green-500 text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  🛡️ Safe ({filteredTokens.safe.length})
                </button>
                <button
                  onClick={() => setActiveTab('trending')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'trending' 
                      ? 'bg-orange-500 text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  🔥 Trending ({filteredTokens.trending.length})
                </button>
                <button
                  onClick={() => setActiveTab('avoid')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'avoid' 
                      ? 'bg-red-500 text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  ⚠️ Avoid ({filteredTokens.avoid.length})
                </button>
              </div>
              
              {/* Chain Info */}
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  📊 Showing {getChainDisplayName(selectedChain)} tokens • {tokens.length} total found • Updated in real-time from Dexscreener
                </p>
              </div>

              {/* Token Grid */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tokens...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getTabTokens().map((token) => {
                    const quality = analyzeTokenForNewbies(token);
                    return (
                      <TokenCard
                        key={token.pairAddress}
                        token={token}
                        quality={quality}
                        onSelect={handleTokenSelect}
                      />
                    );
                  })}
                </div>
              )}

              {getTabTokens().length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">
                    No tokens found in this category. Try refreshing or check back later.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Analysis Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                🤖 AI Analysis
              </h2>
              
              {selectedToken ? (
                <div>
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      {selectedToken.baseToken.symbol} Analysis
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Click on any token to get AI-powered analysis in simple terms
                    </p>
                  </div>

                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Analyzing token...
                      </p>
                    </div>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                        {aiAnalysis}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Select a token to get AI-powered analysis in simple terms
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 