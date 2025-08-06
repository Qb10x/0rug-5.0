'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { TokenCardPanel } from './TokenCardPanel';
import { generateAIResponse, analyzeTokenComprehensive } from '@/lib/api/ai';
import { getTrendingTokensByChain, getChainDisplayName, analyzeTokenComprehensive as analyzeTokenData } from '@/lib/api/dexscreener';
import { InteractiveTokenCard } from './InteractiveTokenCard';
import { TokenDetailsModal } from './TokenDetailsModal';
import { TokenAnalysisCard } from './TokenAnalysisCard';

// Message interface
interface Message {
  id: string;
  type: 'user' | 'bot' | 'interactive-tokens' | 'token-analysis';
  content: string;
  timestamp: Date;
  tokens?: any[]; // For interactive token cards
  analysis?: any; // For token analysis
  tokenData?: any; // For token data
}

// Expandable section component
interface ExpandableSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  icon,
  children,
  isExpanded,
  onToggle
}) => (
  <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 mb-3">
    <button
      onClick={onToggle}
      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div className="text-gray-600 dark:text-gray-400">
          {icon}
        </div>
        <span className="font-medium text-gray-900 dark:text-white">
          {title}
        </span>
      </div>
      {isExpanded ? (
        <ChevronUp className="w-5 h-5 text-gray-500" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-500" />
      )}
    </button>
    
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="px-4 pb-4 space-y-3">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// Chat message component
interface ChatMessageProps {
  message: Message;
}

interface TypingMessageProps {
  content: string;
  onComplete: () => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.type === 'user';
  
  // Clean up the text by removing markdown formatting
  const cleanText = message.content
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove code
    .replace(/~~(.*?)~~/g, '$1') // Remove strikethrough
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/>\s/g, '') // Remove blockquotes
    .replace(/\n\n/g, '\n') // Clean up double line breaks
    .trim();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-3xl rounded-2xl p-4 ${
          isUser
            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-tr-md'
            : 'bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-tl-md'
        }`}
      >
        <div className="flex items-start space-x-3">
          {!isUser && (
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
          )}
          <div className="flex-1">
            <div className="whitespace-pre-wrap text-sm">
              {cleanText}
            </div>
            <div className={`text-xs mt-2 ${
              isUser ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Typing effect component for bot messages
const TypingMessage: React.FC<TypingMessageProps> = ({ content, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + content[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 30); // Speed of typing

      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [currentIndex, content, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start mb-4"
    >
      <div className="max-w-3xl rounded-2xl p-4 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-tl-md">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="whitespace-pre-wrap text-sm">
              {displayedText}
              {currentIndex < content.length && (
                <span className="inline-block w-2 h-4 bg-purple-500 ml-1 animate-pulse"></span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Interactive tokens message component
interface InteractiveTokensMessageProps {
  message: Message;
  onViewDetails: (token: any) => void;
  onTrade: (token: any) => void;
}

const InteractiveTokensMessage: React.FC<InteractiveTokensMessageProps> = ({ 
  message, 
  onViewDetails, 
  onTrade 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start mb-4"
    >
      <div className="max-w-3xl rounded-2xl p-4 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-tl-md">
        <div className="flex items-start space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {message.content}
            </div>
            <div className="space-y-3">
              {message.tokens?.map((token, index) => (
                <InteractiveTokenCard
                  key={index}
                  token={token}
                  index={index}
                  onViewDetails={onViewDetails}
                  onTrade={onTrade}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  );
};

// Token Analysis Message Component
interface TokenAnalysisMessageProps {
  message: Message;
  onViewDetails: (token: any) => void;
  onTrade: (token: any) => void;
}

const TokenAnalysisMessage: React.FC<TokenAnalysisMessageProps> = ({ 
  message, 
  onViewDetails, 
  onTrade 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col space-y-3"
    >
      {/* Bot message */}
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4 border border-purple-200">
          <p className="text-gray-800 text-sm whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>

      {/* Token Analysis Card */}
      {message.analysis && message.tokenData && (
        <div className="ml-11">
          <TokenAnalysisCard 
            tokenData={message.tokenData}
            analysis={message.analysis}
          />
        </div>
      )}
    </motion.div>
  );
};

// Main layout component
export const NewMemeBotLayout: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hey, I'm MemeBot! 🤖\n\nWant to see the top 3 risky meme coins today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingContent, setTypingContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<{ address: string; symbol: string } | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // Check mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Suggested prompts
  const suggestedPrompts = [
    "Is BONK a rug?",
    "Compare PEPE and DOGE",
    "Show LP activity for new tokens",
    "Show me trending Solana tokens"
  ];

  // Check if message contains a contract address
  const extractContractAddress = (message: string): string | null => {
    // Match Solana addresses (base58 format, 32-44 characters)
    const solanaAddressRegex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
    const matches = message.match(solanaAddressRegex);
    
    if (matches && matches.length > 0) {
      return matches[0];
    }
    
    // Match Ethereum-style addresses (0x followed by 40 hex characters)
    const ethAddressRegex = /0x[a-fA-F0-9]{40}/g;
    const ethMatches = message.match(ethAddressRegex);
    
    if (ethMatches && ethMatches.length > 0) {
      return ethMatches[0];
    }
    
    return null;
  };

  // Handle send message with real AI integration
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Hide Quick Questions when any message is sent (typing or clicking)
    setHasStartedTyping(true);

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
      // First, check if message contains a contract address
      const contractAddress = extractContractAddress(content);
      
      if (contractAddress) {
        // If we found a contract address, analyze it regardless of other keywords
        const analysisResponse = await handleTokenAnalysis(contractAddress);
        setMessages(prev => [...prev, analysisResponse]);
      }
      // Check if it's a trending token request
      else if (content.toLowerCase().includes('trending')) {
        const chainMatch = content.match(/(solana|bsc|ethereum|polygon|arbitrum|optimism)/i);
        const chain = chainMatch ? chainMatch[1].toLowerCase() : 'solana';
        
        const trendingResponse = await handleTrendingRequest(chain);
        setMessages(prev => [...prev, trendingResponse]);
      }
      // Check if it's a token analysis request with keywords
      else if (content.toLowerCase().includes('analyze') || content.toLowerCase().includes('token')) {
        // Use real AI response for keyword-based requests
        const aiResponse = await generateAIResponse(content, null);
        
        // Start typing effect
        setIsTyping(true);
        setTypingContent(aiResponse);
      } else {
        // Use real AI response
        const aiResponse = await generateAIResponse(content, null);
        
        // Start typing effect
        setIsTyping(true);
        setTypingContent(aiResponse);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "Sorry, I'm having trouble processing your request. Please try again!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  // Handle trending token requests with real data
  const handleTrendingRequest = async (chain: string): Promise<Message> => {
    try {
      const tokens = await getTrendingTokensByChain(chain);
      const chainName = getChainDisplayName(chain);
      
      if (tokens.length === 0) {
        return {
          id: Date.now().toString(),
          type: 'bot' as const,
          content: `No trending tokens found on ${chainName}. Try asking about a specific token or check back later!`,
          timestamp: new Date()
        };
      }
      
      const trendingTokens = tokens.slice(0, 5);
      
      return {
        id: Date.now().toString(),
        type: 'interactive-tokens' as const,
        content: `🔥 **Top 5 Trending ${chainName} Tokens**\n\nClick on any token below to view details or trade!`,
        timestamp: new Date(),
        tokens: trendingTokens
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

  // Handle comprehensive token analysis
  const handleTokenAnalysis = async (contractAddress: string): Promise<Message> => {
    try {
      // Fetch comprehensive token data
      const tokenData = await analyzeTokenData(contractAddress);
      
      if (!tokenData) {
        return {
          id: Date.now().toString(),
          type: 'bot',
          content: `Sorry, I couldn't find data for that token address. Please check the address and try again!`,
          timestamp: new Date()
        };
      }

      // Generate AI analysis
      const analysis = await analyzeTokenComprehensive(tokenData.basic, tokenData.risk);
      
      return {
        id: Date.now().toString(),
        type: 'token-analysis',
        content: `🔍 **Token Analysis Complete!**\n\nI've analyzed ${tokenData.basic.symbol} (${tokenData.basic.name}) for you. Here's what I found:`,
        timestamp: new Date(),
        analysis,
        tokenData: tokenData.basic
      };
    } catch (error) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `Sorry, I encountered an error while analyzing that token. Please try again!`,
        timestamp: new Date()
      };
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to send message
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSendMessage(inputValue);
      }
      
      // Escape to clear input
      if (e.key === 'Escape') {
        setInputValue('');
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [inputValue]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages, isLoading, isTyping]);

  // Handle typing completion
  const handleTypingComplete = () => {
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: typingContent,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
    setTypingContent('');
    setIsLoading(false);
  };

  // Handle view details
  const handleViewDetails = (token: any) => {
    setSelectedToken({
      address: token.baseToken.address,
      symbol: token.baseToken.symbol
    });
    setIsModalOpen(true);
  };

  // Handle trade
  const handleTrade = (token: any) => {
    // TODO: Implement Jupiter trading integration
    console.log('Trade token:', token);
  };

  return (
    <div className={`${isMobile ? 'flex-col' : 'flex'} h-[calc(100vh-120px)] bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}>
      {/* Left Panel - Chat Interface */}
      <div className={`${isMobile ? 'w-full h-1/2' : 'w-[70%]'} flex flex-col`}>
        {/* Chat Messages */}
        <div ref={chatMessagesRef} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message) => {
                if (message.type === 'interactive-tokens') {
                  return (
                    <InteractiveTokensMessage
                      key={message.id}
                      message={message}
                      onViewDetails={handleViewDetails}
                      onTrade={handleTrade}
                    />
                  );
                }
                if (message.type === 'token-analysis') {
                  return (
                    <TokenAnalysisMessage
                      key={message.id}
                      message={message}
                      onViewDetails={handleViewDetails}
                      onTrade={handleTrade}
                    />
                  );
                }
                return <ChatMessage key={message.id} message={message} />;
              })}
            </AnimatePresence>
            
            {isTyping && (
              <TypingMessage 
                content={typingContent} 
                onComplete={handleTypingComplete} 
              />
            )}
            
            {isLoading && !isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-md p-4">
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
        </div>

        {/* Suggested Prompts - Hide permanently when typing starts */}
        <AnimatePresence>
          {!hasStartedTyping && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quick Questions:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {suggestedPrompts.map((prompt, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSendMessage(prompt)}
                      className="px-4 py-2 bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors"
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Input */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (!hasStartedTyping && e.target.value.trim()) {
                    setHasStartedTyping(true);
                  }
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(inputValue);
                  }
                }}
                placeholder="Ask me anything about tokens... (Ctrl+Enter to send)"
                className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">Send</span>
            </motion.button>
          </div>
          
          {/* Keyboard shortcuts hint */}
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            {hasStartedTyping ? (
              <span>💬 Type your message below...</span>
            ) : (
              <span>💡 <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl+Enter</kbd> to send • <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Esc</kbd> to clear</span>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Token Cards */}
      <div className={`${isMobile ? 'w-full h-1/2' : 'w-[30%]'} border-l border-gray-200 dark:border-gray-700`}>
        <TokenCardPanel />
      </div>

      {/* Token Details Modal */}
      {selectedToken && (
        <TokenDetailsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedToken(null);
          }}
          tokenAddress={selectedToken.address}
          tokenSymbol={selectedToken.symbol}
        />
      )}
    </div>
  );
}; 