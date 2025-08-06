// Token Analysis Card Component
// Displays comprehensive token analysis with AI insights

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Shield, AlertCircle } from 'lucide-react';

interface TokenAnalysisData {
  summary: string;
  riskScore: number;
  recommendation: 'BUY' | 'HOLD' | 'SELL' | 'AVOID';
  keyInsights: string[];
  aiExplanation: string;
}

interface TokenAnalysisCardProps {
  tokenData: any;
  analysis: TokenAnalysisData;
  isLoading?: boolean;
}

export function TokenAnalysisCard({ tokenData, analysis, isLoading = false }: TokenAnalysisCardProps) {
  // Get recommendation color and icon
  const getRecommendationStyle = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY':
        return { color: 'text-green-500', bg: 'bg-green-100', icon: TrendingUp };
      case 'SELL':
        return { color: 'text-red-500', bg: 'bg-red-100', icon: TrendingDown };
      case 'AVOID':
        return { color: 'text-orange-500', bg: 'bg-orange-100', icon: AlertTriangle };
      default:
        return { color: 'text-yellow-500', bg: 'bg-yellow-100', icon: Minus };
    }
  };

  const recStyle = getRecommendationStyle(analysis.recommendation);
  const RecIcon = recStyle.icon;

  // Get risk level
  const getRiskLevel = (score: number) => {
    if (score <= 3) return { level: 'Low', color: 'text-green-500', bg: 'bg-green-100' };
    if (score <= 6) return { level: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-100' };
    return { level: 'High', color: 'text-red-500', bg: 'bg-red-100' };
  };

  const riskLevel = getRiskLevel(analysis.riskScore);

  if (isLoading) {
    return (
      <Card className="w-full bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-purple-800 text-lg">
            <Shield className="h-4 w-4" />
            Token Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="animate-pulse space-y-3">
            <div className="h-3 bg-purple-200 rounded w-3/4"></div>
            <div className="h-3 bg-purple-200 rounded w-1/2"></div>
            <div className="h-3 bg-purple-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-purple-800 text-lg">
          <Shield className="h-4 w-4" />
          AI Token Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Summary - Compact */}
        <div className="bg-white rounded-lg p-3 border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-800">📋 Summary</span>
          </div>
          <p className="text-gray-700 text-xs leading-relaxed">{analysis.summary}</p>
        </div>

        {/* Risk Score & Recommendation - Side by side, compact */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-800">⚠️ Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${riskLevel.bg} ${riskLevel.color} border-0 text-xs px-2 py-1`}>
                {analysis.riskScore}/10
              </Badge>
              <span className={`text-xs ${riskLevel.color}`}>
                {riskLevel.level}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-800">🎯 Action</span>
            </div>
            <div className="flex items-center gap-2">
              <RecIcon className={`h-3 w-3 ${recStyle.color}`} />
              <Badge className={`${recStyle.bg} ${recStyle.color} border-0 text-xs px-2 py-1`}>
                {analysis.recommendation}
              </Badge>
            </div>
          </div>
        </div>

        {/* Key Insights - Compact list */}
        <div className="bg-white rounded-lg p-3 border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-800">💡 Key Insights</span>
          </div>
          <div className="space-y-1">
            {analysis.keyInsights.map((insight, index) => (
              <div key={index} className="flex items-start gap-2 text-xs text-gray-700">
                <span className="text-purple-500 mt-0.5">•</span>
                <span className="leading-tight">{insight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Explanation - Compact */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-3 w-3 text-purple-800" />
            <span className="text-sm font-semibold text-purple-800">AI Analysis</span>
          </div>
          <p className="text-gray-700 text-xs leading-relaxed">
            {analysis.aiExplanation}
          </p>
        </div>

        {/* Token Info - Compact grid */}
        {tokenData && (
          <div className="bg-white rounded-lg p-3 border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-800">📊 Token Info</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Price:</span>
                <span className="font-medium">${tokenData.price || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">24h:</span>
                <span className={`font-medium ${tokenData.priceChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {tokenData.priceChange || 'N/A'}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Volume:</span>
                <span className="font-medium">${tokenData.volume || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Market Cap:</span>
                <span className="font-medium">${tokenData.marketCap || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 