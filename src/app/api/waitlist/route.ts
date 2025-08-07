import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client function to avoid build-time issues
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const body = await request.json();
    const { email, interest, twitter, telegram } = body;

    // Validate required fields
    if (!email || !interest || !Array.isArray(interest) || interest.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current waitlist count for position
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    const position = (count || 0) + 1;

    // Insert into waitlist table
    const { data, error } = await supabase
      .from('waitlist')
      .insert([
        {
          email,
          interest: JSON.stringify(interest), // Store as JSON string
          twitter,
          telegram,
          position,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to join waitlist' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      position,
      message: 'Successfully joined waitlist'
    });

  } catch (error) {
    console.error('Waitlist API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = createSupabaseClient();
    // Get waitlist stats
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      totalWaitlist: count || 0
    });

  } catch (error) {
    console.error('Waitlist stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get waitlist stats' },
      { status: 500 }
    );
  }
} 