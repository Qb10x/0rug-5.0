'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Bot, 
  TrendingUp, 
  Shield, 
  Sparkles, 
  Users, 
  Zap, 
  Star,
  Globe,
  Target,
  Lightbulb,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Rocket,
  BarChart3,
  Wallet,
  Eye,
  Brain,
  MessageSquare,
  Settings,
  Play,
  Code,
  Database,
  Lock,
  RefreshCw,
  Clock,
  DollarSign,
  Award,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';
import { colorUtils } from '@/lib/theme/colorUtils';

export default function DocsPage() {
  const sections = [
    {
      id: 'about',
      title: 'About ØRUG',
      icon: <Rocket className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-6 rounded-lg border border-green-500/20">
            <h3 className="text-xl font-bold text-white mb-4">What is ØRUG?</h3>
            <p className="text-gray-300 leading-relaxed">
              ØRUG is a revolutionary AI-powered token analysis platform built specifically for the Solana ecosystem. 
              We combine cutting-edge artificial intelligence with real-time blockchain data to help traders, 
              especially newcomers, navigate the complex world of meme tokens and DeFi.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-400" />
                Our Mission
              </h4>
              <p className="text-gray-300">
                To democratize access to professional-grade token analysis tools, making advanced trading insights 
                available to everyone, regardless of experience level.
              </p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-blue-400" />
                Our Vision
              </h4>
              <p className="text-gray-300">
                A world where every trader has access to AI-powered insights, real-time alerts, and educational 
                resources to make informed decisions in the crypto market.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'features',
      title: 'Core Features',
      icon: <Sparkles className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 p-6 rounded-lg border border-green-500/20">
              <div className="flex items-center mb-4">
                <Bot className="w-8 h-8 text-green-400 mr-3" />
                <h4 className="text-lg font-semibold text-white">AI Token Analysis</h4>
              </div>
              <p className="text-gray-300 text-sm">
                Advanced AI algorithms analyze token metrics, social sentiment, and market patterns to provide 
                comprehensive risk assessments and trading recommendations.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 rounded-lg border border-blue-500/20">
              <div className="flex items-center mb-4">
                <Eye className="w-8 h-8 text-blue-400 mr-3" />
                <h4 className="text-lg font-semibold text-white">Real-Time Monitoring</h4>
              </div>
              <p className="text-gray-300 text-sm">
                Track new token launches, whale movements, and market changes in real-time with instant alerts 
                and notifications.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 rounded-lg border border-purple-500/20">
              <div className="flex items-center mb-4">
                <Shield className="w-8 h-8 text-purple-400 mr-3" />
                <h4 className="text-lg font-semibold text-white">Rug Pull Detection</h4>
              </div>
              <p className="text-gray-300 text-sm">
                Advanced algorithms detect potential rug pulls and suspicious activities before they happen, 
                protecting your investments.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-6 rounded-lg border border-yellow-500/20">
              <div className="flex items-center mb-4">
                <BarChart3 className="w-8 h-8 text-yellow-400 mr-3" />
                <h4 className="text-lg font-semibold text-white">Market Analytics</h4>
              </div>
              <p className="text-gray-300 text-sm">
                Comprehensive market analysis including volume spikes, price movements, and trading patterns 
                with historical data comparison.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 p-6 rounded-lg border border-red-500/20">
              <div className="flex items-center mb-4">
                <Wallet className="w-8 h-8 text-red-400 mr-3" />
                <h4 className="text-lg font-semibold text-white">Whale Tracking</h4>
              </div>
              <p className="text-gray-300 text-sm">
                Monitor large wallet movements and follow smart money to identify potential opportunities 
                and market trends.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 p-6 rounded-lg border border-indigo-500/20">
              <div className="flex items-center mb-4">
                <MessageSquare className="w-8 h-8 text-indigo-400 mr-3" />
                <h4 className="text-lg font-semibold text-white">AI Chat Assistant</h4>
              </div>
              <p className="text-gray-300 text-sm">
                Interactive AI chatbot that answers questions about tokens, provides analysis, and helps 
                you understand market dynamics.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'for-newbies',
      title: 'Perfect for Newbies',
      icon: <Users className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-6 rounded-lg border border-green-500/20">
            <h3 className="text-xl font-bold text-white mb-4">Why ØRUG is Perfect for Beginners</h3>
            <p className="text-gray-300 leading-relaxed">
              We understand that crypto trading can be overwhelming for newcomers. That's why we've built ØRUG 
              with beginners in mind, providing the tools and education you need to succeed.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-semibold">Educational Content</h4>
                  <p className="text-gray-300 text-sm">Learn about trading, tokenomics, and market analysis through our comprehensive guides and tutorials.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-semibold">Risk Assessment</h4>
                  <p className="text-gray-300 text-sm">Our AI provides clear risk scores and explanations to help you understand potential dangers.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-semibold">Community Support</h4>
                  <p className="text-gray-300 text-sm">Join our community of traders and get help from experienced members and our AI assistant.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-semibold">Simple Interface</h4>
                  <p className="text-gray-300 text-sm">Clean, intuitive design that makes complex data easy to understand and act upon.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-semibold">Real-Time Alerts</h4>
                  <p className="text-gray-300 text-sm">Get notified about important market events and opportunities without constantly monitoring charts.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-semibold">Safe Trading</h4>
                  <p className="text-gray-300 text-sm">Advanced security features and rug pull detection help protect your investments from scams.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'how-it-works',
      title: 'How It Works',
      icon: <Settings className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">1. Data Collection</h4>
              <p className="text-gray-300 text-sm">
                We gather real-time data from multiple sources including blockchain, DEXs, social media, and market feeds.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">2. AI Analysis</h4>
              <p className="text-gray-300 text-sm">
                Our advanced AI algorithms process the data to identify patterns, risks, and opportunities.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">3. Smart Insights</h4>
              <p className="text-gray-300 text-sm">
                You receive actionable insights, alerts, and recommendations to make informed trading decisions.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      icon: <HelpCircle className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">Is ØRUG free to use?</h4>
              <p className="text-gray-300">
                We offer both free and premium tiers. The free tier includes basic analysis and alerts, 
                while premium users get advanced features, priority alerts, and exclusive insights.
              </p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">How accurate is the AI analysis?</h4>
              <p className="text-gray-300">
                Our AI achieves high accuracy through continuous learning and multiple data sources. 
                However, we always recommend doing your own research and never investing more than you can afford to lose.
              </p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">Do you support other blockchains?</h4>
              <p className="text-gray-300">
                Currently, we focus on Solana due to its speed and low fees. We plan to expand to other 
                blockchains in the future based on user demand.
              </p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">How do I connect my wallet?</h4>
              <p className="text-gray-300">
                You can connect any Solana wallet (Phantom, Solflare, etc.) through our secure wallet integration. 
                We never store your private keys and only request read permissions.
              </p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">What makes ØRUG different from other tools?</h4>
              <p className="text-gray-300">
                We combine AI-powered analysis with educational content, real-time alerts, and a focus on 
                helping newcomers. Our platform is designed to be both powerful and accessible.
              </p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">How often is data updated?</h4>
              <p className="text-gray-300">
                Our data is updated in real-time. Price feeds, volume data, and market information are 
                refreshed continuously to ensure you have the most current information.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Play className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="text-white font-semibold">Create Your Account</h4>
                  <p className="text-gray-300 text-sm">Sign up with your email to access all features and save your preferences.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="text-white font-semibold">Connect Your Wallet</h4>
                  <p className="text-gray-300 text-sm">Link your Solana wallet to track your portfolio and get personalized insights.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="text-white font-semibold">Set Up Alerts</h4>
                  <p className="text-gray-300 text-sm">Configure notifications for tokens you're interested in and market events.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-pink-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <h4 className="text-white font-semibold">Explore Features</h4>
                  <p className="text-gray-300 text-sm">Try our AI chat, token analysis, and market monitoring tools.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-yellow-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">5</div>
                <div>
                  <h4 className="text-white font-semibold">Join Community</h4>
                  <p className="text-gray-300 text-sm">Connect with other traders and share insights in our community.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">6</div>
                <div>
                  <h4 className="text-white font-semibold">Start Trading</h4>
                  <p className="text-gray-300 text-sm">Use our insights to make informed decisions and grow your portfolio.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-6 rounded-lg border border-green-500/20">
            <h4 className="text-lg font-semibold text-white mb-3">Pro Tips for Beginners</h4>
            <ul className="text-gray-300 space-y-2">
              <li>• Start with small investments to learn and build confidence</li>
              <li>• Always do your own research alongside our analysis</li>
              <li>• Set up stop-losses to protect your investments</li>
              <li>• Diversify your portfolio across different tokens</li>
              <li>• Keep learning and stay updated with market trends</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <a 
                href="/" 
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-700/50"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                <span className="text-sm font-medium">Back to Home</span>
              </a>
            </div>
            <div className="flex justify-center">
              <Logo size="xl" showText={true} />
            </div>
            <div className="w-32"></div> {/* Spacer for balance */}
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              ØRUG Documentation
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to know about the most advanced AI-powered token analysis platform for Solana
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-800/30 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-4">
            <a
              href="/"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4" />
              <span>Home</span>
            </a>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors whitespace-nowrap"
              >
                {section.icon}
                <span>{section.title}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-16">
          {sections.map((section, index) => (
            <motion.section
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="scroll-mt-20"
            >
              <div className="flex items-center mb-8">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-lg mr-4">
                  {section.icon}
                </div>
                <h2 className="text-3xl font-bold text-white">{section.title}</h2>
              </div>
              {section.content}
            </motion.section>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-8 rounded-lg border border-green-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Start?</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join thousands of traders who are already using ØRUG to make smarter investment decisions 
              and navigate the Solana ecosystem with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3">
                Get Started Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <div className="relative group">
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3">
                  Join Community
                </Button>
                {/* Dropdown Menu */}
                <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                  <div className="py-2">
                    <a 
                      href="https://t.me/orugsol" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-xs">T</span>
                      </div>
                      <span className="text-sm font-medium">Telegram</span>
                    </a>
                    <a 
                      href="https://x.com/0rugsol" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-xs">X</span>
                      </div>
                      <span className="text-sm font-medium">X (Twitter)</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 