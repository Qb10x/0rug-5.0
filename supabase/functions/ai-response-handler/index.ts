import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIResponse {
  id: string
  user_id: string
  message: string
  ai_response: string
  timestamp: string
  session_id: string
  message_type: 'ai'
  metadata?: {
    model_used?: string
    response_time?: number
    tokens_used?: number
    cache_hit?: boolean
  }
}

interface AIRequest {
  user_id: string
  session_id: string
  message_id: string
  ai_response: string
  metadata?: {
    model_used?: string
    response_time?: number
    tokens_used?: number
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request body
    const { user_id, session_id, message_id, ai_response, metadata }: AIRequest = await req.json()

    // Validate required fields
    if (!user_id || !session_id || !message_id || !ai_response) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: user_id, session_id, message_id, ai_response' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if we have a cached response for similar queries
    const cacheKey = `${user_id}_${session_id}_${ai_response.substring(0, 100)}`
    const { data: cachedResponse } = await supabase
      .from('ai_response_cache')
      .select('*')
      .eq('cache_key', cacheKey)
      .single()

    let isCacheHit = false
    let finalResponse = ai_response

    if (cachedResponse) {
      isCacheHit = true
      finalResponse = cachedResponse.cached_response
      console.log('Cache hit for AI response')
    }

    // Log AI response to database
    const aiResponseData: AIResponse = {
      id: crypto.randomUUID(),
      user_id,
      message: '', // This will be updated with the original message
      ai_response: finalResponse,
      timestamp: new Date().toISOString(),
      session_id,
      message_type: 'ai',
      metadata: {
        ...metadata,
        cache_hit: isCacheHit
      }
    }

    const { error: logError } = await supabase
      .from('chat_messages')
      .insert(aiResponseData)

    if (logError) {
      console.error('Error logging AI response:', logError)
    }

    // Cache the response if it's not already cached
    if (!isCacheHit) {
      const { error: cacheError } = await supabase
        .from('ai_response_cache')
        .insert({
          cache_key: cacheKey,
          user_id,
          session_id,
          original_response: ai_response,
          cached_response: ai_response,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        })

      if (cacheError) {
        console.error('Error caching AI response:', cacheError)
      }
    }

    // Update user activity and feature usage
    try {
      await supabase.rpc('log_user_activity', {
        p_user_id: user_id,
        p_activity_type: 'ai_response',
        p_activity_data: { 
          response_length: finalResponse.length,
          cache_hit: isCacheHit 
        }
      })

      await supabase.rpc('update_feature_usage', {
        p_user_id: user_id,
        p_feature_name: 'ai_chat'
      })
    } catch (error) {
      console.error('Error updating user activity:', error)
    }

    // Prepare response
    const response = {
      success: true,
      response_id: aiResponseData.id,
      session_id,
      ai_response: finalResponse,
      cache_hit: isCacheHit,
      timestamp: aiResponseData.timestamp,
      metadata: aiResponseData.metadata
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('AI response handler error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 