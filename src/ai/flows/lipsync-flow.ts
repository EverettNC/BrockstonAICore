'use server';
/**
 * Lip Sync Flow — calls Python api_server.py to generate Wav2Lip video.
 * Returns a data URI (video/mp4) or null if the Python server is unavailable.
 */

const PYTHON_API = process.env.PYTHON_API_URL || 'http://localhost:8000';

export async function getLipSyncVideo(audiob64: string): Promise<string | null> {
  try {
    const res = await fetch(`${PYTHON_API}/lipsync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio_b64: audiob64 }),
      signal: AbortSignal.timeout(300_000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.video ?? null;
  } catch {
    return null;
  }
}
