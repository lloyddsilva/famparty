// Pure game engine: (state, action, now) => state. No I/O, no timers, no Date.now() inside.
// All phase advances — including timer expiry — go through applyAction/advanceIfExpired
// so the Redis compare-and-set in roomStore.js guarantees only one caller wins.

import { QUESTIONS } from "./questions.js";
import { SPECTRUM_PACK, FINISHIT_PACK } from "./packs.js";
import { emojiPoints, spotlightPoints, rememberThisPoints, spectrumPoints } from "./scoring.js";

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 12;
export const QUESTION_MS = 20000;
export const SPOTLIGHT_MS = 30000;
export const STORY_MS = 30000;
export const SPECTRUM_MS = 20000;
export const WRITE_MS = 60000;
export const VOTE_MS = 30000;
export const ROOM_TTL_SECONDS = 2 * 60 * 60;
export const GAMES = ["emoji", "spotlight", "spectrum", "finishit", "remember"];

const shuffle = (arr, seed = 1) => {
  // Deterministic-ish shuffle seeded by caller-provided value (keeps engine pure).
  const a = [...arr];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export const normalizeText = (t) => String(t || "").toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

export function createRoom({ code, hostTokenHash, now, familyId = null }) {
  return {
    code, hostTokenHash, familyId, version: 0, game: "emoji", phase: "lobby",
    players: [], qIndex: 0, deadline: null, paused: false, pausedRemainingMs: null,
    locked: false, createdAt: now, updatedAt: now,
    featuredOrder: [], featuredIdx: 0, spotlightOrder: [0, 1, 2], votes: {},
    finishOrder: [], rememberItems: [], roundId: "lobby-0",
  };
}

const findPlayer = (state, id) => state.players.find((p) => p.id === id);
const featured = (state) => findPlayer(state, state.featuredOrder[state.featuredIdx]);
const freshPlayerFlags = (p) => ({ ...p, lastCorrect: null, lastPoints: 0 });

export function addPlayer(state, { id, tokenHash, name, avatar, memberId = null }, now) {
  const existing = state.players.find((p) => p.tokenHash === tokenHash);
  if (existing) return { state, playerId: existing.id, rejoined: true };
  if (memberId && state.players.some((p) => p.memberId === memberId)) {
    const p = state.players.find((x) => x.memberId === memberId);
    return { state: { ...state, players: state.players.map((x) => x.id === p.id ? { ...x, tokenHash } : x), updatedAt: now }, playerId: p.id, rejoined: true };
  }
  if (state.phase !== "lobby" || state.locked) return { error: "This game has already started. Wait for the next show." };
  if (state.players.length >= MAX_PLAYERS) return { error: `Room is full (${MAX_PLAYERS} players).` };
  if (state.players.some((p) => p.avatar === avatar)) return { error: "That avatar is taken. Pick another." };
  const player = {
    id, tokenHash, memberId, name, avatar, score: 0, streak: 0, lastCorrect: null, lastPoints: 0,
    statements: null, watching: false, storyLine: null, hidden: false,
    spectrumPos: null, spectrumPrediction: null, finishAnswer: null,
  };
  return { state: { ...state, players: [...state.players, player], updatedAt: now }, playerId: id, rejoined: false };
}

/* ---------- shared transitions ---------- */
function toPhase(state, phase, now, ms = null, extra = {}) {
  return { ...state, phase, deadline: ms ? now + ms : null, paused: false, pausedRemainingMs: null, updatedAt: now, ...extra };
}
function startQuestion(state, now) {
  // A fresh roundId per question: answers are keyed by it, so a replay can never
  // surface stale answers from a previous game (regression: review item 5).
  return toPhase(state, "question", now, QUESTION_MS, {
    players: state.players.map(freshPlayerFlags),
    roundId: `emoji-${state.qIndex}-${now}`,
  });
}

/**
 * Score the emoji round exactly once, when it moves to reveal, from the answers
 * hash ({ playerId: {choice, at} }). Booking at reveal — not per answer — means
 * simultaneous answers and answers landing at timer expiry can never lose points
 * (regression: review items 1-2).
 */
export function scoreEmojiReveal(state, answers = {}, now) {
  if (state.phase !== "question") return state;
  const q = QUESTIONS[state.qIndex];
  const players = state.players.map((p) => {
    const a = answers[p.id];
    if (!a) return { ...p, lastCorrect: false, lastPoints: 0 };
    const correct = q.choices[a.choice] === q.answer;
    const remainingFraction = Math.max(0, ((state.deadline ?? now) - a.at) / QUESTION_MS);
    const points = emojiPoints({ correct, remainingFraction, streakBefore: p.streak });
    return { ...p, score: p.score + points, streak: correct ? p.streak + 1 : 0, lastCorrect: correct, lastPoints: points };
  });
  return toPhase({ ...state, players }, "reveal", now);
}

export function assertExpectedPhase(state, expectedPhase) {
  if (expectedPhase && state.phase !== expectedPhase) return `Stale screen: expected ${expectedPhase}, room is in ${state.phase}.`;
  return null;
}
function revealSpotlight(state, now) {
  const f = featured(state);
  if (!f?.statements) return state;
  const liePos = state.spotlightOrder.indexOf(f.statements.lieIndex);
  let fooled = 0;
  const players = state.players.map((p) => {
    if (p.id === f.id) return p;
    const vote = state.votes[p.id];
    if (vote === undefined) return { ...p, lastCorrect: false, lastPoints: 0 };
    const correct = vote === liePos;
    if (!correct) fooled += 1;
    const pts = spotlightPoints({ isLiePick: correct, fooledCount: 0 }).guesser;
    return { ...p, score: p.score + pts, lastCorrect: correct, lastPoints: pts };
  });
  const fPts = spotlightPoints({ isLiePick: false, fooledCount: fooled }).featured;
  return toPhase({ ...state, players: players.map((p) => p.id === f.id ? { ...p, lastPoints: fPts, score: p.score + fPts } : p) }, "spotlightReveal", now);
}
function startSpotlightTurn(state, now) {
  const f = featured(state);
  if (!f) return toPhase(state, "finale", now);
  return toPhase({ ...state, votes: {}, players: state.players.map(freshPlayerFlags), spotlightOrder: shuffle([0, 1, 2], now % 100000) }, "spotlight", now, SPOTLIGHT_MS);
}
function revealSpectrum(state, now) {
  const placed = state.players.filter((p) => p.spectrumPos !== null);
  if (!placed.length) return toPhase(state, "spectrumReveal", now);
  const sorted = [...placed].map((p) => p.spectrumPos).sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const majoritySide = median >= 50 ? "right" : "left";
  const players = state.players.map((p) => {
    if (p.spectrumPos === null) return { ...p, lastPoints: 0, lastCorrect: false };
    const pts = spectrumPoints({ majorityCorrect: p.spectrumPrediction === majoritySide, distanceFromCrowd: Math.abs(p.spectrumPos - median) / 100 });
    return { ...p, score: p.score + pts, lastPoints: pts, lastCorrect: p.spectrumPrediction === majoritySide };
  });
  return toPhase({ ...state, players, spectrumMedian: median, spectrumMajority: majoritySide }, "spectrumReveal", now);
}
function startSpectrum(state, now) {
  return toPhase({ ...state, players: state.players.map((p) => ({ ...freshPlayerFlags(p), spectrumPos: null, spectrumPrediction: null })) }, "spectrum", now, SPECTRUM_MS);
}
function finishToVote(state, now) {
  const ids = state.players.filter((p) => p.finishAnswer).map((p) => p.id);
  return toPhase({ ...state, votes: {}, finishOrder: shuffle(ids, now % 100000) }, "finishVote", now, VOTE_MS);
}
function revealFinish(state, now) {
  // Exact normalized duplicates pool their votes and split the points. No fuzzy matching.
  const groups = new Map();
  for (const p of state.players) {
    if (!p.finishAnswer) continue;
    const key = normalizeText(p.finishAnswer);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p.id);
  }
  const voteCount = {};
  for (const voter of Object.keys(state.votes)) voteCount[state.votes[voter]] = (voteCount[state.votes[voter]] || 0) + 1;
  const earned = {};
  for (const [, ids] of groups) {
    const totalVotes = ids.reduce((sum, id) => sum + (voteCount[id] || 0), 0);
    const each = Math.floor((totalVotes * 100) / ids.length);
    for (const id of ids) earned[id] = each;
  }
  const players = state.players.map((p) => ({ ...p, lastPoints: earned[p.id] || 0, score: p.score + (earned[p.id] || 0), lastCorrect: (earned[p.id] || 0) > 0 }));
  return toPhase({ ...state, players, finishVoteCount: voteCount }, "finishReveal", now);
}
function revealRemember(state, now) {
  const item = state.rememberItems[state.qIndex];
  if (!item) return toPhase(state, "finale", now);
  const players = state.players.map((p) => {
    const guess = state.votes[p.id];
    const isWriter = p.memberId && p.memberId === item.writerMemberId;
    const pts = rememberThisPoints({ correct: guess === item.writerMemberId, isWriter: !!isWriter });
    return { ...p, score: p.score + pts, lastPoints: pts, lastCorrect: guess === item.writerMemberId && !isWriter };
  });
  return toPhase({ ...state, players }, "rememberReveal", now);
}

export function advanceIfExpired(state, now, ctx = {}) {
  if (!state.deadline || state.paused || now < state.deadline) return state;
  switch (state.phase) {
    case "question": return scoreEmojiReveal(state, ctx.answers, now);
    case "spotlight": return revealSpotlight(state, now);
    case "story": return toPhase(state, "storySave", now);
    case "spectrum": return revealSpectrum(state, now);
    case "finishWrite": return finishToVote(state, now);
    case "finishVote": return revealFinish(state, now);
    case "remember": return revealRemember(state, now);
    default: return state;
  }
}

export function applyAction(state, action, now, ctx = {}) {
  const fail = (error) => ({ state, error });
  const actor = action.playerId ? findPlayer(state, action.playerId) : null;

  switch (action.type) {
    case "SELECT_GAME": {
      if (state.phase !== "lobby" || !GAMES.includes(action.game)) return fail("Cannot pick a game now.");
      return { state: { ...state, game: action.game, updatedAt: now } };
    }
    case "START": {
      if (!["lobby", "finale"].includes(state.phase)) return fail("Game already started.");
      if (state.players.length < MIN_PLAYERS) return fail(`Need at least ${MIN_PLAYERS} players.`);
      const base = state.phase === "finale"
        ? { ...state, qIndex: 0, players: state.players.map((p) => ({ ...p, score: 0, streak: 0, statements: null, watching: false, storyLine: null, finishAnswer: null })) }
        : { ...state, qIndex: 0 };
      if (state.game === "spotlight") return { state: toPhase(base, "prep", now) };
      if (state.game === "spectrum") return { state: startSpectrum(base, now) };
      if (state.game === "finishit") return { state: toPhase({ ...base, players: base.players.map((p) => ({ ...p, finishAnswer: null })) }, "finishWrite", now, WRITE_MS) };
      if (state.game === "remember") {
        const items = Array.isArray(action.items) ? action.items.slice(0, 10) : [];
        if (!items.length) return fail("No saved true statements yet. Play Spotlight first.");
        return { state: toPhase({ ...base, rememberItems: items, votes: {} }, "remember", now, SPOTLIGHT_MS) };
      }
      return { state: startQuestion(base, now) };
    }
    case "SUBMIT_STATEMENTS": {
      if (state.phase !== "prep" || !actor) return fail("Not in prep.");
      return { state: { ...state, players: state.players.map((p) => p.id === actor.id ? { ...p, statements: action.statements, watching: false } : p), updatedAt: now } };
    }
    case "SET_WATCH": {
      if (state.phase !== "prep" || !actor) return fail("Not in prep.");
      return { state: { ...state, players: state.players.map((p) => p.id === actor.id ? { ...p, watching: true } : p), updatedAt: now } };
    }
    case "BEGIN_SPOTLIGHT": {
      // host starts anyway: unfinished players become just-watch
      if (state.phase !== "prep") return fail("Not in prep.");
      const players = state.players.map((p) => p.statements ? p : { ...p, watching: true });
      const order = players.filter((p) => p.statements).map((p) => p.id);
      if (!order.length) return fail("Nobody has submitted statements yet.");
      return { state: startSpotlightTurn({ ...state, players, featuredOrder: order, featuredIdx: 0 }, now) };
    }
    case "VOTE": {
      if (!actor || state.votes[actor.id] !== undefined) return fail("Already voted.");
      if (state.phase === "spotlight") {
        const f = featured(state);
        if (!f || actor.id === f.id || ![0, 1, 2].includes(action.choice)) return fail("Invalid vote.");
        const next = { ...state, votes: { ...state.votes, [actor.id]: action.choice }, updatedAt: now };
        const voters = state.players.filter((p) => p.connected !== false && p.id !== f.id);
        return { state: voters.every((p) => next.votes[p.id] !== undefined) ? revealSpotlight(next, now) : next };
      }
      if (state.phase === "remember") {
        const cur = state.rememberItems[state.qIndex];
        if (actor.memberId && cur && actor.memberId === cur.writerMemberId) return fail("The writer cannot guess their own statement.");
        const next = { ...state, votes: { ...state.votes, [actor.id]: String(action.choice) }, updatedAt: now };
        const item = state.rememberItems[state.qIndex];
        const guessers = state.players.filter((p) => !(p.memberId && p.memberId === item?.writerMemberId));
        return { state: guessers.every((p) => next.votes[p.id] !== undefined) ? revealRemember(next, now) : next };
      }
      if (state.phase === "finishVote") {
        if (actor.id === action.choice || !state.finishOrder.includes(action.choice)) return fail("Invalid vote.");
        const next = { ...state, votes: { ...state.votes, [actor.id]: action.choice }, updatedAt: now };
        return { state: state.players.every((p) => next.votes[p.id] !== undefined) ? revealFinish(next, now) : next };
      }
      return fail("Not voting now.");
    }
    case "PLACE": {
      if (state.phase !== "spectrum" || !actor) return fail("Not placing now.");
      const pos = Math.max(0, Math.min(100, Math.round(Number(action.pos))));
      if (Number.isNaN(pos) || !["left", "right"].includes(action.prediction)) return fail("Invalid placement.");
      const next = { ...state, players: state.players.map((p) => p.id === actor.id ? { ...p, spectrumPos: pos, spectrumPrediction: action.prediction } : p), updatedAt: now };
      return { state: next.players.every((p) => p.spectrumPos !== null) ? revealSpectrum(next, now) : next };
    }
    case "FINISH_SUBMIT": {
      if (state.phase !== "finishWrite" || !actor || !action.text) return fail("Not writing now.");
      const next = { ...state, players: state.players.map((p) => p.id === actor.id ? { ...p, finishAnswer: action.text } : p), updatedAt: now };
      return { state: next.players.every((p) => p.finishAnswer) ? finishToVote(next, now) : next };
    }
    case "STORY_SAVE": {
      const f = featured(state);
      if (state.phase !== "storySave" || !f || actor?.id !== f.id) return fail("Only the featured player can save a story line now.");
      return { state: { ...state, players: state.players.map((p) => p.id === f.id ? { ...p, storyLine: action.text || null } : p), updatedAt: now } };
    }
    case "HIDE": {
      if (!findPlayer(state, action.targetId)) return fail("Player not found.");
      return { state: { ...state, players: state.players.map((p) => p.id === action.targetId ? { ...p, hidden: !!action.hidden } : p), updatedAt: now } };
    }
    case "NEXT": {
      if (state.phase === "question") return { state: scoreEmojiReveal(state, ctx.answers, now) };
      if (state.phase === "reveal") return { state: toPhase(state, "scores", now) };
      if (state.phase === "spotlight") return { state: revealSpotlight(state, now) };
      if (state.phase === "spotlightReveal") return { state: toPhase(state, "story", now, STORY_MS) };
      if (state.phase === "story") return { state: toPhase(state, "storySave", now) };
      if (state.phase === "storySave") {
        const idx = state.featuredIdx + 1;
        if (idx >= state.featuredOrder.length) return { state: toPhase(state, "finale", now) };
        return { state: startSpotlightTurn({ ...state, featuredIdx: idx }, now) };
      }
      if (state.phase === "spectrum") return { state: revealSpectrum(state, now) };
      if (state.phase === "spectrumReveal") return { state: toPhase(state, "scores", now) };
      if (state.phase === "finishWrite") return { state: finishToVote(state, now) };
      if (state.phase === "finishVote") return { state: revealFinish(state, now) };
      if (state.phase === "finishReveal") return { state: toPhase(state, "scores", now) };
      if (state.phase === "remember") return { state: revealRemember(state, now) };
      if (state.phase === "rememberReveal") {
        if (state.qIndex + 1 >= state.rememberItems.length) return { state: toPhase(state, "finale", now) };
        return { state: toPhase({ ...state, qIndex: state.qIndex + 1, votes: {}, players: state.players.map(freshPlayerFlags) }, "remember", now, SPOTLIGHT_MS) };
      }
      if (state.phase === "scores") {
        if (state.game === "spectrum") {
          if (state.qIndex + 1 >= SPECTRUM_PACK.items.length) return { state: toPhase(state, "finale", now) };
          return { state: startSpectrum({ ...state, qIndex: state.qIndex + 1 }, now) };
        }
        if (state.game === "finishit") {
          if (state.qIndex + 1 >= FINISHIT_PACK.items.length) return { state: toPhase(state, "finale", now) };
          return { state: toPhase({ ...state, qIndex: state.qIndex + 1, players: state.players.map((p) => ({ ...freshPlayerFlags(p), finishAnswer: null })) }, "finishWrite", now, WRITE_MS) };
        }
        if (state.qIndex + 1 >= QUESTIONS.length) return { state: toPhase(state, "finale", now) };
        return { state: startQuestion({ ...state, qIndex: state.qIndex + 1 }, now) };
      }
      return fail("Nothing to advance.");
    }
    case "PLAY_AGAIN": {
      return {
        state: {
          ...state, phase: "lobby", qIndex: 0, deadline: null, paused: false, locked: false, votes: {}, featuredOrder: [], featuredIdx: 0,
          players: state.players.map((p) => ({ ...p, score: 0, streak: 0, lastCorrect: null, lastPoints: 0, statements: null, watching: false, storyLine: null, finishAnswer: null, spectrumPos: null })),
          updatedAt: now,
        },
      };
    }
    case "LOCK": return { state: { ...state, locked: !!action.locked, updatedAt: now } };
    case "PAUSE": {
      if (!state.deadline || state.paused) return fail("Nothing to pause.");
      return { state: { ...state, paused: true, pausedRemainingMs: Math.max(0, state.deadline - now), deadline: null, updatedAt: now } };
    }
    case "RESUME": {
      if (!state.paused) return fail("Not paused.");
      return { state: { ...state, paused: false, deadline: now + (state.pausedRemainingMs ?? QUESTION_MS), pausedRemainingMs: null, updatedAt: now } };
    }
    case "KICK": {
      if (!findPlayer(state, action.playerId)) return fail("Player not found.");
      return { state: { ...state, players: state.players.filter((p) => p.id !== action.playerId), updatedAt: now }, effects: { removeAnswerFor: action.playerId } };
    }
    // Note: emoji answers are NOT booked here. They live in the answers hash with
    // their timestamps and are scored once by scoreEmojiReveal at reveal time.
    default:
      return fail("Unknown action.");
  }
}

/* ---------- views ---------- */
export function buildView(state, { answers = {}, presence = {}, viewer = {} } = {}) {
  const isDisplay = viewer.role === "display";
  const mask = (p) => isDisplay && p.hidden ? { name: "Hidden by host", avatar: "🙈" } : { name: p.name, avatar: p.avatar };
  const q = QUESTIONS[state.qIndex];
  const players = state.players
    .map((p) => ({
      id: p.id, memberId: p.memberId, ...mask(p), score: p.score, streak: p.streak,
      answered: answers[p.id] !== undefined, voted: state.votes[p.id] !== undefined,
      // answers entries are {choice, at}; legacy numeric entries are tolerated
      lastCorrect: p.lastCorrect, lastPoints: p.lastPoints, hidden: p.hidden,
      ready: !!p.statements, watching: p.watching, hasAnswer: !!p.finishAnswer,
      connected: presence[p.id] ? Date.now() - presence[p.id] < 6000 : false,
    }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const me = viewer.playerId ? players.find((p) => p.id === viewer.playerId) : null;
  const rawMe = viewer.playerId ? findPlayer(state, viewer.playerId) : null;
  const f = featured(state);
  const spectrumItem = SPECTRUM_PACK.items[state.qIndex];
  const finishItem = FINISHIT_PACK.items[state.qIndex];
  const rememberItem = state.rememberItems[state.qIndex];

  return {
    code: state.code, game: state.game, phase: state.phase, version: state.version,
    familyLinked: !!state.familyId,
    players, answeredCount: Object.keys(answers).length, votedCount: Object.keys(state.votes || {}).length,
    qIndex: state.qIndex,
    totalQuestions: state.game === "spectrum" ? SPECTRUM_PACK.items.length : state.game === "finishit" ? FINISHIT_PACK.items.length : state.game === "remember" ? state.rememberItems.length : QUESTIONS.length,
    deadline: state.deadline, paused: state.paused, locked: state.locked,
    question: ["question", "reveal"].includes(state.phase) && q
      ? { emoji: q.emoji, choices: q.choices, ...(state.phase === "reveal" ? { answer: q.answer, answerIndex: q.choices.indexOf(q.answer) } : {}) }
      : null,
    spotlight: f && ["spotlight", "spotlightReveal", "story", "storySave"].includes(state.phase)
      ? {
          featuredId: f.id, ...mask(f), turn: state.featuredIdx + 1, totalTurns: state.featuredOrder.length,
          statements: f.hidden && isDisplay ? f.statements.texts.map(() => "Hidden by host") : state.spotlightOrder.map((idx) => f.statements.texts[idx]),
          ...(state.phase !== "spotlight" ? { liePosition: state.spotlightOrder.indexOf(f.statements.lieIndex) } : {}),
          storyLine: f.storyLine,
        }
      : null,
    spectrum: spectrumItem && ["spectrum", "spectrumReveal"].includes(state.phase)
      ? {
          left: spectrumItem.left, right: spectrumItem.right,
          ...(state.phase === "spectrumReveal" ? {
            median: state.spectrumMedian, majority: state.spectrumMajority,
            placements: state.players.filter((p) => p.spectrumPos !== null).map((p) => ({ id: p.id, pos: p.spectrumPos })),
          } : {}),
        }
      : null,
    finishit: finishItem && ["finishWrite", "finishVote", "finishReveal"].includes(state.phase)
      ? {
          prompt: finishItem,
          ...(state.phase === "finishVote" ? { candidates: state.finishOrder.map((id) => { const p = findPlayer(state, id); return { id, text: p.hidden && isDisplay ? "Hidden by host" : p.finishAnswer }; }) } : {}),
          ...(state.phase === "finishReveal" ? { candidates: state.finishOrder.map((id) => { const p = findPlayer(state, id); return { id, text: p.finishAnswer, authorId: id, votes: (state.finishVoteCount || {})[id] || 0, points: p.lastPoints }; }) } : {}),
        }
      : null,
    remember: rememberItem && ["remember", "rememberReveal"].includes(state.phase)
      ? {
          text: rememberItem.text,
          choices: state.players.filter((p) => p.memberId).map((p) => ({ memberId: p.memberId, name: p.name, avatar: p.avatar })),
          ...(state.phase === "rememberReveal" ? { writerMemberId: rememberItem.writerMemberId, writerName: rememberItem.writerName } : {}),
        }
      : null,
    myAnswer: viewer.playerId ? (typeof answers[viewer.playerId] === "object" && answers[viewer.playerId] !== null ? answers[viewer.playerId].choice : (answers[viewer.playerId] ?? null)) : null,
    myVote: viewer.playerId ? (state.votes[viewer.playerId] ?? null) : null,
    myPlacement: rawMe?.spectrumPos ?? null,
    iAmFeatured: f?.id === viewer.playerId,
    me,
  };
}

export function roundKeyFor(state) {
  // Per-game round id (review item 5): stale answers from a previous game are
  // unreachable because each question gets a fresh key.
  return state.roundId || `emoji-${state.qIndex}`;
}
