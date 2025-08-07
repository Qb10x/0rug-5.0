// Test Smart System Integration
// Following 0rug.com coding guidelines

import { classifyIntent } from './intentClassifier';
import { executeToolsForIntent } from './aiToolExecutor';

// Test the intent classifier
export async function testIntentClassification() {
  const testMessages = [
    "Analyze this token: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "Is this a rug pull? 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "Check if this is a honeypot: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "Who are the top holders? 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "Show me trending tokens",
    "Find new tokens launched today",
    "Detect volume spikes",
    "Track whale activity",
    "What is a rug pull?",
    "How to spot scams?"
  ];

  console.log('🧪 Testing Intent Classification...\n');

  for (const message of testMessages) {
    const result = classifyIntent(message);
    console.log(`Message: "${message}"`);
    console.log(`Intent: ${result.intent} (confidence: ${result.confidence})`);
    console.log(`Tools: ${result.suggestedTools.join(', ')}`);
    console.log(`Parameters:`, result.parameters);
    console.log('---');
  }
}

// Test the tool executor
export async function testToolExecution() {
  const testRequests = [
    {
      message: "Analyze this token: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      description: "Token Analysis"
    },
    {
      message: "Show me trending tokens",
      description: "Trending Tokens"
    },
    {
      message: "What is a rug pull?",
      description: "Educational Content"
    }
  ];

  console.log('🧪 Testing Tool Execution...\n');

  for (const test of testRequests) {
    console.log(`Testing: ${test.description}`);
    console.log(`Message: "${test.message}"`);
    
    try {
      const result = await executeToolsForIntent(test.message, {
        enablePaidAPIs: false, // Disable paid APIs for testing
        personaEnabled: true
      });

      console.log(`Success: ${result.success}`);
      console.log(`Source: ${result.source}`);
      console.log(`Fallback Used: ${result.fallbackUsed}`);
      console.log(`Response Preview: ${result.response.substring(0, 100)}...`);
      console.log('---');
    } catch (error) {
      console.error(`Error: ${error}`);
      console.log('---');
    }
  }
}

// Test the complete system
export async function testCompleteSystem() {
  console.log('🚀 Testing Complete Smart System...\n');

  // Test 1: Intent Classification
  await testIntentClassification();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Tool Execution
  await testToolExecution();
  
  console.log('\n✅ Smart System Test Complete!');
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  testCompleteSystem().catch(console.error);
} 