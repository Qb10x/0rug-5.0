// Token card types - following 0rug.com coding guidelines

// Token data interface
export interface TokenData {
  symbol: string;
  name: string;
  icon: string;
  price: string;
  priceChange: number;
  liquidity: string;
  volume: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  rugRisk: 'Low' | 'Medium' | 'High';
  marketCap?: string;
  holders?: number;
  age?: string;
  contract?: string;
  whaleActivity?: WhaleActivityData;
  tradingAnalysis?: TradingAnalysisData;
}

// Whale activity data
export interface WhaleActivityData {
  topHoldersPercent: number;
  recentLargeTrades: number;
  whaleConfidence: number;
}

// Trading analysis data
export interface TradingAnalysisData {
  buySellRatio: number;
  avgTradeSize: string;
  volatility: 'Low' | 'Medium' | 'High';
}

// Expandable section props
export interface ExpandableSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}

// Token card props
export interface TokenCardProps {
  token: TokenData;
} 