'use client';

import React from 'react';
import Layout from '@/components/layout/Layout';
import { WalletManager } from '@/components/trading/WalletManager';
import { TradingInterface } from '@/components/trading/TradingInterface';
import { useTradingState, useSupportedTokens, useQuote, useSwapExecution } from '@/components/trading/useTradingHooks';
import { useWalletState, useWalletConnection } from '@/components/trading/useWalletHooks';

// Trading page component
export default function TradingPage() {
  // Trading state management
  const { tradingState, setTradingState, handleInputChange, handleTokenSelect } = useTradingState();
  
  // Supported tokens management
  const { supportedTokens } = useSupportedTokens();
  
  // Quote management
  const { getQuote } = useQuote(tradingState, setTradingState);
  
  // Swap execution
  const { executeSwap } = useSwapExecution(tradingState, setTradingState);
  
  // Wallet state management
  const { walletState, setWalletState, walletModal, setWalletModal } = useWalletState();
  
  // Wallet connection management
  const { openWalletModal, closeWalletModal, connectToWallet, disconnectWallet } = useWalletConnection(
    walletState,
    setWalletState,
    walletModal,
    setWalletModal
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Solana Trading
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Swap tokens instantly with the best rates
            </p>
          </div>

          {/* Wallet Connection */}
          <div className="flex justify-end mb-6">
            <WalletManager
              walletState={walletState}
              walletModal={walletModal}
              onConnectWallet={connectToWallet}
              onDisconnectWallet={disconnectWallet}
              onOpenWalletModal={openWalletModal}
              onCloseWalletModal={closeWalletModal}
            />
          </div>

          {/* Trading Interface */}
          <TradingInterface
            tradingState={tradingState}
            supportedTokens={supportedTokens}
            onInputChange={handleInputChange}
            onTokenSelect={handleTokenSelect}
            onGetQuote={getQuote}
            onExecuteSwap={executeSwap}
          />

          {/* Trading Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Total Volume
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                $2.4M
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last 24 hours
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Active Pairs
              </h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                1,247
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Trading pairs
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Best Rate
              </h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                99.8%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Success rate
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 