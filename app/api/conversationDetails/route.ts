import { NextRequest, NextResponse } from 'next/server';

/**
 * Fetches conversation details from the Eleven Labs API
 * @route GET /api/conversationDetails?conversationId={conversationId}
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const apiKey = request.headers.get('x-api-key') || process.env.ELEVEN_LABS_API_KEY;

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      );
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: response.statusText,
      }));
      
      return NextResponse.json(
        { error: `Failed to fetch conversation details: ${errorData.error || response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching conversation details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation details' },
      { status: 500 }
    );
  }
} 