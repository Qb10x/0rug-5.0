import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { sendVerificationCode } from '@/lib/api/telegram';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Missing email address' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('id, email, telegram_username')
      .eq('email', email)
      .single();

    if (userError || !user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a reset code has been sent to your Telegram',
      });
    }

    // Generate reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store reset code in database
    const { error: codeError } = await supabase
      .from('verification_codes')
      .insert({
        user_id: user.id,
        code: resetCode,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
        type: 'password_reset',
      });

    if (codeError) {
      console.error('Reset code storage error:', codeError);
      return NextResponse.json(
        { error: 'Failed to generate reset code' },
        { status: 500 }
      );
    }

    // Send reset code via Telegram bot
    const telegramSent = await sendVerificationCode(user.telegram_username, resetCode, 'password_reset');
    
    if (!telegramSent) {
      console.warn('Failed to send Telegram message, but code was generated');
      // Don't fail the request, just log the warning
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset code sent to your Telegram',
      user_id: user.id,
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 