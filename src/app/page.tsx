'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  MessageSquare, 
  TrendingUp,
  Shield,
  Sparkles,
  ArrowRight,
  Users,
  Zap,
  Star,
  Play,
  Send,
  Globe,
  CheckCircle,
  AlertTriangle,
  TrendingDown,
  Eye,
  X,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { colorUtils } from '@/lib/theme/colorUtils';
import { WaitlistModal } from "@/components/waitlist/WaitlistModal";
import { Logo } from "@/components/ui/Logo";
import Link from 'next/link';

// Demo Modal Component
const DemoModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState<Array<{type: 'user' | 'ai', content: string}>>([
    { type: 'ai', content: "Hey! I'm ØRUG, your AI token analyst. I can help you analyze any token, check for rugs, track whales, and more. Try asking me something like 'What's $BONK?' or paste a contract address!" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [queryCount, setQueryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  // Generate session ID on mount
  useEffect(() => {
    if (isOpen && !sessionId) {
      const newSessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setSessionId(newSessionId);
      
      // Check existing demo count from server
      fetch(`/api/demo?sessionId=${newSessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.demoCount) {
            setQueryCount(data.demoCount);
          }
        })
        .catch(console.error);
    }
  }, [isOpen, sessionId]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || queryCount >= 3 || !sessionId) return;
    
    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsLoading(true);
    
    try {
      // Call the server-side demo API with session tracking
      const response = await fetch('/api/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sessionId
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessages(prev => [...prev, { type: 'ai', content: data.response }]);
        setQueryCount(data.demoCount);
      } else if (data.demoComplete) {
        setMessages(prev => [...prev, { type: 'ai', content: data.message }]);
        setQueryCount(3); // Mark as complete
      } else {
        // Fallback response if API fails
        setMessages(prev => [...prev, { type: 'ai', content: "I'm having trouble analyzing that right now. Try asking about a different token or check back later!" }]);
      }
    } catch (error) {
      console.error('Demo API error:', error);
      // Fallback response
      setMessages(prev => [...prev, { type: 'ai', content: "I'm having trouble analyzing that right now. Try asking about a different token or check back later!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal - Full Chat Interface */}
      <div className="relative bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-4xl mx-4 h-[80vh] flex flex-col">
        {/* Chat Header - Like the real ØRUG Chat */}
        <div className="flex items-center space-x-4 p-6 border-b border-gray-700">
          <Logo size="md" showText={false} />
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">ØRUG Chat</h3>
            <p className="text-gray-400 text-sm">token analysis powered by AI</p>
            <p className="text-green-400 text-xs font-medium">Memes speak your language</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            </div>
            <span className="text-xs bg-gray-600 px-2 py-1 rounded-full text-gray-300">
              {3 - queryCount} queries left
            </span>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Chat Messages - Full Height */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-6 py-3 rounded-2xl ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-200'
              }`}>
                {message.type === 'ai' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Logo size="sm" showText={false} />
                    <span className="text-xs text-gray-400 font-medium">ØRUG</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-gray-200 px-6 py-3 rounded-2xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Logo size="sm" showText={false} />
                  <span className="text-xs text-gray-400 font-medium">ØRUG</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                  <span className="text-sm">Analyzing...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Message Input - Like the real interface */}
        <div className="flex items-center space-x-3 p-6 border-t border-gray-700">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
                          placeholder={queryCount >= 3 ? "Demo complete! Sign up for unlimited access." : "Type your message..."}
              disabled={queryCount >= 3}
            className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 h-12 text-sm"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || queryCount >= 3 || isLoading}
            size="sm"
            className="bg-gray-600 text-gray-400 hover:bg-gray-600 h-12 px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Demo Completion Overlay */}
        {queryCount >= 3 && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 max-w-md mx-4 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-semibold text-xl mb-2">Demo Complete!</h4>
              <p className="text-gray-300 text-sm mb-6">
                You've reached the demo limit. Ready for unlimited access to ØRUG's token analysis powered by AI?
              </p>
              <Button
                onClick={() => {
                  onClose();
                  setTimeout(() => {
                    const event = new CustomEvent('openWaitlist');
                    window.dispatchEvent(event);
                  }, 300);
                }}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 text-lg font-semibold"
              >
                Get Early Access
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Chat simulation messages
const chatMessages = [
  {
    user: "What's $BONK?",
    ai: "Yo! I'm Bonk 🐶 — Solana's wildest memecoin. 100% LP locked. Wanna vibe or dive?",
    type: "trending"
  },
  {
    user: "¿Qué es $BONK?",
    ai: "¡Hola! Soy Bonk 🐶 — el memecoin más salvaje de Solana. LP 100% bloqueado. ¿Quieres hacer vibe o dive?",
    type: "trending"
  },
  {
    user: "Qu'est-ce que $BONK?",
    ai: "Salut! Je suis Bonk 🐶 — le memecoin le plus fou de Solana. LP 100% verrouillé. Tu veux faire du vibe ou du dive?",
    type: "trending"
  },
  {
    user: "Paste CA: 8hhm...ddG",
    ai: "I'm $GOKU. Born 2 hours ago. LP 100% locked for 6 months. 37 whales are watching. DYOR tho 👀",
    type: "analysis"
  },
  {
    user: "Pega CA: 8hhm...ddG",
    ai: "Soy $GOKU. Nacido hace 2 horas. LP 100% bloqueado por 6 meses. 37 ballenas están mirando. DYOR tho 👀",
    type: "analysis"
  },
  {
    user: "Colle CA: 8hhm...ddG",
    ai: "Je suis $GOKU. Né il y a 2 heures. LP 100% verrouillé pour 6 mois. 37 baleines regardent. DYOR tho 👀",
    type: "analysis"
  },
  {
    user: "What's trending today?",
    ai: "Solana or ETH? I've got fire 🔥 on both chains.",
    type: "trending"
  },
  {
    user: "¿Qué está de moda hoy?",
    ai: "¿Solana o ETH? Tengo fuego 🔥 en ambas cadenas.",
    type: "trending"
  },
  {
    user: "Qu'est-ce qui est tendance aujourd'hui?",
    ai: "Solana ou ETH? J'ai du feu 🔥 sur les deux chaînes.",
    type: "trending"
  },
  {
    user: "Is this token a rug?",
    ai: "LP is unlocked, owner holds 87%, and liquidity is thin. Smells like rug perfume 💩",
    type: "rug_check"
  },
  {
    user: "¿Es este token un rug?",
    ai: "LP está desbloqueado, el dueño tiene 87%, y la liquidez es poca. Huele a perfume de rug 💩",
    type: "rug_check"
  },
  {
    user: "Est-ce que ce token est un rug?",
    ai: "LP est déverrouillé, le propriétaire détient 87%, et la liquidité est faible. Ça sent le parfum de rug 💩",
    type: "rug_check"
  },
  {
    user: "Can I sell this token?",
    ai: "Contract has a 35% sell tax + blacklist feature. Stay away, fren ⚠️",
    type: "honeypot"
  },
  {
    user: "¿Puedo vender este token?",
    ai: "El contrato tiene un impuesto de venta del 35% + función de lista negra. Mantente alejado, fren ⚠️",
    type: "honeypot"
  },
  {
    user: "Puis-je vendre ce token?",
    ai: "Le contrat a une taxe de vente de 35% + fonction de liste noire. Reste loin, fren ⚠️",
    type: "honeypot"
  },
  {
    user: "Show me whale movements",
    ai: "Big whale just bought 50K $PEPE. 3 wallets accumulating. Bullish signal? 📈",
    type: "whale"
  },
  {
    user: "Muéstrame movimientos de ballenas",
    ai: "Gran ballena acaba de comprar 50K $PEPE. 3 wallets acumulando. ¿Señal alcista? 📈",
    type: "whale"
  },
  {
    user: "Montre-moi les mouvements de baleines",
    ai: "Grosse baleine vient d'acheter 50K $PEPE. 3 wallets accumulent. Signal haussier? 📈",
    type: "whale"
  },
  {
    user: "Check LP lock status",
    ai: "LP is 100% locked for 6 months. Team tokens vested. This looks solid! ✅",
    type: "lp_check"
  },
  {
    user: "Verifica el estado del bloqueo LP",
    ai: "LP está 100% bloqueado por 6 meses. Tokens del equipo con vesting. ¡Esto se ve sólido! ✅",
    type: "lp_check"
  },
  {
    user: "Vérifie le statut de verrouillage LP",
    ai: "LP est 100% verrouillé pour 6 mois. Tokens de l'équipe avec vesting. Ça a l'air solide! ✅",
    type: "lp_check"
  },
  {
    user: "What's the market cap?",
    ai: "Current MC: $2.4M. FDV: $8.7M. 72% of supply in circulation. Pretty healthy ratios! 📊",
    type: "metrics"
  },
  {
    user: "¿Cuál es la capitalización de mercado?",
    ai: "MC actual: $2.4M. FDV: $8.7M. 72% del suministro en circulación. ¡Ratios bastante saludables! 📊",
    type: "metrics"
  },
  {
    user: "Quelle est la capitalisation boursière?",
    ai: "MC actuelle: $2.4M. FDV: $8.7M. 72% de l'offre en circulation. Ratios assez sains! 📊",
    type: "metrics"
  },
  {
    user: "Who are the top holders?",
    ai: "Top 10 holders own 23% of supply. Biggest whale: 8.2%. Pretty decentralized! 🐋",
    type: "holders"
  },
  {
    user: "¿Quiénes son los principales tenedores?",
    ai: "Los 10 principales tenedores poseen 23% del suministro. Ballena más grande: 8.2%. ¡Bastante descentralizado! 🐋",
    type: "holders"
  },
  {
    user: "Qui sont les principaux détenteurs?",
    ai: "Les 10 principaux détenteurs possèdent 23% de l'offre. Plus grosse baleine: 8.2%. Assez décentralisé! 🐋",
    type: "holders"
  },
  {
    user: "Is this a honeypot?",
    ai: "✅ Sell function works. ✅ No blacklist. ✅ Low sell tax (5%). Looks safe to trade! 🛡️",
    type: "honeypot_check"
  },
  {
    user: "¿Es esto una honeypot?",
    ai: "✅ La función de venta funciona. ✅ Sin lista negra. ✅ Impuesto de venta bajo (5%). ¡Se ve seguro para operar! 🛡️",
    type: "honeypot_check"
  },
  {
    user: "Est-ce une honeypot?",
    ai: "✅ La fonction de vente fonctionne. ✅ Pas de liste noire. ✅ Taxe de vente faible (5%). Ça a l'air sûr à trader! 🛡️",
    type: "honeypot_check"
  },
  {
    user: "What's the token age?",
    ai: "Token launched 3 days ago. Contract verified. Team doxxed. Green flags everywhere! 🚀",
    type: "age_check"
  },
  {
    user: "¿Cuál es la edad del token?",
    ai: "Token lanzado hace 3 días. Contrato verificado. Equipo doxxed. ¡Banderas verdes por todas partes! 🚀",
    type: "age_check"
  },
  {
    user: "Quel est l'âge du token?",
    ai: "Token lancé il y a 3 jours. Contrat vérifié. Équipe doxxed. Drapeaux verts partout! 🚀",
    type: "age_check"
  },
  {
    user: "Show me the chart",
    ai: "Price up 47% today! Volume spiking. RSI at 65. Looks like we're in an uptrend! 📈",
    type: "chart"
  },
  {
    user: "Muéstrame el gráfico",
    ai: "¡Precio subió 47% hoy! Volumen disparándose. RSI en 65. ¡Parece que estamos en una tendencia alcista! 📈",
    type: "chart"
  },
  {
    user: "Montre-moi le graphique",
    ai: "Prix en hausse de 47% aujourd'hui! Volume en flèche. RSI à 65. On dirait qu'on est en tendance haussière! 📈",
    type: "chart"
  },
  {
    user: "Any red flags?",
    ai: "⚠️ Owner can pause trading. ⚠️ High buy tax (15%). ⚠️ Unlocked LP. Be careful!",
    type: "red_flags"
  },
  {
    user: "¿Alguna bandera roja?",
    ai: "⚠️ El dueño puede pausar el trading. ⚠️ Impuesto de compra alto (15%). ⚠️ LP desbloqueado. ¡Ten cuidado!",
    type: "red_flags"
  },
  {
    user: "Des drapeaux rouges?",
    ai: "⚠️ Le propriétaire peut suspendre le trading. ⚠️ Taxe d'achat élevée (15%). ⚠️ LP déverrouillé. Fais attention!",
    type: "red_flags"
  },
  {
    user: "Compare with similar tokens",
    ai: "Similar to $PEPE but with better tokenomics. Lower MC, higher potential. DYOR! 🔍",
    type: "comparison"
  },
  {
    user: "Compara con tokens similares",
    ai: "Similar a $PEPE pero con mejor tokenomics. MC más baja, mayor potencial. ¡DYOR! 🔍",
    type: "comparison"
  },
  {
    user: "Compare avec des tokens similaires",
    ai: "Similaire à $PEPE mais avec une meilleure tokenomics. MC plus basse, potentiel plus élevé. DYOR! 🔍",
    type: "comparison"
  },
  {
    user: "What's the community like?",
    ai: "Telegram: 12K members, active. Twitter: 8K followers. Community looks engaged! 💬",
    type: "community"
  },
  {
    user: "¿Cómo es la comunidad?",
    ai: "Telegram: 12K miembros, activos. Twitter: 8K seguidores. ¡La comunidad se ve comprometida! 💬",
    type: "community"
  },
  {
    user: "Comment est la communauté?",
    ai: "Telegram: 12K membres, actifs. Twitter: 8K followers. La communauté a l'air engagée! 💬",
    type: "community"
  },
  {
    user: "Should I buy now?",
    ai: "Not financial advice! But LP is locked, team is doxxed, and community is growing. DYOR! 🤔",
    type: "advice"
  },
  {
    user: "¿Debería comprar ahora?",
    ai: "¡No es consejo financiero! Pero LP está bloqueado, equipo doxxed, y la comunidad está creciendo. ¡DYOR! 🤔",
    type: "advice"
  },
  {
    user: "Devrais-je acheter maintenant?",
    ai: "Pas de conseil financier! Mais LP est verrouillé, équipe doxxed, et la communauté grandit. DYOR! 🤔",
    type: "advice"
  },
  {
    user: "Check for bots",
    ai: "Bot activity: Low. Most transactions are real users. No bot manipulation detected! 🤖",
    type: "bot_check"
  },
  {
    user: "Verifica si hay bots",
    ai: "Actividad de bots: Baja. La mayoría de transacciones son usuarios reales. ¡No se detectó manipulación de bots! 🤖",
    type: "bot_check"
  },
  {
    user: "Vérifie les bots",
    ai: "Activité des bots: Faible. La plupart des transactions sont des vrais utilisateurs. Pas de manipulation de bots détectée! 🤖",
    type: "bot_check"
  },
  {
    user: "What's the roadmap?",
    ai: "Phase 1: Launch ✅ Phase 2: CEX listings 🚀 Phase 3: NFT collection 🎨",
    type: "roadmap"
  },
  {
    user: "¿Cuál es el roadmap?",
    ai: "Fase 1: Lanzamiento ✅ Fase 2: Listados en CEX 🚀 Fase 3: Colección NFT 🎨",
    type: "roadmap"
  },
  {
    user: "Quel est le roadmap?",
    ai: "Phase 1: Lancement ✅ Phase 2: Listings CEX 🚀 Phase 3: Collection NFT 🎨",
    type: "roadmap"
  },
  {
    user: "Any partnerships?",
    ai: "Partnership with major DEX announced! Marketing wallet funded. Bullish news! 🤝",
    type: "partnerships"
  },
  {
    user: "¿Algún partnership?",
    ai: "¡Partnership con DEX importante anunciado! Wallet de marketing financiado. ¡Noticias alcistas! 🤝",
    type: "partnerships"
  },
  {
    user: "Des partenariats?",
    ai: "Partenariat avec un DEX majeur annoncé! Wallet marketing financé. Nouvelles haussières! 🤝",
    type: "partnerships"
  },
  {
    user: "What's the utility?",
    ai: "Governance token + staking rewards + NFT marketplace. Real utility, not just memes! 🎯",
    type: "utility"
  },
  {
    user: "¿Cuál es la utilidad?",
    ai: "Token de gobernanza + recompensas de staking + marketplace NFT. ¡Utilidad real, no solo memes! 🎯",
    type: "utility"
  },
  {
    user: "Quelle est l'utilité?",
    ai: "Token de gouvernance + récompenses de staking + marketplace NFT. Utilité réelle, pas juste des memes! 🎯",
    type: "utility"
  }
];

// Landing page component
export default function LandingPage() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Rotate through chat messages
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTyping(true);
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % chatMessages.length);
        setIsTyping(false);
      }, 1000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentMessage = chatMessages[currentMessageIndex];

  const handleStartChatting = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
    setShowWaitlistModal(true);
  };

  // Listen for demo completion event
  useEffect(() => {
    const handleOpenWaitlist = () => {
      setShowWaitlistModal(true);
    };

    window.addEventListener('openWaitlist', handleOpenWaitlist);
    return () => window.removeEventListener('openWaitlist', handleOpenWaitlist);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Logo size="md" showText={true} />

            {/* Navigation and Auth */}
            <div className="flex items-center space-x-4">
              {/* Docs Link */}
              <Link 
                href="/docs"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-800/50"
              >
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">Docs</span>
              </Link>
              
              {/* Dashboard Button */}
              <Link href="/trading">
                <Button
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-0"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Panel - Text & Branding (6/12) */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Hero Section with Better Layout */}
              <div className="mb-8">
                {/* Main Headline - Centered and prominent */}
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight text-center lg:text-left">
                  Built Different.
                  <br />
                  <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    Memes Talk Back.
                  </span>
                </h1>
              </div>

              {/* Subtext */}
              <p className="text-lg text-gray-300 mb-8 leading-relaxed text-center lg:text-left">
                It's like talking to tokens before aping in.
                <br />
                <span className="text-gray-400 text-base">No fluff. Just facts.</span>
              </p>

              {/* Features - Improved Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 hover:scale-105">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">👻</span>
                    </div>
                    <div>
                      <h3 className="text-purple-300 font-semibold text-sm mb-1">Paste any CA</h3>
                      <p className="text-gray-300 text-xs leading-relaxed">and the token talks back like an AI</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 hover:scale-105">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">🧠</span>
                    </div>
                    <div>
                      <h3 className="text-red-300 font-semibold text-sm mb-1">Sniff out rugs</h3>
                      <p className="text-gray-300 text-xs leading-relaxed">honeypots, and stealth traps before they get you</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 hover:scale-105">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">🐳</span>
                    </div>
                    <div>
                      <h3 className="text-blue-300 font-semibold text-sm mb-1">Spot whales</h3>
                      <p className="text-gray-300 text-xs leading-relaxed">and trending tokens before they trend on X</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 hover:scale-105">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">🧩</span>
                    </div>
                    <div>
                      <h3 className="text-green-300 font-semibold text-sm mb-1">All-in-one alpha radar</h3>
                      <p className="text-gray-300 text-xs leading-relaxed">powered by real on-chain data</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center lg:justify-start">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                                  <Button 
                  size="lg"
                  onClick={handleStartChatting}
                  className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg w-full sm:w-auto"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Early Access
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={() => setShowDemoModal(true)}
                    className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 hover:from-blue-700 hover:via-cyan-600 hover:to-teal-500 text-white font-semibold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-0 w-full sm:w-auto"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Try Demo
                    <span className="text-xs ml-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white font-medium">3 queries</span>
                  </Button>
                </motion.div>
              </div>

              <p className="text-gray-400 text-sm mt-3">
                Follow us on <a href="https://x.com/0rugsol" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">X</a> and <a href="https://t.me/orugsol" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">Telegram</a> for updates
              </p>
            </motion.div>
          </div>

          {/* Right Panel - Live Chat UI Preview (7/12) */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-gray-800 rounded-2xl border border-gray-700 p-8 shadow-2xl h-[600px] flex flex-col"
            >
              {/* Chat Header */}
              <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-gray-700">
                <Logo size="md" showText={false} />
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">ØRUG Chat</h3>
                  <p className="text-gray-400 text-sm">token analysis powered by AI</p>
                  <p className="text-green-400 text-xs font-medium">Memes speak your language</p>
                </div>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 space-y-4 mb-6 overflow-y-auto max-h-[400px] pr-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentMessageIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl rounded-br-md max-w-md">
                        <p className="text-sm font-medium">{currentMessage.user}</p>
                      </div>
                    </div>

                    {/* AI Message */}
                    <div className="flex justify-start">
                      <div className="bg-gray-700 text-gray-200 px-6 py-3 rounded-2xl rounded-bl-md max-w-md">
                        <div className="flex items-center space-x-2 mb-2">
                          <Logo size="sm" showText={false} />
                          <span className="text-xs text-gray-400 font-medium">ØRUG</span>
                        </div>
                        <p className="text-sm leading-relaxed">
                          {isTyping ? (
                            <span className="flex items-center">
                              <span className="animate-pulse">Typing</span>
                              <span className="ml-1">...</span>
                            </span>
                          ) : (
                            currentMessage.ai
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Additional Demo Messages */}
                    <div className="space-y-4 mt-6">
                      {/* Quick Action Buttons */}
                      <div className="flex flex-wrap gap-2 justify-end">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          Check LP Lock
                        </button>
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          Whale Alert
                        </button>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          Risk Score
                        </button>
                        <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          Chart Analysis
                        </button>
                      </div>

                      {/* Additional AI Response */}
                      <div className="flex justify-start">
                        <div className="bg-gray-700 text-gray-200 px-6 py-3 rounded-2xl rounded-bl-md max-w-md">
                          <div className="flex items-center space-x-2 mb-2">
                            <Bot className="w-4 h-4 text-green-400" />
                            <span className="text-xs text-gray-400 font-medium">ØRUG</span>
                          </div>
                          <p className="text-sm leading-relaxed">
                            I can also help you with:
                          </p>
                          <ul className="text-xs text-gray-300 mt-2 space-y-1">
                            <li>• Token price analysis & charts</li>
                            <li>• Holder distribution & whale tracking</li>
                            <li>• Contract security audits</li>
                            <li>• Trending tokens & market sentiment</li>
                            <li>• Honeypot detection & rug pull alerts</li>
                            <li>• Community analysis & social sentiment</li>
                            <li>• Token comparison & competitor analysis</li>
                            <li>• Real-time alerts & notifications</li>
                          </ul>
                        </div>
                      </div>

                      {/* Status Indicators */}
                      <div className="flex justify-start">
                        <div className="bg-gray-700 text-gray-200 px-6 py-3 rounded-2xl rounded-bl-md max-w-md">
                          <div className="flex items-center space-x-2 mb-2">
                            <Logo size="sm" showText={false} />
                            <span className="text-xs text-gray-400 font-medium">ØRUG</span>
                          </div>
                          <div className="text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span>LP Lock Status:</span>
                              <span className="text-green-400">✅ Locked</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Contract Verified:</span>
                              <span className="text-green-400">✅ Yes</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Risk Score:</span>
                              <span className="text-yellow-400">⚠️ Medium</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Whale Activity:</span>
                              <span className="text-blue-400">📈 High</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Message Input (Disabled) */}
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-700">
                <Input
                  placeholder="Type your message..."
                  disabled
                  className="flex-1 bg-gray-700 border-gray-600 text-gray-300 placeholder-gray-500 h-12 text-sm"
                />
                <Button
                  size="sm"
                  disabled
                  className="bg-gray-600 text-gray-400 hover:bg-gray-600 h-12 px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="border-t border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-gray-400 mb-4">
              <strong className="text-white">Join the early access community.</strong>
            </p>
            <p className="text-sm text-gray-500">
              Runs on Solana RPC, DexScreener, Helius, Moralis, QuickNode, Jupiter & AI magic.
            </p>
            <div className="flex items-center justify-center space-x-6 mt-4 text-gray-400">
              <span className="text-sm">Solana</span>
              <span className="text-sm">BSC</span>
              <span className="text-sm">ETH</span>
              <span className="text-sm">Arbitrum</span>
              <span className="text-sm">Base</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50"
          >
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * window.innerWidth, 
                  y: -10,
                  rotate: 0 
                }}
                animate={{ 
                  y: window.innerHeight + 10,
                  rotate: 360 
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2,
                  ease: "easeOut"
                }}
                className="absolute w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waitlist Modal */}
      <WaitlistModal 
        isOpen={showWaitlistModal} 
        onClose={() => setShowWaitlistModal(false)} 
      />
      
      {/* Demo Modal */}
      <DemoModal 
        isOpen={showDemoModal} 
        onClose={() => setShowDemoModal(false)} 
      />
    </div>
  );
} 