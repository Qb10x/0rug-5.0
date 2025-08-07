'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export function UserProfile() {
  const { user, signOut } = useAuth();

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-white">
            {user.email}
          </p>
        </div>
      </div>
      <Button
        onClick={handleSignOut}
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-white"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
} 