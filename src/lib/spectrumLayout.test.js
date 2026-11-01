import { test } from "node:test";
import assert from "node:assert/strict";
import { spectrumLayout, SPECTRUM_LANES } from "./spectrumLayout.js";

test("cluster at 50-55 and 58-70: every avatar stays inside the panel lanes", () => {
  const placements = [
    ...Array.from({ length: 6 }, (_, i) => ({ id: `a${i}`, pos: 50 + i })),
    ...Array.from({ length: 6 }, (_, i) => ({ id: `b${i}`, pos: 58 + i * 2.4 })),
  ];
  const layout = spectrumLayout(placements);
  const tops = new Set(SPECTRUM_LANES.map((l) => l.top));
  for (const [, v] of layout) {
    assert.ok(tops.has(v.top), `top ${v.top} is a defined lane inside the panel`);
    assert.ok(v.pos >= 2 && v.pos <= 98);
  }
  // no two avatars in the same lane sit within 6% of each other (unless nudged apart, which is the point)
  const byLane = new Map();
  for (const [id, v] of layout) {
    const arr = byLane.get(v.lane) || [];
    for (const other of arr) assert.ok(Math.abs(other - v.pos) >= 6 || other === v.pos, `${id} crowds a lane-mate`);
    arr.push(v.pos);
    byLane.set(v.lane, arr);
  }
});

test("chain spaced 4% apart (50..70) never puts neighbours within 6% in one lane", () => {
  const placements = [50, 54, 58, 62, 66, 70].map((pos, i) => ({ id: `c${i}`, pos }));
  const layout = spectrumLayout(placements);
  const byLane = new Map();
  for (const [, v] of layout) {
    const arr = byLane.get(v.lane) || [];
    for (const other of arr) assert.ok(Math.abs(other - v.pos) >= 6, `lane-mates at ${other} and ${v.pos} are closer than 6%`);
    arr.push(v.pos);
    byLane.set(v.lane, arr);
  }
});

test("well-spread avatars all sit in the first lane at true positions", () => {
  const layout = spectrumLayout([{ id: "a", pos: 5 }, { id: "b", pos: 50 }, { id: "c", pos: 95 }]);
  for (const [, v] of layout) assert.equal(v.lane, 0);
  assert.equal(layout.get("b").pos, 50);
  assert.equal(layout.get("b").scale, 1);
});
