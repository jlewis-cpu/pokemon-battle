export const TYPE_COLORS = {
  electric: { base:'#fef9c3', bar:'#f59e0b' },
  water:    { base:'#e0f2fe', bar:'#0ea5e9' },
  fire:     { base:'#fee2e2', bar:'#f97316' },
  grass:    { base:'#dcfce7', bar:'#22c55e' },
  psychic:  { base:'#ffe4e6', bar:'#ec4899' },
  fighting: { base:'#fee2e2', bar:'#ef4444' },
  dark:     { base:'#e5e7eb', bar:'#111827' },
  steel:    { base:'#e5e7eb', bar:'#6b7280' },
  dragon:   { base:'#dbeafe', bar:'#3b82f6' },
  fairy:    { base:'#ffe4f1', bar:'#f472b6' },
  normal:   { base:'#f3f4f6', bar:'#6b7280' },
  ghost:    { base:'#ede9fe', bar:'#8b5cf6' },
  ice:      { base:'#ecfeff', bar:'#06b6d4' },
  rock:     { base:'#f5f5f4', bar:'#78716c' },
  ground:   { base:'#fef3c7', bar:'#d97706' },
  poison:   { base:'#f3e8ff', bar:'#a855f7' },
  bug:      { base:'#ecfccb', bar:'#65a30d' },
  flying:   { base:'#f1f5f9', bar:'#64748b' },
};
export function getTypeColorsVG(types){
  const t = (types && types[0]?.type?.name) || 'normal';
  return TYPE_COLORS[t] || TYPE_COLORS['normal'];
}
