// src/tcgFetch.js
export const TCG_KEY = import.meta.env.VITE_TCG_KEY || null;

export async function tcgFetch(url, opts = {}) {
  // Rewrite any direct calls to the API base to our proxy
  const proxied = url.replace(/^https?:\/\/api\.pokemontcg\.io/i, '/tcg');
  // Header injection here is optional; the function already adds it.
  const headers = Object.assign({}, opts.headers || {}, TCG_KEY ? { 'X-Api-Key': TCG_KEY } : {});
  console.log('[TCG FETCH]', proxied, 'headers:', headers);
  return fetch(proxied, { ...opts, headers });
}
