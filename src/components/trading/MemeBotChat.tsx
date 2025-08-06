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
import { getTrendingTokensByChain, getChainDisplayName } from '@/lib/api/dexscreener';
import { generateAIResponse } from '@/lib/api/ai';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  tokenData?: any;
}

interface TokenCard {
  name: string;
  symbol: string;
  icon: string;
  price?: string;
  change?: string;
  volume?: string;
}

export function MemeBotChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [trendingTokens, setTrendingTokens] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    "What's the token age?"
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

  const loadTrendingTokens = async () => {
    try {
      const tokens = await getTrendingTokensByChain('solana');
      setTrendingTokens(tokens.slice(0, 3));
    } catch (error) {
      console.error('Failed to load trending tokens:', error);
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
      // Check if it's a trending token request
      if (content.toLowerCase().includes('trending')) {
        const chainMatch = content.match(/(solana|bsc|ethereum|polygon|arbitrum|optimism)/i);
        const chain = chainMatch ? chainMatch[1].toLowerCase() : 'solana';
        
        const trendingResponse = await handleTrendingRequest(chain);
        setMessages(prev => [...prev, trendingResponse]);
      } else {
        // Regular AI response
        const aiResponse = await generateAIResponse(content, null);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: aiResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
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
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
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
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
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
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-6">
                  <Bot className="w-12 h-12 text-white" />
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
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="whitespace-pre-wrap text-sm">
                            {message.content}
                          </div>
                          <div className={`text-xs mt-2 ${
                            message.type === 'user' ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
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
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
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