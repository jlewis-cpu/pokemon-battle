// Netlify Function: /tcg/* -> https://api.pokemontcg.io/*
export async function handler(event) {
  try {
    const API_BASE = 'https://api.pokemontcg.io';
    // Example: path = /tcg/v2/cards?...  -> we need /v2/cards?...
    const upstreamPath = event.rawUrl.replace(/^https?:\/\/[^/]+\/tcg/, '');

    const apiKey =
      process.env.TCG_KEY ||
      process.env.VITE_TCG_KEY || // fallback if you only set VITE_TCG_KEY
      '';

    const res = await fetch(`${API_BASE}${upstreamPath}`, {
      headers: {
        ...(apiKey ? { 'X-Api-Key': apiKey } : {}),
      },
    });

    const body = await res.arrayBuffer(); // pass-through bytes
    const headers = {
      // Pass through content type + allow same-origin usage
      'Content-Type': res.headers.get('content-type') || 'application/json',
      'Cache-Control': res.headers.get('cache-control') || 'no-store',
      // CORS not strictly necessary (same origin), but harmless:
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    };

    return {
      statusCode: res.status,
      headers,
      body: Buffer.from(body).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Proxy error', details: String(err) }),
    };
  }
}
