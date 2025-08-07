'use client';

import React, { useState } from 'react';
import { Wallet, LogOut, Settings, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getStatusColor } from '@/lib/theme/colorUtils';

interface WalletManagerProps {
  walletAddress?: string;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  balance?: string;
}

// Wallet manager component
export default function WalletManager({ 
  walletAddress, 
  isConnected, 
  onConnect, 
  onDisconnect,
  balance 
}: WalletManagerProps) {
  const [showDetails, setShowDetails] = useState(false);
  const successColors = getStatusColor('success');

  // Format wallet address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <Button
          onClick={onConnect}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        {/* Wallet Status */}
        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
          <Wallet className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium text-green-500">
            {formatAddress(walletAddress || '')}
          </span>
        </div>

        {/* Disconnect Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onDisconnect}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </Button>

        {/* Settings Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>

      {/* Wallet Details Dropdown */}
      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
          <div className="space-y-3">
            {/* Wallet Info */}
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Wallet Address
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  {walletAddress}
                </p>
              </div>
            </div>

            {/* Balance */}
            {balance && (
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Balance
                  </p>
                  <p className="text-xs text-gray-500">
                    {balance} SOL
                  </p>
                </div>
              </div>
            )}

            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${successColors.bg}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Connected to Solana
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={onDisconnect}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect Wallet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 