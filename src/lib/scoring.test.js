import { test } from "node:test";
import assert from "node:assert/strict";
import { emojiPoints, spotlightPoints, rememberThisPoints, spectrumPoints } from "./scoring.js";

test("emoji: wrong answer scores 0", () => {
  assert.equal(emojiPoints({ correct: false, remainingFraction: 1, streakBefore: 5 }), 0);
});
test("emoji: fast correct beats slow correct, streak capped", () => {
  const fast = emojiPoints({ correct: true, remainingFraction: 1, streakBefore: 0 });
  const slow = emojiPoints({ correct: true, remainingFraction: 0, streakBefore: 0 });
  assert.equal(fast, 1000);
  assert.equal(slow, 600);
  assert.equal(emojiPoints({ correct: true, remainingFraction: 0, streakBefore: 99 }), 800);
});
test("spotlight: guesser and featured scoring", () => {
  assert.deepEqual(spotlightPoints({ isLiePick: true, fooledCount: 2 }), { guesser: 300, featured: 300 });
  assert.deepEqual(spotlightPoints({ isLiePick: false, fooledCount: 0 }), { guesser: 0, featured: 0 });
});
test("rememberThis: writer never scores on own statement", () => {
  assert.equal(rememberThisPoints({ correct: true, isWriter: true }), 0);
  assert.equal(rememberThisPoints({ correct: true, isWriter: false }), 250);
});
test("spectrum: majority + closeness", () => {
  assert.equal(spectrumPoints({ majorityCorrect: true, distanceFromCrowd: 0 }), 500);
  assert.equal(spectrumPoints({ majorityCorrect: false, distanceFromCrowd: 1 }), 0);
});
