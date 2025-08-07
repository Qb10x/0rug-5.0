import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bgqczmovcojjzhdacbij.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJncWN6bW92Y29qanpoZGFjYmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjI2MDcsImV4cCI6MjA2OTk5ODYwN30.kvww0lTKfwIXrJXpqfMdwK4HjYJiljr0Kt6k97tYYPg';

// Create client with specific auth options
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  }
});

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('Signup attempt for email:', email);

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format - more permissive
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists in our profile table
    const { data: existingUser, error: profileCheckError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error('Profile check error:', profileCheckError);
    }

    if (existingUser) {
      console.log('User already exists in profile table:', existingUser.id);
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    console.log('Creating new user in Supabase Auth...');

    // Try a different approach - use signUp with minimal options
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          email: email.trim().toLowerCase()
        }
      }
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      
      // Handle specific error cases
      if (authError.message.includes('User already registered')) {
        console.log('User exists in auth, attempting to sign in...');
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        
        if (signInError) {
          console.error('Sign in error:', signInError);
          return NextResponse.json(
            { error: 'Account exists but password is incorrect' },
            { status: 400 }
          );
        }
        
        // Create profile for existing auth user
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: signInData.user?.id,
            email: email.trim().toLowerCase(),
            email_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error('Profile creation error for existing user:', profileError);
          return NextResponse.json(
            { error: 'Failed to create user profile' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Account created successfully!',
          user_id: signInData.user?.id,
          email: email.trim().toLowerCase(),
        });
      }
      
      // Handle email validation errors
      if (authError.message.includes('email_address_invalid')) {
        return NextResponse.json(
          { error: 'Please enter a valid email address' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to create user account: ${authError.message}` },
        { status: 500 }
      );
    }

    if (!authData.user?.id) {
      console.error('No user ID returned from auth signup');
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    console.log('Creating profile for new user:', authData.user.id);

    // Create profile in user_profiles table
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: email.trim().toLowerCase(),
        email_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      
      // If profile creation fails, we should clean up the auth user
      // But for now, just return the error
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    console.log('User created successfully:', authData.user.id);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      user_id: authData.user.id,
      email: email.trim().toLowerCase(),
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 