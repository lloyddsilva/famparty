"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { AVATARS } from "../lib/questions";

let socket;
function getSocket() {
  if (!socket) socket = io({ autoConnect: true });
  return socket;
}
const CHOICE_LABELS = ["A", "B", "C", "D"];

function useCountdown(endsAt) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!endsAt) return;
    const id = setInterval(() => setTick((t) => t + 1), 200);
    return () => clearInterval(id);
  }, [endsAt]);
  return endsAt ? Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)) : null;
}

function Leaderboard({ players, meId }) {
  const max = Math.max(1, ...players.map((p) => p.score));
  return (
    <div className="leaderboard">
      {players.map((p, i) => (
        <div key={p.id} className={`lb-row ${p.id === meId ? "me" : ""}`}>
          <span className="rank">{i + 1}</span>
          <span className="lb-avatar">{p.avatar}</span>
          <span className="lb-name">{p.name}{!p.connected ? " · offline" : ""}</span>
          <span className="lb-bar"><span style={{ width: `${(p.score / max) * 100}%` }} /></span>
          <strong>{p.score}</strong>
        </div>
      ))}
    </div>
  );
}

export default function GameApp({ initialMode }) {
  const [mode, setMode] = useState(initialMode); // home | host | join
  const [state, setState] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [meId, setMeId] = useState(null);
  const seconds = useCountdown(state?.endsAt);
  const stateRef = useRef(null);
  stateRef.current = state;

  useEffect(() => {
    const s = getSocket();
    const onState = (snap) => setState(snap);
    s.on("room:state", onState);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const c = params.get("code");
      if (c) setCodeInput(c.toUpperCase());
      if (initialMode === "host") {
        const savedCode = localStorage.getItem("fgs:hostCode");
        const savedToken = localStorage.getItem("fgs:hostToken");
        if (savedCode && savedToken) {
          s.emit("room:rejoinHost", { code: savedCode, hostToken: savedToken }, (res) => {
            if (!res?.ok) { localStorage.removeItem("fgs:hostCode"); localStorage.removeItem("fgs:hostToken"); }
          });
        }
      }
    }
    return () => s.off("room:state", onState);
  }, [initialMode]);

  const me = useMemo(() => state?.players.find((p) => p.id === meId), [state, meId]);
  const takenAvatars = new Set((state?.players || []).map((p) => p.avatar));

  function createRoom() {
    setBusy(true); setError("");
    getSocket().emit("room:create", (res) => {
      setBusy(false);
      if (!res?.ok) return setError("Could not create a room. Try again.");
      localStorage.setItem("fgs:hostCode", res.code);
      localStorage.setItem("fgs:hostToken", res.hostToken);
    });
  }

  function joinRoom(e) {
    e.preventDefault();
    setBusy(true); setError("");
    const savedToken = localStorage.getItem("fgs:playerToken") || undefined;
    getSocket().emit("room:join", { code: codeInput, name, avatar, playerToken: savedToken }, (res) => {
      setBusy(false);
      if (!res?.ok) return setError(res?.error || "Could not join.");
      localStorage.setItem("fgs:playerToken", res.playerToken);
      setMeId(res.playerId);
    });
  }

  const emit = (event) => state && getSocket().emit(event, { code: state.code });
  const joinUrl = state && typeof window !== "undefined" ? `${window.location.origin}/join?code=${state.code}` : "";

  // ---------- HOME ----------
  if (mode === "home" && !state) {
    return (
      <main className="shell">
        <div className="hero card">
          <p className="eyebrow">ONE BIG SCREEN · EVERYONE PLAYS</p>
          <h1>Family Game Show</h1>
          <p className="sub">Emoji Pictionary for the whole room. Open the show on a TV or laptop, everyone joins on their phone with a 4-letter code. No signup, no app.</p>
          <div className="hero-actions">
            <button className="btn primary big" onClick={() => setMode("host")}>📺 Start a show (big screen)</button>
            <button className="btn big" onClick={() => setMode("join")}>📱 Join with a code</button>
          </div>
          <ol className="steps">
            <li>Host opens this page on the TV</li><li>Players join on their phones &amp; pick an avatar</li><li>Guess the emoji phrase — fast answers score more</li>
          </ol>
        </div>
      </main>
    );
  }

  // ---------- HOST: create ----------
  if (mode === "host" && !state) {
    return (
      <main className="shell">
        <div className="card center">
          <p className="eyebrow">BIG SCREEN</p>
          <h2>Ready when you are</h2>
          <p className="sub">Put this screen where everyone can see it, then create your room.</p>
          {error && <p className="error">{error}</p>}
          <button className="btn primary big" disabled={busy} onClick={createRoom}>{busy ? "Creating…" : "Create room"}</button>
          <p><button className="link" onClick={() => setMode("home")}>← Back</button></p>
        </div>
      </main>
    );
  }

  // ---------- JOIN: form ----------
  if (mode === "join" && !me) {
    return (
      <main className="shell">
        <form className="card" onSubmit={joinRoom}>
          <p className="eyebrow">JOIN THE SHOW</p>
          <h2>Pick your avatar</h2>
          <label>Room code<input className="code-input" value={codeInput} onChange={(e) => setCodeInput(e.target.value.toUpperCase().slice(0, 4))} placeholder="ABCD" required /></label>
          <label>Your name<input value={name} onChange={(e) => setName(e.target.value.slice(0, 16))} placeholder="e.g. Alex" required /></label>
          <div className="avatar-grid">
            {AVATARS.map((a) => (
              <button type="button" key={a} className={`avatar ${avatar === a ? "selected" : ""}`} onClick={() => setAvatar(a)}>{a}</button>
            ))}
          </div>
          {error && <p className="error">{error}</p>}
          <button className="btn primary big" disabled={busy}>{busy ? "Joining…" : "Join game"}</button>
          <p><button type="button" className="link" onClick={() => setMode("home")}>← Back</button></p>
        </form>
      </main>
    );
  }

  if (!state) return <main className="shell"><div className="card center">Connecting…</div></main>;

  // ---------- HOST: game ----------
  if (mode === "host") {
    return (
      <main className="shell wide">
        {state.phase === "lobby" && (
          <div className="card center">
            <p className="eyebrow">JOIN AT</p>
            <p className="join-url">{joinUrl.replace(/^https?:\/\//, "")}</p>
            <div className="room-code">{state.code}</div>
            <p className="sub">{state.players.length} / 8 players in — need at least 2 for a real contest, start anytime with 1+.</p>
            <div className="player-grid">
              {state.players.map((p) => <div key={p.id} className="player-chip"><span>{p.avatar}</span>{p.name}</div>)}
              {state.players.length === 0 && <p className="sub">Waiting for players to join…</p>}
            </div>
            <button className="btn primary big" disabled={state.players.length < 1} onClick={() => emit("game:start")}>▶ Start Emoji Pictionary ({state.totalQuestions} rounds)</button>
          </div>
        )}

        {state.phase === "question" && state.question && (
          <div className="card center">
            <div className="q-head"><span>Round {state.qIndex + 1} / {state.totalQuestions}</span><span className="timer">⏱ {seconds ?? 20}s</span><span>{state.answeredCount} / {state.players.length} answered</span></div>
            <div className="timer-bar"><span style={{ width: `${((seconds ?? 20) / 20) * 100}%` }} /></div>
            <div className="big-emoji">{state.question.emoji}</div>
            <p className="sub">What phrase is this?</p>
            <div className="choices host-choices">
              {state.question.choices.map((c, i) => <div key={c} className="choice"><b>{CHOICE_LABELS[i]}</b>{c}</div>)}
            </div>
            <div className="player-grid">{state.players.map((p) => <div key={p.id} className="player-chip">{p.avatar} {p.name} {p.answered ? "✅" : "…"}</div>)}</div>
            <button className="btn" onClick={() => emit("game:next")}>Reveal answer now</button>
          </div>
        )}

        {state.phase === "reveal" && state.question && (
          <div className="card center">
            <div className="big-emoji">{state.question.emoji}</div>
            <h2>✅ {state.question.answer}</h2>
            <div className="choices host-choices">
              {state.question.choices.map((c, i) => <div key={c} className={`choice ${i === state.question.answerIndex ? "correct" : "dim"}`}><b>{CHOICE_LABELS[i]}</b>{c}</div>)}
            </div>
            <div className="player-grid">
              {state.players.map((p) => <div key={p.id} className="player-chip">{p.avatar} {p.name} {p.lastCorrect ? `+${p.lastPoints}` : "✖"}</div>)}
            </div>
            <button className="btn primary big" onClick={() => emit("game:next")}>Show scores →</button>
          </div>
        )}

        {state.phase === "scores" && (
          <div className="card">
            <h2 className="center">🏆 Leaderboard</h2>
            <Leaderboard players={state.players} />
            <button className="btn primary big" onClick={() => emit("game:next")}>{state.qIndex + 1 >= state.totalQuestions ? "Final results →" : "Next round →"}</button>
          </div>
        )}

        {state.phase === "finale" && (
          <div className="card center">
            <h2>🎉 Final Results</h2>
            <div className="podium">
              {state.players.slice(0, 3).map((p, i) => <div key={p.id} className={`podium-spot p${i}`}><span className="podium-avatar">{p.avatar}</span><strong>{p.name}</strong><span>{p.score} pts</span><span className="medal">{["🥇", "🥈", "🥉"][i]}</span></div>)}
            </div>
            <Leaderboard players={state.players} />
            <button className="btn primary big" onClick={() => emit("game:playAgain")}>↺ Back to lobby</button>
          </div>
        )}
      </main>
    );
  }

  // ---------- PLAYER ----------
  return (
    <main className="shell">
      <div className="card">
        <div className="me-head"><span className="me-avatar">{me?.avatar}</span><div><strong>{me?.name}</strong><div className="sub">Room {state.code} · {me?.score ?? 0} pts{me?.streak > 1 ? ` · 🔥 ${me.streak}` : ""}</div></div></div>

        {state.phase === "lobby" && <div className="center"><h3>You&apos;re in!</h3><p className="sub">Look at the big screen. The host will start the show soon.</p><div className="player-grid">{state.players.map((p) => <div key={p.id} className="player-chip">{p.avatar} {p.name}</div>)}</div></div>}

        {state.phase === "question" && state.question && (
          <>
            <p className="eyebrow center">ROUND {state.qIndex + 1} / {state.totalQuestions} · ⏱ {seconds ?? 20}s</p>
            <div className="big-emoji center">{state.question.emoji}</div>
            {state.myAnswer === null ? (
              <div className="choices">
                {state.question.choices.map((c, i) => (
                  <button key={c} className="choice btn-choice" onClick={() => getSocket().emit("game:answer", { code: state.code, choice: i })}><b>{CHOICE_LABELS[i]}</b>{c}</button>
                ))}
              </div>
            ) : <p className="center sub">✅ Answer locked in. Waiting for everyone else…</p>}
          </>
        )}

        {state.phase === "reveal" && state.question && (
          <div className="center">
            <div className="big-emoji">{state.question.emoji}</div>
            {me?.lastCorrect ? <h3>✅ Correct! +{me.lastPoints} pts</h3> : <h3>✖ Not quite</h3>}
            <p className="sub">Answer: <strong>{state.question.answer}</strong></p>
          </div>
        )}

        {(state.phase === "scores" || state.phase === "finale") && (
          <>
            <h3 className="center">{state.phase === "finale" ? "🎉 Final standings" : "🏆 Leaderboard"}</h3>
            <Leaderboard players={state.players} meId={meId} />
            {state.phase === "scores" && <p className="sub center">Waiting for the host to start the next round…</p>}
          </>
        )}
      </div>
    </main>
  );
}
