import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/Logo';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess: () => void;
  email: string;
  telegramUsername: string;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  onVerificationSuccess,
  email,
  telegramUsername
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleVerification = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          telegramUsername,
          code: verificationCode.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onVerificationSuccess();
        }, 1500);
      } else {
        setError(data.error || 'Verification failed. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerification();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Logo size="sm" showText={false} />
            <div>
              <h3 className="text-white font-semibold text-lg">Verify Account</h3>
              <p className="text-gray-400 text-sm">Enter the code sent to your Telegram</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State */}
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-white font-semibold text-xl mb-2">Verification Successful!</h4>
            <p className="text-gray-300 text-sm">Redirecting to dashboard...</p>
          </div>
        ) : (
          <>
            {/* Telegram Info */}
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">TG</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{telegramUsername}</p>
                  <p className="text-gray-400 text-xs">Check your Telegram for the verification code</p>
                </div>
              </div>
            </div>

            {/* Verification Code Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Verification Code *
                </label>
                <Input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter 6-digit code"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  maxLength={6}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

              {/* Action Button */}
              <Button
                onClick={handleVerification}
                disabled={!verificationCode.trim() || isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium py-3"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <span>Verify Account</span>
                )}
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-xs">
                Didn't receive the code? Check your Telegram messages or{' '}
                <button className="text-blue-400 hover:text-blue-300 underline">
                  request a new code
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 