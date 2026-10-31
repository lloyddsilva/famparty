// Pure game engine: (state, action, now) => state. No I/O, no timers, no Date.now() inside.
// All phase advances — including timer expiry — go through applyAction/advanceIfExpired
// so the Redis compare-and-set in roomStore.js guarantees only one caller wins.

import { QUESTIONS } from "./questions.js";
import { emojiPoints } from "./scoring.js";

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 12;
export const QUESTION_MS = 20000;
export const ROOM_TTL_SECONDS = 2 * 60 * 60;

export function createRoom({ code, hostTokenHash, now }) {
  return {
    code, hostTokenHash, version: 0, game: "emoji", phase: "lobby",
    players: [], qIndex: 0, deadline: null, paused: false, pausedRemainingMs: null,
    locked: false, createdAt: now, updatedAt: now,
  };
}

const findPlayer = (state, id) => state.players.find((p) => p.id === id);

export function addPlayer(state, { id, tokenHash, name, avatar }, now) {
  const existing = state.players.find((p) => p.tokenHash === tokenHash);
  if (existing) return { state, playerId: existing.id, rejoined: true };
  if (state.phase !== "lobby" || state.locked) return { error: "This game has already started. Wait for the next show." };
  if (state.players.length >= MAX_PLAYERS) return { error: `Room is full (${MAX_PLAYERS} players).` };
  if (state.players.some((p) => p.avatar === avatar)) return { error: "That avatar is taken. Pick another." };
  const player = { id, tokenHash, name, avatar, score: 0, streak: 0, lastCorrect: null, lastPoints: 0 };
  return { state: { ...state, players: [...state.players, player], updatedAt: now }, playerId: id, rejoined: false };
}

/** Advance a phase whose deadline has passed. Same CAS path as any action. */
export function advanceIfExpired(state, now) {
  if (state.phase === "question" && !state.paused && state.deadline && now >= state.deadline) {
    return { ...state, phase: "reveal", deadline: null, updatedAt: now };
  }
  return state;
}

function startQuestion(state, now) {
  return {
    ...state,
    phase: "question", deadline: now + QUESTION_MS, paused: false, pausedRemainingMs: null,
    players: state.players.map((p) => ({ ...p, lastCorrect: null, lastPoints: 0 })),
    updatedAt: now,
  };
}

export function applyAction(state, action, now, ctx = {}) {
  const fail = (error) => ({ state, error });
  switch (action.type) {
    case "START": {
      if (state.phase !== "lobby" && state.phase !== "finale") return fail("Game already started.");
      if (state.players.length < MIN_PLAYERS) return fail(`Need at least ${MIN_PLAYERS} players.`);
      const reset = state.phase === "finale"
        ? { ...state, players: state.players.map((p) => ({ ...p, score: 0, streak: 0 })) }
        : state;
      return { state: startQuestion({ ...reset, qIndex: 0 }, now), effects: { clearAnswers: true } };
    }
    case "NEXT": {
      if (state.phase === "question") return { state: { ...state, phase: "reveal", deadline: null, updatedAt: now } };
      if (state.phase === "reveal") return { state: { ...state, phase: "scores", updatedAt: now } };
      if (state.phase === "scores") {
        if (state.qIndex + 1 >= QUESTIONS.length) return { state: { ...state, phase: "finale", deadline: null, updatedAt: now } };
        return { state: startQuestion({ ...state, qIndex: state.qIndex + 1 }, now), effects: { clearAnswers: true } };
      }
      return fail("Nothing to advance.");
    }
    case "PLAY_AGAIN": {
      return {
        state: {
          ...state, phase: "lobby", qIndex: 0, deadline: null, paused: false, locked: false,
          players: state.players.map((p) => ({ ...p, score: 0, streak: 0, lastCorrect: null, lastPoints: 0 })),
          updatedAt: now,
        },
        effects: { clearAnswers: true },
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
      return {
        state: { ...state, players: state.players.filter((p) => p.id !== action.playerId), updatedAt: now },
        effects: { removeAnswerFor: action.playerId },
      };
    }
    case "ANSWER_RECORDED": {
      // Answer itself lives in its own Redis hash field (roomStore); this only books the score.
      const player = findPlayer(state, action.playerId);
      if (!player || state.phase !== "question") return fail("Not accepting answers.");
      const q = QUESTIONS[state.qIndex];
      const correct = q.choices[action.choice] === q.answer;
      const remainingFraction = state.paused ? 0 : Math.max(0, (state.deadline - now) / QUESTION_MS);
      const points = emojiPoints({ correct, remainingFraction, streakBefore: player.streak });
      const players = state.players.map((p) => p.id === player.id
        ? { ...p, score: p.score + points, streak: correct ? p.streak + 1 : 0, lastCorrect: correct, lastPoints: points }
        : p);
      let next = { ...state, players, updatedAt: now };
      if (ctx.allAnswered) next = { ...next, phase: "reveal", deadline: null };
      return { state: next };
    }
    default:
      return fail("Unknown action.");
  }
}

/** Public, per-viewer snapshot. Never leaks answers (emoji) or other players' tokens. */
export function buildView(state, { answers = {}, presence = {}, viewer = {} } = {}) {
  const q = QUESTIONS[state.qIndex];
  const players = state.players
    .map((p) => ({
      id: p.id, name: p.name, avatar: p.avatar, score: p.score, streak: p.streak,
      answered: answers[p.id] !== undefined,
      lastCorrect: p.lastCorrect, lastPoints: p.lastPoints,
      connected: presence[p.id] ? Date.now() - presence[p.id] < 6000 : false,
    }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const me = viewer.playerId ? players.find((p) => p.id === viewer.playerId) : null;
  return {
    code: state.code, game: state.game, phase: state.phase, version: state.version,
    players, answeredCount: Object.keys(answers).length,
    qIndex: state.qIndex, totalQuestions: QUESTIONS.length,
    deadline: state.deadline, paused: state.paused, locked: state.locked,
    question: ["question", "reveal"].includes(state.phase) && q
      ? { emoji: q.emoji, choices: q.choices, ...(state.phase === "reveal" ? { answer: q.answer, answerIndex: q.choices.indexOf(q.answer) } : {}) }
      : null,
    myAnswer: viewer.playerId ? (answers[viewer.playerId] ?? null) : null,
    me,
  };
}
