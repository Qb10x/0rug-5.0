// New Token Detection API - Real-time token launch tracking
// Following 0rug.com coding guidelines

import { getTrendingTokensByChain } from './dexscreener';
import { analyzeTokenComprehensive } from './dexscreener';
import { getJupiterTokenData } from './jupiter';
import { analyzeRugPullRisk } from './rugAnalysis';
import { analyzeHoneypotRisk } from './honeypotDetection';

// New token interface
interface NewToken {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  launchTime: Date;
  launchAge: number; // minutes since launch
  initialPrice: number;
  currentPrice: number;
  priceChange: number; // percentage since launch
  initialLiquidity: number;
  currentLiquidity: number;
  volume24h: number;
  holderCount: number;
  riskScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  launchQuality: 'EXCELLENT' | 'GOOD' | 'SUSPICIOUS' | 'POOR';
  analysis: NewTokenAnalysis;
}

// New token analysis
interface NewTokenAnalysis {
  launchMetrics: LaunchMetrics;
  tradingMetrics: TradingMetrics;
  securityMetrics: SecurityMetrics;
  recommendations: string[];
}

// Launch metrics
interface LaunchMetrics {
  launchSpeed: number; // How quickly liquidity was added
  initialLiquidityQuality: number; // 0-100
  priceStability: number; // 0-100
  launchAge: number; // minutes
}

// Trading metrics
interface TradingMetrics {
  volumeSpike: number; // percentage increase
  priceVolatility: number; // 0-100
  tradingActivity: number; // 0-100
  liquidityGrowth: number; // percentage
}

// Security metrics
interface SecurityMetrics {
  rugPullRisk: number; // 0-100
  honeypotRisk: number; // 0-100
  overallSecurity: number; // 0-100
  securityIssues: string[];
}

// Get new tokens listed in the last hour
export async function getNewTokensLastHour(chain: string = 'solana'): Promise<NewToken[]> {
  try {
    // Get trending tokens and filter for recent launches
    const trendingTokens = await getTrendingTokensByChain(chain);
    
    // Filter for tokens launched in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const newTokens = trendingTokens.filter(token => {
      const launchTime = new Date(token.launchTime || token.createdAt || Date.now());
      return launchTime > oneHourAgo;
    });

    // Analyze each new token
    const analyzedTokens = await Promise.all(
      newTokens.slice(0, 10).map(async (token) => {
        return await analyzeNewToken(token, chain);
      })
    );

    // Sort by launch quality and risk score
    return analyzedTokens
      .filter(token => token !== null)
      .sort((a, b) => {
        // Sort by launch quality first, then by risk score
        const qualityOrder = { 'EXCELLENT': 4, 'GOOD': 3, 'SUSPICIOUS': 2, 'POOR': 1 };
        const aQuality = qualityOrder[a.launchQuality];
        const bQuality = qualityOrder[b.launchQuality];
        
        if (aQuality !== bQuality) {
          return bQuality - aQuality;
        }
        
        return a.riskScore - b.riskScore; // Lower risk = better
      });

  } catch (error) {
    console.error('New token detection error:', error);
    return [];
  }
}

// Analyze a single new token
async function analyzeNewToken(token: any, chain: string): Promise<NewToken | null> {
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

    // Calculate launch metrics
    const launchMetrics = calculateLaunchMetrics(token, dexData);
    
    // Calculate trading metrics
    const tradingMetrics = calculateTradingMetrics(token, dexData);
    
    // Calculate security metrics
    const securityMetrics = calculateSecurityMetrics(rugAnalysis, honeypotAnalysis);
    
    // Calculate overall risk score
    const riskScore = calculateOverallRiskScore(launchMetrics, tradingMetrics, securityMetrics);
    
    // Determine launch quality
    const launchQuality = determineLaunchQuality(launchMetrics, tradingMetrics, securityMetrics);
    
    // Generate recommendations
    const recommendations = generateNewTokenRecommendations(launchQuality, riskScore, securityMetrics);

    const launchTime = new Date(token.launchTime || token.createdAt || Date.now());
    const launchAge = Math.floor((Date.now() - launchTime.getTime()) / (1000 * 60)); // minutes

    return {
      tokenAddress,
      tokenSymbol: jupiterData?.mintSymbol || dexData?.basic?.symbol || 'UNKNOWN',
      tokenName: dexData?.basic?.name || 'Unknown Token',
      launchTime,
      launchAge,
      initialPrice: token.initialPrice || 0,
      currentPrice: parseFloat(token.priceUsd || 0),
      priceChange: token.priceChange?.h24 || 0,
      initialLiquidity: token.initialLiquidity || 0,
      currentLiquidity: dexData?.liquidity?.usd || 0,
      volume24h: dexData?.volume?.h24 || 0,
      holderCount: dexData?.holders || 0,
      riskScore,
      riskLevel: getRiskLevel(riskScore),
      launchQuality,
      analysis: {
        launchMetrics,
        tradingMetrics,
        securityMetrics,
        recommendations
      }
    };

  } catch (error) {
    console.error('New token analysis error:', error);
    return null;
  }
}

// Calculate launch metrics
function calculateLaunchMetrics(token: any, dexData: any): LaunchMetrics {
  const launchTime = new Date(token.launchTime || token.createdAt || Date.now());
  const launchAge = Math.floor((Date.now() - launchTime.getTime()) / (1000 * 60)); // minutes
  
  // Calculate launch speed (how quickly liquidity was added)
  const initialLiquidity = token.initialLiquidity || 0;
  const currentLiquidity = dexData?.liquidity?.usd || 0;
  const liquidityGrowth = initialLiquidity > 0 ? ((currentLiquidity - initialLiquidity) / initialLiquidity) * 100 : 0;
  
  let launchSpeed = 0;
  if (launchAge < 5) launchSpeed = 90; // Very fast
  else if (launchAge < 15) launchSpeed = 70; // Fast
  else if (launchAge < 30) launchSpeed = 50; // Medium
  else launchSpeed = 30; // Slow
  
  // Calculate initial liquidity quality
  let initialLiquidityQuality = 0;
  if (initialLiquidity > 100000) initialLiquidityQuality = 90; // Excellent
  else if (initialLiquidity > 50000) initialLiquidityQuality = 70; // Good
  else if (initialLiquidity > 10000) initialLiquidityQuality = 50; // Fair
  else initialLiquidityQuality = 20; // Poor
  
  // Calculate price stability
  const priceChange = Math.abs(token.priceChange?.h24 || 0);
  let priceStability = 0;
  if (priceChange < 10) priceStability = 90; // Very stable
  else if (priceChange < 30) priceStability = 70; // Stable
  else if (priceChange < 50) priceStability = 50; // Volatile
  else priceStability = 20; // Very volatile
  
  return {
    launchSpeed,
    initialLiquidityQuality,
    priceStability,
    launchAge
  };
}

// Calculate trading metrics
function calculateTradingMetrics(token: any, dexData: any): TradingMetrics {
  const volume24h = dexData?.volume?.h24 || 0;
  const priceChange = Math.abs(token.priceChange?.h24 || 0);
  
  // Calculate volume spike
  const averageVolume = dexData?.volume?.h24 || 0;
  const volumeSpike = averageVolume > 0 ? (volume24h / averageVolume) * 100 : 0;
  
  // Calculate price volatility
  let priceVolatility = 0;
  if (priceChange < 10) priceVolatility = 10;
  else if (priceChange < 30) priceVolatility = 30;
  else if (priceChange < 50) priceVolatility = 50;
  else if (priceChange < 100) priceVolatility = 70;
  else priceVolatility = 90;
  
  // Calculate trading activity
  let tradingActivity = 0;
  if (volume24h > 1000000) tradingActivity = 90; // Very active
  else if (volume24h > 100000) tradingActivity = 70; // Active
  else if (volume24h > 10000) tradingActivity = 50; // Moderate
  else tradingActivity = 20; // Low activity
  
  // Calculate liquidity growth
  const initialLiquidity = token.initialLiquidity || 0;
  const currentLiquidity = dexData?.liquidity?.usd || 0;
  const liquidityGrowth = initialLiquidity > 0 ? ((currentLiquidity - initialLiquidity) / initialLiquidity) * 100 : 0;
  
  return {
    volumeSpike,
    priceVolatility,
    tradingActivity,
    liquidityGrowth
  };
}

// Calculate security metrics
function calculateSecurityMetrics(rugAnalysis: any, honeypotAnalysis: any): SecurityMetrics {
  const rugPullRisk = rugAnalysis?.riskScore || 50;
  const honeypotRisk = honeypotAnalysis?.securityScore || 50;
  
  // Calculate overall security
  const overallSecurity = Math.round((100 - rugPullRisk + (100 - honeypotRisk)) / 2);
  
  // Identify security issues
  const securityIssues: string[] = [];
  
  if (rugPullRisk > 70) {
    securityIssues.push('High rug pull risk');
  }
  
  if (honeypotRisk < 30) {
    securityIssues.push('Potential honeypot characteristics');
  }
  
  if (rugAnalysis?.riskFactors?.length > 0) {
    securityIssues.push(...rugAnalysis.riskFactors.slice(0, 2));
  }
  
  if (honeypotAnalysis?.sellRestrictions?.length > 0) {
    securityIssues.push(...honeypotAnalysis.sellRestrictions.slice(0, 2));
  }
  
  return {
    rugPullRisk,
    honeypotRisk,
    overallSecurity,
    securityIssues
  };
}

// Calculate overall risk score
function calculateOverallRiskScore(
  launchMetrics: LaunchMetrics,
  tradingMetrics: TradingMetrics,
  securityMetrics: SecurityMetrics
): number {
  // Weighted average of all metrics
  const weights = {
    launch: 0.3,
    trading: 0.3,
    security: 0.4
  };
  
  const launchScore = (launchMetrics.launchSpeed + launchMetrics.initialLiquidityQuality + launchMetrics.priceStability) / 3;
  const tradingScore = (tradingMetrics.tradingActivity + (100 - tradingMetrics.priceVolatility)) / 2;
  const securityScore = securityMetrics.overallSecurity;
  
  return Math.round(
    launchScore * weights.launch +
    tradingScore * weights.trading +
    securityScore * weights.security
  );
}

// Determine launch quality
function determineLaunchQuality(
  launchMetrics: LaunchMetrics,
  tradingMetrics: TradingMetrics,
  securityMetrics: SecurityMetrics
): 'EXCELLENT' | 'GOOD' | 'SUSPICIOUS' | 'POOR' {
  const avgLaunchScore = (launchMetrics.launchSpeed + launchMetrics.initialLiquidityQuality + launchMetrics.priceStability) / 3;
  const avgTradingScore = (tradingMetrics.tradingActivity + (100 - tradingMetrics.priceVolatility)) / 2;
  const securityScore = securityMetrics.overallSecurity;
  
  const overallScore = (avgLaunchScore + avgTradingScore + securityScore) / 3;
  
  if (overallScore >= 80) return 'EXCELLENT';
  if (overallScore >= 60) return 'GOOD';
  if (overallScore >= 40) return 'SUSPICIOUS';
  return 'POOR';
}

// Get risk level from score
function getRiskLevel(riskScore: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' {
  if (riskScore >= 80) return 'LOW';
  if (riskScore >= 60) return 'MEDIUM';
  if (riskScore >= 40) return 'HIGH';
  return 'EXTREME';
}

// Generate recommendations for new tokens
function generateNewTokenRecommendations(
  launchQuality: string,
  riskScore: number,
  securityMetrics: SecurityMetrics
): string[] {
  const recommendations: string[] = [];
  
  if (launchQuality === 'EXCELLENT') {
    recommendations.push('🟢 EXCELLENT LAUNCH: Consider investing');
    recommendations.push('📈 Strong initial metrics and security');
    recommendations.push('⚡ Fast launch with good liquidity');
  } else if (launchQuality === 'GOOD') {
    recommendations.push('🟡 GOOD LAUNCH: Monitor closely');
    recommendations.push('📊 Decent metrics, some concerns');
    recommendations.push('🔍 Watch for price stability');
  } else if (launchQuality === 'SUSPICIOUS') {
    recommendations.push('🟠 SUSPICIOUS LAUNCH: Exercise caution');
    recommendations.push('⚠️ Multiple red flags detected');
    recommendations.push('💰 Only invest small amounts if at all');
  } else {
    recommendations.push('🔴 POOR LAUNCH: Avoid this token');
    recommendations.push('🚨 High risk of losing funds');
    recommendations.push('❌ Multiple security issues');
  }
  
  // Security-specific recommendations
  if (securityMetrics.rugPullRisk > 70) {
    recommendations.push('🚨 High rug pull risk detected');
  }
  
  if (securityMetrics.honeypotRisk < 30) {
    recommendations.push('🔒 Potential honeypot characteristics');
  }
  
  if (securityMetrics.securityIssues.length > 0) {
    recommendations.push(`⚠️ Security issues: ${securityMetrics.securityIssues.slice(0, 2).join(', ')}`);
  }
  
  return recommendations;
}

// Format new token analysis for chat display
export function formatNewTokenAnalysisForChat(tokens: NewToken[]): string {
  if (tokens.length === 0) {
    return `🔍 **New Token Analysis**\n\nNo new tokens found in the last hour. Try checking trending tokens or expanding the time range.`;
  }
  
  let response = `🚀 **New Tokens Listed in the Last Hour**\n\n`;
  response += `Found ${tokens.length} new tokens:\n\n`;
  
  tokens.forEach((token, index) => {
    const qualityIcon = {
      'EXCELLENT': '🟢',
      'GOOD': '🟡',
      'SUSPICIOUS': '🟠',
      'POOR': '🔴'
    }[token.launchQuality];
    
    const riskIcon = {
      'LOW': '🟢',
      'MEDIUM': '🟡',
      'HIGH': '🟠',
      'EXTREME': '🔴'
    }[token.riskLevel];
    
    response += `${index + 1}. **${token.tokenSymbol}** (${token.tokenName})\n`;
    response += `   ${qualityIcon} Quality: ${token.launchQuality} | ${riskIcon} Risk: ${token.riskLevel}\n`;
    response += `   💰 Price: $${token.currentPrice.toFixed(6)} (${token.priceChange > 0 ? '+' : ''}${token.priceChange.toFixed(1)}%)\n`;
    response += `   💧 Liquidity: $${(token.currentLiquidity / 1000).toFixed(1)}k\n`;
    response += `   📊 Volume: $${(token.volume24h / 1000).toFixed(1)}k\n`;
    response += `   👥 Holders: ${token.holderCount.toLocaleString()}\n`;
    response += `   ⏰ Age: ${token.launchAge} minutes\n`;
    response += `   🎯 Risk Score: ${token.riskScore}/100\n\n`;
  });
  
  // Summary statistics
  const excellentCount = tokens.filter(t => t.launchQuality === 'EXCELLENT').length;
  const goodCount = tokens.filter(t => t.launchQuality === 'GOOD').length;
  const suspiciousCount = tokens.filter(t => t.launchQuality === 'SUSPICIOUS').length;
  const poorCount = tokens.filter(t => t.launchQuality === 'POOR').length;
  
  response += `📊 **Summary:**\n`;
  response += `• 🟢 Excellent: ${excellentCount}\n`;
  response += `• 🟡 Good: ${goodCount}\n`;
  response += `• 🟠 Suspicious: ${suspiciousCount}\n`;
  response += `• 🔴 Poor: ${poorCount}\n\n`;
  
  response += `💡 **Recommendations:**\n`;
  response += `• Focus on EXCELLENT and GOOD quality launches\n`;
  response += `• Avoid POOR quality tokens completely\n`;
  response += `• Always do your own research before investing\n`;
  response += `• Use the security analysis features for detailed checks\n`;
  
  return response;
}

// Get new token summary for quick assessment
export async function getNewTokenSummary(chain: string = 'solana'): Promise<{
  totalTokens: number;
  qualityBreakdown: Record<string, number>;
  averageRiskScore: number;
  summary: string;
  topTokens: NewToken[];
} | null> {
  try {
    const tokens = await getNewTokensLastHour(chain);
    
    if (tokens.length === 0) {
      return null;
    }

    const qualityBreakdown = {
      'EXCELLENT': tokens.filter(t => t.launchQuality === 'EXCELLENT').length,
      'GOOD': tokens.filter(t => t.launchQuality === 'GOOD').length,
      'SUSPICIOUS': tokens.filter(t => t.launchQuality === 'SUSPICIOUS').length,
      'POOR': tokens.filter(t => t.launchQuality === 'POOR').length
    };

    const averageRiskScore = Math.round(
      tokens.reduce((sum, t) => sum + t.riskScore, 0) / tokens.length
    );

    const summary = `Found ${tokens.length} new tokens in the last hour. ` +
                   `Quality breakdown: ${qualityBreakdown.EXCELLENT} excellent, ${qualityBreakdown.GOOD} good, ` +
                   `${qualityBreakdown.SUSPICIOUS} suspicious, ${qualityBreakdown.POOR} poor. ` +
                   `Average risk score: ${averageRiskScore}/100.`;

    return {
      totalTokens: tokens.length,
      qualityBreakdown,
      averageRiskScore,
      summary,
      topTokens: tokens.slice(0, 5)
    };

  } catch (error) {
    console.error('New token summary error:', error);
    return null;
  }
} 