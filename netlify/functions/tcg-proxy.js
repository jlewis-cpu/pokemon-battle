// netlify/functions/tcg-proxy.js
const API_BASE = "https://api.pokemontcg.io";
const DEFAULT_TIMEOUT_MS = 12000; // 12s

exports.handler = async function (event) {
  try {
    // 1) Handle CORS preflight quickly
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: "",
      };
    }

    // 2) Build upstream URL
    const afterFn = event.path.replace(/^\/\.netlify\/functions\/tcg-proxy/, "");
    const query = event.rawQuery ? `?${event.rawQuery}` : "";
    const upstreamUrl = `${API_BASE}${afterFn}${query}`;

    // 3) Pull API key from env
    const apiKey = process.env.TCG_KEY || process.env.VITE_TCG_KEY || "";

    // 4) Timeout guard
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    // 5) Log what we’re calling
    console.log("[tcg-proxy] GET", upstreamUrl, "key:", mask(apiKey));

    const res = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        ...(apiKey ? { "X-Api-Key": apiKey } : {}),
        "User-Agent": "netlify-fn-tcg-proxy",
        "Accept": "application/json",
      },
      signal: controller.signal,
    }).catch((e) => {
      console.error("[tcg-proxy] fetch error:", e?.name, e?.message);
      throw e;
    });

    clearTimeout(t);

    const buf = await res.arrayBuffer();

    // 6) Pass through upstream status + content-type
    return {
      statusCode: res.status,
      headers: {
        ...corsHeaders(),
        "Content-Type": res.headers.get("content-type") || "application/json",
        "Cache-Control": res.headers.get("cache-control") || "no-store",
      },
      body: Buffer.from(buf).toString("base64"),
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error("[tcg-proxy] exception:", err?.name, err?.message);
    const isAbort = err && (err.name === "AbortError" || err.code === "ABORT_ERR");
    return {
      statusCode: isAbort ? 504 : 500,
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        error: isAbort ? "Upstream timeout" : "Proxy error",
        details: String(err?.message || err),
      }),
    };
  }
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, X-Api-Key",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };
}
function mask(k) {
  if (!k) return "(none)";
  return k.length <= 6 ? "***" : `***${k.slice(-6)}`;
}
