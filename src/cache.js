const LS_CARDS = 'tcg_cards_v1';
const LS_NAMES = 'tcg_names_v1';

export function loadCardFromCache(name){
  try { const all = JSON.parse(localStorage.getItem(LS_CARDS) || '{}'); return all[name] || null; }
  catch { return null; }
}
export function saveCardToCache(name, card){
  try {
    const all = JSON.parse(localStorage.getItem(LS_CARDS) || '{}');
    all[name] = card;
    localStorage.setItem(LS_CARDS, JSON.stringify(all));
    const names = new Set(JSON.parse(localStorage.getItem(LS_NAMES) || '[]'));
    names.add(name);
    localStorage.setItem(LS_NAMES, JSON.stringify(Array.from(names)));
  } catch {}
}
export function getCachedNames(prefix){
  try {
    const names = JSON.parse(localStorage.getItem(LS_NAMES) || '[]');
    if (!prefix) return names;
    const p = prefix.toLowerCase();
    return names.filter(n => n.toLowerCase().includes(p)).slice(0, 20);
  } catch { return []; }
}
export function mergeNamesIntoCache(newNames){
  try {
    const names = new Set(JSON.parse(localStorage.getItem(LS_NAMES) || '[]'));
    newNames.forEach(n => names.add(n));
    localStorage.setItem(LS_NAMES, JSON.stringify(Array.from(names)));
  } catch {}
}
export function clearCache(){
  localStorage.removeItem(LS_CARDS);
  localStorage.removeItem(LS_NAMES);
}
