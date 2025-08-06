// Wallet Manager Component - following 0rug.com coding guidelines

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, LogOut, Zap } from 'lucide-react';
import { WalletState, WalletModalState } from './TradingState';

// Wallet manager props
interface WalletManagerProps {
  walletState: WalletState;
  walletModal: WalletModalState;
  onConnectWallet: (walletId: string) => Promise<void>;
  onDisconnectWallet: () => void;
  onOpenWalletModal: () => void;
  onCloseWalletModal: () => void;
}

// Wallet manager component
export function WalletManager({
  walletState,
  walletModal,
  onConnectWallet,
  onDisconnectWallet,
  onOpenWalletModal,
  onCloseWalletModal
}: WalletManagerProps) {
  // Get available wallets
  const getAvailableWallets = () => {
    return [
      { id: 'phantom', name: 'Phantom', icon: '👻' },
      { id: 'solflare', name: 'Solflare', icon: '🔥' },
      { id: 'backpack', name: 'Backpack', icon: '🎒' }
    ];
  };

  // Format wallet address
  const formatWalletAddress = (address: string): string => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex items-center gap-4">
      {walletState.isConnected ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
            <Wallet className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-500">
              {formatWalletAddress(walletState.publicKey)}
            </span>
          </div>
          <button
            onClick={onDisconnectWallet}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={onOpenWalletModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <Zap className="w-4 h-4" />
          <span>Connect Wallet</span>
        </button>
      )}

      {/* Wallet Modal */}
      {walletModal.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={onCloseWalletModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Connect Wallet</h3>
              <button
                onClick={onCloseWalletModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {getAvailableWallets().map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => onConnectWallet(wallet.id)}
                  disabled={walletModal.isLoading}
                  className="w-full flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-xl">{wallet.icon}</span>
                  <span className="font-medium">{wallet.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
} 