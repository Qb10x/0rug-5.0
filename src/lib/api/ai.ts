// AI API Integration with OpenRouter for ChatGPT Access
// Following 0rug.com coding guidelines

const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

export async function callOpenRouterAPI(prompt: string): Promise<string> {
  try {
    // Check if API key is available
    if (!OPENROUTER_API_KEY) {
      console.error('OpenRouter API key is missing');
      return "Sorry, I'm not properly configured right now. Please check back later! 🔧";
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout for faster responses

    console.log('Making OpenRouter API call with prompt:', prompt.substring(0, 100) + '...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://0rug.com', // Your site
        'X-Title': '0rug MemeBot Chat' // Your app name
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo', // Using ChatGPT through OpenRouter
        messages: [
          {
            role: 'system',
            content: 'You are MemeBot, a friendly crypto expert. Keep responses short, conversational, and helpful. Use simple language and emojis. Be honest about risks but encouraging. Max 150 words.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error response:', response.status, errorText);
      return `Sorry, I'm having trouble connecting right now (${response.status}). Please try again in a moment! 🔧`;
    }
    
    const data = await response.json();
    clearTimeout(timeoutId);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected API response format:', data);
      return "Sorry, I got an unexpected response. Please try again! 🔧";
    }
    
    console.log('OpenRouter API call successful');
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter API error:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      return "Sorry, that's taking too long! Try asking something simpler or check your connection. 🚀";
    }
    return 'Sorry, I encountered an error. Please try again.';
  }
}

// Comprehensive token analysis - Core feature for "Analyze this token"
export async function analyzeTokenComprehensive(tokenData: any, riskData?: any): Promise<{
  summary: string;
  riskScore: number;
  recommendation: 'BUY' | 'HOLD' | 'SELL' | 'AVOID';
  keyInsights: string[];
  aiExplanation: string;
}> {
  const prompt = `Analyze this token comprehensively:

Token Data:
- Name: ${tokenData.name || 'Unknown'}
- Symbol: ${tokenData.symbol || 'Unknown'}
- Price: $${tokenData.price || 'Unknown'}
- 24h Change: ${tokenData.priceChange || 'Unknown'}%
- Volume: $${tokenData.volume || 'Unknown'}
- Liquidity: $${tokenData.liquidity || 'Unknown'}
- Market Cap: $${tokenData.marketCap || 'Unknown'}
- Holders: ${tokenData.holders || 'Unknown'}
- LP Lock: ${tokenData.lpLocked ? 'Yes' : 'No'}
- Contract Verified: ${tokenData.verified ? 'Yes' : 'No'}

Risk Data:
- Rug Pull Risk: ${riskData?.rugRisk || 'Unknown'}
- Liquidity Risk: ${riskData?.liquidityRisk || 'Unknown'}
- Holder Concentration: ${riskData?.holderConcentration || 'Unknown'}%

Provide a comprehensive analysis in this format:
1. SUMMARY: Brief overview (50 words max)
2. RISK_SCORE: 1-10 (10 being highest risk)
3. RECOMMENDATION: BUY/HOLD/SELL/AVOID
4. KEY_INSIGHTS: 3 bullet points
5. AI_EXPLANATION: Detailed but simple explanation

Keep it beginner-friendly with emojis and simple language.`;

  const response = await callOpenRouterAPI(prompt);
  
  // Parse the response to extract structured data
  const lines = response.split('\n');
  const summary = lines.find(line => line.includes('SUMMARY:'))?.replace('SUMMARY:', '').trim() || 'Analysis complete!';
  const riskScoreMatch = response.match(/RISK_SCORE:\s*(\d+)/);
  const riskScore = riskScoreMatch ? parseInt(riskScoreMatch[1]) : 5;
  
  const recommendationMatch = response.match(/RECOMMENDATION:\s*(BUY|HOLD|SELL|AVOID)/);
  const recommendation = (recommendationMatch?.[1] as 'BUY' | 'HOLD' | 'SELL' | 'AVOID') || 'HOLD';
  
  // Parse insights without the 's' flag
  const insightsMatch = response.match(/KEY_INSIGHTS:([\s\S]*?)(?=AI_EXPLANATION:|$)/);
  const keyInsights = insightsMatch ? 
    insightsMatch[1].split('•').filter(item => item.trim()).map(item => item.trim()) : 
    ['Analysis provided', 'Check details', 'DYOR'];
  
  const aiExplanation = response.split('AI_EXPLANATION:')[1]?.trim() || response;

  return {
    summary,
    riskScore,
    recommendation,
    keyInsights,
    aiExplanation
  };
}

// Generate newbie-friendly token analysis
export async function generateNewbieTokenAnalysis(
  tokenData: any, 
  qualityScore: number, 
  category: string
): Promise<string> {
  const prompt = `As a crypto expert, explain this token to a complete beginner:

Token Data:
- Name: ${tokenData.name || 'Unknown'}
- Symbol: ${tokenData.symbol || 'Unknown'}
- Price: $${tokenData.price || 'Unknown'}
- 24h Change: ${tokenData.priceChange || 'Unknown'}%
- Volume: $${tokenData.volume || 'Unknown'}
- Liquidity: $${tokenData.liquidity || 'Unknown'}
- Market Cap: $${tokenData.marketCap || 'Unknown'}
- Quality Score: ${qualityScore}/100
- Category: ${category}

Explain this in simple terms:
1. What this token is about
2. Whether it's worth investing in (YES/NO/MAYBE)
3. Why you think that (in plain English)
4. What risks to watch out for
5. What good signs you see

Keep it conversational and beginner-friendly. Use emojis and simple language.`;

  return await callOpenRouterAPI(prompt);
}

// Generate "Explain Like I'm 5" explanations
export async function explainLikeIm5(term: string, context: string): Promise<string> {
  const prompt = `Explain this crypto term like you're talking to a 5-year-old:

Term: ${term}
Context: ${context}

Make it super simple and use analogies that anyone can understand.`;

  return await callOpenRouterAPI(prompt);
}

// Generate risk assessment in plain English
export async function explainRiskInPlainEnglish(
  tokenData: any, 
  riskFactors: string[]
): Promise<string> {
  const prompt = `Explain the risks of this token in simple terms:

Token: ${tokenData.name} (${tokenData.symbol})
Risk Factors: ${riskFactors.join(', ')}

Explain what these risks mean in plain English and what a beginner should watch out for.`;

  return await callOpenRouterAPI(prompt);
}

// Generate "Should I Buy?" recommendation
export async function generateBuyRecommendation(
  tokenData: any, 
  qualityScore: number
): Promise<string> {
  const prompt = `Give a simple YES/NO/MAYBE recommendation for this token:

Token: ${tokenData.name} (${tokenData.symbol})
Quality Score: ${qualityScore}/100
Price: $${tokenData.price}
Volume: $${tokenData.volume}

Give a clear recommendation and explain why in simple terms.`;

  return await callOpenRouterAPI(prompt);
}

// Generate educational content about token metrics
export async function explainTokenMetric(metric: string, value: any): Promise<string> {
  const prompt = `Explain this crypto metric in simple terms:

Metric: ${metric}
Value: ${value}

What does this mean for a beginner investor? Is this good or bad?`;

  return await callOpenRouterAPI(prompt);
}

// General AI response function for chat interface - Optimized for speed
export async function generateAIResponse(message: string, tokenData?: any): Promise<string> {
  try {
    // Quick responses for common questions
    const quickResponses: { [key: string]: string } = {
      'hi': "Hey there! 👋 I'm MemeBot, your crypto buddy! What token do you want to know about?",
      'hello': "Hello! 🚀 Ready to explore some tokens together?",
      'help': "I'm here to help! Ask me about any token, and I'll break it down in simple terms. What's on your mind?",
      'bonk': "BONK is a meme coin on Solana! 🐕 It's been around since 2022 and has a big community. But like all meme coins, it's risky - prices swing wildly! Only invest what you can afford to lose. DYOR! 🔍",
      'pepe': "PEPE is another popular meme coin! 🐸 It's on Ethereum and has been around for a while. But remember - meme coins are super volatile! Never invest more than you can lose. Always DYOR! 💪",
      'doge': "DOGE is the original meme coin! 🐕 It started as a joke but now has a huge community. Still risky though - crypto is unpredictable! Only invest what you can afford to lose. 🚀"
    };

    // Check for quick responses first
    const lowerMessage = message.toLowerCase().trim();
    for (const [key, response] of Object.entries(quickResponses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }

    // For specific token questions, use a focused prompt
    if (message.toLowerCase().includes('rug') || message.toLowerCase().includes('safe') || message.toLowerCase().includes('risk')) {
      const prompt = `User asked: "${message}"

Give a quick, honest answer about crypto risks. Be friendly but real about the dangers. Keep it under 100 words.`;

      return await callOpenRouterAPI(prompt);
    }

    // For general questions, use a simple prompt
    const prompt = `User: "${message}"

Give a helpful, friendly response about crypto. Keep it short and simple. Use emojis.`;

    return await callOpenRouterAPI(prompt);
  } catch (error) {
    console.error('Error in generateAIResponse:', error);
    return "Sorry, I'm having trouble processing your request right now. Please try again in a moment! 🔧";
  }
} 