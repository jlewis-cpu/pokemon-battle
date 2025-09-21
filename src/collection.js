const LS_COLLECTION = 'tcg_collection_v1';

export function getCollection(){
  try { return JSON.parse(localStorage.getItem(LS_COLLECTION) || '[]'); }
  catch { return []; }
}
export function setCollection(names){
  try { localStorage.setItem(LS_COLLECTION, JSON.stringify(Array.from(new Set(names)).filter(Boolean))); }
  catch {}
}
export function addToCollection(name){
  if (!name) return;
  const cur = new Set(getCollection());
  cur.add(name);
  setCollection(Array.from(cur));
}
export function getCollectionNames(prefix=''){
  const list = getCollection();
  if (!prefix) return list;
  const p = prefix.toLowerCase();
  return list.filter(n => n.toLowerCase().includes(p));
}
