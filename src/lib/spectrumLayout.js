// Row offsets for the TV spectrum: avatars within 6% of each other stack into
// successive rows (row 0, 1, 2, ...), never cycling back onto an earlier row.
export function spectrumRows(placements) {
  const sorted = [...placements].sort((a, b) => a.pos - b.pos);
  const rows = new Map();
  const placed = [];
  for (const item of sorted) {
    const row = placed.filter((o) => Math.abs(o.pos - item.pos) < 6).length;
    rows.set(item.id, row);
    placed.push(item);
  }
  return rows;
}
