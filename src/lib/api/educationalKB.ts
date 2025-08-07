// Educational Knowledge Base for Token Analysis
// Provides structured guidance for users on what to look for in tokens

export interface TokenChecklist {
  category: string;
  items: ChecklistItem[];
  importance: 'critical' | 'high' | 'medium' | 'low';
}

export interface ChecklistItem {
  item: string;
  description: string;
  howToCheck: string;
  redFlags: string[];
  greenFlags: string[];
}

export interface EducationalContent {
  topic: string;
  title: string;
  content: string;
  checklist: TokenChecklist[];
  examples: string[];
  tips: string[];
}

// Comprehensive token analysis checklist
export const TOKEN_ANALYSIS_CHECKLIST: TokenChecklist[] = [
  {
    category: "🔐 Security & Trust",
    importance: "critical",
    items: [
      {
        item: "LP Lock Status",
        description: "Check if liquidity is locked and for how long",
        howToCheck: "Look for LP lock duration and percentage locked",
        redFlags: ["LP unlocked", "Lock < 6 months", "Low lock percentage"],
        greenFlags: ["LP locked 6+ months", "High lock percentage", "Multiple locks"]
      },
      {
        item: "Contract Ownership",
        description: "Verify who owns the contract and their history",
        howToCheck: "Check contract owner and their transaction history",
        redFlags: ["Owner can mint", "Owner can pause", "Suspicious owner history"],
        greenFlags: ["Renounced ownership", "Multi-sig ownership", "Reputable owner"]
      },
      {
        item: "Honeypot Detection",
        description: "Ensure you can actually sell the token",
        howToCheck: "Test buy/sell functionality and check for blacklists",
        redFlags: ["Cannot sell", "High sell tax", "Blacklist function"],
        greenFlags: ["Normal buy/sell", "Low taxes", "No blacklist"]
      }
    ]
  },
  {
    category: "💰 Tokenomics",
    importance: "high",
    items: [
      {
        item: "Supply Distribution",
        description: "Check how tokens are distributed among holders",
        howToCheck: "Analyze top holder percentages and distribution",
        redFlags: ["Top holder > 20%", "Uneven distribution", "Whale concentration"],
        greenFlags: ["Even distribution", "Many small holders", "Top holder < 10%"]
      },
      {
        item: "Tax Structure",
        description: "Understand buy/sell taxes and their impact",
        howToCheck: "Check buy/sell taxes and where they go",
        redFlags: ["High taxes > 20%", "Taxes to owner", "Hidden taxes"],
        greenFlags: ["Low taxes < 10%", "Taxes to LP", "Transparent taxes"]
      },
      {
        item: "Token Utility",
        description: "Check if the token has real use cases",
        howToCheck: "Research project goals, partnerships, and roadmap",
        redFlags: ["No utility", "Vague roadmap", "No partnerships"],
        greenFlags: ["Clear utility", "Active development", "Real partnerships"]
      }
    ]
  },
  {
    category: "📊 Market Metrics",
    importance: "high",
    items: [
      {
        item: "Liquidity Depth",
        description: "Check if there's enough liquidity for trading",
        howToCheck: "Look at LP size and trading volume",
        redFlags: ["Low liquidity", "High price impact", "Thin order book"],
        greenFlags: ["High liquidity", "Low price impact", "Deep order book"]
      },
      {
        item: "Volume Analysis",
        description: "Check trading volume and its consistency",
        howToCheck: "Analyze 24h volume and volume trends",
        redFlags: ["Low volume", "Volume manipulation", "Wash trading"],
        greenFlags: ["High volume", "Organic growth", "Real trading"]
      },
      {
        item: "Market Cap vs FDV",
        description: "Compare market cap to fully diluted valuation",
        howToCheck: "Check if market cap is realistic vs total supply",
        redFlags: ["FDV too high", "Unrealistic valuation", "Token dumping"],
        greenFlags: ["Reasonable FDV", "Fair valuation", "Controlled supply"]
      }
    ]
  },
  {
    category: "👥 Community & Social",
    importance: "medium",
    items: [
      {
        item: "Community Engagement",
        description: "Check social media activity and community size",
        howToCheck: "Look at Twitter, Telegram, Discord activity",
        redFlags: ["Dead community", "Bot followers", "No engagement"],
        greenFlags: ["Active community", "Real engagement", "Growing followers"]
      },
      {
        item: "Developer Activity",
        description: "Check if developers are actively working",
        howToCheck: "Look for GitHub activity, updates, and communication",
        redFlags: ["No updates", "Ghost developers", "No communication"],
        greenFlags: ["Regular updates", "Active devs", "Good communication"]
      },
      {
        item: "Transparency",
        description: "Check how transparent the project is",
        howToCheck: "Look for public information, audits, and disclosures",
        redFlags: ["No information", "Hidden team", "No audits"],
        greenFlags: ["Public team", "Audited contracts", "Transparent info"]
      }
    ]
  },
  {
    category: "📈 Technical Analysis",
    importance: "medium",
    items: [
      {
        item: "Price Action",
        description: "Analyze price movements and patterns",
        howToCheck: "Look at price charts and technical indicators",
        redFlags: ["Pump and dump", "Artificial pumps", "No support"],
        greenFlags: ["Healthy growth", "Natural price action", "Strong support"]
      },
      {
        item: "Whale Activity",
        description: "Monitor large holder behavior",
        howToCheck: "Track whale transactions and holdings",
        redFlags: ["Whales dumping", "Large sells", "Concentrated selling"],
        greenFlags: ["Whales holding", "Large buys", "Distributed buying"]
      },
      {
        item: "Trading Patterns",
        description: "Look for healthy trading patterns",
        howToCheck: "Analyze buy/sell ratios and trading volume",
        redFlags: ["All sells", "No buying", "Manipulated volume"],
        greenFlags: ["Balanced trading", "Organic volume", "Natural patterns"]
      }
    ]
  }
];

// Educational content for different topics
export const EDUCATIONAL_CONTENT: Record<string, EducationalContent> = {
  "good_token_guide": {
    topic: "token_analysis",
    title: "What Should I Look For In A Good Token?",
    content: `Here's your comprehensive guide to analyzing tokens like a pro! 🚀

**🔍 The 5-Pillar Analysis Framework:**

1. **🔐 Security First** - Always check LP locks, contract ownership, and honeypot risks
2. **💰 Tokenomics Matter** - Supply distribution, taxes, and utility are crucial
3. **📊 Market Health** - Liquidity, volume, and realistic valuations
4. **👥 Community Strength** - Active engagement and transparent teams
5. **📈 Technical Signals** - Price action and whale behavior

**🎯 Quick Red Flags to Avoid:**
• LP unlocked or locked for < 6 months
• Top holder owns > 20% of supply
• High taxes (>20%) or hidden fees
• No utility or vague roadmap
• Dead community or ghost developers
• Unrealistic market cap vs FDV

**✅ Green Flags to Look For:**
• LP locked 6+ months with high percentage
• Even token distribution (top holder < 10%)
• Low, transparent taxes (< 10%)
• Clear utility and active development
• Growing, engaged community
• Realistic valuation and organic growth

**💡 Pro Tip:** Always DYOR (Do Your Own Research) and never invest more than you can afford to lose!`,
    checklist: TOKEN_ANALYSIS_CHECKLIST,
    examples: [
      "Good: BONK - LP locked, community-driven, clear utility",
      "Bad: Random token with unlocked LP and 50% owner wallet",
      "Good: SOL - Strong fundamentals, active development, real use case"
    ],
    tips: [
      "Start with security checks before anything else",
      "Compare to similar successful tokens in the space",
      "Check multiple timeframes for price analysis",
      "Verify all claims independently",
      "Join the project's community to gauge sentiment"
    ]
  },
  "rugpull_detection": {
    topic: "security",
    title: "How To Spot A Rugpull Before It Happens",
    content: `🚨 **Rugpull Detection Guide** - Protect yourself from scams!

**🔍 Key Warning Signs:**

1. **Contract Red Flags:**
   • Owner can mint unlimited tokens
   • Owner can pause trading
   • High sell taxes (>20%)
   • Blacklist function enabled
   • No liquidity lock or short lock period

2. **Tokenomics Red Flags:**
   • Top holder owns >50% of supply
   • Uneven distribution among holders
   • Hidden fees or complex tax structures
   • No utility or vague promises

3. **Team Red Flags:**
   • Anonymous developers
   • No social media presence
   • Copy-paste website
   • Unrealistic promises (1000x guaranteed)

4. **Market Red Flags:**
   • Sudden price spikes with no news
   • Low liquidity relative to market cap
   • Artificial volume or wash trading
   • No trading history or very new

**✅ How to Verify:**
• Check contract on Solscan/Solana Explorer
• Verify LP lock status and duration
• Research team and project history
• Test buy/sell functionality
• Check community sentiment

**🛡️ Protection Tips:**
• Never invest more than you can afford to lose
• Start with small amounts to test
• Use trusted DEXs and wallets
• Enable transaction confirmations
• Keep private keys secure

**💡 Remember:** If it sounds too good to be true, it probably is!`,
    checklist: [
      {
        category: "🚨 Critical Red Flags",
        importance: "critical",
        items: [
          {
            item: "LP Lock Status",
            description: "Check if liquidity is actually locked",
            howToCheck: "Verify lock duration and percentage on lock platforms",
            redFlags: ["Unlocked LP", "Lock < 6 months", "Low lock percentage"],
            greenFlags: ["LP locked 6+ months", "High lock percentage", "Multiple locks"]
          },
          {
            item: "Contract Ownership",
            description: "Check if owner can manipulate the contract",
            howToCheck: "Look for mint functions, pause functions, and owner privileges",
            redFlags: ["Owner can mint", "Owner can pause", "Suspicious functions"],
            greenFlags: ["Renounced ownership", "No mint function", "No pause function"]
          },
          {
            item: "Sell Functionality",
            description: "Test if you can actually sell the token",
            howToCheck: "Try to sell a small amount or check for blacklists",
            redFlags: ["Cannot sell", "High sell tax", "Blacklist active"],
            greenFlags: ["Normal selling", "Low taxes", "No blacklist"]
          }
        ]
      }
    ],
    examples: [
      "Rugpull Example: Token with unlocked LP, owner can mint, 50% sell tax",
      "Safe Example: LP locked 1 year, renounced ownership, 5% taxes"
    ],
    tips: [
      "Always check the contract code yourself",
      "Verify LP lock on multiple platforms",
      "Test buy/sell with small amounts first",
      "Research the team thoroughly",
      "Trust your gut - if it feels wrong, avoid it"
    ]
  }
};

// Function to get educational content based on topic
export function getEducationalContent(topic: string): EducationalContent | null {
  return EDUCATIONAL_CONTENT[topic] || null;
}

// Function to generate educational response
export function generateEducationalResponse(topic: string): string {
  const content = getEducationalContent(topic);
  if (!content) {
    return "I don't have educational content for that topic yet. Try asking about 'good token analysis' or 'rugpull detection'!";
  }

  return content.content;
}

// Function to get checklist for a topic
export function getChecklistForTopic(topic: string): TokenChecklist[] {
  const content = getEducationalContent(topic);
  return content?.checklist || [];
}

// Function to generate personalized advice based on user experience level
export function generatePersonalizedAdvice(experienceLevel: 'beginner' | 'intermediate' | 'advanced'): string {
  const advice = {
    beginner: `🎓 **Beginner-Friendly Tips:**
• Start with security basics - always check LP lock first
• Use simple tools like DexScreener for initial research
• Don't invest more than you can afford to lose
• Join communities to learn from others
• Focus on established projects initially`,

    intermediate: `🚀 **Intermediate Trader Tips:**
• Deep dive into tokenomics and distribution analysis
• Use advanced tools for whale tracking and volume analysis
• Develop your own checklist based on successful trades
• Network with other traders and share insights
• Consider both technical and fundamental analysis`,

    advanced: `⚡ **Advanced Trader Tips:**
• Build custom analysis tools and scripts
• Monitor real-time data feeds and whale movements
• Develop sophisticated risk management strategies
• Contribute to the community and share knowledge
• Consider arbitrage and MEV opportunities`
  };

  return advice[experienceLevel] || advice.beginner;
} 