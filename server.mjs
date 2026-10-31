import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import next from "next";
import { Server } from "socket.io";
import { QUESTIONS, AVATARS } from "./src/lib/questions.js";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const rooms = new Map();
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const QUESTION_MS = 20000;
const MAX_PLAYERS = 8;

function makeCode() {
  let code;
  do {
    code = Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
  } while (rooms.has(code));
  return code;
}
const token = () => randomBytes(16).toString("hex");
const cleanName = (v) => String(v || "Player").replace(/\s+/g, " ").trim().slice(0, 16) || "Player";

function publicPlayers(room) {
  return [...room.players.values()]
    .map((p) => ({
      id: p.id, name: p.name, avatar: p.avatar, score: p.score, streak: p.streak,
      connected: p.connected, answered: room.answers.has(p.id),
      lastCorrect: p.lastCorrect, lastPoints: p.lastPoints,
    }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

function snapshot(room, socketId) {
  const q = QUESTIONS[room.qIndex];
  const isReveal = room.phase === "reveal";
  return {
    code: room.code,
    phase: room.phase,
    players: publicPlayers(room),
    answeredCount: room.answers.size,
    qIndex: room.qIndex,
    totalQuestions: QUESTIONS.length,
    endsAt: room.endsAt,
    question: ["question", "reveal"].includes(room.phase) && q
      ? { emoji: q.emoji, choices: q.choices, ...(isReveal ? { answer: q.answer, answerIndex: q.choices.indexOf(q.answer) } : {}) }
      : null,
    myAnswer: room.answers.get(socketId)?.choice ?? null,
  };
}

function broadcast(room) {
  for (const socketId of [...room.players.keys(), room.hostId].filter(Boolean)) {
    globalThis.__io?.to(socketId).emit("room:state", snapshot(room, socketId));
  }
}

function clearTimer(room) {
  if (room.timer) clearTimeout(room.timer);
  room.timer = null;
}

function startQuestion(room) {
  clearTimer(room);
  room.answers.clear();
  for (const p of room.players.values()) { p.lastCorrect = null; p.lastPoints = 0; }
  room.phase = "question";
  room.endsAt = Date.now() + QUESTION_MS;
  room.timer = setTimeout(() => reveal(room), QUESTION_MS + 250);
  broadcast(room);
}

function reveal(room) {
  if (room.phase !== "question") return;
  clearTimer(room);
  room.phase = "reveal";
  room.endsAt = null;
  broadcast(room);
}

function nextPhase(room) {
  if (room.phase === "lobby" || room.phase === "finale") {
    room.qIndex = 0;
    if (room.phase === "finale") for (const p of room.players.values()) { p.score = 0; p.streak = 0; }
    startQuestion(room);
  } else if (room.phase === "question") {
    reveal(room);
  } else if (room.phase === "reveal") {
    room.phase = "scores";
    broadcast(room);
  } else if (room.phase === "scores") {
    if (room.qIndex + 1 >= QUESTIONS.length) { room.phase = "finale"; broadcast(room); }
    else { room.qIndex += 1; startQuestion(room); }
  }
}

await app.prepare();
const httpServer = createServer((req, res) => handle(req, res));
const io = new Server(httpServer, { cors: { origin: "*" } });
globalThis.__io = io;

io.on("connection", (socket) => {
  socket.on("room:create", (cb) => {
    const code = makeCode();
    const room = {
      code, hostId: socket.id, hostToken: token(), phase: "lobby",
      players: new Map(), answers: new Map(), qIndex: 0, endsAt: null, timer: null,
    };
    rooms.set(code, room);
    socket.join(code);
    cb?.({ ok: true, code, hostToken: room.hostToken });
    socket.emit("room:state", snapshot(room, socket.id));
  });

  socket.on("room:rejoinHost", ({ code, hostToken } = {}, cb) => {
    const room = rooms.get(String(code || "").toUpperCase());
    if (!room || room.hostToken !== hostToken) return cb?.({ ok: false, error: "Room not found. Create a new show." });
    room.hostId = socket.id;
    socket.join(room.code);
    cb?.({ ok: true, code: room.code });
    broadcast(room);
  });

  socket.on("room:join", ({ code, name, avatar, playerToken } = {}, cb) => {
    const room = rooms.get(String(code || "").toUpperCase().trim());
    if (!room) return cb?.({ ok: false, error: "Room not found. Check the code on the big screen." });
    if (!AVATARS.includes(avatar)) return cb?.({ ok: false, error: "Pick an avatar." });

    let player = [...room.players.values()].find((p) => playerToken && p.playerToken === playerToken);
    if (player) {
      room.players.delete(player.id);
      player.id = socket.id;
      player.connected = true;
      room.players.set(socket.id, player);
    } else {
      if (room.phase !== "lobby") return cb?.({ ok: false, error: "This game has already started. Wait for the next show." });
      if (room.players.size >= MAX_PLAYERS) return cb?.({ ok: false, error: "Room is full (8 players)." });
      if ([...room.players.values()].some((p) => p.avatar === avatar)) return cb?.({ ok: false, error: "That avatar is taken. Pick another." });
      player = {
        id: socket.id, playerToken: playerToken || token(), name: cleanName(name), avatar,
        score: 0, streak: 0, connected: true, lastCorrect: null, lastPoints: 0,
      };
      room.players.set(socket.id, player);
    }
    socket.join(room.code);
    cb?.({ ok: true, code: room.code, playerToken: player.playerToken, playerId: player.id });
    broadcast(room);
  });

  const asHost = (fn) => ({ code } = {}) => {
    const room = rooms.get(String(code || "").toUpperCase());
    if (room && room.hostId === socket.id) fn(room);
  };
  socket.on("game:start", asHost((room) => { if (room.players.size >= 1) nextPhase(room); }));
  socket.on("game:next", asHost((room) => nextPhase(room)));
  socket.on("game:playAgain", asHost((room) => {
    clearTimer(room);
    room.phase = "lobby"; room.qIndex = 0; room.answers.clear();
    for (const p of room.players.values()) { p.score = 0; p.streak = 0; p.lastCorrect = null; p.lastPoints = 0; }
    broadcast(room);
  }));

  socket.on("game:answer", ({ code, choice } = {}) => {
    const room = rooms.get(String(code || "").toUpperCase());
    const player = room?.players.get(socket.id);
    if (!room || !player || room.phase !== "question" || room.answers.has(socket.id)) return;
    const idx = Number(choice);
    const q = QUESTIONS[room.qIndex];
    if (!Number.isInteger(idx) || idx < 0 || idx >= q.choices.length) return;

    const remaining = Math.max(0, (room.endsAt - Date.now()) / QUESTION_MS);
    const correct = q.choices[idx] === q.answer;
    const points = correct ? 600 + Math.round(400 * remaining) + Math.min(player.streak * 50, 200) : 0;
    player.streak = correct ? player.streak + 1 : 0;
    player.score += points;
    player.lastCorrect = correct;
    player.lastPoints = points;
    room.answers.set(socket.id, { choice: idx });
    broadcast(room);
    const connected = [...room.players.values()].filter((p) => p.connected);
    if (connected.length && connected.every((p) => room.answers.has(p.id))) reveal(room);
  });

  socket.on("disconnect", () => {
    for (const room of rooms.values()) {
      if (room.hostId === socket.id) room.hostId = room.hostId; // host may rejoin with token; room persists
      const player = room.players.get(socket.id);
      if (player) { player.connected = false; broadcast(room); }
      const anyConnectedPlayer = [...room.players.values()].some((p) => p.connected);
      if (!anyConnectedPlayer && room.hostId !== socket.id) {
        // keep room for host-led session; host page refresh uses token rejoin
      }
    }
  });
});

httpServer.listen(port, () => console.log(`> Family Game Show ready on http://localhost:${port}`));
