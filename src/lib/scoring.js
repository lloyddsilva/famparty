// Pure scoring functions — unit tested in scoring.test.js. No I/O, no Date.now().

export function emojiPoints({ correct, remainingFraction, streakBefore }) {
  if (!correct) return 0;
  const speed = Math.round(400 * Math.min(1, Math.max(0, remainingFraction)));
  const streakBonus = Math.min(Math.max(0, streakBefore) * 50, 200);
  return 600 + speed + streakBonus;
}

export function spotlightPoints({ isLiePick, fooledCount }) {
  // Guesser: 300 for spotting the lie. Featured: 150 per player fooled.
  return { guesser: isLiePick ? 300 : 0, featured: 150 * Math.max(0, fooledCount) };
}

export function rememberThisPoints({ correct, isWriter }) {
  if (isWriter) return 0; // writer never scores on their own statement
  return correct ? 250 : 0;
}

export function spectrumPoints({ majorityCorrect, distanceFromCrowd }) {
  // distanceFromCrowd: 0..1, lower = closer to the crowd's centre
  const closeness = Math.round(200 * (1 - Math.min(1, Math.max(0, distanceFromCrowd))));
  return (majorityCorrect ? 300 : 0) + closeness;
}
