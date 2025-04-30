import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    console.log("getSignedUrl route called");
  const searchParams = request.nextUrl.searchParams;
  const agentId = searchParams.get('agentId');

  if (!agentId) {
    return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API returned ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return NextResponse.json({ signedUrl: data.signed_url });
  } catch (error: any) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate signed URL: ' + error.message },
      { status: 500 }
    );
  }
}