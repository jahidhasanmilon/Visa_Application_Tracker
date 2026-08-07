// Merges a saved order array against the current set of known keys (fixed
// section keys + custom item ids), so: existing order is preserved, any
// fixed key missing from a stale saved order gets appended, new custom
// items land at the end (admin can reorder them from there), and
// removed/stale ids just disappear.
export function mergeSectionOrder(saved: string[] | null, fixedKeys: string[], customIds: string[]): string[] {
  const known = new Set([...fixedKeys, ...customIds]);
  const base = saved && saved.length > 0 ? saved : fixedKeys;
  const kept = base.filter(k => known.has(k));
  const missing = [...fixedKeys, ...customIds].filter(k => !kept.includes(k));
  return [...kept, ...missing];
}
