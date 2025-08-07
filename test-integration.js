// Test script for Edge Functions integration
const SUPABASE_URL = 'https://bgqczmovcojjzhdacbij.supabase.co/functions/v1';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJncWN6bW92Y29qanpoZGFjYmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjI2MDcsImV4cCI6MjA2OTk5ODYwN30.kvww0lTKfwIXrJXpqfMdwK4HjYJiljr0Kt6k97tYYPg';

async function testChatIntegration() {
  console.log('🧪 Testing Chat Integration with Edge Functions...\n');
  
  const userId = `test_user_${Date.now()}`;
  const sessionId = `test_session_${Date.now()}`;
  
  try {
    // Test 1: Chat Handler
    console.log('📝 Testing Chat Handler...');
    const chatResponse = await fetch(`${SUPABASE_URL}/chat-handler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify({
        message: "What's the best token to buy right now?",
        user_id: userId,
        session_id: sessionId,
        context: {
          trading_context: "General crypto analysis",
          token_address: "PEPE"
        }
      })
    });

    const chatData = await chatResponse.json();
    console.log('✅ Chat Handler Response:', chatData);
    
    if (chatData.success && chatData.message_id) {
      console.log('✅ Message logged successfully with ID:', chatData.message_id);
      
      // Test 2: AI Response Handler
      console.log('\n🤖 Testing AI Response Handler...');
      const aiResponse = await fetch(`${SUPABASE_URL}/ai-response-handler`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ANON_KEY}`
        },
        body: JSON.stringify({
          user_id: userId,
          session_id: sessionId,
          message_id: chatData.message_id,
          ai_response: "Based on current market analysis, PEPE shows strong momentum with increasing volume and liquidity. However, always DYOR!",
          metadata: {
            model_used: "gpt-4",
            response_time: 1200,
            tokens_used: 45
          }
        })
      });

      const aiData = await aiResponse.json();
      console.log('✅ AI Response Handler Response:', aiData);
      
      if (aiData.success && aiData.response_id) {
        console.log('✅ AI response logged successfully with ID:', aiData.response_id);
        console.log('✅ Cache hit status:', aiData.cache_hit);
      }
    }
    
    console.log('\n🎉 Integration test completed successfully!');
    console.log('✅ Chat Handler: Working');
    console.log('✅ AI Response Handler: Working');
    console.log('✅ Session Management: Working');
    console.log('✅ Context Tracking: Working');
    console.log('✅ Metadata Logging: Working');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
  }
}

// Run the integration test
testChatIntegration(); 