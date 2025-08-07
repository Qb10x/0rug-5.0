// Rug Pull Detection API - Real Solana blockchain analysis
// Following 0rug.com coding guidelines

import { getTokenHolderDistribution } from './solana';
import { analyzeTokenComprehensive } from './dexscreener';
import { getJupiterTokenData } from './jupiter';

// Rug pull analysis interface
interface RugPullAnalysis {
  tokenAddress: string;
  tokenSymbol: string;
  riskScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  riskFactors: string[];
  devWalletActivity: DevWalletAnalysis;
  lpLockStatus: LPLockAnalysis;
  priceManipulation: PriceAnalysis;
  holderConcentration: HolderAnalysis;
  recommendations: string[];
  confidence: number; // 0-100
}

// Dev wallet analysis
interface DevWalletAnalysis {
  devWallets: Array<{
    address: string;
    balance: number;
    percentage: number;
    recentActivity: string[];
  }>;
  suspiciousActivity: string[];
  devWalletRisk: number; // 0-100
}

// LP lock analysis
interface LPLockAnalysis {
  isLocked: boolean;
  lockDuration: number; // days
  lockPercentage: number; // % of LP locked
  lockProvider: string;
  lockRisk: number; // 0-100
}

// Price manipulation analysis
interface PriceAnalysis {
  priceVolatility: number; // 0-100
  pumpAndDumpSignals: string[];
  manipulationRisk: number; // 0-100
  priceHistory: Array<{
    timestamp: number;
    price: number;
    volume: number;
  }>;
}

// Holder concentration analysis
interface HolderAnalysis {
  top10Percentage: number;
  whaleConcentration: number;
  holderDistribution: string;
  concentrationRisk: number; // 0-100
}

// Analyze token for rug pull risk
export async function analyzeRugPullRisk(tokenAddress: string): Promise<RugPullAnalysis | null> {
  try {
    // Get comprehensive token data
    const [holderData, dexData, jupiterData] = await Promise.all([
      getTokenHolderDistribution(tokenAddress),
      analyzeTokenComprehensive(tokenAddress),
      getJupiterTokenData(tokenAddress)
    ]);

    if (!holderData || holderData.totalHolders === 0) {
      return null;
    }

    // Analyze dev wallet activity
    const devWalletActivity = analyzeDevWalletActivity(holderData, dexData);
    
    // Analyze LP lock status
    const lpLockStatus = analyzeLPLockStatus(dexData);
    
    // Analyze price manipulation
    const priceManipulation = analyzePriceManipulation(dexData);
    
    // Analyze holder concentration
    const holderConcentration = analyzeHolderConcentration(holderData);
    
    // Calculate overall risk score
    const riskScore = calculateOverallRiskScore(
      devWalletActivity.devWalletRisk,
      lpLockStatus.lockRisk,
      priceManipulation.manipulationRisk,
      holderConcentration.concentrationRisk
    );

    // Generate risk factors and recommendations
    const riskFactors = generateRiskFactors(
      devWalletActivity,
      lpLockStatus,
      priceManipulation,
      holderConcentration
    );

    const recommendations = generateRecommendations(riskScore, riskFactors);

    return {
      tokenAddress,
      tokenSymbol: jupiterData?.mintSymbol || dexData?.basic?.symbol || 'UNKNOWN',
      riskScore,
      riskLevel: getRiskLevel(riskScore),
      riskFactors,
      devWalletActivity,
      lpLockStatus,
      priceManipulation,
      holderConcentration,
      recommendations,
      confidence: calculateConfidence(riskFactors.length, riskScore)
    };

  } catch (error) {
    console.error('Rug pull analysis error:', error);
    return null;
  }
}

// Analyze dev wallet activity
function analyzeDevWalletActivity(holderData: any, dexData: any): DevWalletAnalysis {
  const devWallets: Array<{ address: string; balance: number; percentage: number; recentActivity: string[] }> = [];
  const suspiciousActivity: string[] = [];

  // Identify potential dev wallets (top holders with large percentages)
  const topHolders = holderData.topHolders.slice(0, 10);
  const totalSupply = holderData.totalHolders > 0 ? holderData.topHolders.reduce((sum: number, h: any) => sum + h.balance, 0) : 0;

  topHolders.forEach((holder: any) => {
    const percentage = totalSupply > 0 ? (holder.balance / totalSupply) * 100 : 0;
    
    if (percentage > 5) { // Consider wallets with >5% as potential dev wallets
      devWallets.push({
        address: holder.address,
        balance: holder.balance,
        percentage,
        recentActivity: [] // Would be populated with actual transaction history
      });

      // Flag suspicious activity
      if (percentage > 20) {
        suspiciousActivity.push(`Single wallet owns ${percentage.toFixed(1)}% of supply`);
      }
    }
  });

  // Calculate dev wallet risk
  let devWalletRisk = 0;
  const totalDevPercentage = devWallets.reduce((sum, w) => sum + w.percentage, 0);
  
  if (totalDevPercentage > 80) devWalletRisk = 90;
  else if (totalDevPercentage > 60) devWalletRisk = 70;
  else if (totalDevPercentage > 40) devWalletRisk = 50;
  else if (totalDevPercentage > 20) devWalletRisk = 30;
  else devWalletRisk = 10;

  return {
    devWallets,
    suspiciousActivity,
    devWalletRisk
  };
}

// Analyze LP lock status
function analyzeLPLockStatus(dexData: any): LPLockAnalysis {
  const lockInfo = dexData?.liquidity?.lockInfo || {};
  
  return {
    isLocked: lockInfo.isLocked || false,
    lockDuration: lockInfo.lockDuration || 0,
    lockPercentage: lockInfo.lockPercentage || 0,
    lockProvider: lockInfo.lockProvider || 'Unknown',
    lockRisk: calculateLockRisk(lockInfo)
  };
}

// Calculate LP lock risk
function calculateLockRisk(lockInfo: any): number {
  if (!lockInfo.isLocked) return 90; // High risk if not locked
  
  let risk = 0;
  
  // Duration risk
  if (lockInfo.lockDuration < 30) risk += 40;
  else if (lockInfo.lockDuration < 90) risk += 20;
  else risk += 10;
  
  // Percentage risk
  if (lockInfo.lockPercentage < 50) risk += 30;
  else if (lockInfo.lockPercentage < 80) risk += 15;
  else risk += 5;
  
  return Math.min(100, risk);
}

// Analyze price manipulation
function analyzePriceManipulation(dexData: any): PriceAnalysis {
  const priceData = dexData?.price || {};
  const volumeData = dexData?.volume || {};
  
  // Calculate price volatility
  const priceChange24h = Math.abs(priceData.priceChange24h || 0);
  let priceVolatility = 0;
  
  if (priceChange24h > 100) priceVolatility = 90;
  else if (priceChange24h > 50) priceVolatility = 70;
  else if (priceChange24h > 20) priceVolatility = 50;
  else if (priceChange24h > 10) priceVolatility = 30;
  else priceVolatility = 10;

  // Detect pump and dump signals
  const pumpAndDumpSignals: string[] = [];
  
  if (priceChange24h > 100) {
    pumpAndDumpSignals.push('Extreme price volatility (>100% in 24h)');
  }
  
  if (volumeData.h24 && volumeData.h24 < 1000) {
    pumpAndDumpSignals.push('Very low trading volume');
  }

  const manipulationRisk = Math.min(100, priceVolatility + (pumpAndDumpSignals.length * 10));

  return {
    priceVolatility,
    pumpAndDumpSignals,
    manipulationRisk,
    priceHistory: [] // Would be populated with actual price history
  };
}

// Analyze holder concentration
function analyzeHolderConcentration(holderData: any): HolderAnalysis {
  const top10Holders = holderData.topHolders.slice(0, 10);
  const totalSupply = holderData.topHolders.reduce((sum: number, h: any) => sum + h.balance, 0);
  
  const top10Percentage = totalSupply > 0 ? 
    top10Holders.reduce((sum: number, h: any) => sum + h.balance, 0) / totalSupply * 100 : 0;
  
  const whaleConcentration = holderData.whaleCount / holderData.totalHolders;
  
  let concentrationRisk = 0;
  if (top10Percentage > 80) concentrationRisk = 90;
  else if (top10Percentage > 60) concentrationRisk = 70;
  else if (top10Percentage > 40) concentrationRisk = 50;
  else if (top10Percentage > 20) concentrationRisk = 30;
  else concentrationRisk = 10;

  return {
    top10Percentage,
    whaleConcentration,
    holderDistribution: getHolderDistributionDescription(holderData),
    concentrationRisk
  };
}

// Get holder distribution description
function getHolderDistributionDescription(holderData: any): string {
  if (holderData.totalHolders < 100) return 'Very concentrated';
  if (holderData.totalHolders < 500) return 'Concentrated';
  if (holderData.totalHolders < 1000) return 'Moderately distributed';
  return 'Well distributed';
}

// Calculate overall risk score
function calculateOverallRiskScore(
  devWalletRisk: number,
  lockRisk: number,
  manipulationRisk: number,
  concentrationRisk: number
): number {
  // Weighted average of all risk factors
  const weights = {
    devWallet: 0.3,
    lock: 0.25,
    manipulation: 0.25,
    concentration: 0.2
  };

  return Math.round(
    devWalletRisk * weights.devWallet +
    lockRisk * weights.lock +
    manipulationRisk * weights.manipulation +
    concentrationRisk * weights.concentration
  );
}

// Get risk level from score
function getRiskLevel(riskScore: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' {
  if (riskScore >= 80) return 'EXTREME';
  if (riskScore >= 60) return 'HIGH';
  if (riskScore >= 35) return 'MEDIUM';
  return 'LOW';
}

// Generate risk factors
function generateRiskFactors(
  devWalletActivity: DevWalletAnalysis,
  lpLockStatus: LPLockAnalysis,
  priceManipulation: PriceAnalysis,
  holderConcentration: HolderAnalysis
): string[] {
  const factors: string[] = [];

  // Dev wallet factors
  if (devWalletActivity.devWalletRisk > 70) {
    factors.push('High dev wallet concentration detected');
  }
  devWalletActivity.suspiciousActivity.forEach(activity => {
    factors.push(activity);
  });

  // LP lock factors
  if (!lpLockStatus.isLocked) {
    factors.push('LP is not locked - high rug risk');
  } else if (lpLockStatus.lockDuration < 30) {
    factors.push(`LP lock expires soon (${lpLockStatus.lockDuration} days)`);
  }

  if (lpLockStatus.lockPercentage < 80) {
    factors.push(`Low LP lock percentage (${lpLockStatus.lockPercentage}%)`);
  }

  // Price manipulation factors
  if (priceManipulation.priceVolatility > 70) {
    factors.push('Extreme price volatility detected');
  }
  priceManipulation.pumpAndDumpSignals.forEach(signal => {
    factors.push(signal);
  });

  // Holder concentration factors
  if (holderConcentration.top10Percentage > 80) {
    factors.push('Extreme holder concentration (>80%)');
  } else if (holderConcentration.top10Percentage > 60) {
    factors.push('High holder concentration (>60%)');
  }

  if (holderConcentration.whaleConcentration > 0.1) {
    factors.push('High whale concentration');
  }

  return factors;
}

// Generate recommendations
function generateRecommendations(riskScore: number, riskFactors: string[]): string[] {
  const recommendations: string[] = [];

  if (riskScore >= 80) {
    recommendations.push('🚨 EXTREME RISK: Avoid this token completely');
    recommendations.push('⚠️ High probability of rug pull');
  } else if (riskScore >= 60) {
    recommendations.push('⚠️ HIGH RISK: Only invest small amounts if at all');
    recommendations.push('🔍 Monitor closely for suspicious activity');
  } else if (riskScore >= 35) {
    recommendations.push('🟡 MEDIUM RISK: Exercise caution');
    recommendations.push('📊 Consider waiting for better entry');
  } else {
    recommendations.push('🟢 RELATIVELY SAFE: Standard due diligence recommended');
  }

  if (riskFactors.includes('LP is not locked')) {
    recommendations.push('🔒 Wait for LP lock before investing');
  }

  if (riskFactors.includes('Extreme price volatility detected')) {
    recommendations.push('📈 Avoid during high volatility periods');
  }

  return recommendations;
}

// Calculate confidence level
function calculateConfidence(factorCount: number, riskScore: number): number {
  // More factors = higher confidence, but very high risk scores reduce confidence
  let confidence = Math.min(100, factorCount * 10 + 50);
  
  if (riskScore > 80) {
    confidence = Math.max(confidence - 20, 60); // High risk = lower confidence
  }
  
  return confidence;
}

// Format rug analysis for chat display
export function formatRugAnalysisForChat(analysis: RugPullAnalysis): string {
  const { riskScore, riskLevel, riskFactors, recommendations, confidence } = analysis;
  
  let response = `🚨 **Rug Pull Analysis for ${analysis.tokenSymbol}**\n\n`;
  
  // Risk summary
  response += `📊 **Risk Assessment:**\n`;
  response += `• Risk Score: ${riskScore}/100\n`;
  response += `• Risk Level: ${riskLevel}\n`;
  response += `• Confidence: ${confidence}%\n\n`;
  
  // Dev wallet analysis
  if (analysis.devWalletActivity.devWallets.length > 0) {
    response += `👤 **Dev Wallet Analysis:**\n`;
    analysis.devWalletActivity.devWallets.slice(0, 3).forEach((wallet, index) => {
      response += `${index + 1}. ${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}\n`;
      response += `   Balance: ${wallet.balance.toLocaleString()} (${wallet.percentage.toFixed(1)}%)\n`;
    });
    response += `\n`;
  }
  
  // LP lock analysis
  response += `🔒 **LP Lock Status:**\n`;
  response += `• Locked: ${analysis.lpLockStatus.isLocked ? '✅ Yes' : '❌ No'}\n`;
  if (analysis.lpLockStatus.isLocked) {
    response += `• Duration: ${analysis.lpLockStatus.lockDuration} days\n`;
    response += `• Percentage: ${analysis.lpLockStatus.lockPercentage}%\n`;
    response += `• Provider: ${analysis.lpLockStatus.lockProvider}\n`;
  }
  response += `\n`;
  
  // Price analysis
  response += `📈 **Price Analysis:**\n`;
  response += `• Volatility: ${analysis.priceManipulation.priceVolatility}/100\n`;
  response += `• Manipulation Risk: ${analysis.priceManipulation.manipulationRisk}/100\n`;
  if (analysis.priceManipulation.pumpAndDumpSignals.length > 0) {
    response += `• Warning Signs:\n`;
    analysis.priceManipulation.pumpAndDumpSignals.forEach(signal => {
      response += `  - ${signal}\n`;
    });
  }
  response += `\n`;
  
  // Holder analysis
  response += `👥 **Holder Analysis:**\n`;
  response += `• Top 10 Holders: ${analysis.holderConcentration.top10Percentage.toFixed(1)}%\n`;
  response += `• Distribution: ${analysis.holderConcentration.holderDistribution}\n`;
  response += `• Concentration Risk: ${analysis.holderConcentration.concentrationRisk}/100\n\n`;
  
  // Risk factors
  if (riskFactors.length > 0) {
    response += `⚠️ **Risk Factors:**\n`;
    riskFactors.forEach(factor => {
      response += `• ${factor}\n`;
    });
    response += `\n`;
  }
  
  // Recommendations
  response += `💡 **Recommendations:**\n`;
  recommendations.forEach(rec => {
    response += `• ${rec}\n`;
  });
  
  return response;
}

// Get rug analysis summary for quick assessment
export async function getRugAnalysisSummary(tokenAddress: string): Promise<{
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  riskScore: number;
  summary: string;
  keyFactors: string[];
} | null> {
  try {
    const analysis = await analyzeRugPullRisk(tokenAddress);
    
    if (!analysis) {
      return null;
    }

    const summary = `Token has ${analysis.riskLevel.toLowerCase()} rug risk (${analysis.riskScore}/100). ` +
                   `Key factors: ${analysis.riskFactors.slice(0, 3).join(', ')}. ` +
                   `Confidence: ${analysis.confidence}%`;

    return {
      riskLevel: analysis.riskLevel,
      riskScore: analysis.riskScore,
      summary,
      keyFactors: analysis.riskFactors.slice(0, 3)
    };

  } catch (error) {
    console.error('Rug analysis summary error:', error);
    return null;
  }
} 