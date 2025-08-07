'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  MessageSquare, 
  Star,
  ArrowRight,
  ChevronRight,
  HelpCircle,
  Send,
  Mic,
  Lightbulb
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { getTrendingTokensByChain, getChainDisplayName } from '@/lib/api/dexscreener';
import { generateAIResponse } from '@/lib/api/ai';
import { analyzeTokenHolders, formatHolderAnalysisForChat } from '@/lib/api/holderAnalysis';
import { analyzeRugPullRisk, formatRugAnalysisForChat } from '@/lib/api/rugAnalysis';
import { analyzeHoneypotRisk, formatHoneypotAnalysisForChat } from '@/lib/api/honeypotDetection';
import { getNewTokensLastHour, formatNewTokenAnalysisForChat } from '@/lib/api/newTokenDetection';
import { getVolumeSpikes, formatVolumeSpikeAnalysisForChat } from '@/lib/api/volumeSpikeDetection';
import { getWhaleActivityToday, formatWhaleActivityAnalysisForChat } from '@/lib/api/whaleTracking';
import { executeToolsForIntent } from '@/lib/api/aiToolExecutor';

// Edge Function URLs
const SUPABASE_URL = 'https://bgqczmovcojjzhdacbij.supabase.co/functions/v1';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJncWN6bW92Y29qanpoZGFjYmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjI2MDcsImV4cCI6MjA2OTk5ODYwN30.kvww0lTKfwIXrJXpqfMdwK4HjYJiljr0Kt6k97tYYPg';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  tokenData?: any;
  messageId?: string; // For tracking with Edge Functions
}

interface TokenCard {
  name: string;
  symbol: string;
  icon: string;
  price?: string;
  change?: string;
  volume?: string;
}

interface ChatContext {
  wallet_address?: string;
  token_address?: string;
  trading_context?: string;
}

export function MemeBotChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [trendingTokens, setTrendingTokens] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session and user ID
  useEffect(() => {
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    setUserId(`user_${Math.random().toString(36).substr(2, 9)}`);
  }, []);

  // Popular tokens for newbies
  const popularTokens: TokenCard[] = [
    { name: 'Pepe', symbol: 'PEPE', icon: '🐸', price: '$0.00000123', change: '+15.2%' },
    { name: 'Bonk', symbol: 'BONK', icon: '🦍', price: '$0.00000089', change: '+8.7%' },
    { name: 'Dogecoin', symbol: 'DOGE', icon: '💎', price: '$0.087', change: '+3.4%' },
    { name: 'Shiba Inu', symbol: 'SHIB', icon: '🚀', price: '$0.000023', change: '+12.1%' }
  ];

  // Quick questions for newbies
  const quickQuestions = [
    "What's your current price and volume?",
    "Are you a honeypot?",
    "How much liquidity do you have?",
    "What's your market cap?",
    "Is this token safe to buy?",
    "What's the token age?",
    "Who are the top holders?",
    "Analyze holder distribution",
    "Is this a rug?",
    "Check security score",
    "Show new tokens",
    "Volume spike analysis",
    "Whale activity today",
    "What should I look for in a good token?",
    "Teach me how to spot a rugpull",
    "What's the risk score of this token?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadTrendingTokens();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadTrendingTokens = async () => {
    try {
      const tokens = await getTrendingTokensByChain('solana');
      setTrendingTokens(tokens.slice(0, 3));
    } catch (error) {
      console.error('Failed to load trending tokens:', error);
    }
  };

  // Call chat-handler Edge Function
  const callChatHandler = async (message: string, context?: ChatContext) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/chat-handler`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ANON_KEY}`
        },
        body: JSON.stringify({
          message,
          user_id: userId,
          session_id: sessionId,
          context
        })
      });

      if (!response.ok) {
        throw new Error(`Chat handler failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Chat handler error:', error);
      throw error;
    }
  };

  // Call ai-response-handler Edge Function
  const callAIResponseHandler = async (aiResponse: string, messageId: string, metadata?: any) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/ai-response-handler`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ANON_KEY}`
        },
        body: JSON.stringify({
          user_id: userId,
          session_id: sessionId,
          message_id: messageId,
          ai_response: aiResponse,
          metadata
        })
      });

      if (!response.ok) {
        throw new Error(`AI response handler failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('AI response handler error:', error);
      throw error;
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare context for the chat handler
      const context: ChatContext = {
        trading_context: selectedToken ? `Analyzing ${selectedToken} token` : 'General crypto analysis',
        token_address: selectedToken || undefined
      };

      // Call chat-handler to log the user message
      const chatHandlerResponse = await callChatHandler(content, context);
      userMessage.messageId = chatHandlerResponse.message_id;

      // Use the smart AI tool executor to handle all requests
      const startTime = Date.now();
      const toolResult = await executeToolsForIntent(content, {
        enablePaidAPIs: true,
        personaEnabled: true
      });
      const responseTime = Date.now() - startTime;

      let botMessage: Message;

      if (toolResult.success) {
        botMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: toolResult.response,
          timestamp: new Date(),
          tokenData: toolResult.data
        };

        // Call ai-response-handler to log the AI response
        await callAIResponseHandler(toolResult.response, userMessage.messageId!, {
          model_used: 'smart_ai_executor',
          response_time: responseTime,
          tokens_used: toolResult.response.length,
          source: toolResult.source,
          fallback_used: toolResult.fallbackUsed
        });
      } else {
        // Fallback to regular AI response if tool execution fails
        const aiResponse = await generateAIResponse(content, null);
        
        botMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: aiResponse,
          timestamp: new Date()
        };

        // Call ai-response-handler to log the AI response
        await callAIResponseHandler(aiResponse, userMessage.messageId!, {
          model_used: 'gpt-4',
          response_time: responseTime,
          tokens_used: aiResponse.length
        });
      }

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "Sorry, I'm having trouble processing your request. Please try again!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrendingRequest = async (chain: string): Promise<Message> => {
    try {
      const tokens = await getTrendingTokensByChain(chain);
      const chainName = getChainDisplayName(chain);
      
      let response = `🔥 **Trending ${chainName} Tokens**\n\n`;
      
      if (tokens.length === 0) {
        response += `No trending tokens found on ${chainName}. Try asking about a specific token or check back later!`;
      } else {
        const trendingTokens = tokens.slice(0, 5);
        const diamondTokens = tokens.filter(t => t.volume?.h24 > 1000000).slice(0, 3);
        
        if (trendingTokens.length > 0) {
          response += `🔥 **Hot Trending (${trendingTokens.length} found):**\n`;
          trendingTokens.forEach((token, index) => {
            const priceChange = token.priceChange?.h24 || 0;
            const volume = token.volume?.h24 || 0;
            const changeColor = priceChange >= 0 ? '🟢' : '🔴';
            response += `${index + 1}. **${token.baseToken.symbol}** - $${token.priceUsd} (${changeColor}${priceChange.toFixed(1)}%)\n`;
            response += `   Volume: $${(volume / 1000000).toFixed(1)}M | Liquidity: $${(token.liquidity?.usd / 1000000).toFixed(1)}M\n\n`;
          });
        }
        
        if (diamondTokens.length > 0) {
          response += `💎 **Diamond Quality (${diamondTokens.length} found):**\n`;
          diamondTokens.forEach((token, index) => {
            const priceChange = token.priceChange?.h24 || 0;
            const volume = token.volume?.h24 || 0;
            const changeColor = priceChange >= 0 ? '🟢' : '🔴';
            response += `${index + 1}. **${token.baseToken.symbol}** - $${token.priceUsd} (${changeColor}${priceChange.toFixed(1)}%)\n`;
            response += `   Volume: $${(volume / 1000000).toFixed(1)}M | Quality: 85+/100\n\n`;
          });
        }
        
        response += `📚 **Educational Section:**\n`;
        response += `• **Price Change**: Shows how much the token's value changed in 24 hours\n`;
        response += `• **Volume**: Total trading activity - higher = more interest\n`;
        response += `• **Liquidity**: How easy it is to buy/sell - higher = safer\n`;
        response += `• **Quality Score**: Our AI's assessment of token safety (0-100)\n\n`;
        
        response += `🎯 **Action Guidance:**\n`;
        response += `1. Click any token above to get detailed analysis\n`;
        response += `2. Use the Token Explorer tab for filtered results\n`;
        response += `3. Ask me specific questions about any token\n\n`;
        response += `💡 **Pro Tip**: Always check liquidity and volume before investing!`;
      }
      
      return {
        id: Date.now().toString(),
        type: 'bot' as const,
        content: response,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        id: Date.now().toString(),
        type: 'bot' as const,
        content: `Sorry, I couldn't fetch trending tokens right now. Try asking about a specific token or check back later!`,
        timestamp: new Date()
      };
    }
  };

  const handleHolderAnalysisRequest = async (content: string): Promise<Message> => {
    try {
      // Extract token address from the message
      const tokenAddressMatch = content.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/);
      const tokenAddress = tokenAddressMatch ? tokenAddressMatch[0] : selectedToken;
      
      if (!tokenAddress) {
        return {
          id: Date.now().toString(),
          type: 'bot' as const,
          content: `Please provide a token address to analyze holders. You can:\n\n1. Paste a token address directly\n2. Select a token from the left panel first\n3. Ask "Who are the top holders of [TOKEN_ADDRESS]?"`,
          timestamp: new Date()
        };
      }

      // Analyze token holders
      const holderAnalysis = await analyzeTokenHolders(tokenAddress);
      
      if (!holderAnalysis) {
        return {
          id: Date.now().toString(),
          type: 'bot' as const,
          content: `Sorry, I couldn't analyze holders for that token. This could be because:\n\n• The token address is invalid\n• The token has no holders yet\n• There was an issue fetching the data\n\nPlease try with a different token address.`,
          timestamp: new Date()
        };
      }

      // Format the analysis for chat
      const response = formatHolderAnalysisForChat(holderAnalysis);
      
      return {
        id: Date.now().toString(),
        type: 'bot' as const,
        content: response,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Holder analysis error:', error);
      return {
        id: Date.now().toString(),
        type: 'bot' as const,
        content: `Sorry, I encountered an error while analyzing holders. Please try again with a different token or check back later.`,
        timestamp: new Date()
      };
    }
  };

  const handleRugAnalysisRequest = async (content: string): Promise<Message> => {
    try {
      // Extract token address from the message
      const tokenAddressMatch = content.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/);
      const tokenAddress = tokenAddressMatch ? tokenAddressMatch[0] : selectedToken;
      
      if (!tokenAddress) {
        return {
          id: Date.now().toString(),
          type: 'bot' as const,
          content: `Please provide a token address to analyze for rug pull risk. You can:\n\n1. Paste a token address directly\n2. Select a token from the left panel first\n3. Ask "Is this a rug? [TOKEN_ADDRESS]"`,
          timestamp: new Date()
        };
      }

      // Analyze rug pull risk
      const rugAnalysis = await analyzeRugPullRisk(tokenAddress);
      
      if (!rugAnalysis) {
        return {
          id: Date.now().toString(),
          type: 'bot' as const,
          content: `Sorry, I couldn't analyze rug pull risk for that token. This could be because:\n\n• The token address is invalid\n• The token has no trading activity\n• There was an issue fetching the data\n\nPlease try with a different token address.`,
          timestamp: new Date()
        };
      }

      // Format the analysis for chat
      const response = formatRugAnalysisForChat(rugAnalysis);
      
      return {
        id: Date.now().toString(),
        type: 'bot' as const,
        content: response,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Rug analysis error:', error);
      return {
        id: Date.now().toString(),
        type: 'bot' as const,
        content: `Sorry, I encountered an error while analyzing rug pull risk. Please try again with a different token or check back later.`,
        timestamp: new Date()
      };
    }
  };

  const handleHoneypotAnalysisRequest = async (content: string): Promise<Message> => {
    try {
      // Extract token address from the message
      const tokenAddressMatch = content.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/);
      const tokenAddress = tokenAddressMatch ? tokenAddressMatch[0] : selectedToken;
      
      if (!tokenAddress) {
        return {
          id: Date.now().toString(),
          type: 'bot' as const,
          content: `Please provide a token address to check for honeypot characteristics. You can:\n\n1. Paste a token address directly\n2. Select a token from the left panel first\n3. Ask "Is this a honeypot? [TOKEN_ADDRESS]"`,
          timestamp: new Date()
        };
      }

      // Analyze honeypot risk
      const honeypotAnalysis = await analyzeHoneypotRisk(tokenAddress);
      
      if (!honeypotAnalysis) {
        return {
          id: Date.now().toString(),
          type: 'bot' as const,
          content: `Sorry, I couldn't analyze honeypot risk for that token. This could be because:\n\n• The token address is invalid\n• The token has no trading activity\n• There was an issue fetching the data\n\nPlease try with a different token address.`,
          timestamp: new Date()
        };
      }

      // Format the analysis for chat
      const response = formatHoneypotAnalysisForChat(honeypotAnalysis);
      
      return {
        id: Date.now().toString(),
        type: 'bot' as const,
        content: response,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Honeypot analysis error:', error);
      return {
        id: Date.now().toString(),
        type: 'bot' as const,
        content: `Sorry, I encountered an error while analyzing honeypot risk. Please try again with a different token or check back later.`,
        timestamp: new Date()
      };
    }
  };

  const handleNewTokenRequest = async (content: string): Promise<Message> => {
    try {
      // Extract chain from the message or default to solana
      const chainMatch = content.match(/(solana|bsc|ethereum|polygon|arbitrum|optimism)/i);
      const chain = chainMatch ? chainMatch[1].toLowerCase() : 'solana';
      
      // Get new tokens from the last hour
      const newTokens = await getNewTokensLastHour(chain);
      
      if (newTokens.length === 0) {
        return {
          id: Date.now().toString(),
          type: 'bot' as const,
          content: `No new tokens found in the last hour on ${chain}. This could be because:\n\n• No new tokens were launched recently\n• The tokens are still being indexed\n• There was an issue fetching the data\n\nTry asking about trending tokens instead!`,
          timestamp: new Date()
        };
      }

      // Format the analysis for chat
      const response = formatNewTokenAnalysisForChat(newTokens);
      
      return {
        id: Date.now().toString(),
        type: 'bot' as const,
        content: response,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('New token analysis error:', error);
      return {
        id: Date.now().toString(),
        type: 'bot' as const,
        content: `Sorry, I encountered an error while analyzing new tokens. Please try again or check back later.`,
        timestamp: new Date()
      };
    }
  };

  const handleVolumeSpikeRequest = async (content: string): Promise<Message> => {
    try {
      // Extract chain from the message or default to solana
      const chainMatch = content.match(/(solana|bsc|ethereum|polygon|arbitrum|optimism)/i);
      const chain = chainMatch ? chainMatch[1].toLowerCase() : 'solana';
      
      // Get volume spikes
      const volumeSpikes = await getVolumeSpikes(chain, 10);
      
      if (volumeSpikes.length === 0) {
        return {
          id: Date.now().toString(),
          type: 'bot' as const,
          content: `No significant volume spikes detected on ${chain}. This could indicate:\n\n• Stable market conditions\n• Low trading activity\n• No recent major events\n\nTry checking trending tokens or expanding the time range.`,
          timestamp: new Date()
        };
      }

      // Format the analysis for chat
      const response = formatVolumeSpikeAnalysisForChat(volumeSpikes);
      
      return {
        id: Date.now().toString(),
        type: 'bot' as const,
        content: response,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Volume spike analysis error:', error);
      return {
        id: Date.now().toString(),
        type: 'bot' as const,
        content: `Sorry, I encountered an error while analyzing volume spikes. Please try again or check back later.`,
        timestamp: new Date()
      };
    }
  };

  const handleWhaleActivityRequest = async (content: string): Promise<Message> => {
    try {
      // Extract chain from the message or default to solana
      const chainMatch = content.match(/(solana|bsc|ethereum|polygon|arbitrum|optimism)/i);
      const chain = chainMatch ? chainMatch[1].toLowerCase() : 'solana';
      
      // Get whale activity for today
      const whaleActivities = await getWhaleActivityToday(chain, 10);
      
      if (whaleActivities.length === 0) {
        return {
          id: Date.now().toString(),
          type: 'bot' as const,
          content: `No significant whale activity detected on ${chain} today. This could indicate:\n\n• Quiet market conditions\n• Whales are holding positions\n• No major moves happening\n\nTry checking trending tokens or expanding the time range.`,
          timestamp: new Date()
        };
      }

      // Format the analysis for chat
      const response = formatWhaleActivityAnalysisForChat(whaleActivities);
      
      return {
        id: Date.now().toString(),
        type: 'bot' as const,
        content: response,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Whale activity analysis error:', error);
      return {
        id: Date.now().toString(),
        type: 'bot' as const,
        content: `Sorry, I encountered an error while analyzing whale activity. Please try again or check back later.`,
        timestamp: new Date()
      };
    }
  };

  const handleTokenSelect = (token: TokenCard) => {
    setSelectedToken(token.symbol);
    setShowOnboarding(false);
    handleSendMessage(`Tell me about ${token.name} (${token.symbol})`);
  };

  const handleQuickQuestion = (question: string) => {
    if (selectedToken) {
      handleSendMessage(`${question} for ${selectedToken}`);
    } else {
      handleSendMessage(question);
    }
  };

  const onboardingSteps = [
    {
      title: "Welcome to MemeBot Chat! 🤖",
      description: "I'm your AI companion for crypto analysis. Let me show you around!",
      icon: <Bot className="w-8 h-8" />
    },
    {
      title: "Start with Popular Tokens",
      description: "Click on any popular token below to get instant analysis",
      icon: <Star className="w-8 h-8" />
    },
    {
      title: "Ask Me Anything",
      description: "Use the chat below to ask questions about any token",
      icon: <MessageSquare className="w-8 h-8" />
    }
  ];

  return (
    <div className="h-full flex bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Left Panel - Independent Container */}
      <div className="w-80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Left Panel Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Logo size="sm" showText={false} />
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Token Selection
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose tokens to analyze
              </p>
            </div>
          </div>
        </div>

        {/* Left Panel Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Onboarding */}
          {showOnboarding && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 text-white">
                <div className="flex items-center space-x-3 mb-4">
                  {onboardingSteps[currentStep].icon}
                  <h3 className="text-lg font-semibold">{onboardingSteps[currentStep].title}</h3>
                </div>
                <p className="text-purple-100 mb-4">{onboardingSteps[currentStep].description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {onboardingSteps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentStep ? 'bg-white' : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      if (currentStep < onboardingSteps.length - 1) {
                        setCurrentStep(currentStep + 1);
                      } else {
                        setShowOnboarding(false);
                      }
                    }}
                    className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 transition-colors"
                  >
                    <span>{currentStep < onboardingSteps.length - 1 ? 'Next' : 'Get Started'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Popular Tokens */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Popular Tokens
              </h3>
            </div>
            <div className="space-y-3">
              {popularTokens.map((token) => (
                <motion.button
                  key={token.symbol}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTokenSelect(token)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedToken === token.symbol
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{token.icon}</span>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {token.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {token.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {token.price}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        {token.change}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Quick Questions */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Lightbulb className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Questions
              </h3>
            </div>
            <div className="space-y-2">
              {quickQuestions.map((question, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleQuickQuestion(question)}
                  className="w-full p-3 text-left bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {question}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <HelpCircle className="w-5 h-5 text-blue-500" />
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                Need Help?
              </h4>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-200">
              Just type your question in the chat below. I'm here to help you understand any token!
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Chat Interface - Independent Container */}
      <div className="flex-1 flex flex-col bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
        {/* Chat Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Logo size="sm" showText={false} />
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                MemeBot Chat
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered crypto analysis
              </p>
            </div>
          </div>
        </div>

        {/* Chat Messages - Independent Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <div className="mb-6">
                  <Logo size="lg" showText={false} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Welcome to MemeBot Chat!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  Select a popular token from the left panel or ask me anything about crypto tokens. 
                  I'll help you understand prices, risks, and opportunities!
                </p>
              </motion.div>

              {/* Example Messages */}
              <div className="space-y-4 max-w-lg w-full">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-start"
                >
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-2xl rounded-tl-md p-4 max-w-xs">
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      "What's your current price and volume?"
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex justify-end"
                >
                  <div className="bg-blue-100 dark:bg-blue-900/20 rounded-2xl rounded-tr-md p-4 max-w-xs">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      "Let me check that for you! 📊"
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex justify-start"
                >
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-2xl rounded-tl-md p-4 max-w-xs">
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      "Are you a honeypot?"
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-3xl rounded-2xl p-4 ${
                        message.type === 'user'
                          ? 'bg-purple-500 text-white rounded-tr-md'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-tl-md'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {message.type === 'bot' && (
                          <div className="flex-shrink-0">
                            <Logo size="sm" showText={false} />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="whitespace-pre-wrap text-sm">
                            {message.content}
                          </div>
                          <div className={`text-xs mt-2 ${
                            message.type === 'user' ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {mounted ? message.timestamp.toLocaleTimeString() : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-md p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Logo size="sm" showText={false} />
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input - Fixed at Bottom */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(inputValue);
                  }
                }}
                placeholder="Ask me anything about tokens..."
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Mic className="w-5 h-5" />
              </button>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>Send</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
} 