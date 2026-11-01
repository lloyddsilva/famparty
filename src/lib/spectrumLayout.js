// Row/position layout for the TV spectrum.
//
// Avatars are assigned the first lane (row) with no other avatar within 6%.
// Lanes alternate above and below the track so they stay inside the panel.
// When every lane conflicts, the display position is nudged sideways (the
// true position and the median marker never move) and the avatar shrinks.
// Returns Map id -> { lane, row, top, pos, scale } where `top` is the CSS
// offset in px from the track, always within the panel bounds we test for.

export const SPECTRUM_LANES = [
  { row: 0, top: -48 },   // above, closest
  { row: 1, top: 26 },    // below, closest
  { row: 2, top: -96 },   // above, second (48px clear of row 0)
  { row: 3, top: 74 },    // below, second
];
const MIN_GAP = 6;
const NUDGES = [0, -4, 4, -8, 8, -12, 12, -16, 16];

export function spectrumLayout(placements) {
  // One avatar size per reveal: if anyone needs shrinking, everyone shrinks,
  // so size never looks like it means something.
  const raw = spectrumLayoutRaw(placements);
  const uniform = [...raw.values()].some((v) => v.scale < 1) ? 0.8 : 1;
  for (const v of raw.values()) v.scale = uniform;
  return raw;
}

function spectrumLayoutRaw(placements) {
  const sorted = [...placements].sort((a, b) => a.pos - b.pos);
  const lanes = SPECTRUM_LANES.map(() => []); // display positions per lane
  const out = new Map();

  for (const item of sorted) {
    let placed = null;
    for (const nudge of NUDGES) {
      const displayPos = Math.max(2, Math.min(98, item.pos + nudge));
      for (let lane = 0; lane < SPECTRUM_LANES.length; lane++) {
        if (lanes[lane].every((p) => Math.abs(p - displayPos) >= MIN_GAP)) {
          placed = { lane, displayPos, nudged: nudge !== 0 };
          lanes[lane].push(displayPos);
          break;
        }
      }
      if (placed) break;
    }
    if (!placed) {
      // Extremely dense: last lane, smallest size, keep the true position.
      placed = { lane: SPECTRUM_LANES.length - 1, displayPos: item.pos, nudged: true };
      lanes[placed.lane].push(item.pos);
    }
    const laneDef = SPECTRUM_LANES[placed.lane];
    out.set(item.id, {
      lane: placed.lane,
      row: laneDef.row,
      top: laneDef.top,
      pos: placed.displayPos,
      scale: placed.nudged || placed.lane > 1 ? 0.8 : 1,
    });
  }
  return out;
}

// Backwards-compatible name used by earlier code/tests.
export function spectrumRows(placements) {
  const layout = spectrumLayout(placements);
  return new Map([...layout].map(([id, v]) => [id, v.row]));
}
