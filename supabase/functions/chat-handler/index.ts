// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatMessage {
  id: string
  user_id: string
  message: string
  timestamp: string
  session_id: string
  message_type: 'user' | 'ai'
}

interface ChatRequest {
  message: string
  user_id: string
  session_id: string
  context?: {
    wallet_address?: string
    token_address?: string
    trading_context?: string
  }
}

serve(async (req: any) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    // @ts-ignore
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    // @ts-ignore
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request body
    const { message, user_id, session_id, context }: ChatRequest = await req.json()

    // Validate required fields
    if (!message || !user_id || !session_id) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: message, user_id, session_id' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log user message to database
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      user_id,
      message,
      timestamp: new Date().toISOString(),
      session_id,
      message_type: 'user'
    }

    const { error: logError } = await supabase
      .from('chat_messages')
      .insert(userMessage)

    if (logError) {
      console.error('Error logging user message:', logError)
    }

    // Get chat history for context (last 10 messages)
    const { data: chatHistory, error: historyError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', session_id)
      .order('timestamp', { ascending: false })
      .limit(10)

    if (historyError) {
      console.error('Error fetching chat history:', historyError)
    }

    // Prepare response with chat data
    const response = {
      success: true,
      message_id: userMessage.id,
      session_id,
      chat_history: chatHistory || [],
      context,
      timestamp: userMessage.timestamp
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Chat handler error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 