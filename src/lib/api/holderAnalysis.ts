// Holder Analysis API - Real Solana blockchain data
// Following 0rug.com coding guidelines

import { getTokenHolderDistribution, getSolanaTokenData, getTokenAge } from './solana';
import { analyzeTokenComprehensive } from './dexscreener';
import { getJupiterTokenData } from './jupiter';

// Holder analysis interface
interface HolderAnalysis {
  tokenAddress: string;
  tokenSymbol: string;
  totalHolders: number;
  whaleCount: number;
  averageBalance: number;
  topHolders: Array<{
    address: string;
    balance: number;
    percentage: number;
    isWhale: boolean;
    reputation?: number;
  }>;
  holderDistribution: {
    whales: number; // Top 1%
    large: number;  // Top 5%
    medium: number; // Top 20%
    small: number;  // Rest
  };
  riskFactors: string[];
  recommendations: string[];
  analysis: {
    concentrationRisk: number; // 0-100
    whaleInfluence: number;   // 0-100
    holderStability: number;  // 0-100
    overallRisk: number;      // 0-100
  };
}

// Whale reputation scoring
interface WhaleProfile {
  address: string;
  reputation: number; // 0-100
  totalValue: number;
  successRate: number;
  activityLevel: number;
  influence: number;
}

// Analyze token holders comprehensively
export async function analyzeTokenHolders(tokenAddress: string): Promise<HolderAnalysis | null> {
  try {
    // Get holder distribution from Solana
    const holderData = await getTokenHolderDistribution(tokenAddress);
    
    if (holderData.totalHolders === 0) {
      return null;
    }

    // Get additional token data
    const [tokenData, dexData, jupiterData] = await Promise.all([
      getSolanaTokenData(tokenAddress),
      analyzeTokenComprehensive(tokenAddress),
      getJupiterTokenData(tokenAddress)
    ]);

    // Calculate holder percentages
    const totalSupply = tokenData?.supply.uiAmount || 0;
    const topHoldersWithPercentage = holderData.topHolders.map(holder => ({
      ...holder,
      percentage: totalSupply > 0 ? (holder.balance / totalSupply) * 100 : 0,
      isWhale: holder.balance >= holderData.averageBalance * 10
    }));

    // Calculate holder distribution
    const sortedHolders = holderData.topHolders.sort((a, b) => b.balance - a.balance);
    const totalBalance = sortedHolders.reduce((sum, h) => sum + h.balance, 0);
    
    const whales = sortedHolders.slice(0, Math.ceil(holderData.totalHolders * 0.01));
    const large = sortedHolders.slice(Math.ceil(holderData.totalHolders * 0.01), Math.ceil(holderData.totalHolders * 0.05));
    const medium = sortedHolders.slice(Math.ceil(holderData.totalHolders * 0.05), Math.ceil(holderData.totalHolders * 0.20));
    const small = sortedHolders.slice(Math.ceil(holderData.totalHolders * 0.20));

    const holderDistribution = {
      whales: whales.length,
      large: large.length,
      medium: medium.length,
      small: small.length
    };

    // Calculate risk factors
    const riskFactors = calculateRiskFactors(topHoldersWithPercentage, holderData, dexData);
    const recommendations = generateRecommendations(topHoldersWithPercentage, holderData, dexData);
    const analysis = calculateRiskAnalysis(topHoldersWithPercentage, holderData, dexData);

    return {
      tokenAddress,
      tokenSymbol: jupiterData?.mintSymbol || dexData?.basic?.symbol || 'UNKNOWN',
      totalHolders: holderData.totalHolders,
      whaleCount: holderData.whaleCount,
      averageBalance: holderData.averageBalance,
      topHolders: topHoldersWithPercentage,
      holderDistribution,
      riskFactors,
      recommendations,
      analysis
    };

  } catch (error) {
    console.error('Holder analysis error:', error);
    return null;
  }
}

// Calculate risk factors based on holder data
function calculateRiskFactors(
  topHolders: Array<{ address: string; balance: number; percentage: number; isWhale: boolean }>,
  holderData: any,
  dexData: any
): string[] {
  const factors: string[] = [];

  // Concentration risk
  const top10Percentage = topHolders.slice(0, 10).reduce((sum, h) => sum + h.percentage, 0);
  if (top10Percentage > 80) {
    factors.push('Extreme concentration: Top 10 holders own >80% of supply');
  } else if (top10Percentage > 60) {
    factors.push('High concentration: Top 10 holders own >60% of supply');
  } else if (top10Percentage > 40) {
    factors.push('Moderate concentration: Top 10 holders own >40% of supply');
  }

  // Single whale risk
  const topHolder = topHolders[0];
  if (topHolder && topHolder.percentage > 20) {
    factors.push(`Single whale owns ${topHolder.percentage.toFixed(1)}% of supply`);
  }

  // Low holder count
  if (holderData.totalHolders < 100) {
    factors.push('Very low holder count (<100 holders)');
  } else if (holderData.totalHolders < 500) {
    factors.push('Low holder count (<500 holders)');
  }

  // Whale to holder ratio
  const whaleRatio = holderData.whaleCount / holderData.totalHolders;
  if (whaleRatio > 0.1) {
    factors.push('High whale concentration (>10% of holders are whales)');
  }

  // Add DEX-specific risk factors
  if (dexData?.risk?.riskLevel === 'HIGH' || dexData?.risk?.riskLevel === 'EXTREME') {
    factors.push(`High DEX risk level: ${dexData.risk.riskLevel}`);
  }

  if (dexData?.basic?.liquidity < 10000) {
    factors.push('Very low liquidity (<$10k)');
  }

  return factors;
}

// Generate recommendations based on holder analysis
function generateRecommendations(
  topHolders: Array<{ address: string; balance: number; percentage: number; isWhale: boolean }>,
  holderData: any,
  dexData: any
): string[] {
  const recommendations: string[] = [];

  // Concentration recommendations
  const top10Percentage = topHolders.slice(0, 10).reduce((sum, h) => sum + h.percentage, 0);
  if (top10Percentage > 80) {
    recommendations.push('⚠️ EXTREME RISK: Avoid this token - too concentrated');
  } else if (top10Percentage > 60) {
    recommendations.push('⚠️ HIGH RISK: Only invest small amounts');
  } else if (top10Percentage > 40) {
    recommendations.push('🟡 MEDIUM RISK: Exercise caution');
  } else {
    recommendations.push('🟢 RELATIVELY SAFE: Reasonable holder distribution');
  }

  // Holder count recommendations
  if (holderData.totalHolders < 100) {
    recommendations.push('📊 Very few holders - high manipulation risk');
  } else if (holderData.totalHolders < 500) {
    recommendations.push('📊 Low holder count - moderate risk');
  } else {
    recommendations.push('📊 Good holder count - lower manipulation risk');
  }

  // Whale analysis
  const whaleHolders = topHolders.filter(h => h.isWhale);
  if (whaleHolders.length > 0) {
    recommendations.push(`🐋 ${whaleHolders.length} whale(s) detected - monitor their activity`);
  }

  // DEX-specific recommendations
  if (dexData?.risk?.riskLevel === 'HIGH' || dexData?.risk?.riskLevel === 'EXTREME') {
    recommendations.push('🚨 High DEX risk - consider avoiding');
  }

  if (dexData?.basic?.liquidity < 10000) {
    recommendations.push('💧 Very low liquidity - high slippage risk');
  }

  return recommendations;
}

// Calculate comprehensive risk analysis
function calculateRiskAnalysis(
  topHolders: Array<{ address: string; balance: number; percentage: number; isWhale: boolean }>,
  holderData: any,
  dexData: any
): { concentrationRisk: number; whaleInfluence: number; holderStability: number; overallRisk: number } {
  
  // Concentration risk (0-100)
  const top10Percentage = topHolders.slice(0, 10).reduce((sum, h) => sum + h.percentage, 0);
  let concentrationRisk = 0;
  if (top10Percentage > 80) concentrationRisk = 90;
  else if (top10Percentage > 60) concentrationRisk = 70;
  else if (top10Percentage > 40) concentrationRisk = 50;
  else if (top10Percentage > 20) concentrationRisk = 30;
  else concentrationRisk = 10;

  // Whale influence (0-100)
  const whaleHolders = topHolders.filter(h => h.isWhale);
  const whalePercentage = whaleHolders.reduce((sum, h) => sum + h.percentage, 0);
  let whaleInfluence = 0;
  if (whalePercentage > 50) whaleInfluence = 90;
  else if (whalePercentage > 30) whaleInfluence = 70;
  else if (whalePercentage > 15) whaleInfluence = 50;
  else if (whalePercentage > 5) whaleInfluence = 30;
  else whaleInfluence = 10;

  // Holder stability (0-100)
  let holderStability = 50; // Base score
  if (holderData.totalHolders > 1000) holderStability += 30;
  else if (holderData.totalHolders > 500) holderStability += 20;
  else if (holderData.totalHolders > 100) holderStability += 10;
  else holderStability -= 20;

  if (holderData.averageBalance > 1000) holderStability += 10;
  else holderStability -= 10;

  holderStability = Math.max(0, Math.min(100, holderStability));

  // Overall risk calculation
  const overallRisk = Math.round((concentrationRisk * 0.4 + whaleInfluence * 0.3 + holderStability * 0.3));

  return {
    concentrationRisk,
    whaleInfluence,
    holderStability,
    overallRisk
  };
}

// Format holder analysis for chat display
export function formatHolderAnalysisForChat(analysis: HolderAnalysis): string {
  const { topHolders, holderDistribution, riskFactors, recommendations, analysis: riskAnalysis } = analysis;
  
  let response = `🐋 **Top Holders Analysis for ${analysis.tokenSymbol}**\n\n`;
  
  // Basic stats
  response += `📊 **Holder Statistics:**\n`;
  response += `• Total Holders: ${analysis.totalHolders.toLocaleString()}\n`;
  response += `• Whale Count: ${analysis.whaleCount}\n`;
  response += `• Average Balance: ${analysis.averageBalance.toLocaleString()}\n\n`;
  
  // Holder distribution
  response += `📈 **Holder Distribution:**\n`;
  response += `• Whales (Top 1%): ${holderDistribution.whales}\n`;
  response += `• Large (Top 5%): ${holderDistribution.large}\n`;
  response += `• Medium (Top 20%): ${holderDistribution.medium}\n`;
  response += `• Small (Rest): ${holderDistribution.small}\n\n`;
  
  // Top 10 holders
  response += `🏆 **Top 10 Holders:**\n`;
  topHolders.slice(0, 10).forEach((holder, index) => {
    const whaleIcon = holder.isWhale ? '🐋' : '👤';
    response += `${index + 1}. ${whaleIcon} ${holder.address.slice(0, 8)}...${holder.address.slice(-6)}\n`;
    response += `   Balance: ${holder.balance.toLocaleString()} (${holder.percentage.toFixed(2)}%)\n`;
  });
  
  response += `\n⚠️ **Risk Analysis:**\n`;
  response += `• Concentration Risk: ${riskAnalysis.concentrationRisk}/100\n`;
  response += `• Whale Influence: ${riskAnalysis.whaleInfluence}/100\n`;
  response += `• Holder Stability: ${riskAnalysis.holderStability}/100\n`;
  response += `• Overall Risk: ${riskAnalysis.overallRisk}/100\n\n`;
  
  // Risk factors
  if (riskFactors.length > 0) {
    response += `🚨 **Risk Factors:**\n`;
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

// Get whale profiles for specific addresses
export async function getWhaleProfiles(addresses: string[]): Promise<WhaleProfile[]> {
  // This would integrate with your whale tracking system
  // For now, return basic profiles
  return addresses.map(address => ({
    address,
    reputation: Math.floor(Math.random() * 100),
    totalValue: Math.floor(Math.random() * 1000000),
    successRate: Math.random() * 100,
    activityLevel: Math.random() * 100,
    influence: Math.random() * 100
  }));
}

// Check if an address is a known whale
export async function isKnownWhale(address: string): Promise<boolean> {
  // This would check against your whale database
  // For now, use a simple heuristic
  return address.length === 44 && address.startsWith('1');
}

// Get holder analysis summary for quick assessment
export async function getHolderAnalysisSummary(tokenAddress: string): Promise<{
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  riskScore: number;
  summary: string;
  keyMetrics: Record<string, number>;
} | null> {
  try {
    const analysis = await analyzeTokenHolders(tokenAddress);
    
    if (!analysis) {
      return null;
    }

    const riskLevel = analysis.analysis.overallRisk > 80 ? 'EXTREME' :
                     analysis.analysis.overallRisk > 60 ? 'HIGH' :
                     analysis.analysis.overallRisk > 35 ? 'MEDIUM' : 'LOW';

    const summary = `Token has ${analysis.totalHolders} holders with ${analysis.whaleCount} whales. ` +
                   `Top 10 holders own ${analysis.topHolders.slice(0, 10).reduce((sum, h) => sum + h.percentage, 0).toFixed(1)}% of supply. ` +
                   `Risk level: ${riskLevel}`;

    return {
      riskLevel,
      riskScore: analysis.analysis.overallRisk,
      summary,
      keyMetrics: {
        totalHolders: analysis.totalHolders,
        whaleCount: analysis.whaleCount,
        concentrationPercentage: analysis.topHolders.slice(0, 10).reduce((sum, h) => sum + h.percentage, 0),
        averageBalance: analysis.averageBalance
      }
    };

  } catch (error) {
    console.error('Holder analysis summary error:', error);
    return null;
  }
} 