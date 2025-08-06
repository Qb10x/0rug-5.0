// LP Lock Analysis Card Component
// Displays comprehensive LP lock security analysis

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Unlock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface LPLockData {
  isLocked: boolean;
  lockPercentage: number;
  lockDuration: string;
  lockProvider: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  securityScore: number;
  details: string[];
  recommendations: string[];
}

interface LPLockAnalysisCardProps {
  tokenData: any;
  lpData: LPLockData;
  isLoading?: boolean;
}

export function LPLockAnalysisCard({ tokenData, lpData, isLoading = false }: LPLockAnalysisCardProps) {
  // Get risk level styling
  const getRiskStyle = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW':
        return { color: 'text-green-500', bg: 'bg-green-100', icon: CheckCircle };
      case 'MEDIUM':
        return { color: 'text-yellow-500', bg: 'bg-yellow-100', icon: AlertTriangle };
      case 'HIGH':
        return { color: 'text-red-500', bg: 'bg-red-100', icon: XCircle };
      default:
        return { color: 'text-yellow-500', bg: 'bg-yellow-100', icon: AlertTriangle };
    }
  };

  const riskStyle = getRiskStyle(lpData.riskLevel);
  const RiskIcon = riskStyle.icon;

  // Get lock status styling
  const getLockStyle = (isLocked: boolean) => {
    if (isLocked) {
      return { color: 'text-green-500', bg: 'bg-green-100', icon: Lock, text: 'LOCKED' };
    } else {
      return { color: 'text-red-500', bg: 'bg-red-100', icon: Unlock, text: 'UNLOCKED' };
    }
  };

  const lockStyle = getLockStyle(lpData.isLocked);
  const LockIcon = lockStyle.icon;

  if (isLoading) {
    return (
      <Card className="w-full bg-gradient-to-br from-blue-50 to-green-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800 text-lg">
            <Shield className="h-4 w-4" />
            LP Lock Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-3 bg-blue-200 rounded w-3/4"></div>
            <div className="h-3 bg-blue-200 rounded w-1/2"></div>
            <div className="h-3 bg-blue-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gradient-to-br from-blue-50 to-green-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800 text-lg">
          <Shield className="h-4 w-4" />
          LP Lock Security Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Lock Status - Compact */}
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-800">🔒 Lock Status</span>
          </div>
          <div className="flex items-center gap-2">
            <LockIcon className={`h-4 w-4 ${lockStyle.color}`} />
            <Badge className={`${lockStyle.bg} ${lockStyle.color} border-0 text-xs px-2 py-1`}>
              {lockStyle.text}
            </Badge>
            <span className="text-xs text-gray-600">
              {lpData.lockPercentage}% locked for {lpData.lockDuration}
            </span>
          </div>
        </div>

        {/* Security Score & Risk Level - Side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-800">🛡️ Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${riskStyle.bg} ${riskStyle.color} border-0 text-xs px-2 py-1`}>
                {lpData.securityScore}/100
              </Badge>
              <span className={`text-xs ${riskStyle.color}`}>
                {lpData.riskLevel} Risk
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-800">⚠️ Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <RiskIcon className={`h-3 w-3 ${riskStyle.color}`} />
              <Badge className={`${riskStyle.bg} ${riskStyle.color} border-0 text-xs px-2 py-1`}>
                {lpData.riskLevel}
              </Badge>
            </div>
          </div>
        </div>

        {/* Lock Details - Compact */}
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-800">📋 Lock Details</span>
          </div>
          <div className="space-y-1">
            {lpData.details.map((detail, index) => (
              <div key={index} className="flex items-start gap-2 text-xs text-gray-700">
                <span className="text-blue-500 mt-0.5">•</span>
                <span className="leading-tight">{detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations - Compact */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-blue-800">💡 Recommendations</span>
          </div>
          <div className="space-y-1">
            {lpData.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-2 text-xs text-gray-700">
                <span className="text-blue-500 mt-0.5">•</span>
                <span className="leading-tight">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Token Info - Compact */}
        {tokenData && (
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-800">📊 Token Info</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Liquidity:</span>
                <span className="font-medium">${tokenData.liquidity || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Volume:</span>
                <span className="font-medium">${tokenData.volume || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Provider:</span>
                <span className="font-medium">{lpData.lockProvider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration:</span>
                <span className="font-medium">{lpData.lockDuration}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 