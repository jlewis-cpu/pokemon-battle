const API_BASE = "https://api.pokemontcg.io";
const DEFAULT_TIMEOUT_MS = 25000; // try 25s to test upstream responsiveness

exports.handler = async function (event) {
  try {
    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 200, headers: corsHeaders(), body: "" };
    }

    const afterFn = event.path.replace(/^\/\.netlify\/functions\/tcg-proxy/, "");
    const query = event.rawQuery ? `?${event.rawQuery}` : "";
    const upstreamUrl = `${API_BASE}${afterFn}${query}`;

    const apiKey = process.env.TCG_KEY || process.env.VITE_TCG_KEY || "";

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

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

    console.log("[tcg-proxy] upstream status:", res.status);
    const buf = await res.arrayBuffer();

    return {
      statusCode: res.status,
      headers: { ...corsHeaders(),
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
      body: JSON.stringify({ error: isAbort ? "Upstream timeout" : "Proxy error", details: String(err?.message || err) }),
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
function mask(k){ if(!k)return"(none)"; return k.length<=6?"***":`***${k.slice(-6)}` }
