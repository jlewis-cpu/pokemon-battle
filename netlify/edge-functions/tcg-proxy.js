// Edge Function: /tcg/* -> https://api.pokemontcg.io/*
export default async (request, context) => {
  // Original request URL
  const url = new URL(request.url);

  // Strip the /tcg prefix from the path
  // e.g. /tcg/v2/cards => /v2/cards
  const upstreamPath = url.pathname.replace(/^\/tcg/, "");
  const upstreamURL = new URL(`https://api.pokemontcg.io${upstreamPath}`);
  upstreamURL.search = url.search; // keep query string

  // Use env vars set in Netlify (Site → Settings → Environment)
  const apiKey = context.env.TCG_KEY || context.env.VITE_TCG_KEY || "";

  // Proxy the request at the edge
  const upstreamRes = await fetch(upstreamURL, {
    method: "GET",
    headers: {
      ...(apiKey ? { "X-Api-Key": apiKey } : {}),
      "Accept": "application/json",
      "User-Agent": "netlify-edge-tcg-proxy",
    },
  });

  // Return upstream response as-is
  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    headers: {
      "Content-Type": upstreamRes.headers.get("content-type") || "application/json",
      "Cache-Control": upstreamRes.headers.get("cache-control") || "no-store",
      "Access-Control-Allow-Origin": "*", // harmless (same-origin anyway)
    },
  });
};
