// Smart Token Filtering System for Newbies
// Following 0rug.com coding guidelines

import { DexscreenerPair } from '@/lib/api/dexscreener';

export interface TokenQuality {
  score: number;
  category: 'DIAMOND' | 'SAFE' | 'RISKY' | 'SCAM';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  reasons: string[];
  warnings: string[];
  recommendation: 'BUY' | 'HOLD' | 'SELL' | 'AVOID';
  confidence: number;
}

export interface NewbieAnalysis {
  simpleExplanation: string;
  shouldIBuy: 'YES' | 'NO' | 'MAYBE';
  whyReason: string;
  riskInPlainEnglish: string;
  whatToWatch: string[];
  redFlags: string[];
  greenFlags: string[];
}

// Advanced filtering algorithm for newbies
export const analyzeTokenForNewbies = (pair: DexscreenerPair): TokenQuality => {
  let score = 0;
  const reasons: string[] = [];
  const warnings: string[] = [];

  // 1. Liquidity Analysis (40% of score)
  if (pair.liquidity.usd > 1000000) {
    score += 40;
    reasons.push('High liquidity - easy to buy/sell');
  } else if (pair.liquidity.usd > 500000) {
    score += 30;
    reasons.push('Good liquidity');
  } else if (pair.liquidity.usd > 100000) {
    score += 20;
    reasons.push('Moderate liquidity');
  } else {
    score += 5;
    warnings.push('Low liquidity - hard to sell');
  }

  // 2. Volume Analysis (25% of score)
  const volumeToLiquidityRatio = pair.volume.h24 / pair.liquidity.usd;
  if (volumeToLiquidityRatio > 10) {
    score += 25;
    reasons.push('High trading activity');
  } else if (volumeToLiquidityRatio > 5) {
    score += 20;
    reasons.push('Good trading volume');
  } else if (volumeToLiquidityRatio > 2) {
    score += 15;
    reasons.push('Moderate trading');
  } else {
    score += 5;
    warnings.push('Low trading volume');
  }

  // 3. Age Analysis (15% of score)
  const ageHours = (Date.now() - pair.pairCreatedAt) / (1000 * 60 * 60);
  if (ageHours > 168) { // 1 week
    score += 15;
    reasons.push('Established token (1+ week old)');
  } else if (ageHours > 72) { // 3 days
    score += 10;
    reasons.push('Mature token (3+ days old)');
  } else if (ageHours > 24) { // 1 day
    score += 5;
    reasons.push('New but not too new');
  } else {
    score += 0;
    warnings.push('Very new token - higher risk');
  }

  // 4. Price Stability (10% of score)
  const priceChange = Math.abs(pair.priceChange.h24);
  if (priceChange < 20) {
    score += 10;
    reasons.push('Stable price movement');
  } else if (priceChange < 50) {
    score += 5;
    reasons.push('Moderate price movement');
  } else {
    score += 0;
    warnings.push('High price volatility');
  }

  // 5. Market Cap Analysis (10% of score)
  if (pair.fdv > 10000000) { // $10M+
    score += 10;
    reasons.push('Established market cap');
  } else if (pair.fdv > 1000000) { // $1M+
    score += 8;
    reasons.push('Good market cap');
  } else if (pair.fdv > 100000) { // $100K+
    score += 5;
    reasons.push('Small but reasonable cap');
  } else {
    score += 2;
    warnings.push('Very small market cap');
  }

  // Determine category and risk level
  let category: TokenQuality['category'];
  let riskLevel: TokenQuality['riskLevel'];
  let recommendation: TokenQuality['recommendation'];
  let confidence: number;

  if (score >= 80) {
    category = 'DIAMOND';
    riskLevel = 'LOW';
    recommendation = 'BUY';
    confidence = 0.9;
  } else if (score >= 60) {
    category = 'SAFE';
    riskLevel = 'LOW';
    recommendation = 'BUY';
    confidence = 0.7;
  } else if (score >= 40) {
    category = 'RISKY';
    riskLevel = 'MEDIUM';
    recommendation = 'HOLD';
    confidence = 0.5;
  } else {
    category = 'SCAM';
    riskLevel = 'HIGH';
    recommendation = 'AVOID';
    confidence = 0.8;
  }

  return {
    score,
    category,
    riskLevel,
    reasons,
    warnings,
    recommendation,
    confidence
  };
};

// Generate newbie-friendly analysis
export const generateNewbieAnalysis = (pair: DexscreenerPair, quality: TokenQuality): NewbieAnalysis => {
  const simpleExplanation = generateSimpleExplanation(pair, quality);
  const shouldIBuy = quality.recommendation === 'BUY' ? 'YES' : quality.recommendation === 'HOLD' ? 'MAYBE' : 'NO';
  const whyReason = generateWhyReason(quality);
  const riskInPlainEnglish = generateRiskExplanation(quality);
  const whatToWatch = generateWatchList(pair, quality);
  const redFlags = quality.warnings;
  const greenFlags = quality.reasons;

  return {
    simpleExplanation,
    shouldIBuy,
    whyReason,
    riskInPlainEnglish,
    whatToWatch,
    redFlags,
    greenFlags
  };
};

// Helper functions for newbie-friendly explanations
function generateSimpleExplanation(pair: DexscreenerPair, quality: TokenQuality): string {
  const price = parseFloat(pair.priceUsd).toFixed(8);
  const change = pair.priceChange.h24 > 0 ? '+' : '';
  
  return `This token is worth $${price} and has moved ${change}${pair.priceChange.h24.toFixed(1)}% in the last 24 hours. It has $${(pair.liquidity.usd / 1000000).toFixed(2)}M in liquidity and $${(pair.volume.h24 / 1000000).toFixed(2)}M in trading volume. Our analysis gives it a ${quality.score}/100 score.`;
}

function generateWhyReason(quality: TokenQuality): string {
  switch (quality.recommendation) {
    case 'BUY':
      return `This token looks good because: ${quality.reasons.slice(0, 3).join(', ')}. It has a ${quality.score}/100 quality score.`;
    case 'HOLD':
      return `This token is okay but risky. ${quality.reasons.length > 0 ? quality.reasons[0] : 'Mixed signals.'} Score: ${quality.score}/100.`;
    case 'AVOID':
      return `We recommend avoiding this token because: ${quality.warnings.slice(0, 3).join(', ')}. Score: ${quality.score}/100.`;
    default:
      return 'Mixed signals on this token.';
  }
}

function generateRiskExplanation(quality: TokenQuality): string {
  switch (quality.riskLevel) {
    case 'LOW':
      return 'This is a relatively safe token with good fundamentals.';
    case 'MEDIUM':
      return 'This token has some risk but could be worth watching.';
    case 'HIGH':
      return 'This token is risky and should be approached with caution.';
    case 'EXTREME':
      return 'This token is very risky and should be avoided.';
    default:
      return 'Risk level unclear.';
  }
}

function generateWatchList(pair: DexscreenerPair, quality: TokenQuality): string[] {
  const watchList: string[] = [];
  
  if (pair.liquidity.usd < 500000) {
    watchList.push('Liquidity levels - make sure you can sell');
  }
  
  if (Math.abs(pair.priceChange.h24) > 50) {
    watchList.push('Price volatility - could swing either way');
  }
  
  if (quality.score < 50) {
    watchList.push('Overall quality score - consider waiting');
  }
  
  return watchList;
}

// Filter tokens for newbies
export const filterTokensForNewbies = (tokens: DexscreenerPair[]): {
  diamonds: DexscreenerPair[];
  safe: DexscreenerPair[];
  trending: DexscreenerPair[];
  avoid: DexscreenerPair[];
} => {
  const analyzed = tokens.map(token => ({
    token,
    quality: analyzeTokenForNewbies(token)
  }));

  return {
    diamonds: analyzed.filter(t => t.quality.category === 'DIAMOND').map(t => t.token),
    safe: analyzed.filter(t => t.quality.category === 'SAFE').map(t => t.token),
    trending: analyzed.filter(t => t.quality.score > 60 && t.token.volume.h24 > 100000).map(t => t.token),
    avoid: analyzed.filter(t => t.quality.category === 'SCAM').map(t => t.token)
  };
}; 