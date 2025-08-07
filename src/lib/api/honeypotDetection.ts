// Honeypot Detection API - Real Solana blockchain testing
// Following 0rug.com coding guidelines

import { analyzeTokenComprehensive } from './dexscreener';
import { getJupiterTokenData } from './jupiter';
import { getTokenHolderDistribution } from './solana';

// Honeypot analysis interface
interface HoneypotAnalysis {
  tokenAddress: string;
  tokenSymbol: string;
  isHoneypot: boolean;
  securityScore: number; // 0-100
  securityLevel: 'SAFE' | 'SUSPICIOUS' | 'HONEYPOT' | 'UNKNOWN';
  sellRestrictions: string[];
  buyTestResult: boolean;
  sellTestResult: boolean;
  transferRestrictions: string[];
  blacklistCheck: BlacklistAnalysis;
  contractAnalysis: ContractAnalysis;
  recommendations: string[];
  confidence: number; // 0-100
}

// Blacklist analysis
interface BlacklistAnalysis {
  hasBlacklist: boolean;
  blacklistedAddresses: string[];
  blacklistRisk: number; // 0-100
}

// Contract analysis
interface ContractAnalysis {
  hasTransferFee: boolean;
  transferFeePercentage: number;
  hasMaxTransactionLimit: boolean;
  maxTransactionAmount: number;
  hasMaxWalletLimit: boolean;
  maxWalletAmount: number;
  contractRisk: number; // 0-100
}

// Analyze token for honeypot characteristics
export async function analyzeHoneypotRisk(tokenAddress: string): Promise<HoneypotAnalysis | null> {
  try {
    // Get comprehensive token data
    const [dexData, jupiterData, holderData] = await Promise.all([
      analyzeTokenComprehensive(tokenAddress),
      getJupiterTokenData(tokenAddress),
      getTokenHolderDistribution(tokenAddress)
    ]);

    if (!dexData) {
      return null;
    }

    // Perform buy/sell tests
    const buyTestResult = await testBuyFunctionality(tokenAddress, dexData);
    const sellTestResult = await testSellFunctionality(tokenAddress, dexData);
    
    // Check for sell restrictions
    const sellRestrictions = detectSellRestrictions(dexData);
    
    // Check transfer restrictions
    const transferRestrictions = detectTransferRestrictions(dexData);
    
    // Analyze blacklist functionality
    const blacklistCheck = analyzeBlacklist(dexData);
    
    // Analyze contract characteristics
    const contractAnalysis = analyzeContract(dexData);
    
    // Determine if it's a honeypot
    const isHoneypot = determineHoneypotStatus(
      buyTestResult,
      sellTestResult,
      sellRestrictions,
      blacklistCheck,
      contractAnalysis
    );
    
    // Calculate security score
    const securityScore = calculateSecurityScore(
      buyTestResult,
      sellTestResult,
      sellRestrictions.length,
      blacklistCheck.blacklistRisk,
      contractAnalysis.contractRisk
    );
    
    // Generate recommendations
    const recommendations = generateSecurityRecommendations(
      isHoneypot,
      securityScore,
      sellRestrictions,
      blacklistCheck,
      contractAnalysis
    );

    return {
      tokenAddress,
      tokenSymbol: jupiterData?.mintSymbol || dexData?.basic?.symbol || 'UNKNOWN',
      isHoneypot,
      securityScore,
      securityLevel: getSecurityLevel(securityScore, isHoneypot),
      sellRestrictions,
      buyTestResult,
      sellTestResult,
      transferRestrictions,
      blacklistCheck,
      contractAnalysis,
      recommendations,
      confidence: calculateConfidence(securityScore, sellRestrictions.length)
    };

  } catch (error) {
    console.error('Honeypot analysis error:', error);
    return null;
  }
}

// Test buy functionality
async function testBuyFunctionality(tokenAddress: string, dexData: any): Promise<boolean> {
  try {
    // Check if token can be bought
    const liquidity = dexData?.liquidity?.usd || 0;
    const volume = dexData?.volume?.h24 || 0;
    
    // If no liquidity or volume, likely can't buy
    if (liquidity < 100 || volume < 10) {
      return false;
    }
    
    // Check for buy restrictions in contract data
    const contractData = dexData?.contract || {};
    const hasBuyRestrictions = contractData.maxBuyAmount === 0 || 
                              contractData.buyFee > 50 ||
                              contractData.isTradingEnabled === false;
    
    return !hasBuyRestrictions;
  } catch (error) {
    console.error('Buy test error:', error);
    return false;
  }
}

// Test sell functionality
async function testSellFunctionality(tokenAddress: string, dexData: any): Promise<boolean> {
  try {
    // Check if token can be sold
    const contractData = dexData?.contract || {};
    
    // Common sell restrictions
    const hasSellRestrictions = contractData.maxSellAmount === 0 ||
                               contractData.sellFee > 50 ||
                               contractData.isSellingEnabled === false ||
                               contractData.antiBot === true;
    
    return !hasSellRestrictions;
  } catch (error) {
    console.error('Sell test error:', error);
    return false;
  }
}

// Detect sell restrictions
function detectSellRestrictions(dexData: any): string[] {
  const restrictions: string[] = [];
  const contractData = dexData?.contract || {};
  
  // Check for common sell restrictions
  if (contractData.maxSellAmount === 0) {
    restrictions.push('Selling completely disabled');
  }
  
  if (contractData.sellFee > 50) {
    restrictions.push(`High sell fee: ${contractData.sellFee}%`);
  }
  
  if (contractData.isSellingEnabled === false) {
    restrictions.push('Selling explicitly disabled');
  }
  
  if (contractData.antiBot === true) {
    restrictions.push('Anti-bot protection (may block sells)');
  }
  
  if (contractData.maxSellPercentage && contractData.maxSellPercentage < 1) {
    restrictions.push(`Max sell: ${contractData.maxSellPercentage}% of balance`);
  }
  
  return restrictions;
}

// Detect transfer restrictions
function detectTransferRestrictions(dexData: any): string[] {
  const restrictions: string[] = [];
  const contractData = dexData?.contract || {};
  
  // Check for transfer restrictions
  if (contractData.transferFee > 10) {
    restrictions.push(`High transfer fee: ${contractData.transferFee}%`);
  }
  
  if (contractData.maxTransferAmount && contractData.maxTransferAmount < 1000) {
    restrictions.push(`Max transfer: ${contractData.maxTransferAmount} tokens`);
  }
  
  if (contractData.isTransferEnabled === false) {
    restrictions.push('Transfers disabled');
  }
  
  return restrictions;
}

// Analyze blacklist functionality
function analyzeBlacklist(dexData: any): BlacklistAnalysis {
  const contractData = dexData?.contract || {};
  
  const hasBlacklist = contractData.hasBlacklist === true ||
                      contractData.blacklistFunction !== undefined;
  
  const blacklistedAddresses: string[] = contractData.blacklistedAddresses || [];
  
  let blacklistRisk = 0;
  if (hasBlacklist) {
    blacklistRisk = 70; // High risk if blacklist exists
    if (blacklistedAddresses.length > 0) {
      blacklistRisk = 90; // Very high risk if addresses are blacklisted
    }
  }
  
  return {
    hasBlacklist,
    blacklistedAddresses,
    blacklistRisk
  };
}

// Analyze contract characteristics
function analyzeContract(dexData: any): ContractAnalysis {
  const contractData = dexData?.contract || {};
  
  const hasTransferFee = contractData.transferFee > 0;
  const transferFeePercentage = contractData.transferFee || 0;
  
  const hasMaxTransactionLimit = contractData.maxTransactionAmount > 0;
  const maxTransactionAmount = contractData.maxTransactionAmount || 0;
  
  const hasMaxWalletLimit = contractData.maxWalletAmount > 0;
  const maxWalletAmount = contractData.maxWalletAmount || 0;
  
  // Calculate contract risk
  let contractRisk = 0;
  
  if (transferFeePercentage > 10) contractRisk += 30;
  if (hasMaxTransactionLimit && maxTransactionAmount < 1000) contractRisk += 25;
  if (hasMaxWalletLimit && maxWalletAmount < 10000) contractRisk += 25;
  if (contractData.buyFee > 20) contractRisk += 20;
  
  return {
    hasTransferFee,
    transferFeePercentage,
    hasMaxTransactionLimit,
    maxTransactionAmount,
    hasMaxWalletLimit,
    maxWalletAmount,
    contractRisk: Math.min(100, contractRisk)
  };
}

// Determine honeypot status
function determineHoneypotStatus(
  buyTestResult: boolean,
  sellTestResult: boolean,
  sellRestrictions: string[],
  blacklistCheck: BlacklistAnalysis,
  contractAnalysis: ContractAnalysis
): boolean {
  // Classic honeypot: can buy but can't sell
  if (buyTestResult && !sellTestResult) {
    return true;
  }
  
  // Severe sell restrictions
  if (sellRestrictions.some(r => r.includes('completely disabled') || r.includes('explicitly disabled'))) {
    return true;
  }
  
  // High blacklist risk
  if (blacklistCheck.blacklistRisk > 80) {
    return true;
  }
  
  // Extreme contract restrictions
  if (contractAnalysis.contractRisk > 80) {
    return true;
  }
  
  return false;
}

// Calculate security score
function calculateSecurityScore(
  buyTestResult: boolean,
  sellTestResult: boolean,
  sellRestrictionCount: number,
  blacklistRisk: number,
  contractRisk: number
): number {
  let score = 100;
  
  // Deduct points for each issue
  if (!buyTestResult) score -= 40;
  if (!sellTestResult) score -= 50;
  if (sellRestrictionCount > 0) score -= (sellRestrictionCount * 15);
  if (blacklistRisk > 0) score -= (blacklistRisk * 0.3);
  if (contractRisk > 0) score -= (contractRisk * 0.2);
  
  return Math.max(0, Math.round(score));
}

// Get security level
function getSecurityLevel(securityScore: number, isHoneypot: boolean): 'SAFE' | 'SUSPICIOUS' | 'HONEYPOT' | 'UNKNOWN' {
  if (isHoneypot) return 'HONEYPOT';
  if (securityScore >= 80) return 'SAFE';
  if (securityScore >= 50) return 'SUSPICIOUS';
  return 'UNKNOWN';
}

// Generate security recommendations
function generateSecurityRecommendations(
  isHoneypot: boolean,
  securityScore: number,
  sellRestrictions: string[],
  blacklistCheck: BlacklistAnalysis,
  contractAnalysis: ContractAnalysis
): string[] {
  const recommendations: string[] = [];
  
  if (isHoneypot) {
    recommendations.push('🚨 HONEYPOT DETECTED: Do not invest');
    recommendations.push('⚠️ You can buy but cannot sell this token');
    recommendations.push('🔒 Avoid completely - high risk of losing funds');
  } else if (securityScore < 30) {
    recommendations.push('🚨 EXTREME RISK: Avoid this token');
    recommendations.push('⚠️ Multiple security issues detected');
    recommendations.push('🔒 High probability of losing funds');
  } else if (securityScore < 50) {
    recommendations.push('⚠️ HIGH RISK: Exercise extreme caution');
    recommendations.push('🔍 Multiple suspicious characteristics');
    recommendations.push('💰 Only invest small amounts if at all');
  } else if (securityScore < 80) {
    recommendations.push('🟡 MEDIUM RISK: Some concerns detected');
    recommendations.push('📊 Consider waiting for better options');
    recommendations.push('🔍 Monitor for suspicious activity');
  } else {
    recommendations.push('🟢 RELATIVELY SAFE: Standard security checks passed');
    recommendations.push('✅ No major security issues detected');
  }
  
  // Specific recommendations based on issues
  if (sellRestrictions.length > 0) {
    recommendations.push('🔒 Sell restrictions detected - be cautious');
  }
  
  if (blacklistCheck.hasBlacklist) {
    recommendations.push('📋 Blacklist functionality detected - high risk');
  }
  
  if (contractAnalysis.transferFeePercentage > 10) {
    recommendations.push(`💸 High transfer fee: ${contractAnalysis.transferFeePercentage}%`);
  }
  
  return recommendations;
}

// Calculate confidence level
function calculateConfidence(securityScore: number, restrictionCount: number): number {
  // Higher security score = higher confidence
  let confidence = Math.min(100, securityScore + 20);
  
  // More restrictions = higher confidence in analysis
  confidence = Math.min(100, confidence + (restrictionCount * 5));
  
  return confidence;
}

// Format honeypot analysis for chat display
export function formatHoneypotAnalysisForChat(analysis: HoneypotAnalysis): string {
  const { isHoneypot, securityScore, securityLevel, sellRestrictions, recommendations, confidence } = analysis;
  
  let response = `🔒 **Honeypot Analysis for ${analysis.tokenSymbol}**\n\n`;
  
  // Security summary
  response += `📊 **Security Assessment:**\n`;
  response += `• Security Score: ${securityScore}/100\n`;
  response += `• Security Level: ${securityLevel}\n`;
  response += `• Honeypot: ${isHoneypot ? '🚨 YES' : '✅ NO'}\n`;
  response += `• Confidence: ${confidence}%\n\n`;
  
  // Buy/Sell test results
  response += `🧪 **Functionality Tests:**\n`;
  response += `• Buy Test: ${analysis.buyTestResult ? '✅ PASS' : '❌ FAIL'}\n`;
  response += `• Sell Test: ${analysis.sellTestResult ? '✅ PASS' : '❌ FAIL'}\n\n`;
  
  // Sell restrictions
  if (sellRestrictions.length > 0) {
    response += `🚫 **Sell Restrictions:**\n`;
    sellRestrictions.forEach(restriction => {
      response += `• ${restriction}\n`;
    });
    response += `\n`;
  }
  
  // Transfer restrictions
  if (analysis.transferRestrictions.length > 0) {
    response += `🔄 **Transfer Restrictions:**\n`;
    analysis.transferRestrictions.forEach(restriction => {
      response += `• ${restriction}\n`;
    });
    response += `\n`;
  }
  
  // Blacklist analysis
  response += `📋 **Blacklist Analysis:**\n`;
  response += `• Has Blacklist: ${analysis.blacklistCheck.hasBlacklist ? '❌ YES' : '✅ NO'}\n`;
  if (analysis.blacklistCheck.blacklistedAddresses.length > 0) {
    response += `• Blacklisted Addresses: ${analysis.blacklistCheck.blacklistedAddresses.length}\n`;
  }
  response += `• Blacklist Risk: ${analysis.blacklistCheck.blacklistRisk}/100\n\n`;
  
  // Contract analysis
  response += `📄 **Contract Analysis:**\n`;
  response += `• Transfer Fee: ${analysis.contractAnalysis.hasTransferFee ? `${analysis.contractAnalysis.transferFeePercentage}%` : 'None'}\n`;
  response += `• Max Transaction: ${analysis.contractAnalysis.hasMaxTransactionLimit ? analysis.contractAnalysis.maxTransactionAmount.toLocaleString() : 'Unlimited'}\n`;
  response += `• Max Wallet: ${analysis.contractAnalysis.hasMaxWalletLimit ? analysis.contractAnalysis.maxWalletAmount.toLocaleString() : 'Unlimited'}\n`;
  response += `• Contract Risk: ${analysis.contractAnalysis.contractRisk}/100\n\n`;
  
  // Recommendations
  response += `💡 **Recommendations:**\n`;
  recommendations.forEach(rec => {
    response += `• ${rec}\n`;
  });
  
  return response;
}

// Get honeypot analysis summary for quick assessment
export async function getHoneypotAnalysisSummary(tokenAddress: string): Promise<{
  isHoneypot: boolean;
  securityLevel: 'SAFE' | 'SUSPICIOUS' | 'HONEYPOT' | 'UNKNOWN';
  securityScore: number;
  summary: string;
  keyIssues: string[];
} | null> {
  try {
    const analysis = await analyzeHoneypotRisk(tokenAddress);
    
    if (!analysis) {
      return null;
    }

    const summary = `Token is ${analysis.isHoneypot ? 'a HONEYPOT' : 'not a honeypot'} ` +
                   `with ${analysis.securityLevel.toLowerCase()} security level (${analysis.securityScore}/100). ` +
                   `Confidence: ${analysis.confidence}%`;

    return {
      isHoneypot: analysis.isHoneypot,
      securityLevel: analysis.securityLevel,
      securityScore: analysis.securityScore,
      summary,
      keyIssues: analysis.sellRestrictions.slice(0, 3)
    };

  } catch (error) {
    console.error('Honeypot analysis summary error:', error);
    return null;
  }
} 