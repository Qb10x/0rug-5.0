'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { getRiskLevelColor, getPriceChangeColor } from '@/lib/theme/colorUtils';

interface TokenData {
  name: string;
  symbol: string;
  price: number;
  priceChange: number;
  volume24h: number;
  marketCap: number;
  liquidity: number;
  holders: number;
  riskScore: number;
  isVerified: boolean;
  age: number;
}

interface TokenAnalysisCardProps {
  tokenData: TokenData;
  onViewDetails: () => void;
}

// Get trend indicator based on price change
const getTrendIndicator = (priceChange: number) => {
  if (priceChange > 0) {
    return { color: 'text-green-500', bg: 'bg-green-100', icon: TrendingUp };
  } else if (priceChange < 0) {
    return { color: 'text-red-500', bg: 'bg-red-100', icon: TrendingDown };
  } else {
    return { color: 'text-yellow-500', bg: 'bg-yellow-100', icon: Minus };
  }
};

// Get risk level assessment
const getRiskAssessment = (score: number) => {
  if (score <= 3) return { level: 'Low', color: 'text-green-500', bg: 'bg-green-100' };
  if (score <= 6) return { level: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-100' };
  return { level: 'High', color: 'text-red-500', bg: 'bg-red-100' };
};

// Format number with appropriate suffix
const formatNumber = (num: number): string => {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toFixed(2);
};

// Format price with appropriate decimals
const formatPrice = (price: number): string => {
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(4);
  return price.toFixed(8);
};

// Token analysis card component
export default function TokenAnalysisCard({ tokenData, onViewDetails }: TokenAnalysisCardProps) {
  const trendIndicator = getTrendIndicator(tokenData.priceChange);
  const riskAssessment = getRiskAssessment(tokenData.riskScore);
  const riskColors = getRiskLevelColor(tokenData.riskScore <= 3 ? 'low' : tokenData.riskScore <= 6 ? 'medium' : 'high');
  const priceChangeColors = getPriceChangeColor(tokenData.priceChange > 0);

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={onViewDetails}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">{tokenData.symbol.charAt(0)}</span>
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{tokenData.name}</CardTitle>
              <p className="text-sm text-gray-500">${tokenData.symbol}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {tokenData.isVerified && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            <Badge className={`${riskColors.bg} ${riskColors.text}`}>
              <AlertTriangle className="w-3 h-3 mr-1" />
              {riskAssessment.level} Risk
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Price Section */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">${formatPrice(tokenData.price)}</p>
            <div className="flex items-center space-x-2">
              <trendIndicator.icon className={`w-4 h-4 ${trendIndicator.color}`} />
              <span className={`font-medium ${priceChangeColors.text}`}>
                {tokenData.priceChange > 0 ? '+' : ''}{tokenData.priceChange.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className={`p-2 rounded-lg ${trendIndicator.bg}`}>
            <trendIndicator.icon className={`w-6 h-6 ${trendIndicator.color}`} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Market Cap</p>
            <p className="font-semibold">${formatNumber(tokenData.marketCap)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">24h Volume</p>
            <p className="font-semibold">${formatNumber(tokenData.volume24h)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Liquidity</p>
            <p className="font-semibold">${formatNumber(tokenData.liquidity)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Holders</p>
            <p className="font-semibold">{formatNumber(tokenData.holders)}</p>
          </div>
        </div>

        {/* Risk Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Risk Score</p>
            <span className={`text-sm font-medium ${riskColors.text}`}>
              {tokenData.riskScore}/10
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${riskColors.progress}`}
              style={{ width: `${(tokenData.riskScore / 10) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Token Age */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Token Age</span>
          <span className="font-medium">{tokenData.age} days</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Named export for backward compatibility
export { TokenAnalysisCard }; 