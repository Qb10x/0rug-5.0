// Token Selector Component - following 0rug.com coding guidelines

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Info } from 'lucide-react';
import { Token, ContractSearchState } from './TradingState';

// Token selector props
interface TokenSelectorProps {
  selectedToken: string;
  onTokenSelect: (tokenAddress: string) => void;
  supportedTokens: Token[];
  placeholder: string;
  isInput: boolean;
}

// Token selector component
export function TokenSelector({
  selectedToken,
  onTokenSelect,
  supportedTokens,
  placeholder,
  isInput
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [contractSearch, setContractSearch] = useState<ContractSearchState>({
    isOpen: false,
    inputAddress: '',
    isSearching: false,
    foundToken: null,
    error: ''
  });

  // Get token info
  const getTokenInfo = (address: string): Token | null => {
    return supportedTokens.find(token => token.address === address) || null;
  };

  // Validate Solana address
  const isValidSolanaAddress = (address: string): boolean => {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  };

  // Search token by address
  const searchTokenByAddress = async (address: string) => {
    if (!isValidSolanaAddress(address)) {
      setContractSearch(prev => ({ ...prev, error: 'Invalid Solana address' }));
      return;
    }

    setContractSearch(prev => ({ ...prev, isSearching: true, error: '' }));

    try {
      // Mock token search - replace with actual API call
      const mockToken: Token = {
        address,
        symbol: 'TOKEN',
        name: 'Custom Token',
        decimals: 9,
        logoURI: '/api/placeholder/64/64'
      };

      setContractSearch(prev => ({
        ...prev,
        foundToken: mockToken,
        isSearching: false
      }));
    } catch (error) {
      setContractSearch(prev => ({
        ...prev,
        error: 'Token not found',
        isSearching: false
      }));
    }
  };

  // Handle contract search
  const handleContractSearch = (value: string) => {
    setContractSearch(prev => ({ ...prev, inputAddress: value }));
  };

  // Select found token
  const selectFoundToken = () => {
    if (contractSearch.foundToken) {
      onTokenSelect(contractSearch.foundToken.address);
      setContractSearch(prev => ({ ...prev, isOpen: false, inputAddress: '' }));
    }
  };

  // Filter tokens by search term
  const filteredTokens = supportedTokens.filter(token =>
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedTokenInfo = getTokenInfo(selectedToken);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors"
      >
        {selectedTokenInfo?.logoURI && (
          <img
            src={selectedTokenInfo.logoURI}
            alt={selectedTokenInfo.symbol}
            className="w-6 h-6 rounded-full"
          />
        )}
        <span className="font-medium">
          {selectedTokenInfo?.symbol || 'Select Token'}
        </span>
        <span className="text-gray-400">▼</span>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10"
        >
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tokens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent outline-none"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredTokens.map((token) => (
              <button
                key={token.address}
                onClick={() => {
                  onTokenSelect(token.address);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <img
                  src={token.logoURI}
                  alt={token.symbol}
                  className="w-6 h-6 rounded-full"
                />
                <div className="text-left">
                  <div className="font-medium">{token.symbol}</div>
                  <div className="text-sm text-gray-500">{token.name}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setContractSearch(prev => ({ ...prev, isOpen: true }))}
              className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
            >
              <Info className="w-4 h-4" />
              <span>Add Custom Token</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Contract Search Modal */}
      {contractSearch.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setContractSearch(prev => ({ ...prev, isOpen: false }))}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Custom Token</h3>
              <button
                onClick={() => setContractSearch(prev => ({ ...prev, isOpen: false }))}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Token Address</label>
                <input
                  type="text"
                  value={contractSearch.inputAddress}
                  onChange={(e) => handleContractSearch(e.target.value)}
                  placeholder="Enter Solana token address..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>

              {contractSearch.error && (
                <div className="text-red-500 text-sm">{contractSearch.error}</div>
              )}

              {contractSearch.foundToken && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <img
                      src={contractSearch.foundToken.logoURI}
                      alt={contractSearch.foundToken.symbol}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="font-medium">{contractSearch.foundToken.symbol}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {contractSearch.foundToken.name}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => searchTokenByAddress(contractSearch.inputAddress)}
                  disabled={contractSearch.isSearching}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
                >
                  {contractSearch.isSearching ? 'Searching...' : 'Search'}
                </button>
                {contractSearch.foundToken && (
                  <button
                    onClick={selectFoundToken}
                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                  >
                    Add Token
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
} 