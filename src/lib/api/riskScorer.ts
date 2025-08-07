// Comprehensive Risk Scoring System for Tokens
// Following 0rug.com coding guidelines

export interface RiskFactor {
  name: string;
  weight: number;
  score: number;
  description: string;
  category: 'security' | 'tokenomics' | 'market' | 'community' | 'technical';
}

export interface RiskScore {
  overallScore: number;
  riskLevel: 'safe' | 'warning' | 'danger' | 'critical';
  factors: RiskFactor[];
  summary: string;
  recommendations: string[];
  color: string;
}

export interface TokenRiskData {
  lpLocked: boolean;
  lpLockDuration?: number;
  lpLockPercentage?: number;
  ownerCanMint: boolean;
  ownerCanPause: boolean;
  sellTax: number;
  buyTax: number;
  topHolderPercentage: number;
  liquidityUsd: number;
  volume24h: number;
  marketCap: number;
  priceChange24h: number;
  holderCount: number;
  contractVerified: boolean;
  honeypotRisk: boolean;
  rugPullRisk: boolean;
}

// Risk scoring weights
const RISK_WEIGHTS = {
  // Security factors (highest weight)
  lpLockStatus: 25,
  contractOwnership: 20,
  honeypotRisk: 15,
  contractVerification: 10,
  
  // Tokenomics factors
  holderConcentration: 15,
  taxStructure: 10,
  
  // Market factors
  liquidityDepth: 10,
  volumeHealth: 8,
  priceStability: 7,
  
  // Community factors
  holderCount: 5,
  
  // Technical factors
  priceAction: 5
};

// Calculate risk score based on token data
export function calculateRiskScore(tokenData: TokenRiskData): RiskScore {
  const factors: RiskFactor[] = [];
  
  // 1. LP Lock Status (Critical Security Factor)
  const lpLockScore = calculateLPLockScore(tokenData);
  factors.push({
    name: 'Liquidity Pool Lock',
    weight: RISK_WEIGHTS.lpLockStatus,
    score: lpLockScore,
    description: tokenData.lpLocked 
      ? `LP locked for ${tokenData.lpLockDuration || 0} days (${tokenData.lpLockPercentage || 0}% locked)`
      : 'LP is NOT locked - HIGH RISK',
    category: 'security'
  });

  // 2. Contract Ownership (Critical Security Factor)
  const ownershipScore = calculateOwnershipScore(tokenData);
  factors.push({
    name: 'Contract Ownership',
    weight: RISK_WEIGHTS.contractOwnership,
    score: ownershipScore,
    description: tokenData.ownerCanMint || tokenData.ownerCanPause
      ? 'Owner can manipulate contract - HIGH RISK'
      : 'Contract ownership renounced - SAFE',
    category: 'security'
  });

  // 3. Honeypot Risk (Critical Security Factor)
  const honeypotScore = calculateHoneypotScore(tokenData);
  factors.push({
    name: 'Honeypot Detection',
    weight: RISK_WEIGHTS.honeypotRisk,
    score: honeypotScore,
    description: tokenData.honeypotRisk
      ? 'Token may be a honeypot - CANNOT SELL'
      : 'Token appears sellable - SAFE',
    category: 'security'
  });

  // 4. Contract Verification
  const verificationScore = tokenData.contractVerified ? 100 : 0;
  factors.push({
    name: 'Contract Verification',
    weight: RISK_WEIGHTS.contractVerification,
    score: verificationScore,
    description: tokenData.contractVerified
      ? 'Contract is verified on blockchain explorer'
      : 'Contract is NOT verified - proceed with caution',
    category: 'security'
  });

  // 5. Holder Concentration (Tokenomics)
  const concentrationScore = calculateConcentrationScore(tokenData);
  factors.push({
    name: 'Holder Concentration',
    weight: RISK_WEIGHTS.holderConcentration,
    score: concentrationScore,
    description: `Top holder owns ${tokenData.topHolderPercentage.toFixed(1)}% of supply`,
    category: 'tokenomics'
  });

  // 6. Tax Structure (Tokenomics)
  const taxScore = calculateTaxScore(tokenData);
  factors.push({
    name: 'Tax Structure',
    weight: RISK_WEIGHTS.taxStructure,
    score: taxScore,
    description: `Buy tax: ${tokenData.buyTax}%, Sell tax: ${tokenData.sellTax}%`,
    category: 'tokenomics'
  });

  // 7. Liquidity Depth (Market)
  const liquidityScore = calculateLiquidityScore(tokenData);
  factors.push({
    name: 'Liquidity Depth',
    weight: RISK_WEIGHTS.liquidityDepth,
    score: liquidityScore,
    description: `Liquidity: $${formatNumber(tokenData.liquidityUsd)}`,
    category: 'market'
  });

  // 8. Volume Health (Market)
  const volumeScore = calculateVolumeScore(tokenData);
  factors.push({
    name: 'Volume Health',
    weight: RISK_WEIGHTS.volumeHealth,
    score: volumeScore,
    description: `24h Volume: $${formatNumber(tokenData.volume24h)}`,
    category: 'market'
  });

  // 9. Price Stability (Market)
  const priceStabilityScore = calculatePriceStabilityScore(tokenData);
  factors.push({
    name: 'Price Stability',
    weight: RISK_WEIGHTS.priceStability,
    score: priceStabilityScore,
    description: `24h Change: ${tokenData.priceChange24h > 0 ? '+' : ''}${tokenData.priceChange24h.toFixed(2)}%`,
    category: 'market'
  });

  // 10. Holder Count (Community)
  const holderCountScore = calculateHolderCountScore(tokenData);
  factors.push({
    name: 'Community Size',
    weight: RISK_WEIGHTS.holderCount,
    score: holderCountScore,
    description: `${tokenData.holderCount} holders`,
    category: 'community'
  });

  // Calculate weighted average score
  const totalWeight = Object.values(RISK_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  const weightedScore = factors.reduce((sum, factor) => sum + (factor.score * factor.weight), 0);
  const overallScore = Math.round(weightedScore / totalWeight);

  // Determine risk level
  const riskLevel = getRiskLevel(overallScore);
  const color = getRiskColor(riskLevel);

  // Generate summary and recommendations
  const summary = generateRiskSummary(overallScore, riskLevel, factors);
  const recommendations = generateRecommendations(factors, riskLevel);

  return {
    overallScore,
    riskLevel,
    factors,
    summary,
    recommendations,
    color
  };
}

// Helper functions for individual risk calculations
function calculateLPLockScore(data: TokenRiskData): number {
  if (!data.lpLocked) return 0;
  if (data.lpLockDuration && data.lpLockDuration >= 365) return 100;
  if (data.lpLockDuration && data.lpLockDuration >= 180) return 90;
  if (data.lpLockDuration && data.lpLockDuration >= 90) return 80;
  if (data.lpLockDuration && data.lpLockDuration >= 30) return 70;
  return 50; // Locked but short duration
}

function calculateOwnershipScore(data: TokenRiskData): number {
  if (data.ownerCanMint || data.ownerCanPause) return 0;
  return 100; // Ownership renounced
}

function calculateHoneypotScore(data: TokenRiskData): number {
  return data.honeypotRisk ? 0 : 100;
}

function calculateConcentrationScore(data: TokenRiskData): number {
  if (data.topHolderPercentage > 50) return 0;
  if (data.topHolderPercentage > 30) return 20;
  if (data.topHolderPercentage > 20) return 40;
  if (data.topHolderPercentage > 10) return 70;
  return 100; // Good distribution
}

function calculateTaxScore(data: TokenRiskData): number {
  const totalTax = data.buyTax + data.sellTax;
  if (totalTax > 50) return 0;
  if (totalTax > 30) return 20;
  if (totalTax > 20) return 40;
  if (totalTax > 10) return 70;
  return 100; // Low taxes
}

function calculateLiquidityScore(data: TokenRiskData): number {
  if (data.liquidityUsd < 10000) return 0;
  if (data.liquidityUsd < 50000) return 30;
  if (data.liquidityUsd < 100000) return 60;
  if (data.liquidityUsd < 500000) return 80;
  return 100; // High liquidity
}

function calculateVolumeScore(data: TokenRiskData): number {
  if (data.volume24h < 1000) return 0;
  if (data.volume24h < 10000) return 30;
  if (data.volume24h < 50000) return 60;
  if (data.volume24h < 100000) return 80;
  return 100; // High volume
}

function calculatePriceStabilityScore(data: TokenRiskData): number {
  const absChange = Math.abs(data.priceChange24h);
  if (absChange > 50) return 0;
  if (absChange > 30) return 30;
  if (absChange > 20) return 50;
  if (absChange > 10) return 70;
  return 100; // Stable price
}

function calculateHolderCountScore(data: TokenRiskData): number {
  if (data.holderCount < 100) return 0;
  if (data.holderCount < 500) return 30;
  if (data.holderCount < 1000) return 60;
  if (data.holderCount < 5000) return 80;
  return 100; // Large community
}

function getRiskLevel(score: number): 'safe' | 'warning' | 'danger' | 'critical' {
  if (score >= 80) return 'safe';
  if (score >= 60) return 'warning';
  if (score >= 40) return 'danger';
  return 'critical';
}

function getRiskColor(level: string): string {
  switch (level) {
    case 'safe': return '#10B981'; // Green
    case 'warning': return '#F59E0B'; // Yellow
    case 'danger': return '#EF4444'; // Red
    case 'critical': return '#7C2D12'; // Dark red
    default: return '#6B7280'; // Gray
  }
}

function generateRiskSummary(score: number, level: string, factors: RiskFactor[]): string {
  const criticalIssues = factors.filter(f => f.score < 30 && f.weight >= 15);
  const majorIssues = factors.filter(f => f.score < 50 && f.weight >= 10);
  
  if (level === 'safe') {
    return `✅ **SAFE TOKEN** (${score}/100)\n\nThis token appears to have good security practices and healthy fundamentals. Always DYOR!`;
  } else if (level === 'warning') {
    return `⚠️ **MODERATE RISK** (${score}/100)\n\nThis token has some concerning factors but may still be worth investigating. Proceed with caution.`;
  } else if (level === 'danger') {
    return `🚨 **HIGH RISK** (${score}/100)\n\nThis token has multiple red flags. Strongly consider avoiding this investment.`;
  } else {
    return `💀 **CRITICAL RISK** (${score}/100)\n\nThis token has severe security issues. AVOID AT ALL COSTS!`;
  }
}

function generateRecommendations(factors: RiskFactor[], level: string): string[] {
  const recommendations: string[] = [];
  
  // Add level-specific recommendations
  if (level === 'critical') {
    recommendations.push('🚨 AVOID THIS TOKEN - Multiple critical security issues detected');
    recommendations.push('💀 High risk of losing your investment');
    recommendations.push('⚠️ Do not invest under any circumstances');
  } else if (level === 'danger') {
    recommendations.push('⚠️ Proceed with extreme caution');
    recommendations.push('🔍 Conduct thorough research before investing');
    recommendations.push('💰 Only invest what you can afford to lose');
  } else if (level === 'warning') {
    recommendations.push('🔍 Research the specific concerns mentioned');
    recommendations.push('💰 Consider starting with a small investment');
    recommendations.push('📊 Monitor the token closely');
  } else {
    recommendations.push('✅ Token appears relatively safe');
    recommendations.push('🔍 Still conduct your own research');
    recommendations.push('💰 Invest responsibly');
  }
  
  // Add factor-specific recommendations
  const lowScoreFactors = factors.filter(f => f.score < 50);
  lowScoreFactors.forEach(factor => {
    if (factor.name === 'Liquidity Pool Lock') {
      recommendations.push('🔒 LP is not locked - high rug pull risk');
    } else if (factor.name === 'Contract Ownership') {
      recommendations.push('👤 Owner can manipulate contract - avoid');
    } else if (factor.name === 'Honeypot Detection') {
      recommendations.push('🍯 Token may be a honeypot - cannot sell');
    } else if (factor.name === 'Holder Concentration') {
      recommendations.push('🐋 Top holder concentration too high');
    }
  });
  
  return recommendations;
}

function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toFixed(0);
}

// Function to get risk score from token address
export async function getTokenRiskScore(tokenAddress: string): Promise<RiskScore | null> {
  try {
    // This would integrate with your existing APIs to get token data
    // For now, returning a mock implementation
    const mockData: TokenRiskData = {
      lpLocked: true,
      lpLockDuration: 180,
      lpLockPercentage: 85,
      ownerCanMint: false,
      ownerCanPause: false,
      sellTax: 5,
      buyTax: 3,
      topHolderPercentage: 8,
      liquidityUsd: 150000,
      volume24h: 75000,
      marketCap: 2500000,
      priceChange24h: 12.5,
      holderCount: 2500,
      contractVerified: true,
      honeypotRisk: false,
      rugPullRisk: false
    };
    
    return calculateRiskScore(mockData);
  } catch (error) {
    console.error('Error calculating risk score:', error);
    return null;
  }
} 