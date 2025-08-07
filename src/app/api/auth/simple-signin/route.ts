import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bgqczmovcojjzhdacbij.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJncWN6bW92Y29qanpoZGFjYmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjI2MDcsImV4cCI6MjA2OTk5ODYwN30.kvww0lTKfwIXrJXpqfMdwK4HjYJiljr0Kt6k97tYYPg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('Simple signin attempt for email:', email);

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user in user_profiles table
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // For now, we'll accept any password (in a real app, you'd hash and verify)
    // This is just for testing purposes
    console.log('User found:', userProfile.id);

    // Update last login time
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userProfile.id);

    if (updateError) {
      console.error('Update last login error:', updateError);
      // Don't fail the signin if this fails
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully signed in!',
      user_id: userProfile.id,
      email: userProfile.email,
      user: {
        id: userProfile.id,
        email: userProfile.email,
        created_at: userProfile.created_at,
        last_login: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Simple signin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 