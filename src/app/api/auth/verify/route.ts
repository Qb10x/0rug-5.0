import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json();

    // Validate input
    if (!userId || !code) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Invalid verification code format' },
        { status: 400 }
      );
    }

    // Get verification code from database
    const { data: verificationData, error: verificationError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('code', code)
      .eq('type', 'signup')
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (verificationError || !verificationData) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Mark verification code as used
    await supabase
      .from('verification_codes')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('id', verificationData.id);

    // Update user profile to verified
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({ 
        email_verified: true,
        telegram_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Profile update error:', profileError);
      return NextResponse.json(
        { error: 'Failed to verify user account' },
        { status: 500 }
      );
    }

    // Get user profile
    const { data: profile, error: profileFetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileFetchError) {
      console.error('Profile fetch error:', profileFetchError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Account verified successfully',
      user: {
        id: profile.id,
        email: profile.email,
        telegram_username: profile.telegram_username,
        email_verified: true,
        telegram_verified: true,
        created_at: profile.created_at,
      },
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 