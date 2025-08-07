import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const { data: tables, error: tablesError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);

    if (tablesError) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: tablesError.message
      }, { status: 500 });
    }

    // Test verification_codes table
    const { data: codes, error: codesError } = await supabase
      .from('verification_codes')
      .select('count')
      .limit(1);

    if (codesError) {
      return NextResponse.json({
        success: false,
        error: 'Verification codes table not accessible',
        details: codesError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Authentication system is working correctly',
      database: 'Connected',
      tables: {
        user_profiles: 'Available',
        verification_codes: 'Available'
      },
      project_url: 'https://bgqczmovcojjzhdacbij.supabase.co'
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 