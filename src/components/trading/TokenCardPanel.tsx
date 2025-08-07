'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Shield,
  Users,
  Activity,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { TokenData, TokenCardProps } from './TokenCardTypes';
import { realTimeService, RealTimeTokenData } from '@/lib/services/realTimeData';

// Expandable section component
interface ExpandableSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  icon,
  children,
  isExpanded,
  onToggle
}) => (
  <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 mb-3">
    <button
      onClick={onToggle}
      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div className="text-gray-600 dark:text-gray-400">
          {icon}
        </div>
        <span className="font-medium text-gray-900 dark:text-white">
          {title}
        </span>
      </div>
      {isExpanded ? (
        <ChevronUp className="w-5 h-5 text-gray-500" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-500" />
      )}
    </button>
    
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="px-4 pb-4 space-y-3">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// Token card component
const TokenCard: React.FC<TokenCardProps> = ({ token }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Toggle section expansion
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Get risk color
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-600 dark:text-green-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'High': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Get price change color and icon
  const getPriceChangeDisplay = (change: number) => {
    const isPositive = change >= 0;
    const color = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    const icon = isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
    
    return { color, icon, isPositive };
  };

  const priceChange = getPriceChangeDisplay(token.priceChange);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
    >
      {/* Token Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-2xl">
            {token.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {token.symbol}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {token.name}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {token.price}
          </div>
          <div className={`flex items-center space-x-1 ${priceChange.color}`}>
            {priceChange.icon}
            <span className="text-sm font-medium">
              {priceChange.isPositive ? '+' : ''}{token.priceChange.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Price Chart Placeholder */}
      <div className="mb-6">
        <div className="h-20 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            📈 Price Chart (Coming Soon)
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Liquidity</span>
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {token.liquidity}
          </div>
        </div>
        
        <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Volume</span>
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {token.volume}
          </div>
        </div>
        
        <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Risk</span>
          </div>
          <div className={`text-lg font-semibold ${getRiskColor(token.riskLevel)}`}>
            {token.riskLevel}
          </div>
        </div>
        
        <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">RugRisk</span>
          </div>
          <div className={`text-lg font-semibold ${getRiskColor(token.rugRisk)}`}>
            {token.rugRisk}
          </div>
        </div>
      </div>

      {/* Expandable Sections */}
      <div className="space-y-3">
        {/* Token Details */}
        <ExpandableSection
          title="Token Details"
          icon={<BarChart3 className="w-5 h-5" />}
          isExpanded={expandedSections.has('details')}
          onToggle={() => toggleSection('details')}
        >
          <div className="space-y-2 text-sm">
            {token.marketCap && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Market Cap:</span>
                <span className="font-medium text-gray-900 dark:text-white">{token.marketCap}</span>
              </div>
            )}
            {token.holders && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Holders:</span>
                <span className="font-medium text-gray-900 dark:text-white">{token.holders.toLocaleString()}</span>
              </div>
            )}
            {token.age && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Age:</span>
                <span className="font-medium text-gray-900 dark:text-white">{token.age}</span>
              </div>
            )}
            {token.contract && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Contract:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                    {token.contract.slice(0, 8)}...{token.contract.slice(-6)}
                  </span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </div>
              </div>
            )}
          </div>
        </ExpandableSection>

        {/* Whale Activity */}
        {token.whaleActivity && (
          <ExpandableSection
            title="Whale Activity"
            icon={<Users className="w-5 h-5" />}
            isExpanded={expandedSections.has('whales')}
            onToggle={() => toggleSection('whales')}
          >
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Top 10 Holders:</span>
                <span className="font-medium text-gray-900 dark:text-white">{token.whaleActivity.topHoldersPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Recent Large Trades:</span>
                <span className="font-medium text-gray-900 dark:text-white">{token.whaleActivity.recentLargeTrades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Whale Confidence:</span>
                <span className="font-medium text-gray-900 dark:text-white">{token.whaleActivity.whaleConfidence}%</span>
              </div>
            </div>
          </ExpandableSection>
        )}

        {/* Trading Analysis */}
        {token.tradingAnalysis && (
          <ExpandableSection
            title="Trading Analysis"
            icon={<Activity className="w-5 h-5" />}
            isExpanded={expandedSections.has('trading')}
            onToggle={() => toggleSection('trading')}
          >
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Buy/Sell Ratio:</span>
                <span className="font-medium text-gray-900 dark:text-white">{token.tradingAnalysis.buySellRatio}/35</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Avg Trade Size:</span>
                <span className="font-medium text-gray-900 dark:text-white">{token.tradingAnalysis.avgTradeSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Volatility:</span>
                <span className={`font-medium ${getRiskColor(token.tradingAnalysis.volatility)}`}>
                  {token.tradingAnalysis.volatility}
                </span>
              </div>
            </div>
          </ExpandableSection>
        )}
      </div>
    </motion.div>
  );
};

// Main token card panel component
export const TokenCardPanel: React.FC = () => {
  const [tokens, setTokens] = useState<RealTimeTokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  // Subscribe to real-time updates - only when component is mounted and visible
  useEffect(() => {
    // Only start updates if the component is actually visible and not already running
    const isVisible = document.visibilityState === 'visible';
    const isAlreadyRunning = realTimeService.isRunning();
    
    if (isVisible && !isAlreadyRunning) {
      setLoading(true);
      
      // Start real-time service with error handling
      try {
        realTimeService.startUpdates('solana');
        
        // Subscribe to updates
        const unsubscribe = realTimeService.subscribe((data) => {
          setTokens(data);
          setLastUpdated(new Date());
          setLoading(false);
        });

        // Cleanup on unmount
        return () => {
          unsubscribe();
          // Only stop if no other components are using the service
          if (realTimeService.getCurrentData().length === 0) {
            realTimeService.stopUpdates();
          }
        };
      } catch (error) {
        console.warn('Failed to start real-time updates:', error);
        setLoading(false);
      }
    } else if (isAlreadyRunning) {
      // If service is already running, just subscribe to existing data
      const unsubscribe = realTimeService.subscribe((data) => {
        setTokens(data);
        setLastUpdated(new Date());
        setLoading(false);
      });

      return () => {
        unsubscribe();
      };
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-full bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Token Analysis
          </h2>
          {!loading && lastUpdated && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Live • {mounted ? lastUpdated.toLocaleTimeString() : ''}
              </span>
            </div>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {loading ? 'Loading real-time data...' : 'Live token information and metrics'}
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading tokens...</p>
          </div>
        </div>
      )}

      {/* Scrollable Token Cards */}
      {!loading && (
        <div className="space-y-6 overflow-y-auto h-[calc(100vh-200px)] pr-2">
          {tokens.map((token, index) => (
            <TokenCard key={token.symbol} token={token} />
          ))}
        </div>
      )}
    </div>
  );
}; 