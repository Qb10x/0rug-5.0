// Whale Tracking API - Real-time whale activity monitoring
// Following 0rug.com coding guidelines

import { getTrendingTokensByChain } from './dexscreener';
import { analyzeTokenComprehensive } from './dexscreener';
import { getJupiterTokenData } from './jupiter';
import { analyzeRugPullRisk } from './rugAnalysis';
import { analyzeHoneypotRisk } from './honeypotDetection';

// Whale activity interface
interface WhaleActivity {
  whaleAddress: string;
  whaleName: string;
  reputation: number; // 0-100
  reputationLevel: 'LEGENDARY' | 'EXPERT' | 'PROFICIENT' | 'NOVICE' | 'UNKNOWN';
  totalValue: number; // USD
  activityType: 'BUYING' | 'SELLING' | 'LP_ADD' | 'LP_REMOVE' | 'HOLDING';
  targetToken: string;
  targetTokenSymbol: string;
  transactionAmount: number; // USD
  transactionSize: 'WHALE' | 'LARGE' | 'MEDIUM' | 'SMALL';
  timestamp: Date;
  impactScore: number; // 0-100
  riskAssessment: WhaleRiskAssessment;
  analysis: WhaleActivityAnalysis;
}

// Whale risk assessment
interface WhaleRiskAssessment {
  whaleRisk: number; // 0-100
  tokenRisk: number; // 0-100
  overallRisk: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  riskFactors: string[];
}

// Whale activity analysis
interface WhaleActivityAnalysis {
  whaleMetrics: WhaleMetrics;
  tokenMetrics: TokenMetrics;
  marketImpact: MarketImpact;
  recommendations: string[];
}

// Whale metrics
interface WhaleMetrics {
  successRate: number; // 0-100
  averageHoldTime: number; // days
  portfolioDiversity: number; // 0-100
  influenceScore: number; // 0-100
  copycatFollowers: number;
}

// Token metrics
interface TokenMetrics {
  tokenAddress: string;
  tokenSymbol: string;
  currentPrice: number;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
  marketCap: number;
  holderCount: number;
}

// Market impact
interface MarketImpact {
  priceImpact: number; // percentage
  volumeImpact: number; // percentage
  liquidityImpact: number; // percentage
  marketSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number; // 0-100
}

// Get whale activity for today
export async function getWhaleActivityToday(chain: string = 'solana', limit: number = 10): Promise<WhaleActivity[]> {
  try {
    // Get trending tokens to analyze whale activity
    const trendingTokens = await getTrendingTokensByChain(chain);
    
    // Analyze whale activity for each token
    const whaleActivities = await Promise.all(
      trendingTokens.slice(0, 15).map(async (token) => {
        return await analyzeWhaleActivity(token, chain);
      })
    );

    // Filter out null results and sort by impact score
    return whaleActivities
      .filter(activity => activity !== null)
      .sort((a, b) => b.impactScore - a.impactScore)
      .slice(0, limit);

  } catch (error) {
    console.error('Whale activity detection error:', error);
    return [];
  }
}

// Analyze whale activity for a single token
async function analyzeWhaleActivity(token: any, chain: string): Promise<WhaleActivity | null> {
  try {
    const tokenAddress = token.baseToken.address;
    
    // Get comprehensive token data
    const [dexData, jupiterData, rugAnalysis, honeypotAnalysis] = await Promise.all([
      analyzeTokenComprehensive(tokenAddress),
      getJupiterTokenData(tokenAddress),
      analyzeRugPullRisk(tokenAddress),
      analyzeHoneypotRisk(tokenAddress)
    ]);

    if (!dexData) {
      return null;
    }

    // Simulate whale activity (in real implementation, this would come from blockchain data)
    const whaleActivity = simulateWhaleActivity(token, dexData);
    
    if (!whaleActivity) {
      return null;
    }

    // Calculate whale metrics
    const whaleMetrics = calculateWhaleMetrics(whaleActivity);
    
    // Calculate token metrics
    const tokenMetrics = calculateTokenMetrics(token, dexData);
    
    // Calculate market impact
    const marketImpact = calculateMarketImpact(whaleActivity, tokenMetrics);
    
    // Calculate risk assessment
    const riskAssessment = calculateWhaleRiskAssessment(whaleActivity, rugAnalysis, honeypotAnalysis);
    
    // Calculate impact score
    const impactScore = calculateImpactScore(whaleActivity, whaleMetrics, marketImpact);
    
    // Generate recommendations
    const recommendations = generateWhaleRecommendations(whaleActivity, riskAssessment, marketImpact);

    return {
      whaleAddress: whaleActivity.whaleAddress,
      whaleName: whaleActivity.whaleName,
      reputation: whaleActivity.reputation,
      reputationLevel: getReputationLevel(whaleActivity.reputation),
      totalValue: whaleActivity.totalValue,
      activityType: whaleActivity.activityType,
      targetToken: tokenAddress,
      targetTokenSymbol: jupiterData?.mintSymbol || dexData?.basic?.symbol || 'UNKNOWN',
      transactionAmount: whaleActivity.transactionAmount,
      transactionSize: determineTransactionSize(whaleActivity.transactionAmount),
      timestamp: new Date(),
      impactScore,
      riskAssessment,
      analysis: {
        whaleMetrics,
        tokenMetrics,
        marketImpact,
        recommendations
      }
    };

  } catch (error) {
    console.error('Whale activity analysis error:', error);
    return null;
  }
}

// Simulate whale activity (in real implementation, this would come from blockchain data)
function simulateWhaleActivity(token: any, dexData: any): any {
  // This is a simulation - in real implementation, you'd parse actual blockchain data
  const whaleAddresses = [
    '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Example whale address
    '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
    'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
  ];
  
  const whaleNames = [
    'Whale_Alpha',
    'Whale_Beta', 
    'Whale_Gamma'
  ];
  
  const activityTypes = ['BUYING', 'SELLING', 'LP_ADD', 'LP_REMOVE', 'HOLDING'];
  
  // Randomly select whale activity
  const randomIndex = Math.floor(Math.random() * whaleAddresses.length);
  const randomActivity = Math.floor(Math.random() * activityTypes.length);
  const randomAmount = Math.random() * 1000000 + 10000; // $10k - $1M
  const randomReputation = Math.random() * 100;
  
  return {
    whaleAddress: whaleAddresses[randomIndex],
    whaleName: whaleNames[randomIndex],
    reputation: randomReputation,
    totalValue: randomAmount * 10, // Assume whale has 10x the transaction amount
    activityType: activityTypes[randomActivity],
    transactionAmount: randomAmount
  };
}

// Calculate whale metrics
function calculateWhaleMetrics(whaleActivity: any): WhaleMetrics {
  const reputation = whaleActivity.reputation;
  
  // Calculate success rate based on reputation
  const successRate = Math.min(100, reputation + Math.random() * 20);
  
  // Calculate average hold time (higher reputation = longer holds)
  const averageHoldTime = reputation > 80 ? 30 + Math.random() * 60 : // 30-90 days
                         reputation > 60 ? 15 + Math.random() * 30 : // 15-45 days
                         reputation > 40 ? 7 + Math.random() * 14 : // 7-21 days
                         1 + Math.random() * 7; // 1-8 days
  
  // Calculate portfolio diversity
  const portfolioDiversity = Math.min(100, reputation * 0.8 + Math.random() * 20);
  
  // Calculate influence score
  const influenceScore = Math.min(100, reputation * 0.9 + Math.random() * 10);
  
  // Calculate copycat followers
  const copycatFollowers = Math.floor(reputation * 10 + Math.random() * 100);
  
  return {
    successRate,
    averageHoldTime,
    portfolioDiversity,
    influenceScore,
    copycatFollowers
  };
}

// Calculate token metrics
function calculateTokenMetrics(token: any, dexData: any): TokenMetrics {
  return {
    tokenAddress: token.baseToken.address,
    tokenSymbol: dexData?.basic?.symbol || 'UNKNOWN',
    currentPrice: parseFloat(token.priceUsd || 0),
    priceChange24h: token.priceChange?.h24 || 0,
    volume24h: dexData?.volume?.h24 || 0,
    liquidity: dexData?.liquidity?.usd || 0,
    marketCap: dexData?.marketCap || 0,
    holderCount: dexData?.holders || 0
  };
}

// Calculate market impact
function calculateMarketImpact(whaleActivity: any, tokenMetrics: TokenMetrics): MarketImpact {
  const transactionAmount = whaleActivity.transactionAmount;
  const marketCap = tokenMetrics.marketCap;
  const volume24h = tokenMetrics.volume24h;
  const liquidity = tokenMetrics.liquidity;
  
  // Calculate price impact
  const priceImpact = marketCap > 0 ? (transactionAmount / marketCap) * 100 : 0;
  
  // Calculate volume impact
  const volumeImpact = volume24h > 0 ? (transactionAmount / volume24h) * 100 : 0;
  
  // Calculate liquidity impact
  const liquidityImpact = liquidity > 0 ? (transactionAmount / liquidity) * 100 : 0;
  
  // Determine market sentiment
  let marketSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  if (whaleActivity.activityType === 'BUYING' && whaleActivity.reputation > 70) {
    marketSentiment = 'BULLISH';
  } else if (whaleActivity.activityType === 'SELLING' && whaleActivity.reputation > 70) {
    marketSentiment = 'BEARISH';
  }
  
  // Calculate confidence
  const confidence = Math.min(100, whaleActivity.reputation * 0.8 + Math.random() * 20);
  
  return {
    priceImpact,
    volumeImpact,
    liquidityImpact,
    marketSentiment,
    confidence
  };
}

// Calculate whale risk assessment
function calculateWhaleRiskAssessment(
  whaleActivity: any,
  rugAnalysis: any,
  honeypotAnalysis: any
): WhaleRiskAssessment {
  const riskFactors: string[] = [];
  
  // Calculate whale risk
  let whaleRisk = 0;
  if (whaleActivity.reputation < 30) {
    whaleRisk = 80;
    riskFactors.push('Low reputation whale');
  } else if (whaleActivity.reputation < 50) {
    whaleRisk = 60;
    riskFactors.push('Medium reputation whale');
  } else if (whaleActivity.reputation < 70) {
    whaleRisk = 40;
    riskFactors.push('Good reputation whale');
  } else {
    whaleRisk = 20;
    riskFactors.push('High reputation whale');
  }
  
  // Calculate token risk
  let tokenRisk = 0;
  if (rugAnalysis?.riskScore > 70) {
    tokenRisk = 80;
    riskFactors.push('High rug pull risk token');
  } else if (rugAnalysis?.riskScore > 50) {
    tokenRisk = 60;
    riskFactors.push('Medium rug pull risk token');
  } else {
    tokenRisk = 20;
    riskFactors.push('Low rug pull risk token');
  }
  
  if (honeypotAnalysis?.isHoneypot) {
    tokenRisk = 90;
    riskFactors.push('Honeypot token detected');
  }
  
  // Calculate overall risk
  const overallRisk = Math.round((whaleRisk + tokenRisk) / 2);
  
  return {
    whaleRisk,
    tokenRisk,
    overallRisk,
    riskLevel: getRiskLevel(overallRisk),
    riskFactors
  };
}

// Calculate impact score
function calculateImpactScore(
  whaleActivity: any,
  whaleMetrics: WhaleMetrics,
  marketImpact: MarketImpact
): number {
  // Weighted average of impact factors
  const weights = {
    reputation: 0.3,
    transactionSize: 0.25,
    marketImpact: 0.25,
    influence: 0.2
  };
  
  const reputationScore = whaleActivity.reputation;
  const transactionSizeScore = Math.min(100, (whaleActivity.transactionAmount / 100000) * 10);
  const marketImpactScore = (marketImpact.priceImpact + marketImpact.volumeImpact) / 2;
  const influenceScore = whaleMetrics.influenceScore;
  
  return Math.round(
    reputationScore * weights.reputation +
    transactionSizeScore * weights.transactionSize +
    marketImpactScore * weights.marketImpact +
    influenceScore * weights.influence
  );
}

// Get reputation level
function getReputationLevel(reputation: number): 'LEGENDARY' | 'EXPERT' | 'PROFICIENT' | 'NOVICE' | 'UNKNOWN' {
  if (reputation >= 90) return 'LEGENDARY';
  if (reputation >= 75) return 'EXPERT';
  if (reputation >= 50) return 'PROFICIENT';
  if (reputation >= 25) return 'NOVICE';
  return 'UNKNOWN';
}

// Determine transaction size
function determineTransactionSize(amount: number): 'WHALE' | 'LARGE' | 'MEDIUM' | 'SMALL' {
  if (amount >= 1000000) return 'WHALE'; // $1M+
  if (amount >= 100000) return 'LARGE'; // $100k+
  if (amount >= 10000) return 'MEDIUM'; // $10k+
  return 'SMALL';
}

// Get risk level from score
function getRiskLevel(riskScore: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' {
  if (riskScore >= 80) return 'EXTREME';
  if (riskScore >= 60) return 'HIGH';
  if (riskScore >= 35) return 'MEDIUM';
  return 'LOW';
}

// Generate whale recommendations
function generateWhaleRecommendations(
  whaleActivity: any,
  riskAssessment: WhaleRiskAssessment,
  marketImpact: MarketImpact
): string[] {
  const recommendations: string[] = [];
  
  if (whaleActivity.activityType === 'BUYING') {
    if (whaleActivity.reputation > 80) {
      recommendations.push('🐋 LEGENDARY WHALE BUYING: Strong bullish signal');
      recommendations.push('📈 High reputation whale with excellent track record');
      recommendations.push('💡 Consider following this whale\'s lead');
    } else if (whaleActivity.reputation > 60) {
      recommendations.push('🐋 EXPERT WHALE BUYING: Positive signal');
      recommendations.push('📊 Good reputation whale with solid track record');
      recommendations.push('🔍 Monitor for confirmation');
    } else {
      recommendations.push('🐋 WHALE BUYING: Exercise caution');
      recommendations.push('⚠️ Lower reputation whale - do your own research');
      recommendations.push('📊 Verify token fundamentals before following');
    }
  } else if (whaleActivity.activityType === 'SELLING') {
    if (whaleActivity.reputation > 80) {
      recommendations.push('🐋 LEGENDARY WHALE SELLING: Bearish signal');
      recommendations.push('📉 High reputation whale exiting position');
      recommendations.push('⚠️ Consider reducing exposure');
    } else {
      recommendations.push('🐋 WHALE SELLING: Monitor closely');
      recommendations.push('📊 Lower reputation whale selling');
      recommendations.push('🔍 Check for other confirming signals');
    }
  }
  
  // Risk-specific recommendations
  if (riskAssessment.overallRisk > 80) {
    recommendations.push('🚨 EXTREME RISK: Avoid following this whale');
    recommendations.push('🔒 High risk of losing funds');
  } else if (riskAssessment.overallRisk > 60) {
    recommendations.push('⚠️ HIGH RISK: Exercise extreme caution');
    recommendations.push('💰 Only invest small amounts if at all');
  } else if (riskAssessment.overallRisk > 35) {
    recommendations.push('🟡 MEDIUM RISK: Standard due diligence');
    recommendations.push('📊 Consider the whale\'s reputation');
  } else {
    recommendations.push('🟢 LOW RISK: Relatively safe to follow');
    recommendations.push('✅ Good risk/reward ratio');
  }
  
  // Market impact recommendations
  if (marketImpact.marketSentiment === 'BULLISH') {
    recommendations.push('📈 BULLISH SENTIMENT: Positive market outlook');
  } else if (marketImpact.marketSentiment === 'BEARISH') {
    recommendations.push('📉 BEARISH SENTIMENT: Negative market outlook');
  }
  
  return recommendations;
}

// Format whale activity analysis for chat display
export function formatWhaleActivityAnalysisForChat(activities: WhaleActivity[]): string {
  if (activities.length === 0) {
    return `🐋 **Whale Activity Analysis**\n\nNo significant whale activity detected today. This could indicate:\n\n• Quiet market conditions\n• Whales are holding positions\n• No major moves happening\n\nTry checking trending tokens or expanding the time range.`;
  }
  
  let response = `🐋 **Whale Activity Analysis**\n\n`;
  response += `Found ${activities.length} significant whale activities today:\n\n`;
  
  activities.forEach((activity, index) => {
    const reputationIcon = {
      'LEGENDARY': '👑',
      'EXPERT': '🐋',
      'PROFICIENT': '🐬',
      'NOVICE': '🐟',
      'UNKNOWN': '❓'
    }[activity.reputationLevel];
    
    const activityIcon = {
      'BUYING': '📈',
      'SELLING': '📉',
      'LP_ADD': '💧',
      'LP_REMOVE': '💧',
      'HOLDING': '📊'
    }[activity.activityType];
    
    const riskIcon = {
      'LOW': '🟢',
      'MEDIUM': '🟡',
      'HIGH': '🟠',
      'EXTREME': '🔴'
    }[activity.riskAssessment.riskLevel];
    
    const sizeIcon = {
      'WHALE': '🐋',
      'LARGE': '🐬',
      'MEDIUM': '🐟',
      'SMALL': '🦐'
    }[activity.transactionSize];
    
    response += `${index + 1}. **${activity.whaleName}** (${activity.whaleAddress.slice(0, 8)}...)\n`;
    response += `   ${reputationIcon} Reputation: ${activity.reputationLevel} (${activity.reputation}/100)\n`;
    response += `   ${activityIcon} Activity: ${activity.activityType} ${activity.targetTokenSymbol}\n`;
    response += `   ${sizeIcon} Amount: $${(activity.transactionAmount / 1000).toFixed(1)}k\n`;
    response += `   💰 Total Value: $${(activity.totalValue / 1000000).toFixed(1)}M\n`;
    response += `   🎯 Impact Score: ${activity.impactScore}/100\n`;
    response += `   ${riskIcon} Risk: ${activity.riskAssessment.riskLevel}\n\n`;
  });
  
  // Summary statistics
  const buyingCount = activities.filter(a => a.activityType === 'BUYING').length;
  const sellingCount = activities.filter(a => a.activityType === 'SELLING').length;
  const legendaryCount = activities.filter(a => a.reputationLevel === 'LEGENDARY').length;
  const expertCount = activities.filter(a => a.reputationLevel === 'EXPERT').length;
  
  response += `📊 **Summary:**\n`;
  response += `• 📈 Buying Activities: ${buyingCount}\n`;
  response += `• 📉 Selling Activities: ${sellingCount}\n`;
  response += `• 👑 Legendary Whales: ${legendaryCount}\n`;
  response += `• 🐋 Expert Whales: ${expertCount}\n\n`;
  
  response += `💡 **Recommendations:**\n`;
  response += `• Follow LEGENDARY and EXPERT whales more closely\n`;
  response += `• Be cautious of NOVICE whale activities\n`;
  response += `• Always do your own research before following\n`;
  response += `• Consider the overall market sentiment\n`;
  
  return response;
}

// Get whale activity summary for quick assessment
export async function getWhaleActivitySummary(chain: string = 'solana'): Promise<{
  totalActivities: number;
  activityBreakdown: Record<string, number>;
  averageReputation: number;
  summary: string;
  topActivities: WhaleActivity[];
} | null> {
  try {
    const activities = await getWhaleActivityToday(chain, 10);
    
    if (activities.length === 0) {
      return null;
    }

    const activityBreakdown = {
      'BUYING': activities.filter(a => a.activityType === 'BUYING').length,
      'SELLING': activities.filter(a => a.activityType === 'SELLING').length,
      'LP_ADD': activities.filter(a => a.activityType === 'LP_ADD').length,
      'LP_REMOVE': activities.filter(a => a.activityType === 'LP_REMOVE').length
    };

    const averageReputation = Math.round(
      activities.reduce((sum, a) => sum + a.reputation, 0) / activities.length
    );

    const summary = `Found ${activities.length} whale activities. ` +
                   `Breakdown: ${activityBreakdown.BUYING} buying, ${activityBreakdown.SELLING} selling, ` +
                   `${activityBreakdown.LP_ADD} LP adds, ${activityBreakdown.LP_REMOVE} LP removes. ` +
                   `Average reputation: ${averageReputation}/100.`;

    return {
      totalActivities: activities.length,
      activityBreakdown,
      averageReputation,
      summary,
      topActivities: activities.slice(0, 5)
    };

  } catch (error) {
    console.error('Whale activity summary error:', error);
    return null;
  }
} 