import { NextRequest, NextResponse } from 'next/server';
import { executeToolsForIntent } from '@/lib/api/aiToolExecutor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, isDemo = false } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Use the real AI tool executor
    const result = await executeToolsForIntent(message);

    if (!result || !result.response) {
      return NextResponse.json(
        { error: 'Failed to generate response' },
        { status: 500 }
      );
    }

    // Return the real AI response without any demo indicators
    const response = result.response;

    return NextResponse.json({
      response: response,
      success: true
    });

  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 