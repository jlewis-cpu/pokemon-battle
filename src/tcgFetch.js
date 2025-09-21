// src/tcgFetch.js
export const TCG_KEY = import.meta.env.VITE_TCG_KEY || null;

export async function tcgFetch(url, opts = {}) {
  // Rewrite any direct API call to our edge path
  const proxied = url.replace(/^https?:\/\/api\.pokemontcg\.io/i, '/tcg');
  // You can still include X-Api-Key here, but the edge function adds it already.
  const headers = Object.assign({}, opts.headers || {}, TCG_KEY ? { 'X-Api-Key': TCG_KEY } : {});
  console.log('[TCG FETCH]', proxied, 'headers:', headers);
  return fetch(proxied, { ...opts, headers });
}
