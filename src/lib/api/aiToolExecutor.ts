// AI Tool Executor - Routes user requests to appropriate analysis functions
// Following 0rug.com coding guidelines

import { classifyIntent, getAIGuidance, getToolPriority, getResponseTemplate } from './intentClassifier';
import { smartTokenResolution, smartLPResolution, smartWalletAnalysis, smartVolumeSpikeDetection, generateSmartAIResponse } from './smartRouter';
import { SmartRouterTracker } from './smartRouter';

interface ToolExecutionResult {
  success: boolean;
  response: string;
  data?: any;
  source: string;
  fallbackUsed: boolean;
  error?: string;
}

// Execute tools based on user intent
export async function executeToolsForIntent(
  message: string,
  config: { enablePaidAPIs?: boolean; personaEnabled?: boolean } = {}
): Promise<ToolExecutionResult> {
  try {
    // Classify user intent
    const intentResult = classifyIntent(message);
    const { intent, parameters, confidence } = intentResult;
    
    console.log(`Intent classified: ${intent} (confidence: ${confidence})`);
    console.log(`Parameters:`, parameters);
    console.log(`Token address from parameters:`, parameters.tokenAddress);

    // Get tool priority for this intent
    const toolPriority = getToolPriority(intent);
    const aiGuidance = getAIGuidance(intent);

    // Check if we should use paid APIs
    const enablePaidAPIs = config.enablePaidAPIs !== false && SmartRouterTracker.isWithinLimit('paid');

    // Execute based on intent
    switch (intent) {
      case 'token_analysis':
        // If no token address was extracted but we have a token_analysis intent, try to extract from original message
        let tokenAddress = parameters.tokenAddress;
        if (!tokenAddress && intent === 'token_analysis') {
          const fallbackMatch = message.match(/([1-9A-HJ-NP-Za-km-z]{32,44})/);
          if (fallbackMatch) {
            tokenAddress = fallbackMatch[1];
            console.log('Fallback token address extraction:', tokenAddress);
          }
        }
        return await executeTokenAnalysis(tokenAddress, enablePaidAPIs);

      case 'lp_lock_check':
        return await executeLPLockCheck(parameters.tokenAddress, enablePaidAPIs);

      case 'holder_analysis':
        return await executeHolderAnalysis(parameters.tokenAddress, enablePaidAPIs);

      case 'rug_pull_detection':
        return await executeRugPullDetection(parameters.tokenAddress, enablePaidAPIs);

      case 'honeypot_detection':
        return await executeHoneypotDetection(parameters.tokenAddress, enablePaidAPIs);

      case 'new_token_detection':
        return await executeNewTokenDetection(enablePaidAPIs);

      case 'volume_spike_detection':
        return await executeVolumeSpikeDetection(enablePaidAPIs);

      case 'whale_tracking':
        return await executeWhaleTracking(parameters.walletAddress || parameters.tokenAddress, enablePaidAPIs);

      case 'trending_tokens':
        return await executeTrendingTokens(enablePaidAPIs);

      case 'educational':
        return await executeEducationalContent(message);

      case 'risk_scoring':
        return await executeRiskScoring(parameters.tokenAddress, enablePaidAPIs);

      case 'token_metadata':
        return await executeTokenMetadata(parameters.tokenAddress, enablePaidAPIs);

      default:
        return await executeTokenAnalysis(parameters.tokenAddress, enablePaidAPIs);
    }
  } catch (error) {
    console.error('Tool execution error:', error);
    return {
      success: false,
      response: 'I encountered an error while processing your request. Please try again.',
      source: 'error',
      fallbackUsed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Execute token analysis
async function executeTokenAnalysis(tokenAddress: string, enablePaidAPIs: boolean): Promise<ToolExecutionResult> {
  console.log('executeTokenAnalysis called with tokenAddress:', tokenAddress);
  
  if (!tokenAddress) {
    console.log('No token address provided, returning error');
    return {
      success: false,
      response: 'Please provide a token address to analyze.',
      source: 'error',
      fallbackUsed: false
    };
  }

  try {
    // Try smart token resolution first
    const resolution = await smartTokenResolution(tokenAddress, { enablePaidAPIs });
    
    if (resolution.success) {
      const metadata = resolution.data;
      
      // Get additional data from DexScreener
      const dexScreenerData = await getDexScreenerData(tokenAddress);
      
      // Format numbers with proper suffixes
      const formatNumber = (num: number | string | undefined): string => {
        if (!num || isNaN(Number(num))) return 'N/A';
        const value = Number(num);
        
        if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
        if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
        if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
        return `$${value.toFixed(2)}`;
      };

      // Generate meme personality based on token symbol
      const getMemePersonality = (symbol: string) => {
        const lowerSymbol = symbol.toLowerCase();
        
        if (lowerSymbol.includes('bonk')) {
          return {
            greeting: "Yo! I'm BONK 🐶 — Solana's wildest memecoin!",
            style: "doge",
            emoji: "🐶"
          };
        } else if (lowerSymbol.includes('pepe')) {
          return {
            greeting: "Ribbit! I'm PEPE 🐸 — the OG meme lord!",
            style: "pepe",
            emoji: "🐸"
          };
        } else if (lowerSymbol.includes('doge')) {
          return {
            greeting: "Much wow! I'm DOGE 🐕 — such token, very meme!",
            style: "doge",
            emoji: "🐕"
          };
        } else if (lowerSymbol.includes('shib')) {
          return {
            greeting: "Woof! I'm SHIB 🐕 — the people's token!",
            style: "shib",
            emoji: "🐕"
          };
        } else if (lowerSymbol.includes('moon')) {
          return {
            greeting: "🚀 To the moon! I'm ${symbol} — ready to blast off!",
            style: "moon",
            emoji: "🚀"
          };
        } else if (lowerSymbol.includes('inu')) {
          return {
            greeting: "Arf! I'm ${symbol} 🐕 — the goodest boy in crypto!",
            style: "inu",
            emoji: "🐕"
          };
        } else if (lowerSymbol.includes('cat')) {
          return {
            greeting: "Meow! I'm ${symbol} 🐱 — purr-fectly meme-worthy!",
            style: "cat",
            emoji: "🐱"
          };
        } else {
          // Default personality for other tokens
          const personalities = [
            { greeting: `Hey fren! I'm ${symbol} 🚀 — let's get this bread!`, emoji: "🚀" },
            { greeting: `Yo! I'm ${symbol} 💎 — diamond hands only!`, emoji: "💎" },
            { greeting: `What's good! I'm ${symbol} 🔥 — keeping it hot!`, emoji: "🔥" },
            { greeting: `Ayy! I'm ${symbol} ⚡ — lightning fast gains!`, emoji: "⚡" },
            { greeting: `Sup! I'm ${symbol} 🌙 — moon mission activated!`, emoji: "🌙" }
          ];
          return personalities[Math.floor(Math.random() * personalities.length)];
        }
      };

      const personality = getMemePersonality(metadata.symbol);
      
      // Format price change with emoji
      const getPriceChangeEmoji = (change: number) => {
        if (change > 100) return "🚀🚀🚀";
        if (change > 50) return "🚀🚀";
        if (change > 20) return "🚀";
        if (change > 0) return "📈";
        if (change < -50) return "💀";
        if (change < -20) return "📉";
        return "➡️";
      };

      const priceChange = dexScreenerData?.priceChange?.h24;
      const priceEmoji = priceChange ? getPriceChangeEmoji(priceChange) : "";

      const response = `${personality.greeting} ${personality.emoji}

Here's my analysis, fren! 📊

**${metadata.symbol} Stats:**
• Name: ${metadata.name}
• Symbol: ${metadata.symbol}
• Verified: ${metadata.verified ? '✅ Yes' : '❌ No'}

${dexScreenerData ? `
**Market Vibes:**
• Price: $${dexScreenerData.priceUsd || 'N/A'}
• 24h Change: ${priceChange || 'N/A'}% ${priceEmoji}
• Market Cap: ${formatNumber(dexScreenerData.marketCap)}
• Volume (24h): ${formatNumber(dexScreenerData.volume?.h24)}
• Liquidity: ${formatNumber(dexScreenerData.liquidity?.usd)}

${priceChange > 100 ? "🚀🚀🚀 ABSOLUTE MADNESS! This is going parabolic! 🚀🚀🚀" : ""}
${priceChange > 50 ? "🚀🚀 Looking bullish af! 🚀🚀" : ""}
${priceChange > 20 ? "🚀 Nice gains! 🚀" : ""}
${priceChange < -20 ? "💀 Rough day, but we'll bounce back! 💀" : ""}
` : ''}

*Source: ${resolution.source}*`;

      return {
        success: true,
        response,
        data: { metadata, dexScreenerData },
        source: resolution.source,
        fallbackUsed: resolution.fallbackUsed
      };
    }

    return {
      success: false,
      response: 'I couldn\'t find data for this token. Please check the address and try again.',
      source: 'none',
      fallbackUsed: true
    };
  } catch (error) {
    return {
      success: false,
      response: 'Error analyzing token. Please try again.',
      source: 'error',
      fallbackUsed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Execute LP lock check
async function executeLPLockCheck(tokenAddress: string, enablePaidAPIs: boolean): Promise<ToolExecutionResult> {
  if (!tokenAddress) {
    return {
      success: false,
      response: 'Please provide a token address to check LP lock status.',
      source: 'error',
      fallbackUsed: false
    };
  }

  try {
    const lpResolution = await smartLPResolution(tokenAddress, { enablePaidAPIs });
    
    if (lpResolution.success) {
      const lpData = lpResolution.data;
      
      const response = `**LP Lock Analysis** 🔒

**Pool Information:**
• Pool Address: ${lpData.poolAddress}
• Base Token: ${lpData.baseToken}
• Quote Token: ${lpData.quoteToken}
• Liquidity: $${lpData.liquidity || 'N/A'}

**Lock Status:** ${lpData.liquidity > 0 ? '✅ Liquidity Found' : '⚠️ Low Liquidity'}

*Source: ${lpResolution.source}*`;

      return {
        success: true,
        response,
        data: lpData,
        source: lpResolution.source,
        fallbackUsed: lpResolution.fallbackUsed
      };
    }

    return {
      success: false,
      response: 'I couldn\'t find LP data for this token. It may not have liquidity pools yet.',
      source: 'none',
      fallbackUsed: true
    };
  } catch (error) {
    return {
      success: false,
      response: 'Error checking LP lock status. Please try again.',
      source: 'error',
      fallbackUsed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Execute holder analysis
async function executeHolderAnalysis(tokenAddress: string, enablePaidAPIs: boolean): Promise<ToolExecutionResult> {
  if (!tokenAddress) {
    return {
      success: false,
      response: 'Please provide a token address to analyze holders.',
      source: 'error',
      fallbackUsed: false
    };
  }

  try {
    const walletAnalysis = await smartWalletAnalysis(tokenAddress, { enablePaidAPIs });
    
    if (walletAnalysis.success) {
      const holderData = walletAnalysis.data;
      
      const response = `**Holder Analysis** 👥

**Holder Distribution:**
• Total Holders: ${holderData.totalHolders || 'N/A'}
• Top 10 Holders: ${holderData.topHolders?.length || 0}
• Concentration: ${holderData.concentration || 'N/A'}

${holderData.topHolders ? `
**Top Holders:**
${holderData.topHolders.slice(0, 5).map((holder: any, index: number) => 
  `${index + 1}. ${holder.address.slice(0, 8)}...${holder.address.slice(-8)} - ${holder.percentage}%`
).join('\n')}
` : ''}

*Source: ${walletAnalysis.source}*`;

      return {
        success: true,
        response,
        data: holderData,
        source: walletAnalysis.source,
        fallbackUsed: walletAnalysis.fallbackUsed
      };
    }

    return {
      success: false,
      response: 'I couldn\'t find holder data for this token.',
      source: 'none',
      fallbackUsed: true
    };
  } catch (error) {
    return {
      success: false,
      response: 'Error analyzing holders. Please try again.',
      source: 'error',
      fallbackUsed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Execute rug pull detection
async function executeRugPullDetection(tokenAddress: string, enablePaidAPIs: boolean): Promise<ToolExecutionResult> {
  if (!tokenAddress) {
    return {
      success: false,
      response: 'Please provide a token address to check for rug pull risks.',
      source: 'error',
      fallbackUsed: false
    };
  }

  try {
    const { analyzeRugPullRisk } = await import('./rugAnalysis');
    const rugAnalysis = await analyzeRugPullRisk(tokenAddress);
    
    if (!rugAnalysis) {
      return {
        success: false,
        response: 'Error analyzing rug pull risks. Please try again.',
        source: 'error',
        fallbackUsed: false
      };
    }
    
    const response = `**Rug Pull Risk Assessment** ⚠️

**Risk Score: ${rugAnalysis.riskScore}/100**

**Risk Factors:**
${rugAnalysis.riskFactors.map((factor: any) => 
  `• ${factor.factor}: ${factor.score}/10 - ${factor.description}`
).join('\n')}

**Overall Assessment:** Risk assessment completed

**Recommendation:** ${rugAnalysis.recommendations || 'Exercise caution and DYOR'}

*Source: rugAnalysis + smartRouter*`;

    return {
      success: true,
      response,
      data: rugAnalysis,
      source: 'rugAnalysis',
      fallbackUsed: false
    };
  } catch (error) {
    return {
      success: false,
      response: 'Error analyzing rug pull risks. Please try again.',
      source: 'error',
      fallbackUsed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Execute honeypot detection
async function executeHoneypotDetection(tokenAddress: string, enablePaidAPIs: boolean): Promise<ToolExecutionResult> {
  if (!tokenAddress) {
    return {
      success: false,
      response: 'Please provide a token address to check for honeypot characteristics.',
      source: 'error',
      fallbackUsed: false
    };
  }

  try {
    const { analyzeHoneypotRisk } = await import('./honeypotDetection');
    const honeypotAnalysis = await analyzeHoneypotRisk(tokenAddress);
    
    if (!honeypotAnalysis) {
      return {
        success: false,
        response: 'Error checking honeypot status. Please try again.',
        source: 'error',
        fallbackUsed: false
      };
    }
    
    const response = `**Honeypot Detection** 🍯

**Sellability Test:** ${honeypotAnalysis.sellTestResult ? '✅ Can Sell' : '❌ Cannot Sell'}

**Risk Factors:**
${honeypotAnalysis.sellRestrictions.map((restriction: string) => 
  `• ${restriction}`
).join('\n')}

**Overall Assessment:** Honeypot analysis completed

**Recommendation:** ${honeypotAnalysis.recommendations || 'Test sellability before investing'}

*Source: honeypotDetection + smartRouter*`;

    return {
      success: true,
      response,
      data: honeypotAnalysis,
      source: 'honeypotDetection',
      fallbackUsed: false
    };
  } catch (error) {
    return {
      success: false,
      response: 'Error checking honeypot status. Please try again.',
      source: 'error',
      fallbackUsed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Execute new token detection
async function executeNewTokenDetection(enablePaidAPIs: boolean): Promise<ToolExecutionResult> {
  try {
    const { getNewTokensLastHour } = await import('./newTokenDetection');
    const newTokens = await getNewTokensLastHour();
    
    const response = `**New Token Detection** 🆕

**Recently Launched Tokens:**
${newTokens.slice(0, 5).map((token: any, index: number) => 
  `${index + 1}. **${token.symbol}** (${token.name})
   • Address: ${token.address}
   • Launch Time: ${token.launchTime}
   • Initial Price: $${token.initialPrice || 'N/A'}
   • Current Price: $${token.currentPrice || 'N/A'}`
).join('\n\n')}

*Found ${newTokens.length} new tokens in the last hour*

*Source: newTokenDetection + smartRouter*`;

    return {
      success: true,
      response,
      data: newTokens,
      source: 'newTokenDetection',
      fallbackUsed: false
    };
  } catch (error) {
    return {
      success: false,
      response: 'Error detecting new tokens. Please try again.',
      source: 'error',
      fallbackUsed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Execute volume spike detection
async function executeVolumeSpikeDetection(enablePaidAPIs: boolean): Promise<ToolExecutionResult> {
  try {
    const volumeSpikes = await smartVolumeSpikeDetection({ enablePaidAPIs });
    
    if (volumeSpikes.success) {
      const spikes = volumeSpikes.data;
      
      const response = `**Volume Spike Detection** 📈

**Tokens with Unusual Volume:**
${spikes.slice(0, 5).map((token: any, index: number) => 
  `${index + 1}. **${token.baseToken.symbol}**
   • Price Change: ${token.priceChange?.h24 || 'N/A'}%
   • Volume (24h): $${token.volume?.h24 || 'N/A'}
   • Market Cap: $${token.marketCap || 'N/A'}`
).join('\n\n')}

*Source: ${volumeSpikes.source}*`;

      return {
        success: true,
        response,
        data: spikes,
        source: volumeSpikes.source,
        fallbackUsed: volumeSpikes.fallbackUsed
      };
    }

    return {
      success: false,
      response: 'I couldn\'t find volume spike data at the moment.',
      source: 'none',
      fallbackUsed: true
    };
  } catch (error) {
    return {
      success: false,
      response: 'Error detecting volume spikes. Please try again.',
      source: 'error',
      fallbackUsed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Execute whale tracking
async function executeWhaleTracking(address: string, enablePaidAPIs: boolean): Promise<ToolExecutionResult> {
  if (!address) {
    return {
      success: false,
      response: 'Please provide a wallet address to track.',
      source: 'error',
      fallbackUsed: false
    };
  }

  try {
    const { getWhaleActivityToday } = await import('./whaleTracking');
    const whaleData = await getWhaleActivityToday();
    
    const response = `**Whale Activity Tracking** 🐋

**Recent Large Transactions:**
${whaleData.slice(0, 5).map((tx: any, index: number) => 
  `${index + 1}. **${tx.tokenSymbol}** - $${tx.amount}
   • From: ${tx.from.slice(0, 8)}...${tx.from.slice(-8)}
   • To: ${tx.to.slice(0, 8)}...${tx.to.slice(-8)}
   • Time: ${tx.timestamp}`
).join('\n\n')}

*Source: whaleTracking + smartRouter*`;

    return {
      success: true,
      response,
      data: whaleData,
      source: 'whaleTracking',
      fallbackUsed: false
    };
  } catch (error) {
    return {
      success: false,
      response: 'Error tracking whale activity. Please try again.',
      source: 'error',
      fallbackUsed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Execute trending tokens
async function executeTrendingTokens(enablePaidAPIs: boolean): Promise<ToolExecutionResult> {
  try {
    const response = await fetch('https://api.dexscreener.com/latest/dex/search?q=solana');
    const data = await response.json();
    
    const trendingTokens = data.pairs?.slice(0, 10) || [];
    
    const responseText = `**Trending Tokens** 🔥

**Top Trending on Solana:**
${trendingTokens.map((token: any, index: number) => 
  `${index + 1}. **${token.baseToken.symbol}** (${token.baseToken.name})
   • Price: $${token.priceUsd || 'N/A'}
   • 24h Change: ${token.priceChange?.h24 || 'N/A'}%
   • Volume: $${token.volume?.h24 || 'N/A'}
   • Market Cap: $${token.marketCap || 'N/A'}`
).join('\n\n')}

*Source: DexScreener*`;

    return {
      success: true,
      response: responseText,
      data: trendingTokens,
      source: 'dexscreeener',
      fallbackUsed: false
    };
  } catch (error) {
    return {
      success: false,
      response: 'Error fetching trending tokens. Please try again.',
      source: 'error',
      fallbackUsed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Execute educational content
async function executeEducationalContent(message: string): Promise<ToolExecutionResult> {
  const lowerMessage = message.toLowerCase();
  
  // Import the educational functions
  const { generateEducationalResponse, getEducationalContent, generatePersonalizedAdvice } = await import('./educationalKB');
  
  let educationalResponse = '';
  let topic = '';
  
  // Determine the educational topic based on message content
  if (lowerMessage.includes('good token') || lowerMessage.includes('what should') || lowerMessage.includes('look for')) {
    topic = 'good_token_guide';
  } else if (lowerMessage.includes('rug') || lowerMessage.includes('scam') || lowerMessage.includes('spot')) {
    topic = 'rugpull_detection';
  } else if (lowerMessage.includes('honeypot')) {
    topic = 'rugpull_detection'; // Honeypot info is in rugpull detection
  } else if (lowerMessage.includes('teach') || lowerMessage.includes('learn') || lowerMessage.includes('guide')) {
    topic = 'good_token_guide'; // Default to general guide
  } else {
    // Default educational content
    educationalResponse = `**🎓 Crypto Trading Education** 📚

**🔍 What Should You Look For In A Good Token?**

**🔐 Security First:**
• LP locked for 6+ months
• Contract ownership renounced
• No honeypot functions
• Transparent team

**💰 Tokenomics:**
• Even distribution (top holder < 10%)
• Low, transparent taxes (< 10%)
• Clear utility and roadmap
• Real partnerships

**📊 Market Health:**
• High liquidity relative to market cap
• Organic volume growth
• Realistic valuation
• Active community

**💡 Pro Tips:**
• Always DYOR (Do Your Own Research)
• Start with security checks
• Compare to successful tokens
• Never invest more than you can afford to lose

**Want to learn more about a specific topic? Ask me about:**
• "How to spot rugpulls"
• "What makes a good token"
• "How to analyze tokenomics"

**Remember: Crypto is highly volatile and risky!** 🚨`;
    
    return {
      success: true,
      response: educationalResponse,
      data: null,
      source: 'educational',
      fallbackUsed: false
    };
  }
  
  // Get educational content for the specific topic
  const content = getEducationalContent(topic);
  if (content) {
    educationalResponse = content.content;
    
    // Add personalized advice based on user experience level
    // For now, we'll add beginner-friendly advice
    const personalizedAdvice = generatePersonalizedAdvice('beginner');
    
    educationalResponse += `\n\n${personalizedAdvice}`;
  } else {
    educationalResponse = generateEducationalResponse(topic);
  }
  
  // Add DYOR warning
  educationalResponse += `\n\n⚠️ **Always DYOR (Do Your Own Research). Crypto is risky. Never invest more than you can afford to lose!** 💪`;

  return {
    success: true,
    response: educationalResponse,
    data: { topic, checklist: content?.checklist || [] },
    source: 'educational',
    fallbackUsed: false
  };
}

// Execute risk scoring
async function executeRiskScoring(tokenAddress: string, enablePaidAPIs: boolean): Promise<ToolExecutionResult> {
  if (!tokenAddress) {
    return {
      success: false,
      response: 'Please provide a token address to calculate risk score.',
      source: 'error',
      fallbackUsed: false
    };
  }

  try {
    // Import risk scorer
    const { getTokenRiskScore } = await import('./riskScorer');
    
    const riskScore = await getTokenRiskScore(tokenAddress);
    
    if (!riskScore) {
      return {
        success: false,
        response: 'Unable to calculate risk score for this token. Please try again.',
        source: 'error',
        fallbackUsed: false
      };
    }

    // Format the risk score response
    const response = formatRiskScoreResponse(riskScore);
    
    return {
      success: true,
      response,
      data: riskScore,
      source: 'riskScorer',
      fallbackUsed: false
    };
  } catch (error) {
    return {
      success: false,
      response: 'Error calculating risk score. Please try again.',
      source: 'error',
      fallbackUsed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Execute token metadata
async function executeTokenMetadata(tokenAddress: string, enablePaidAPIs: boolean): Promise<ToolExecutionResult> {
  if (!tokenAddress) {
    return {
      success: false,
      response: 'Please provide a token address to get metadata.',
      source: 'error',
      fallbackUsed: false
    };
  }

  try {
    const aiResponse = await generateSmartAIResponse(tokenAddress, 'metadata', { enablePaidAPIs });
    
    return {
      success: true,
      response: aiResponse,
      data: null,
      source: 'tokenRegistry',
      fallbackUsed: false
    };
  } catch (error) {
    return {
      success: false,
      response: 'Error getting token metadata. Please try again.',
      source: 'error',
      fallbackUsed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Format risk score response
function formatRiskScoreResponse(riskScore: any): string {
  const { overallScore, riskLevel, factors, summary, recommendations, color } = riskScore;
  
  let response = `${summary}\n\n`;
  
  // Add risk factors breakdown
  response += `**🔍 Risk Factor Breakdown:**\n\n`;
  
  // Group factors by category
  const categories = ['security', 'tokenomics', 'market', 'community', 'technical'];
  const categoryIcons = {
    security: '🔐',
    tokenomics: '💰',
    market: '📊',
    community: '👥',
    technical: '📈'
  };
  
  categories.forEach(category => {
    const categoryFactors = factors.filter((f: any) => f.category === category);
    if (categoryFactors.length > 0) {
      response += `${categoryIcons[category as keyof typeof categoryIcons]} **${category.charAt(0).toUpperCase() + category.slice(1)}:**\n`;
      categoryFactors.forEach((factor: any) => {
        const scoreIcon = factor.score >= 80 ? '✅' : factor.score >= 50 ? '⚠️' : '❌';
        response += `  ${scoreIcon} ${factor.name}: ${factor.score}/100\n`;
        response += `     ${factor.description}\n`;
      });
      response += '\n';
    }
  });
  
  // Add recommendations
  if (recommendations.length > 0) {
    response += `**💡 Recommendations:**\n`;
    recommendations.forEach((rec: any) => {
      response += `• ${rec}\n`;
    });
    response += '\n';
  }
  
  // Add final warning
  response += `⚠️ **Always DYOR (Do Your Own Research). This analysis is for informational purposes only.**`;
  
  return response;
}

// Helper function to get DexScreener data
async function getDexScreenerData(tokenAddress: string) {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);
    if (response.ok) {
      const data = await response.json();
      return data.pairs?.[0] || null;
    }
  } catch (error) {
    console.error('DexScreener error:', error);
  }
  return null;
} 