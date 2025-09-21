export async function handler(event) {
  try {
    const API_BASE = "https://api.pokemontcg.io";
    // /tcg/v2/cards -> /.netlify/functions/tcg-proxy/v2/cards (after redirect)
    const afterFn = event.path.replace(/^\/\.netlify\/functions\/tcg-proxy/, "");
    const query = event.rawQuery ? `?${event.rawQuery}` : "";
    const upstreamUrl = `${API_BASE}${afterFn}${query}`;

    const apiKey = process.env.TCG_KEY || process.env.VITE_TCG_KEY || "";
    const res = await fetch(upstreamUrl, { headers: apiKey ? { "X-Api-Key": apiKey } : {} });

    const buf = await res.arrayBuffer();
    return {
      statusCode: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") || "application/json",
        "Cache-Control": res.headers.get("cache-control") || "no-store",
        "Access-Control-Allow-Origin": "*",
      },
      body: Buffer.from(buf).toString("base64"),
      isBase64Encoded: true,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Proxy error", details: String(err) }),
    };
  }
}
