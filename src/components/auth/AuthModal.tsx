"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/Logo";
import { Lock, Eye, EyeOff, ArrowRight, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Use the simple auth endpoints that work
      const endpoint = isSignUp ? "/api/auth/simple-signup" : "/api/auth/simple-signin";
      
      // Use the current window location to ensure correct port
      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}${endpoint}`;
      
      console.log('Making request to:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `${isSignUp ? 'Signup' : 'Sign in'} failed`);
      }

      // Success - close modal
      onClose();
      resetForm();
      
      // The auth context will automatically update the user state
      // No need to show alerts - the UI will update automatically
      
    } catch (error) {
      console.error("Auth error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setError("");
  };

  // If user is already logged in, show a message
  if (user) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="p-8 text-center">
          <div className="mx-auto mb-4">
            <Logo size="lg" showText={false} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Already Signed In
          </h2>
          <p className="text-gray-400 mb-6">
            You are already signed in as {user.email}
          </p>
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
          >
            Continue
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4">
            <Logo size="lg" showText={false} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-gray-400">
            {isSignUp 
              ? "Join 0RUG and start analyzing tokens like a pro" 
              : "Sign in to continue your analysis"
            }
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3"
          >
            {isLoading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isSignUp ? "Creating Account..." : "Signing In..."}
              </span>
            ) : (
              <span className="flex items-center">
                {isSignUp ? "Create Account" : "Sign In"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </span>
            )}
          </Button>
        </form>

        {/* Toggle */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                resetForm();
              }}
              className="text-blue-400 hover:text-blue-300 ml-1 font-medium"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </Modal>
  );
} 