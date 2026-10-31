"use client";

import { useEffect, useState } from "react";
import { AVATARS } from "../lib/questions";
import { useRoom, useCountdown } from "./useRoom";
import { Leaderboard, CHOICE_LABELS } from "./SharedViews";

export default function PlayerClient() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [creds, setCreds] = useState(null); // {code, playerToken, playerId}
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("code");
    if (c) setCode(c.toUpperCase());
    const savedCode = localStorage.getItem("famparty:playerCode");
    const savedToken = localStorage.getItem("famparty:playerToken");
    if (savedCode && savedToken) setCreds({ code: savedCode, playerToken: savedToken });
  }, []);

  const { view, act, serverNow } = useRoom(creds?.code, { role: "player", token: creds?.playerToken || "" });
  const seconds = useCountdown(view, serverNow);
  const me = view?.me;

  async function join(e) {
    e.preventDefault();
    setBusy(true); setError("");
    const savedToken = localStorage.getItem("famparty:playerToken") || undefined;
    const res = await fetch(`/api/rooms/${code}/join`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, avatar, playerToken: savedToken }),
    });
    const data = await res.json();
    setBusy(false);
    if (!data.ok) return setError(data.error || "Could not join.");
    localStorage.setItem("famparty:playerCode", data.code);
    localStorage.setItem("famparty:playerToken", data.playerToken);
    setCreds({ code: data.code, playerToken: data.playerToken, playerId: data.playerId });
  }

  if (!creds) {
    return (
      <main className="shell">
        <form className="card" onSubmit={join}>
          <p className="eyebrow">JOIN THE SHOW</p>
          <h2>Pick your avatar</h2>
          <label>Room code<input className="code-input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))} placeholder="ABCD" required /></label>
          <label>Your name<input value={name} onChange={(e) => setName(e.target.value.slice(0, 16))} placeholder="e.g. Alex" required /></label>
          <div className="avatar-grid">
            {AVATARS.map((a) => <button type="button" key={a} className={`avatar ${avatar === a ? "selected" : ""}`} onClick={() => setAvatar(a)}>{a}</button>)}
          </div>
          {error && <p className="error">{error}</p>}
          <button className="btn primary big" disabled={busy}>{busy ? "Joining…" : "Join game"}</button>
        </form>
      </main>
    );
  }

  if (!view) return <main className="shell"><div className="card center">{error || "Connecting…"}</div></main>;

  return (
    <main className="shell">
      <div className="card">
        <div className="me-head"><span className="me-avatar">{me?.avatar || avatar}</span><div><strong>{me?.name || name}</strong><div className="sub">Room {view.code} · {me?.score ?? 0} pts{me?.streak > 1 ? ` · 🔥 ${me.streak}` : ""}</div></div></div>

        {view.phase === "lobby" && <div className="center"><h3>You&apos;re in!</h3><p className="sub">Look at the big screen. The host starts the show from their phone.</p><div className="player-grid">{view.players.map((p) => <div key={p.id} className="player-chip">{p.avatar} {p.name}</div>)}</div></div>}

        {view.phase === "question" && view.question && (
          <>
            <p className="eyebrow center">ROUND {view.qIndex + 1} / {view.totalQuestions} · {view.paused ? "⏸ PAUSED" : `⏱ ${seconds ?? 20}s`}</p>
            <div className="big-emoji center">{view.question.emoji}</div>
            {view.myAnswer === null ? (
              <div className="choices">
                {view.question.choices.map((c, i) => (
                  <button key={c} className="choice btn-choice" onClick={() => act({ type: "ANSWER", choice: i })}><b>{CHOICE_LABELS[i]}</b>{c}</button>
                ))}
              </div>
            ) : <p className="center sub">✅ Answer locked in. Waiting for everyone else…</p>}
          </>
        )}

        {view.phase === "reveal" && view.question && (
          <div className="center">
            <div className="big-emoji">{view.question.emoji}</div>
            {me?.lastCorrect ? <h3>✅ Correct! +{me.lastPoints} pts</h3> : <h3>✖ Not quite</h3>}
            <p className="sub">Answer: <strong>{view.question.answer}</strong></p>
          </div>
        )}

        {(view.phase === "scores" || view.phase === "finale") && (
          <>
            <h3 className="center">{view.phase === "finale" ? "🎉 Final standings" : "🏆 Leaderboard"}</h3>
            <Leaderboard players={view.players} meId={me?.id} />
            {view.phase === "scores" && <p className="sub center">Waiting for the host to start the next round…</p>}
          </>
        )}
      </div>
    </main>
  );
}
