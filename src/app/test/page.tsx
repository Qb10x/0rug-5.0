// Test page for Dexscreener integration
// Following 0rug.com coding guidelines

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateAIResponse } from '@/lib/api/ai';

export default function TestPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testAI = async () => {
    setIsLoading(true);
    try {
      const response = await generateAIResponse('Hello, can you help me understand crypto?');
      setTestResult(response);
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">AI Test Page</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>OpenRouter API Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testAI} disabled={isLoading}>
            {isLoading ? 'Testing...' : 'Test AI Response'}
          </Button>
          
          {testResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-semibold mb-2">Result:</h3>
              <p>{testResult}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 