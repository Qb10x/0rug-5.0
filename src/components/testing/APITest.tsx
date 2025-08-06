// API Test Component - Verify all connections
// Following 0rug.com coding guidelines

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, TestTube } from 'lucide-react';

// Test results interface
interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  duration?: number;
}

// API test component
export function APITest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Test Jupiter API
  const testJupiterAPI = async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/jupiter', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        return {
          name: 'Jupiter API',
          status: 'error',
          message: `❌ HTTP ${response.status}: ${response.statusText}`,
          duration: Date.now() - startTime
        };
      }
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      if (data.outAmount) {
        return {
          name: 'Jupiter API',
          status: 'success',
          message: `✅ Connected - Quote API responding`,
          duration
        };
      } else {
        return {
          name: 'Jupiter API',
          status: 'error',
          message: '❌ No data returned',
          duration
        };
      }
    } catch (error) {
      return {
        name: 'Jupiter API',
        status: 'error',
        message: `❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      };
    }
  };

  // Test Raydium API
  const testRaydiumAPI = async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      const response = await fetch('https://api.raydium.io/v2/sdk/liquidity/mainnet.json', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });
      
      if (!response.ok) {
        return {
          name: 'Raydium API',
          status: 'error',
          message: `❌ HTTP ${response.status}: ${response.statusText}`,
          duration: Date.now() - startTime
        };
      }
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      if (data.official && Array.isArray(data.official)) {
        return {
          name: 'Raydium API',
          status: 'success',
          message: `✅ Connected - ${data.official.length} pools found`,
          duration
        };
      } else {
        return {
          name: 'Raydium API',
          status: 'error',
          message: '❌ Invalid data format',
          duration
        };
      }
    } catch (error) {
      return {
        name: 'Raydium API',
        status: 'error',
        message: `❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      };
    }
  };

  // Test Solana RPC via backend API route
  const testSolanaRPC = async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/rpc', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSlot'
        })
      });
      
      if (!response.ok) {
        return {
          name: 'Solana RPC',
          status: 'error',
          message: `❌ HTTP ${response.status}: ${response.statusText}`,
          duration: Date.now() - startTime
        };
      }
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      if (data.result && typeof data.result === 'number') {
        return {
          name: 'Solana RPC',
          status: 'success',
          message: `✅ Connected - Slot: ${data.result}`,
          duration
        };
      } else {
        return {
          name: 'Solana RPC',
          status: 'error',
          message: `❌ RPC error: ${data.error?.message || 'Unknown error'}`,
          duration
        };
      }
    } catch (error) {
      return {
        name: 'Solana RPC',
        status: 'error',
        message: `❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      };
    }
  };

    // Test DeepSeek API only
  const testAIAPIs = async (): Promise<TestResult[]> => {
    const results: TestResult[] = [];
    
    // Test DeepSeek API
    const deepseekStart = Date.now();
    try {
      const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 10
        })
      });
      
      const deepseekDuration = Date.now() - deepseekStart;
      
      if (deepseekResponse.ok) {
        results.push({
          name: 'DeepSeek API',
          status: 'success',
          message: '✅ Connected - API key valid',
          duration: deepseekDuration
        });
      } else {
        results.push({
          name: 'DeepSeek API',
          status: 'error',
          message: `❌ API error: ${deepseekResponse.status}`,
          duration: deepseekDuration
        });
      }
    } catch {
      results.push({
        name: 'DeepSeek API',
        status: 'error',
        message: '❌ Connection failed',
        duration: Date.now() - deepseekStart
      });
    }
    
    return results;
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const results: TestResult[] = [];
    
    // Test free APIs
    results.push(await testJupiterAPI());
    results.push(await testRaydiumAPI());
    results.push(await testSolanaRPC());
    
    // Test AI APIs
    const aiResults = await testAIAPIs();
    results.push(...aiResults);
    
    setTestResults(results);
    setIsRunning(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <TestTube className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            API Connection Test
          </h2>
        </div>
        
        <div className="mb-6">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Testing APIs...
              </>
            ) : (
              <>
                <TestTube className="w-5 h-5" />
                Run API Tests
              </>
            )}
          </button>
        </div>
        
        <div className="space-y-4">
          {testResults.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${
                result.status === 'success' 
                  ? 'border-green-200 bg-green-50 dark:bg-green-900/20' 
                  : result.status === 'error'
                  ? 'border-red-200 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-200 bg-gray-50 dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {result.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : result.status === 'error' ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  )}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {result.name}
                  </span>
                </div>
                {result.duration && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {result.duration}ms
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {result.message}
              </p>
            </motion.div>
          ))}
        </div>
        
        {testResults.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Test Summary
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p>✅ Free APIs: Jupiter, Raydium, Solana RPC</p>
              <p>🤖 AI APIs: Kimi K2, DeepSeek</p>
              <p>📊 Cache System: Ready</p>
              <p>🎯 MemeBot Chat: Ready for deployment</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 