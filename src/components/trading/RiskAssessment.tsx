// Risk Assessment Component - following 0rug.com coding guidelines

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';

// Risk assessment props
interface RiskAssessmentProps {
  inputToken: string;
  outputToken: string;
  amount: number;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  recommendations: string[];
  isLoading?: boolean;
}

// Risk assessment component
export function RiskAssessment({
  inputToken,
  outputToken,
  amount,
  riskScore,
  riskLevel,
  riskFactors,
  recommendations,
  isLoading = false
}: RiskAssessmentProps) {
  // Get risk color based on level
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'high': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  // Get risk icon based on level
  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-gray-400 animate-pulse" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Analyzing risk...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Risk Assessment
          </h3>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getRiskColor(riskLevel)}`}>
          {getRiskIcon(riskLevel)}
          <span>{riskLevel.toUpperCase()} RISK</span>
        </span>
      </div>

      {/* Trade Info */}
      <div className="mb-3 p-3 bg-white dark:bg-gray-700 rounded-lg">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Trading</div>
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {amount} {inputToken} → {outputToken}
        </div>
      </div>

      {/* Risk Score */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-600 dark:text-gray-400">Risk Score</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {riskScore}/100
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              riskLevel === 'low' ? 'bg-green-500' :
              riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${riskScore}%` }}
          />
        </div>
      </div>

      {/* Risk Factors */}
      {riskFactors.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Risk Factors
          </h4>
          <ul className="space-y-1">
            {riskFactors.map((factor, index) => (
              <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start space-x-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Recommendations
          </h4>
          <ul className="space-y-1">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start space-x-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
} 