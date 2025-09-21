export const TYPE_COLORS = {
  fire:     { base: '#fee2e2', bar: '#f97316', panel: '#fff1f1' },
  water:    { base: '#e0f2fe', bar: '#0ea5e9', panel: '#eff8ff' },
  grass:    { base: '#dcfce7', bar: '#22c55e', panel: '#edfff3' },
  lightning:{ base: '#fef9c3', bar: '#f59e0b', panel: '#fffbe6' },
  psychic:  { base: '#ffe4e6', bar: '#ec4899', panel: '#fff1f4' },
  fighting: { base: '#fee2e2', bar: '#ef4444', panel: '#fff1f1' },
  darkness: { base: '#e5e7eb', bar: '#111827', panel: '#f3f4f6' },
  metal:    { base: '#e5e7eb', bar: '#6b7280', panel: '#f4f5f7' },
  dragon:   { base: '#dbeafe', bar: '#3b82f6', panel: '#edf4ff' },
  fairy:    { base: '#ffe4f1', bar: '#f472b6', panel: '#fff0f7' },
  colorless:{ base: '#f3f4f6', bar: '#6b7280', panel: '#f9fafb' },
};
export function getTypeColorsTCG(types){
  const t = (types && types[0] || 'colorless').toLowerCase();
  return TYPE_COLORS[t] || TYPE_COLORS['colorless'];
}
export function baseSpeciesFromCardName(name){
  if (!name) return "";
  let s = String(name).toLowerCase();
  s = s.replace(/\b(vmax|vstar|v-union|ex|gx|break|prime|lv\.x|star|δ|mega)\b/g, "");
  s = s.replace(/\b(v)\b/g, "");
  s = s.replace(/\s+/g, " ").trim();
  s = s.replace(/[^a-z0-9\-\s]/g, "");
  s = s.replace(/^alolan\s+/, "alolan-");
  s = s.replace(/^galarian\s+/, "galarian-");
  s = s.replace(/^hisui\w*\s+/, "hisuian-");
  s = s.replace(/^paldea\w*\s+/, "paldean-");
  s = s.replace(/^[-\s]+|[-\s]+$/g, "");
  return s;
}
