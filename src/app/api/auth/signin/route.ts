import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bgqczmovcojjzhdacbij.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJncWN6bW92Y29qanpoZGFjYmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjI2MDcsImV4cCI6MjA2OTk5ODYwN30.kvww0lTKfwIXrJXpqfMdwK4HjYJiljr0Kt6k97tYYPg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      
      if (authError.message.includes('Invalid login credentials')) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to sign in' },
        { status: 500 }
      );
    }

    if (!authData.user?.id) {
      return NextResponse.json(
        { error: 'Failed to sign in' },
        { status: 500 }
      );
    }

    // Update last login time
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', authData.user.id);

    if (updateError) {
      console.error('Update last login error:', updateError);
      // Don't fail the signin if this fails
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully signed in!',
      user_id: authData.user.id,
      email: email,
      session: authData.session,
    });

  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 