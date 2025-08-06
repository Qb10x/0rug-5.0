// Trading Hooks - following 0rug.com coding guidelines

import { useState, useEffect } from 'react';
import { TradingState, Token, QuoteData } from './TradingState';

// Use trading state hook
export function useTradingState() {
  const [tradingState, setTradingState] = useState<TradingState>({
    inputToken: 'So11111111111111111111111111111111111111112', // SOL
    outputToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    inputAmount: '',
    outputAmount: '',
    slippage: 0.5,
    isLoading: false,
    quote: null,
    error: ''
  });

  // Handle input change
  const handleInputChange = (value: string) => {
    setTradingState((prev: TradingState) => ({
      ...prev,
      inputAmount: value,
      outputAmount: '',
      quote: null,
      error: ''
    }));
  };

  // Handle token selection
  const handleTokenSelect = (tokenAddress: string, isInput: boolean) => {
    setTradingState((prev: TradingState) => ({
      ...prev,
      [isInput ? 'inputToken' : 'outputToken']: tokenAddress,
      outputAmount: '',
      quote: null,
      error: ''
    }));
  };

  return {
    tradingState,
    setTradingState,
    handleInputChange,
    handleTokenSelect
  };
}

// Use supported tokens hook
export function useSupportedTokens() {
  const [supportedTokens, setSupportedTokens] = useState<Token[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(true);

  // Load supported tokens
  const loadSupportedTokens = async () => {
    try {
      setIsLoadingTokens(true);
      // Mock token data - replace with actual API call
      const mockTokens: Token[] = [
        {
          address: 'So11111111111111111111111111111111111111112',
          symbol: 'SOL',
          name: 'Solana',
          decimals: 9,
          logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
        },
        {
          address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
        },
        {
          address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
          symbol: 'USDT',
          name: 'Tether USD',
          decimals: 6,
          logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png'
        }
      ];
      setSupportedTokens(mockTokens);
    } catch {
      // Handle error silently for now
    } finally {
      setIsLoadingTokens(false);
    }
  };

  useEffect(() => {
    loadSupportedTokens();
  }, []);

  return {
    supportedTokens,
    isLoadingTokens,
    loadSupportedTokens
  };
}

// Use quote hook
export function useQuote(
  tradingState: TradingState, 
  setTradingState: React.Dispatch<React.SetStateAction<TradingState>>
) {
  // Get quote from API
  const getQuote = async () => {
    if (!tradingState.inputAmount || parseFloat(tradingState.inputAmount) <= 0) {
      return;
    }

    setTradingState((prev: TradingState) => ({ ...prev, isLoading: true, error: '' }));

    try {
      // Mock quote API call - replace with actual Jupiter API
      const mockQuote: QuoteData = {
        inputAmount: parseFloat(tradingState.inputAmount),
        outputAmount: parseFloat(tradingState.inputAmount) * 20.5, // Mock rate
        priceImpact: 0.1,
        fee: 0.0001,
        route: ['SOL', 'USDC']
      };

      setTradingState((prev: TradingState) => ({
        ...prev,
        quote: mockQuote,
        outputAmount: mockQuote.outputAmount.toString(),
        isLoading: false
      }));
    } catch {
      setTradingState((prev: TradingState) => ({
        ...prev,
        error: 'Failed to get quote. Please try again.',
        isLoading: false
      }));
    }
  };

  return { getQuote };
}

// Use swap execution hook
export function useSwapExecution(
  tradingState: TradingState, 
  setTradingState: React.Dispatch<React.SetStateAction<TradingState>>
) {
  // Execute swap
  const executeSwap = async () => {
    if (!tradingState.quote) {
      return;
    }

    setTradingState((prev: TradingState) => ({ ...prev, isLoading: true, error: '' }));

    try {
      // Mock swap execution - replace with actual Jupiter swap
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      setTradingState((prev: TradingState) => ({
        ...prev,
        isLoading: false,
        inputAmount: '',
        outputAmount: '',
        quote: null
      }));
    } catch {
      setTradingState((prev: TradingState) => ({
        ...prev,
        error: 'Swap failed. Please try again.',
        isLoading: false
      }));
    }
  };

  return { executeSwap };
} 