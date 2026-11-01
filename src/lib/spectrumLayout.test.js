import { test } from "node:test";
import assert from "node:assert/strict";
import { spectrumRows } from "./spectrumLayout.js";

test("12 avatars at nearly the same position each get their own row", () => {
  const placements = Array.from({ length: 12 }, (_, i) => ({ id: `p${i}`, pos: 50 + (i % 3) }));
  const rows = spectrumRows(placements);
  const used = new Set(rows.values());
  assert.equal(used.size, 12);
  assert.equal(Math.max(...used), 11);
});

test("well-spread avatars share row zero", () => {
  const rows = spectrumRows([{ id: "a", pos: 5 }, { id: "b", pos: 50 }, { id: "c", pos: 95 }]);
  assert.deepEqual([...rows.values()], [0, 0, 0]);
});
