'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  Unlock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { getRiskLevelColor, getPriceChangeColor } from '@/lib/theme/colorUtils';

interface LPLockData {
  isLocked: boolean;
  lockPercentage: number;
  lockDuration: number;
  ownerSpread: number;
  liquidityDepth: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastUpdate: Date;
}

interface LPLockAnalysisCardProps {
  lpData: LPLockData;
  onViewDetails: () => void;
}

// Get LP lock status info
const getLockStatusInfo = (isLocked: boolean, lockPercentage: number) => {
  if (isLocked && lockPercentage >= 80) {
    return { 
      color: 'text-green-500', 
      bg: 'bg-green-100', 
      icon: Lock, 
      text: 'LOCKED' 
    };
  } else if (isLocked && lockPercentage >= 50) {
    return { 
      color: 'text-yellow-500', 
      bg: 'bg-yellow-100', 
      icon: AlertTriangle, 
      text: 'PARTIALLY LOCKED' 
    };
  } else {
    return { 
      color: 'text-red-500', 
      bg: 'bg-red-100', 
      icon: Unlock, 
      text: 'UNLOCKED' 
    };
  }
};

// LP Lock Analysis Card Component
export default function LPLockAnalysisCard({ lpData, onViewDetails }: LPLockAnalysisCardProps) {
  const lockStatus = getLockStatusInfo(lpData.isLocked, lpData.lockPercentage);
  const riskColors = getRiskLevelColor(lpData.riskLevel);
  const LockIcon = lockStatus.icon;

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={onViewDetails}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800 text-lg">
          <Lock className="w-5 h-5" />
          LP Lock Analysis
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Lock Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${lockStatus.bg}`}>
              <LockIcon className={`w-5 h-5 ${lockStatus.color}`} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{lockStatus.text}</p>
              <p className="text-sm text-gray-500">{lpData.lockPercentage}% Locked</p>
            </div>
          </div>
          <Badge className={`${riskColors.bg} ${riskColors.text}`}>
            {lpData.riskLevel.toUpperCase()} RISK
          </Badge>
        </div>

        {/* Lock Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Lock Duration</p>
            <p className="font-semibold">{lpData.lockDuration} days</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Owner Spread</p>
            <p className="font-semibold">{lpData.ownerSpread}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Liquidity Depth</p>
            <p className="font-semibold">${lpData.liquidityDepth.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Last Update</p>
            <p className="font-semibold">{lpData.lastUpdate.toLocaleDateString()}</p>
          </div>
        </div>

        {/* Lock Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Lock Percentage</span>
            <span className={`font-medium ${riskColors.text}`}>
              {lpData.lockPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full ${riskColors.progress}`}
              style={{ width: `${lpData.lockPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Risk Indicators */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-gray-700">Risk Indicators</h4>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Owner Concentration</span>
              <span className={lpData.ownerSpread > 20 ? 'text-red-500' : 'text-green-500'}>
                {lpData.ownerSpread > 20 ? 'High' : 'Low'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Liquidity Adequacy</span>
              <span className={lpData.liquidityDepth < 10000 ? 'text-red-500' : 'text-green-500'}>
                {lpData.liquidityDepth < 10000 ? 'Low' : 'Good'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Named export for backward compatibility
export { LPLockAnalysisCard }; 