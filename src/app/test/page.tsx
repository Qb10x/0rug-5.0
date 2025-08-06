// Test page for Dexscreener integration
// Following 0rug.com coding guidelines

'use client';

import { useState } from 'react';
import { getDexscreenerTokenData, getTrendingSolanaTokens, getTrendingTokensByChain, getSupportedChains, getChainDisplayName } from '@/lib/api/dexscreener';

// Main test page component
export default function TestPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testDexscreenerAPI = async () => {
    setIsLoading(true);
    setTestResult('Testing Dexscreener API...\n');

    try {
      // Test 1: Get SOL token data
      setTestResult(prev => prev + '🔍 Testing SOL token data...\n');
      const solData = await getDexscreenerTokenData('So11111111111111111111111111111111111111112');
      
      if (solData) {
        setTestResult(prev => prev + `✅ SOL Data: $${parseFloat(solData.priceUsd).toFixed(2)} (${solData.priceChange.h24 > 0 ? '+' : ''}${solData.priceChange.h24.toFixed(2)}%)\n`);
      } else {
        setTestResult(prev => prev + '❌ Failed to get SOL data\n');
      }

      // Test 2: Get trending Solana tokens
      setTestResult(prev => prev + '🔥 Testing Solana trending tokens...\n');
      const solanaTokens = await getTrendingTokensByChain('solana');
      
      if (solanaTokens.length > 0) {
        setTestResult(prev => prev + `✅ Found ${solanaTokens.length} Solana trending tokens\n`);
        solanaTokens.slice(0, 3).forEach(token => {
          setTestResult(prev => prev + `   • ${token.baseToken.symbol}: $${parseFloat(token.priceUsd).toFixed(6)}\n`);
        });
      } else {
        setTestResult(prev => prev + '❌ No Solana trending tokens found\n');
      }

      // Test 3: Get trending BSC tokens
      setTestResult(prev => prev + '🔥 Testing BSC trending tokens...\n');
      const bscTokens = await getTrendingTokensByChain('bsc');
      
      if (bscTokens.length > 0) {
        setTestResult(prev => prev + `✅ Found ${bscTokens.length} BSC trending tokens\n`);
        bscTokens.slice(0, 3).forEach(token => {
          setTestResult(prev => prev + `   • ${token.baseToken.symbol}: $${parseFloat(token.priceUsd).toFixed(6)}\n`);
        });
      } else {
        setTestResult(prev => prev + '❌ No BSC trending tokens found\n');
      }

      // Test 4: Test supported chains
      setTestResult(prev => prev + '🌐 Testing supported chains...\n');
      const supportedChains = getSupportedChains();
      setTestResult(prev => prev + `✅ Supported chains: ${supportedChains.join(', ')}\n`);

      setTestResult(prev => prev + '\n🎉 Multi-chain Dexscreener integration test completed!');
    } catch (error) {
      setTestResult(prev => prev + `❌ Error: ${error}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🧪 Multi-Chain Dexscreener Integration Test
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This page tests the multi-chain Dexscreener API integration for the MemeBot Chat.
          </p>

          <button
            onClick={testDexscreenerAPI}
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all duration-200 mb-6"
          >
            {isLoading ? 'Testing...' : 'Run Multi-Chain Test'}
          </button>

          {testResult && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Test Results:
              </h2>
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {testResult}
              </pre>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              🎯 Next Steps:
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Visit <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">/trading</code> to test the MemeBot Chat</li>
              <li>• Try asking "Show me trending Solana tokens" or "Show me trending BSC tokens"</li>
              <li>• Use the Newbie Explorer to browse tokens by chain</li>
              <li>• Test chain-specific questions in the chat</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 