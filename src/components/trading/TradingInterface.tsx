// Trading Interface Component - following 0rug.com coding guidelines

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { TradingState, Token } from './TradingState';
import { TokenSelector } from './TokenSelector';
import { RiskAssessment } from './RiskAssessment';

// Trading interface props
interface TradingInterfaceProps {
  tradingState: TradingState;
  supportedTokens: Token[];
  onInputChange: (value: string) => void;
  onTokenSelect: (tokenAddress: string, isInput: boolean) => void;
  onGetQuote: () => Promise<void>;
  onExecuteSwap: () => Promise<void>;
}

// Trading interface component
export function TradingInterface({
  tradingState,
  supportedTokens,
  onInputChange,
  onTokenSelect,
  onGetQuote,
  onExecuteSwap
}: TradingInterfaceProps) {
  // Format number for display
  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  // Calculate risk score based on trading state
  const calculateRiskScore = (state: TradingState): number => {
    if (!state.quote) return 50;
    
    let score = 50; // Base score
    
    // Price impact factor
    if (state.quote.priceImpact > 5) score += 30;
    else if (state.quote.priceImpact > 2) score += 15;
    else if (state.quote.priceImpact < 0.5) score -= 10;
    
    // Amount factor
    const amount = parseFloat(state.inputAmount || '0');
    if (amount > 10000) score += 20;
    else if (amount > 1000) score += 10;
    else if (amount < 100) score -= 5;
    
    // Route complexity factor
    if (state.quote.route.length > 3) score += 10;
    
    return Math.max(0, Math.min(100, score));
  };

  // Calculate risk level based on score
  const calculateRiskLevel = (state: TradingState): 'low' | 'medium' | 'high' => {
    const score = calculateRiskScore(state);
    if (score < 30) return 'low';
    if (score < 70) return 'medium';
    return 'high';
  };

  // Get risk factors based on trading state
  const getRiskFactors = (state: TradingState): string[] => {
    const factors: string[] = [];
    
    if (!state.quote) return factors;
    
    if (state.quote.priceImpact > 5) {
      factors.push('High price impact detected');
    }
    
    const amount = parseFloat(state.inputAmount || '0');
    if (amount > 10000) {
      factors.push('Large trade size');
    }
    
    if (state.quote.route.length > 3) {
      factors.push('Complex routing path');
    }
    
    if (state.quote.fee > 100) {
      factors.push('High transaction fees');
    }
    
    return factors;
  };

  // Get recommendations based on trading state
  const getRecommendations = (state: TradingState): string[] => {
    const recommendations: string[] = [];
    
    if (!state.quote) return recommendations;
    
    if (state.quote.priceImpact > 5) {
      recommendations.push('Consider smaller trade size');
    }
    
    if (state.quote.priceImpact < 0.5) {
      recommendations.push('Good price impact - safe to proceed');
    }
    
    const amount = parseFloat(state.inputAmount || '0');
    if (amount > 10000) {
      recommendations.push('Monitor for slippage');
    }
    
    if (state.quote.route.length > 3) {
      recommendations.push('Consider alternative routes');
    }
    
    return recommendations;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          {/* Input Token */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              You Pay
            </label>
            <div className="flex items-center gap-3">
              <TokenSelector
                selectedToken={tradingState.inputToken}
                onTokenSelect={(address) => onTokenSelect(address, true)}
                supportedTokens={supportedTokens}
              />
              <input
                type="number"
                value={tradingState.inputAmount}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="0.0"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Swap Arrow */}
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full"
            >
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Output Token */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              You Receive
            </label>
            <div className="flex items-center gap-3">
              <TokenSelector
                selectedToken={tradingState.outputToken}
                onTokenSelect={(address) => onTokenSelect(address, false)}
                supportedTokens={supportedTokens}
              />
              <input
                type="number"
                value={tradingState.outputAmount}
                readOnly
                placeholder="0.0"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
              />
            </div>
          </div>

          {/* Quote Details */}
          {tradingState.quote && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2"
            >
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Price Impact</span>
                <span className={tradingState.quote.priceImpact > 1 ? 'text-red-500' : 'text-green-500'}>
                  {tradingState.quote.priceImpact.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Fee</span>
                <span>{formatNumber(tradingState.quote.fee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Route</span>
                <span className="text-blue-500">{tradingState.quote.route.join(' → ')}</span>
              </div>
            </motion.div>
          )}

          {/* Risk Assessment */}
          {tradingState.quote && tradingState.inputAmount && (
            <RiskAssessment
              inputToken={tradingState.inputToken}
              outputToken={tradingState.outputToken}
              amount={parseFloat(tradingState.inputAmount)}
              riskScore={calculateRiskScore(tradingState)}
              riskLevel={calculateRiskLevel(tradingState)}
              riskFactors={getRiskFactors(tradingState)}
              recommendations={getRecommendations(tradingState)}
              isLoading={tradingState.isLoading}
            />
          )}

          {/* Error Message */}
          {tradingState.error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-700 dark:text-red-300">{tradingState.error}</span>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onGetQuote}
              disabled={tradingState.isLoading || !tradingState.inputAmount}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {tradingState.isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>{tradingState.isLoading ? 'Getting Quote...' : 'Get Quote'}</span>
            </button>

            {tradingState.quote && (
              <button
                onClick={onExecuteSwap}
                disabled={tradingState.isLoading}
                className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                {tradingState.isLoading ? 'Swapping...' : 'Swap'}
              </button>
            )}
          </div>

          {/* Slippage Settings */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Slippage Tolerance</span>
              <div className="flex gap-2">
                {[0.1, 0.5, 1.0].map((value) => (
                  <button
                    key={value}
                    onClick={() => {/* Handle slippage change */}}
                    className={`px-3 py-1 text-sm rounded ${
                      tradingState.slippage === value
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {value}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 