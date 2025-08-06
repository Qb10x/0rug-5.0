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
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Shield className="h-5 w-5" />
            Token Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-purple-200 rounded w-3/4"></div>
            <div className="h-4 bg-purple-200 rounded w-1/2"></div>
            <div className="h-4 bg-purple-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Shield className="h-5 w-5" />
          AI Token Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="bg-white rounded-lg p-4 border border-purple-100">
          <h3 className="font-semibold text-gray-800 mb-2">📋 Summary</h3>
          <p className="text-gray-700 text-sm">{analysis.summary}</p>
        </div>

        {/* Risk Score & Recommendation */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <h3 className="font-semibold text-gray-800 mb-2">⚠️ Risk Score</h3>
            <div className="flex items-center gap-2">
              <Badge className={`${riskLevel.bg} ${riskLevel.color} border-0`}>
                {analysis.riskScore}/10
              </Badge>
              <span className={`text-sm ${riskLevel.color}`}>
                {riskLevel.level} Risk
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <h3 className="font-semibold text-gray-800 mb-2">🎯 Recommendation</h3>
            <div className="flex items-center gap-2">
              <RecIcon className={`h-4 w-4 ${recStyle.color}`} />
              <Badge className={`${recStyle.bg} ${recStyle.color} border-0`}>
                {analysis.recommendation}
              </Badge>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-white rounded-lg p-4 border border-purple-100">
          <h3 className="font-semibold text-gray-800 mb-2">💡 Key Insights</h3>
          <ul className="space-y-2">
            {analysis.keyInsights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-purple-500 mt-1">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>

        {/* AI Explanation */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
          <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            AI Analysis
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed">
            {analysis.aiExplanation}
          </p>
        </div>

        {/* Token Info */}
        {tokenData && (
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <h3 className="font-semibold text-gray-800 mb-2">📊 Token Info</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Price:</span>
                <span className="ml-2 font-medium">${tokenData.price || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">24h Change:</span>
                <span className={`ml-2 font-medium ${tokenData.priceChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {tokenData.priceChange || 'N/A'}%
                </span>
              </div>
              <div>
                <span className="text-gray-500">Volume:</span>
                <span className="ml-2 font-medium">${tokenData.volume || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Market Cap:</span>
                <span className="ml-2 font-medium">${tokenData.marketCap || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 