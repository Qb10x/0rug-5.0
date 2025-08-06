'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Info, ExternalLink, DollarSign } from 'lucide-react';

interface TokenData {
  baseToken: {
    symbol: string;
    name: string;
  };
  priceUsd: string;
  priceChange: {
    h24: number;
  };
  volume: {
    h24: number;
  };
  liquidity: {
    usd: number;
  };
  dexId: string;
  pairAddress: string;
}

interface InteractiveTokenCardProps {
  token: TokenData;
  index: number;
  onViewDetails: (token: TokenData) => void;
  onTrade: (token: TokenData) => void;
}

export const InteractiveTokenCard: React.FC<InteractiveTokenCardProps> = ({
  token,
  index,
  onViewDetails,
  onTrade
}) => {
  const priceChange = token.priceChange?.h24 || 0;
  const volume = token.volume?.h24 || 0;
  const liquidity = token.liquidity?.usd || 0;
  const isPositive = priceChange >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              {token.baseToken.symbol}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {token.baseToken.name}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-gray-900 dark:text-white">
            ${parseFloat(token.priceUsd).toFixed(6)}
          </div>
          <div className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{priceChange.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
          <div className="text-gray-500 dark:text-gray-400">Volume 24h</div>
          <div className="font-medium text-gray-900 dark:text-white">
            ${(volume / 1000000).toFixed(1)}M
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
          <div className="text-gray-500 dark:text-gray-400">Liquidity</div>
          <div className="font-medium text-gray-900 dark:text-white">
            ${(liquidity / 1000000).toFixed(1)}M
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewDetails(token)}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
        >
          <Info className="w-4 h-4" />
          <span>Details</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onTrade(token)}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
        >
          <DollarSign className="w-4 h-4" />
          <span>Trade</span>
        </motion.button>
      </div>
    </motion.div>
  );
}; 