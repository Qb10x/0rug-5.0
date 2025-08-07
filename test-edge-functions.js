// Test script for Edge Functions
const SUPABASE_URL = 'https://bgqczmovcojjzhdacbij.supabase.co/functions/v1';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJncWN6bW92Y29qanpoZGFjYmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjI2MDcsImV4cCI6MjA2OTk5ODYwN30.kvww0lTKfwIXrJXpqfMdwK4HjYJiljr0Kt6k97tYYPg';

async function testChatHandler() {
  console.log('🧪 Testing Chat Handler...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/chat-handler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify({
        message: "Hello, this is a test message!",
        user_id: "test_user_123",
        session_id: "test_session_456",
        context: {
          wallet_address: "test_wallet_abc123",
          token_address: "test_token_xyz789",
          trading_context: "testing"
        }
      })
    });

    const data = await response.json();
    console.log('✅ Chat Handler Response:', data);
    return data;
  } catch (error) {
    console.error('❌ Chat Handler Error:', error);
    return null;
  }
}

async function testAIResponseHandler() {
  console.log('🧪 Testing AI Response Handler...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/ai-response-handler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify({
        user_id: "test_user_123",
        session_id: "test_session_456",
        message_id: "test_message_789",
        ai_response: "This is a test AI response for the chatbot.",
        metadata: {
          model_used: "gpt-4",
          response_time: 1500,
          tokens_used: 45
        }
      })
    });

    const data = await response.json();
    console.log('✅ AI Response Handler Response:', data);
    return data;
  } catch (error) {
    console.error('❌ AI Response Handler Error:', error);
    return null;
  }
}

async function testSimpleFunction() {
  console.log('🧪 Testing Simple Test Function...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/simple-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`
      }
    });

    const data = await response.json();
    console.log('✅ Simple Test Response:', data);
    return data;
  } catch (error) {
    console.error('❌ Simple Test Error:', error);
    return null;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Edge Function Tests...\n');
  
  // Test simple function first
  await testSimpleFunction();
  console.log('');
  
  // Test chat handler
  await testChatHandler();
  console.log('');
  
  // Test AI response handler
  await testAIResponseHandler();
  console.log('');
  
  console.log('🏁 All tests completed!');
}

// Run the tests
runAllTests(); 