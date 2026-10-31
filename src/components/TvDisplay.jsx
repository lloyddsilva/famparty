"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useRoom, useCountdown } from "./useRoom";
import { Leaderboard, Podium, CHOICE_LABELS } from "./SharedViews";

export default function TvDisplay({ code }) {
  const { view, error, serverNow } = useRoom(code, { role: "display" });
  const seconds = useCountdown(view, serverNow);
  const [qr, setQr] = useState("");

  useEffect(() => {
    // Keep the TV awake where the platform allows it.
    navigator.wakeLock?.request("screen").catch(() => {});
    if (code) {
      QRCode.toDataURL(`${window.location.origin}/join?code=${code}`, { width: 260, margin: 1 })
        .then(setQr).catch(() => {});
    }
  }, [code]);

  if (error && !view) return <main className="shell wide"><div className="card center"><h2>{error}</h2><p className="sub">Check the room code, or ask the host to create a new room.</p></div></main>;
  if (!view) return <main className="shell wide"><div className="card center">Connecting to room {code}…</div></main>;

  return (
    <main className="shell wide">
      {view.phase === "lobby" && (
        <div className="card center">
          <p className="eyebrow">SCAN TO JOIN · OR ENTER THE CODE ON YOUR PHONE</p>
          {qr && <img className="qr" src={qr} alt="QR code to join this room" />}
          <div className="room-code">{view.code}</div>
          <p className="sub">{view.players.length} / 12 players in — the host starts the show from their phone.</p>
          <div className="player-grid tv-grid">
            {view.players.map((p) => <div key={p.id} className="player-chip"><span>{p.avatar}</span>{p.name}</div>)}
            {view.players.length === 0 && <p className="sub">Waiting for players…</p>}
          </div>
        </div>
      )}

      {view.phase === "question" && view.question && (
        <div className="card center">
          <div className="q-head"><span>Round {view.qIndex + 1} / {view.totalQuestions}</span><span className="timer">{view.paused ? "⏸ Paused" : `⏱ ${seconds ?? 20}s`}</span><span>{view.answeredCount} / {view.players.length} answered</span></div>
          <div className="timer-bar"><span style={{ width: `${(((seconds ?? 20) / 20) * 100)}%` }} /></div>
          <div className="big-emoji">{view.question.emoji}</div>
          <p className="sub">What phrase is this?</p>
          <div className="choices host-choices">
            {view.question.choices.map((c, i) => <div key={c} className="choice"><b>{CHOICE_LABELS[i]}</b>{c}</div>)}
          </div>
          <div className="player-grid tv-grid">{view.players.map((p) => <div key={p.id} className="player-chip">{p.avatar} {p.name} {p.answered ? "✅" : "…"}</div>)}</div>
        </div>
      )}

      {view.phase === "reveal" && view.question && (
        <div className="card center">
          <div className="big-emoji">{view.question.emoji}</div>
          <h2>✅ {view.question.answer}</h2>
          <div className="choices host-choices">
            {view.question.choices.map((c, i) => <div key={c} className={`choice ${i === view.question.answerIndex ? "correct" : "dim"}`}><b>{CHOICE_LABELS[i]}</b>{c}</div>)}
          </div>
          <div className="player-grid tv-grid">
            {view.players.map((p) => <div key={p.id} className="player-chip">{p.avatar} {p.name} {p.lastCorrect ? `+${p.lastPoints}` : "✖"}</div>)}
          </div>
        </div>
      )}

      {view.phase === "scores" && (
        <div className="card">
          <h2 className="center">🏆 Leaderboard</h2>
          <Leaderboard players={view.players} />
          <p className="sub center">Next round coming up…</p>
        </div>
      )}

      {view.phase === "finale" && (
        <div className="card center">
          <h2>🎉 Final Results</h2>
          <Podium players={view.players} />
          <Leaderboard players={view.players} />
        </div>
      )}
    </main>
  );
}
