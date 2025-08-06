// Wallet Hooks - following 0rug.com coding guidelines

import { useState } from 'react';
import { WalletState, WalletModalState } from './TradingState';

// Use wallet state hook
export function useWalletState() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    publicKey: '',
    balance: 0,
    isLoading: false
  });

  const [walletModal, setWalletModal] = useState<WalletModalState>({
    isOpen: false,
    selectedWallet: null,
    isLoading: false
  });

  return {
    walletState,
    setWalletState,
    walletModal,
    setWalletModal
  };
}

// Use wallet connection hook
export function useWalletConnection(
  walletState: WalletState,
  setWalletState: React.Dispatch<React.SetStateAction<WalletState>>,
  walletModal: WalletModalState,
  setWalletModal: React.Dispatch<React.SetStateAction<WalletModalState>>
) {
  // Open wallet modal
  const openWalletModal = () => {
    setWalletModal((prev: WalletModalState) => ({ ...prev, isOpen: true }));
  };

  // Close wallet modal
  const closeWalletModal = () => {
    setWalletModal((prev: WalletModalState) => ({ ...prev, isOpen: false }));
  };

  // Connect to wallet
  const connectToWallet = async (walletId: string) => {
    setWalletModal((prev: WalletModalState) => ({ ...prev, isLoading: true }));

    try {
      // Mock wallet connection - replace with actual wallet adapter
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate connection

      const mockPublicKey = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM';
      const mockBalance = 10.5;

      setWalletState({
        isConnected: true,
        publicKey: mockPublicKey,
        balance: mockBalance,
        isLoading: false
      });

      setWalletModal({
        isOpen: false,
        selectedWallet: walletId,
        isLoading: false
      });
    } catch {
      setWalletModal((prev: WalletModalState) => ({ ...prev, isLoading: false }));
      // Handle error silently for now
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      publicKey: '',
      balance: 0,
      isLoading: false
    });

    setWalletModal({
      isOpen: false,
      selectedWallet: null,
      isLoading: false
    });
  };

  return {
    openWalletModal,
    closeWalletModal,
    connectToWallet,
    disconnectWallet
  };
} 