'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, TrendingUp, TrendingDown } from 'lucide-react';
import { getRiskLevelColor } from '@/lib/theme/colorUtils';

interface RiskAssessmentProps {
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  riskFactors: string[];
  recommendations: string[];
}

// Risk assessment component
export default function RiskAssessment({ 
  riskLevel, 
  riskScore, 
  riskFactors, 
  recommendations 
}: RiskAssessmentProps) {
  const riskColors = getRiskLevelColor(riskLevel);

  // Get risk level display info
  const getRiskLevelInfo = (level: string) => {
    switch (level) {
      case 'low': return { 
        color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
        icon: Shield,
        text: 'Low Risk'
      };
      case 'medium': return { 
        color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
        icon: AlertTriangle,
        text: 'Medium Risk'
      };
      case 'high': return { 
        color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
        icon: AlertTriangle,
        text: 'High Risk'
      };
      default: return { 
        color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20',
        icon: AlertTriangle,
        text: 'Unknown Risk'
      };
    }
  };

  const riskInfo = getRiskLevelInfo(riskLevel);
  const RiskIcon = riskInfo.icon;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="w-5 h-5" />
          Risk Assessment
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Risk Level Badge */}
        <div className="flex items-center justify-between">
          <Badge className={`${riskInfo.color} border-0`}>
            <RiskIcon className="w-3 h-3 mr-1" />
            {riskInfo.text}
          </Badge>
          <span className="text-sm text-gray-500">Score: {riskScore}/100</span>
        </div>

        {/* Risk Score Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Risk Level</span>
            <span className={`font-medium ${riskColors.text}`}>
              {riskScore}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full ${riskColors.progress}`}
              style={{ width: `${riskScore}%` }}
            ></div>
          </div>
        </div>

        {/* Risk Factors */}
        {riskFactors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
              Risk Factors
            </h4>
            <ul className="space-y-1">
              {riskFactors.map((factor, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
              Recommendations
            </h4>
            <ul className="space-y-1">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 