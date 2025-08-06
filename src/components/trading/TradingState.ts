// Trading State Types - following 0rug.com coding guidelines

// Trading interface
export interface TradingState {
  inputToken: string;
  outputToken: string;
  inputAmount: string;
  outputAmount: string;
  slippage: number;
  isLoading: boolean;
  quote: QuoteData | null;
  error: string;
}

// Quote data interface
export interface QuoteData {
  inputAmount: number;
  outputAmount: number;
  priceImpact: number;
  fee: number;
  route: string[];
}

// Token interface
export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
}

// Wallet interface
export interface WalletState {
  isConnected: boolean;
  publicKey: string;
  balance: number;
  isLoading: boolean;
}

// Wallet modal interface
export interface WalletModalState {
  isOpen: boolean;
  selectedWallet: string | null;
  isLoading: boolean;
}

// Contract search interface
export interface ContractSearchState {
  isOpen: boolean;
  inputAddress: string;
  isSearching: boolean;
  foundToken: Token | null;
  error: string;
} 