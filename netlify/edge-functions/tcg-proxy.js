// Edge Function: /tcg/* -> https://api.pokemontcg.io/*
export default async (request) => {
  const url = new URL(request.url);

  // Strip the /tcg prefix: /tcg/v2/cards -> /v2/cards
  const upstreamPath = url.pathname.replace(/^\/tcg/, "");
  const upstreamURL = new URL(`https://api.pokemontcg.io${upstreamPath}`);
  upstreamURL.search = url.search; // preserve query

  // ✅ Read env vars in Edge via Deno.env.get
  const apiKey =
    Deno.env.get("TCG_KEY") ||
    Deno.env.get("VITE_TCG_KEY") ||
    "";

  // Proxy to upstream
  const upstreamRes = await fetch(upstreamURL, {
    method: "GET",
    headers: {
      ...(apiKey ? { "X-Api-Key": apiKey } : {}),
      "Accept": "application/json",
      "User-Agent": "netlify-edge-tcg-proxy",
    },
  });

  // Return the upstream response (pass-through)
  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    headers: {
      "Content-Type": upstreamRes.headers.get("content-type") || "application/json",
      "Cache-Control": upstreamRes.headers.get("cache-control") || "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
