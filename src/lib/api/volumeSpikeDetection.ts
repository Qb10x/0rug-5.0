// Volume Spike Detection API - Real-time volume analysis
// Following 0rug.com coding guidelines

import { getTrendingTokensByChain } from './dexscreener';
import { analyzeTokenComprehensive } from './dexscreener';
import { getJupiterTokenData } from './jupiter';
import { analyzeRugPullRisk } from './rugAnalysis';
import { analyzeHoneypotRisk } from './honeypotDetection';

// Volume spike interface
interface VolumeSpike {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  currentVolume: number;
  previousVolume: number;
  volumeChange: number; // percentage
  volumeSpike: number; // 0-100 spike intensity
  spikeLevel: 'MASSIVE' | 'LARGE' | 'MEDIUM' | 'SMALL' | 'NONE';
  priceChange: number; // percentage
  liquidityChange: number; // percentage
  holderChange: number; // percentage
  riskScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  analysis: VolumeSpikeAnalysis;
}

// Volume spike analysis
interface VolumeSpikeAnalysis {
  volumeMetrics: VolumeMetrics;
  priceMetrics: PriceMetrics;
  liquidityMetrics: LiquidityMetrics;
  spikePattern: SpikePattern;
  recommendations: string[];
}

// Volume metrics
interface VolumeMetrics {
  currentVolume24h: number;
  previousVolume24h: number;
  volumeChangePercent: number;
  volumeSpikeIntensity: number; // 0-100
  averageVolume7d: number;
  volumeConsistency: number; // 0-100
}

// Price metrics
interface PriceMetrics {
  currentPrice: number;
  priceChange24h: number;
  priceChange1h: number;
  priceVolatility: number; // 0-100
  priceDirection: 'PUMP' | 'DUMP' | 'STABLE';
}

// Liquidity metrics
interface LiquidityMetrics {
  currentLiquidity: number;
  liquidityChange24h: number;
  liquidityDepth: number; // 0-100
  liquidityStability: number; // 0-100
}

// Spike pattern analysis
interface SpikePattern {
  pattern: 'PUMP_AND_DUMP' | 'ORGANIC_GROWTH' | 'MANIPULATION' | 'NORMAL';
  confidence: number; // 0-100
  indicators: string[];
  manipulationRisk: number; // 0-100
}

// Get tokens with volume spikes
export async function getVolumeSpikes(chain: string = 'solana', limit: number = 10): Promise<VolumeSpike[]> {
  try {
    // Get trending tokens
    const trendingTokens = await getTrendingTokensByChain(chain);
    
    // Analyze volume changes for each token
    const volumeSpikes = await Promise.all(
      trendingTokens.slice(0, 20).map(async (token) => {
        return await analyzeVolumeSpike(token, chain);
      })
    );

    // Filter out null results and sort by spike intensity
    return volumeSpikes
      .filter(spike => spike !== null)
      .sort((a, b) => b.volumeSpike - a.volumeSpike)
      .slice(0, limit);

  } catch (error) {
    console.error('Volume spike detection error:', error);
    return [];
  }
}

// Analyze volume spike for a single token
async function analyzeVolumeSpike(token: any, chain: string): Promise<VolumeSpike | null> {
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

    // Calculate volume metrics
    const volumeMetrics = calculateVolumeMetrics(token, dexData);
    
    // Calculate price metrics
    const priceMetrics = calculatePriceMetrics(token, dexData);
    
    // Calculate liquidity metrics
    const liquidityMetrics = calculateLiquidityMetrics(token, dexData);
    
    // Analyze spike pattern
    const spikePattern = analyzeSpikePattern(volumeMetrics, priceMetrics, liquidityMetrics);
    
    // Calculate overall risk score
    const riskScore = calculateVolumeRiskScore(volumeMetrics, priceMetrics, liquidityMetrics, spikePattern);
    
    // Determine spike level
    const spikeLevel = determineSpikeLevel(volumeMetrics.volumeSpikeIntensity);
    
    // Generate recommendations
    const recommendations = generateVolumeSpikeRecommendations(spikeLevel, riskScore, spikePattern);

    return {
      tokenAddress,
      tokenSymbol: jupiterData?.mintSymbol || dexData?.basic?.symbol || 'UNKNOWN',
      tokenName: dexData?.basic?.name || 'Unknown Token',
      currentVolume: volumeMetrics.currentVolume24h,
      previousVolume: volumeMetrics.previousVolume24h,
      volumeChange: volumeMetrics.volumeChangePercent,
      volumeSpike: volumeMetrics.volumeSpikeIntensity,
      spikeLevel,
      priceChange: priceMetrics.priceChange24h,
      liquidityChange: liquidityMetrics.liquidityChange24h,
      holderChange: 0, // Would be calculated from holder data
      riskScore,
      riskLevel: getRiskLevel(riskScore),
      analysis: {
        volumeMetrics,
        priceMetrics,
        liquidityMetrics,
        spikePattern,
        recommendations
      }
    };

  } catch (error) {
    console.error('Volume spike analysis error:', error);
    return null;
  }
}

// Calculate volume metrics
function calculateVolumeMetrics(token: any, dexData: any): VolumeMetrics {
  const currentVolume24h = dexData?.volume?.h24 || 0;
  const previousVolume24h = dexData?.volume?.h24_previous || currentVolume24h * 0.8; // Estimate if not available
  const averageVolume7d = dexData?.volume?.h7d || currentVolume24h;
  
  // Calculate volume change percentage
  const volumeChangePercent = previousVolume24h > 0 ? 
    ((currentVolume24h - previousVolume24h) / previousVolume24h) * 100 : 0;
  
  // Calculate spike intensity (0-100)
  let volumeSpikeIntensity = 0;
  if (volumeChangePercent > 1000) volumeSpikeIntensity = 100; // Massive spike
  else if (volumeChangePercent > 500) volumeSpikeIntensity = 90;
  else if (volumeChangePercent > 200) volumeSpikeIntensity = 80;
  else if (volumeChangePercent > 100) volumeSpikeIntensity = 70;
  else if (volumeChangePercent > 50) volumeSpikeIntensity = 60;
  else if (volumeChangePercent > 20) volumeSpikeIntensity = 40;
  else if (volumeChangePercent > 10) volumeSpikeIntensity = 20;
  else volumeSpikeIntensity = 0;
  
  // Calculate volume consistency
  const volumeConsistency = Math.min(100, Math.max(0, 100 - Math.abs(volumeChangePercent) / 10));
  
  return {
    currentVolume24h,
    previousVolume24h,
    volumeChangePercent,
    volumeSpikeIntensity,
    averageVolume7d,
    volumeConsistency
  };
}

// Calculate price metrics
function calculatePriceMetrics(token: any, dexData: any): PriceMetrics {
  const currentPrice = parseFloat(token.priceUsd || 0);
  const priceChange24h = token.priceChange?.h24 || 0;
  const priceChange1h = token.priceChange?.h1 || 0;
  
  // Calculate price volatility
  const priceVolatility = Math.abs(priceChange24h) + Math.abs(priceChange1h);
  
  // Determine price direction
  let priceDirection: 'PUMP' | 'DUMP' | 'STABLE' = 'STABLE';
  if (priceChange24h > 20) priceDirection = 'PUMP';
  else if (priceChange24h < -20) priceDirection = 'DUMP';
  
  return {
    currentPrice,
    priceChange24h,
    priceChange1h,
    priceVolatility,
    priceDirection
  };
}

// Calculate liquidity metrics
function calculateLiquidityMetrics(token: any, dexData: any): LiquidityMetrics {
  const currentLiquidity = dexData?.liquidity?.usd || 0;
  const previousLiquidity = dexData?.liquidity?.usd_previous || currentLiquidity * 0.9; // Estimate
  const liquidityChange24h = previousLiquidity > 0 ? 
    ((currentLiquidity - previousLiquidity) / previousLiquidity) * 100 : 0;
  
  // Calculate liquidity depth
  let liquidityDepth = 0;
  if (currentLiquidity > 1000000) liquidityDepth = 90; // Excellent
  else if (currentLiquidity > 100000) liquidityDepth = 70; // Good
  else if (currentLiquidity > 10000) liquidityDepth = 50; // Fair
  else liquidityDepth = 20; // Poor
  
  // Calculate liquidity stability
  const liquidityStability = Math.min(100, Math.max(0, 100 - Math.abs(liquidityChange24h) / 2));
  
  return {
    currentLiquidity,
    liquidityChange24h,
    liquidityDepth,
    liquidityStability
  };
}

// Analyze spike pattern
function analyzeSpikePattern(
  volumeMetrics: VolumeMetrics,
  priceMetrics: PriceMetrics,
  liquidityMetrics: LiquidityMetrics
): SpikePattern {
  const indicators: string[] = [];
  let manipulationRisk = 0;
  let pattern: 'PUMP_AND_DUMP' | 'ORGANIC_GROWTH' | 'MANIPULATION' | 'NORMAL' = 'NORMAL';
  let confidence = 50; // Base confidence
  
  // Check for pump and dump indicators
  if (volumeMetrics.volumeSpikeIntensity > 80 && priceMetrics.priceDirection === 'PUMP') {
    indicators.push('High volume spike with price pump');
    manipulationRisk += 30;
  }
  
  if (priceMetrics.priceVolatility > 70) {
    indicators.push('Extreme price volatility');
    manipulationRisk += 25;
  }
  
  if (liquidityMetrics.liquidityStability < 50) {
    indicators.push('Unstable liquidity');
    manipulationRisk += 20;
  }
  
  if (volumeMetrics.volumeConsistency < 30) {
    indicators.push('Inconsistent volume pattern');
    manipulationRisk += 15;
  }
  
  // Determine pattern based on indicators
  if (manipulationRisk > 70) {
    pattern = 'MANIPULATION';
    confidence = 80;
  } else if (volumeMetrics.volumeSpikeIntensity > 60 && priceMetrics.priceDirection === 'PUMP') {
    pattern = 'PUMP_AND_DUMP';
    confidence = 70;
  } else if (volumeMetrics.volumeSpikeIntensity > 40 && priceMetrics.priceDirection === 'STABLE') {
    pattern = 'ORGANIC_GROWTH';
    confidence = 60;
  } else {
    pattern = 'NORMAL';
    confidence = 40;
  }
  
  return {
    pattern,
    confidence,
    indicators,
    manipulationRisk: Math.min(100, manipulationRisk)
  };
}

// Calculate volume risk score
function calculateVolumeRiskScore(
  volumeMetrics: VolumeMetrics,
  priceMetrics: PriceMetrics,
  liquidityMetrics: LiquidityMetrics,
  spikePattern: SpikePattern
): number {
  // Weighted average of risk factors
  const weights = {
    volumeSpike: 0.3,
    priceVolatility: 0.25,
    liquidityStability: 0.25,
    manipulationRisk: 0.2
  };
  
  const volumeSpikeRisk = volumeMetrics.volumeSpikeIntensity;
  const priceVolatilityRisk = priceMetrics.priceVolatility;
  const liquidityStabilityRisk = 100 - liquidityMetrics.liquidityStability;
  const manipulationRisk = spikePattern.manipulationRisk;
  
  return Math.round(
    volumeSpikeRisk * weights.volumeSpike +
    priceVolatilityRisk * weights.priceVolatility +
    liquidityStabilityRisk * weights.liquidityStability +
    manipulationRisk * weights.manipulationRisk
  );
}

// Determine spike level
function determineSpikeLevel(spikeIntensity: number): 'MASSIVE' | 'LARGE' | 'MEDIUM' | 'SMALL' | 'NONE' {
  if (spikeIntensity >= 90) return 'MASSIVE';
  if (spikeIntensity >= 70) return 'LARGE';
  if (spikeIntensity >= 50) return 'MEDIUM';
  if (spikeIntensity >= 20) return 'SMALL';
  return 'NONE';
}

// Get risk level from score
function getRiskLevel(riskScore: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' {
  if (riskScore >= 80) return 'EXTREME';
  if (riskScore >= 60) return 'HIGH';
  if (riskScore >= 35) return 'MEDIUM';
  return 'LOW';
}

// Generate recommendations for volume spikes
function generateVolumeSpikeRecommendations(
  spikeLevel: string,
  riskScore: number,
  spikePattern: SpikePattern
): string[] {
  const recommendations: string[] = [];
  
  if (spikeLevel === 'MASSIVE') {
    recommendations.push('🚨 MASSIVE VOLUME SPIKE: Extreme caution required');
    recommendations.push('⚠️ High probability of manipulation or pump and dump');
    recommendations.push('💰 Only invest if you can afford to lose everything');
  } else if (spikeLevel === 'LARGE') {
    recommendations.push('🟠 LARGE VOLUME SPIKE: Exercise caution');
    recommendations.push('📊 Monitor price action closely');
    recommendations.push('🔍 Check for organic growth vs manipulation');
  } else if (spikeLevel === 'MEDIUM') {
    recommendations.push('🟡 MEDIUM VOLUME SPIKE: Monitor closely');
    recommendations.push('📈 Could indicate growing interest');
    recommendations.push('🔍 Verify token fundamentals');
  } else {
    recommendations.push('🟢 SMALL VOLUME SPIKE: Normal market activity');
    recommendations.push('📊 Standard trading volume increase');
    recommendations.push('✅ No immediate concerns');
  }
  
  // Pattern-specific recommendations
  if (spikePattern.pattern === 'MANIPULATION') {
    recommendations.push('🚨 MANIPULATION DETECTED: Avoid this token');
    recommendations.push('🔒 High risk of losing funds');
  } else if (spikePattern.pattern === 'PUMP_AND_DUMP') {
    recommendations.push('📈 PUMP AND DUMP PATTERN: Exit quickly if invested');
    recommendations.push('⏰ Time-sensitive opportunity/risk');
  } else if (spikePattern.pattern === 'ORGANIC_GROWTH') {
    recommendations.push('🌱 ORGANIC GROWTH: Positive sign');
    recommendations.push('📊 Consider fundamental analysis');
  }
  
  // Risk-specific recommendations
  if (riskScore > 80) {
    recommendations.push('🚨 EXTREME RISK: Avoid completely');
  } else if (riskScore > 60) {
    recommendations.push('⚠️ HIGH RISK: Only experienced traders');
  } else if (riskScore > 35) {
    recommendations.push('🟡 MEDIUM RISK: Standard due diligence');
  } else {
    recommendations.push('🟢 LOW RISK: Normal market activity');
  }
  
  return recommendations;
}

// Format volume spike analysis for chat display
export function formatVolumeSpikeAnalysisForChat(spikes: VolumeSpike[]): string {
  if (spikes.length === 0) {
    return `📊 **Volume Spike Analysis**\n\nNo significant volume spikes detected. This could indicate:\n\n• Stable market conditions\n• Low trading activity\n• No recent major events\n\nTry checking trending tokens or expanding the time range.`;
  }
  
  let response = `📊 **Volume Spike Analysis**\n\n`;
  response += `Found ${spikes.length} tokens with significant volume spikes:\n\n`;
  
  spikes.forEach((spike, index) => {
    const spikeIcon = {
      'MASSIVE': '🚨',
      'LARGE': '🟠',
      'MEDIUM': '🟡',
      'SMALL': '🟢',
      'NONE': '⚪'
    }[spike.spikeLevel];
    
    const riskIcon = {
      'LOW': '🟢',
      'MEDIUM': '🟡',
      'HIGH': '🟠',
      'EXTREME': '🔴'
    }[spike.riskLevel];
    
    const patternIcon = {
      'PUMP_AND_DUMP': '📈',
      'ORGANIC_GROWTH': '🌱',
      'MANIPULATION': '🚨',
      'NORMAL': '📊'
    }[spike.analysis.spikePattern.pattern];
    
    response += `${index + 1}. **${spike.tokenSymbol}** (${spike.tokenName})\n`;
    response += `   ${spikeIcon} Spike: ${spike.spikeLevel} | ${riskIcon} Risk: ${spike.riskLevel}\n`;
    response += `   📊 Volume: $${(spike.currentVolume / 1000).toFixed(1)}k (${spike.volumeChange > 0 ? '+' : ''}${spike.volumeChange.toFixed(1)}%)\n`;
    response += `   💰 Price: $${spike.analysis.priceMetrics.currentPrice.toFixed(6)} (${spike.priceChange > 0 ? '+' : ''}${spike.priceChange.toFixed(1)}%)\n`;
    response += `   💧 Liquidity: $${(spike.analysis.liquidityMetrics.currentLiquidity / 1000).toFixed(1)}k\n`;
    response += `   ${patternIcon} Pattern: ${spike.analysis.spikePattern.pattern.replace('_', ' ')}\n`;
    response += `   🎯 Risk Score: ${spike.riskScore}/100\n\n`;
  });
  
  // Summary statistics
  const massiveCount = spikes.filter(s => s.spikeLevel === 'MASSIVE').length;
  const largeCount = spikes.filter(s => s.spikeLevel === 'LARGE').length;
  const mediumCount = spikes.filter(s => s.spikeLevel === 'MEDIUM').length;
  const smallCount = spikes.filter(s => s.spikeLevel === 'SMALL').length;
  
  const manipulationCount = spikes.filter(s => s.analysis.spikePattern.pattern === 'MANIPULATION').length;
  const pumpDumpCount = spikes.filter(s => s.analysis.spikePattern.pattern === 'PUMP_AND_DUMP').length;
  const organicCount = spikes.filter(s => s.analysis.spikePattern.pattern === 'ORGANIC_GROWTH').length;
  
  response += `📈 **Summary:**\n`;
  response += `• 🚨 Massive Spikes: ${massiveCount}\n`;
  response += `• 🟠 Large Spikes: ${largeCount}\n`;
  response += `• 🟡 Medium Spikes: ${mediumCount}\n`;
  response += `• 🟢 Small Spikes: ${smallCount}\n\n`;
  
  response += `🔍 **Pattern Analysis:**\n`;
  response += `• 🚨 Manipulation: ${manipulationCount}\n`;
  response += `• 📈 Pump & Dump: ${pumpDumpCount}\n`;
  response += `• 🌱 Organic Growth: ${organicCount}\n\n`;
  
  response += `💡 **Recommendations:**\n`;
  response += `• Focus on organic growth patterns\n`;
  response += `• Avoid manipulation and pump & dump tokens\n`;
  response += `• Always do your own research before investing\n`;
  response += `• Use security analysis features for detailed checks\n`;
  
  return response;
}

// Get volume spike summary for quick assessment
export async function getVolumeSpikeSummary(chain: string = 'solana'): Promise<{
  totalSpikes: number;
  spikeBreakdown: Record<string, number>;
  averageRiskScore: number;
  summary: string;
  topSpikes: VolumeSpike[];
} | null> {
  try {
    const spikes = await getVolumeSpikes(chain, 10);
    
    if (spikes.length === 0) {
      return null;
    }

    const spikeBreakdown = {
      'MASSIVE': spikes.filter(s => s.spikeLevel === 'MASSIVE').length,
      'LARGE': spikes.filter(s => s.spikeLevel === 'LARGE').length,
      'MEDIUM': spikes.filter(s => s.spikeLevel === 'MEDIUM').length,
      'SMALL': spikes.filter(s => s.spikeLevel === 'SMALL').length
    };

    const averageRiskScore = Math.round(
      spikes.reduce((sum, s) => sum + s.riskScore, 0) / spikes.length
    );

    const summary = `Found ${spikes.length} volume spikes. ` +
                   `Breakdown: ${spikeBreakdown.MASSIVE} massive, ${spikeBreakdown.LARGE} large, ` +
                   `${spikeBreakdown.MEDIUM} medium, ${spikeBreakdown.SMALL} small. ` +
                   `Average risk score: ${averageRiskScore}/100.`;

    return {
      totalSpikes: spikes.length,
      spikeBreakdown,
      averageRiskScore,
      summary,
      topSpikes: spikes.slice(0, 5)
    };

  } catch (error) {
    console.error('Volume spike summary error:', error);
    return null;
  }
} 