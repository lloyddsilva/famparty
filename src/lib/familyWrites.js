// Async round-end family writes, shared by the actions route and the state
// route's timer-expiry path (review items 3-4). Scheduled with after() so the
// database never delays gameplay, and always keyed to the player whose turn
// actually just ended.

import { after } from "next/server";
import { saveStatements, saveGameResults } from "./db.js";

function logFailure(scope, e) {
  // Server-side only; never log statement text, names, or tokens.
  console.error(`[familyWrites] ${scope} failed`, { code: e?.code || e?.cause?.code || e?.name || "unknown" });
}

export function scheduleFamilyWrites(before, afterState) {
  if (!afterState?.familyId || !before) return;
  const familyId = afterState.familyId;

  // Spotlight reveal (host action OR timer expiry): save the featured player's
  // true statements unless they opted out per statement.
  if (before.phase === "spotlight" && afterState.phase === "spotlightReveal") {
    const f = afterState.players.find((p) => p.id === afterState.featuredOrder[afterState.featuredIdx]);
    if (f?.memberId && f.statements) {
      const truths = f.statements.texts.filter((_, i) => i !== f.statements.lieIndex && !f.statements.dontSave?.[i]);
      if (truths.length) after(async () => { try { await saveStatements(familyId, f.memberId, truths, "truth", afterState.code); } catch (e) { logFailure("spotlight truths", e); } });
    }
  }

  // Leaving storySave: save THAT turn's featured player's line — nobody else's.
  if (before.phase === "storySave" && afterState.phase !== "storySave") {
    const featuredId = before.featuredOrder[before.featuredIdx];
    const f = afterState.players.find((p) => p.id === featuredId);
    if (f?.memberId && f.storyLine) {
      after(async () => { try { await saveStatements(familyId, f.memberId, [f.storyLine], "story", afterState.code); } catch (e) { logFailure("story line", e); } });
    }
  }

  if (afterState.phase === "finale" && before.phase !== "finale") {
    const results = afterState.players.filter((p) => p.memberId).map((p) => ({ memberId: p.memberId, game: afterState.game, points: p.score, dedupeScope: afterState.code }));
    if (results.length) after(async () => { try { await saveGameResults(familyId, results); } catch (e) { logFailure("game results", e); } });
  }
}
