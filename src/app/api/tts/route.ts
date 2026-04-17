import { NextRequest, NextResponse } from 'next/server';
import { PollyClient, SynthesizeSpeechCommand, Engine, VoiceId, OutputFormat, TextType } from '@aws-sdk/client-polly';

const polly = new PollyClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: 'No text' }, { status: 400 });
  }

  const command = new SynthesizeSpeechCommand({
    Text: text.slice(0, 3000),
    VoiceId: VoiceId.Matthew,
    Engine: Engine.NEURAL,
    OutputFormat: OutputFormat.MP3,
    TextType: TextType.TEXT,
  });

  const response = await polly.send(command);
  if (!response.AudioStream) {
    return NextResponse.json({ error: 'No audio from Polly' }, { status: 502 });
  }

  // AudioStream is a Node.js Readable — collect it into a buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of response.AudioStream as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': String(buffer.length),
      'Cache-Control': 'no-store',
    },
  });
}
