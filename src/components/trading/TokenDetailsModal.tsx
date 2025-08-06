'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, AlertTriangle, CheckCircle, Clock, DollarSign, TrendingUp, Users, ExternalLink, Copy, AlertCircle } from 'lucide-react';
import { getDexscreenerTokenData, calculateRugRiskScore, DexscreenerPair } from '@/lib/api/dexscreener';
import { getJupiterTokenMetadata } from '@/lib/api/jupiter';

interface TokenDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenAddress: string;
  tokenSymbol: string;
}

interface RiskAssessment {
  score: number;
  level: 'Low' | 'Medium' | 'High' | 'Critical';
  factors: {
    liquidity: { score: number; reason: string };
    volume: { score: number; reason: string };
    age: { score: number; reason: string };
    priceStability: { score: number; reason: string };
  };
}

export const TokenDetailsModal: React.FC<TokenDetailsModalProps> = ({
  isOpen,
  onClose,
  tokenAddress,
  tokenSymbol
}) => {
  const [tokenData, setTokenData] = useState<DexscreenerPair | null>(null);
  const [jupiterData, setJupiterData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);

  // Fetch token data when modal opens
  useEffect(() => {
    if (isOpen && tokenAddress) {
      fetchTokenData();
    }
  }, [isOpen, tokenAddress]);

  const fetchTokenData = async () => {
    setLoading(true);
    try {
      // Fetch from DexScreener
      const dexData = await getDexscreenerTokenData(tokenAddress);
      setTokenData(dexData);

      // Fetch from Jupiter
      const jupData = await getJupiterTokenMetadata(tokenAddress);
      setJupiterData(jupData);

      // Calculate risk assessment
      if (dexData) {
        const risk = calculateRiskAssessment(dexData);
        setRiskAssessment(risk);
      }
    } catch (error) {
      console.error('Error fetching token data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRiskAssessment = (data: DexscreenerPair): RiskAssessment => {
    let totalScore = 0;
    const factors = {
      liquidity: { score: 0, reason: '' },
      volume: { score: 0, reason: '' },
      age: { score: 0, reason: '' },
      priceStability: { score: 0, reason: '' }
    };

    // Liquidity assessment
    if (data.liquidity.usd < 10000) {
      factors.liquidity = { score: 30, reason: 'Very low liquidity (< $10K)' };
    } else if (data.liquidity.usd < 50000) {
      factors.liquidity = { score: 15, reason: 'Low liquidity (< $50K)' };
    } else if (data.liquidity.usd < 100000) {
      factors.liquidity = { score: 5, reason: 'Moderate liquidity (< $100K)' };
    } else {
      factors.liquidity = { score: 0, reason: 'Good liquidity (> $100K)' };
    }

    // Volume assessment
    const volumeToLiquidityRatio = data.volume.h24 / data.liquidity.usd;
    if (volumeToLiquidityRatio > 10) {
      factors.volume = { score: 25, reason: 'Suspicious volume/liquidity ratio' };
    } else if (volumeToLiquidityRatio > 5) {
      factors.volume = { score: 15, reason: 'High volume/liquidity ratio' };
    } else {
      factors.volume = { score: 0, reason: 'Normal volume/liquidity ratio' };
    }

    // Age assessment
    const pairAge = Date.now() - data.pairCreatedAt;
    const daysOld = pairAge / (1000 * 60 * 60 * 24);
    if (daysOld < 1) {
      factors.age = { score: 20, reason: 'Very new token (< 1 day)' };
    } else if (daysOld < 7) {
      factors.age = { score: 10, reason: 'New token (< 1 week)' };
    } else {
      factors.age = { score: 0, reason: 'Established token (> 1 week)' };
    }

    // Price stability assessment
    if (data.priceChange.h24 < -50) {
      factors.priceStability = { score: 25, reason: 'Major price crash (> 50%)' };
    } else if (data.priceChange.h24 < -20) {
      factors.priceStability = { score: 15, reason: 'Significant price drop (> 20%)' };
    } else if (data.priceChange.h24 > 100) {
      factors.priceStability = { score: 10, reason: 'Suspicious price pump (> 100%)' };
    } else {
      factors.priceStability = { score: 0, reason: 'Stable price movement' };
    }

    totalScore = factors.liquidity.score + factors.volume.score + factors.age.score + factors.priceStability.score;

    let level: 'Low' | 'Medium' | 'High' | 'Critical';
    if (totalScore <= 20) level = 'Low';
    else if (totalScore <= 40) level = 'Medium';
    else if (totalScore <= 70) level = 'High';
    else level = 'Critical';

    return { score: totalScore, level, factors };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'High': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'Critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'Low': return <CheckCircle className="w-5 h-5" />;
      case 'Medium': return <AlertTriangle className="w-5 h-5" />;
      case 'High': return <AlertCircle className="w-5 h-5" />;
      case 'Critical': return <AlertTriangle className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {tokenSymbol} Details
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Risk Assessment & Token Analysis
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : tokenData ? (
                <div className="space-y-6">
                  {/* Risk Assessment */}
                  {riskAssessment && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Risk Assessment
                        </h3>
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getRiskColor(riskAssessment.level)}`}>
                          {getRiskIcon(riskAssessment.level)}
                          <span className="font-medium">{riskAssessment.level} Risk</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Risk Score</span>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {riskAssessment.score}/100
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              riskAssessment.score <= 20 ? 'bg-green-500' :
                              riskAssessment.score <= 40 ? 'bg-yellow-500' :
                              riskAssessment.score <= 70 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${riskAssessment.score}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Risk Factors */}
                      <div className="space-y-3">
                        {Object.entries(riskAssessment.factors).map(([factor, data]) => (
                          <div key={factor} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                {factor}
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {data.reason}
                              </p>
                            </div>
                            <span className={`text-sm font-bold ${
                              data.score === 0 ? 'text-green-600' :
                              data.score <= 10 ? 'text-yellow-600' :
                              data.score <= 20 ? 'text-orange-600' : 'text-red-600'
                            }`}>
                              +{data.score}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Token Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Token Info</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Price</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${parseFloat(tokenData.priceUsd).toFixed(8)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">24h Change</span>
                          <span className={`font-medium ${
                            tokenData.priceChange.h24 >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {tokenData.priceChange.h24 >= 0 ? '+' : ''}{tokenData.priceChange.h24.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Volume 24h</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${(tokenData.volume.h24 / 1000000).toFixed(2)}M
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Liquidity</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${(tokenData.liquidity.usd / 1000000).toFixed(2)}M
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Trading Activity</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Buys (24h)</span>
                          <span className="font-medium text-green-600">{tokenData.txns.h24.buys}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Sells (24h)</span>
                          <span className="font-medium text-red-600">{tokenData.txns.h24.sells}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Pair Age</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {Math.floor((Date.now() - tokenData.pairCreatedAt) / (1000 * 60 * 60 * 24))} days
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">DEX</span>
                          <span className="font-medium text-gray-900 dark:text-white capitalize">
                            {tokenData.dexId}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Token Address */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Token Address</h4>
                      <button
                        onClick={() => copyToClipboard(tokenData.baseToken.address)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <Copy className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded flex-1 break-all">
                        {tokenData.baseToken.address}
                      </code>
                      <a
                        href={`https://solscan.io/token/${tokenData.baseToken.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-500" />
                      </a>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200">
                      Trade on Jupiter
                    </button>
                    <button className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200">
                      View Chart
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Could not load token data. Please try again.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 