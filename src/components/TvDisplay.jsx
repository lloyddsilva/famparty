"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useRoom, useCountdown } from "./useRoom";
import { Leaderboard, Podium, CHOICE_LABELS } from "./SharedViews";
import { spectrumLayout } from "../lib/spectrumLayout";

export default function TvDisplay({ code }) {
  const joinHost = typeof window !== "undefined" ? `${window.location.host}/join` : "this site /join";
  const { view, error, serverNow } = useRoom(code, { role: "display" });
  const seconds = useCountdown(view, serverNow);
  const [qr, setQr] = useState("");
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () => setScale(Math.min(window.innerWidth / 1280, window.innerHeight / 720));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

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
    <main className="tv-viewport">
     <div className="tv-stage" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
     <div className="tv-frame-big"><div className={`tv-panel ${["question", "reveal"].includes(view.phase) ? "yellow" : "white"}`}>
      {view.phase === "lobby" && (
        <div className="tv-lobby">
          <div className="tv-lobby-left">
            {qr && <img className="qr" src={qr} alt="QR code to join this room" />}
            <div className="room-code">{view.code}</div>
            <p className="tv-join-line">Scan, or go to {joinHost}</p>
          </div>
          <div className="tv-lobby-right">
            <span className="sticker">Lobby</span>
            <h2 className="tv-lobby-h">{view.players.length} of 12 are in.</h2>
            <p className="tv-sub">The host starts the show from their phone.</p>
            <div className="player-grid tv-grid" style={{ justifyContent: "flex-start", margin: "14px 0 0" }}>
              {view.players.map((p) => <div key={p.id} className="player-chip"><span>{p.avatar}</span>{p.name}</div>)}
              {view.players.length === 0 && <p className="tv-sub">Waiting for players…</p>}
            </div>
          </div>
        </div>
      )}

      {view.phase === "question" && view.question && (
        <div className="card center">
          <div className="q-head"><span>Round {view.qIndex + 1} / {view.totalQuestions}</span><span className="timer">{view.paused ? "⏸ Paused" : `⏱ ${seconds ?? 20}s`}</span><span>{view.answeredCount} / {view.players.length} answered</span></div>
          <div className="timer-bar"><span style={{ width: `${(((seconds ?? 20) / 20) * 100)}%` }} /></div>
          <div className="big-emoji">{view.question.emoji}</div>
          <p className="tv-question">What phrase is this?</p>
          <div className="choices host-choices">
            {view.question.choices.map((c, i) => <div key={c} className="choice"><b>{CHOICE_LABELS[i]}</b>{c}</div>)}
          </div>
          <div className="player-grid tv-grid">{view.players.map((p) => <div key={p.id} className="player-chip" style={p.answered ? {} : { opacity: .5 }}>{p.avatar} {p.name} {p.answered ? "✅" : ""}</div>)}</div>
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

      {view.phase === "prep" && (
        <div className="card center">
          <p className="eyebrow">SPOTLIGHT · WRITING TIME</p>
          <h2>✍️ Two truths and a lie — check your phone</h2>
          <div className="player-grid tv-grid">
            {view.players.map((p) => <div key={p.id} className="player-chip">{p.avatar} {p.name} {p.ready ? "✅ ready" : p.watching ? "👀 just watching" : "✍️ writing…"}</div>)}
          </div>
        </div>
      )}

      {["spotlight", "spotlightReveal", "story", "storySave"].includes(view.phase) && view.spotlight && (
        <div className="card center">
          <div className="q-head"><span>Spotlight · {view.spotlight.turn} of {view.spotlight.totalTurns}</span><span className="timer">{view.paused ? "⏸ Paused" : view.phase === "spotlight" ? `⏱ ${seconds ?? 30}s` : ""}</span><span>{view.phase === "spotlight" ? `${view.votedCount} voted` : ""}</span></div>
          <div className="me-avatar" style={{ fontSize: "2.4rem", display: "inline-block", padding: "2px 8px" }}>{view.spotlight.avatar}</div>
          <h2>{view.spotlight.name}</h2>
          {view.phase !== "story" && view.phase !== "storySave" && (
            <div className="choices">
              {view.spotlight.statements.map((s, i) => (
                <div key={i} className={`choice ${view.phase !== "spotlight" && i === view.spotlight.liePosition ? "correct" : ""}`}>
                  <b>{CHOICE_LABELS[i]}</b>{s}{view.phase !== "spotlight" && i === view.spotlight.liePosition ? " ← THE LIE" : ""}
                </div>
              ))}
            </div>
          )}
          {view.phase === "spotlight" && <p className="sub">Which one is the lie? Vote on your phones!</p>}
          {view.phase === "story" && <><div className="big-emoji">🎤</div><h2>Tell us the story, {view.spotlight.name}!</h2><p className="timer" style={{ fontSize: "2rem" }}>⏱ {seconds ?? 30}s</p></>}
          {view.phase === "storySave" && <><h2>One for the family album?</h2><p className="sub">{view.spotlight.name} can save a one-line version from their phone — or just keep talking.</p>{view.spotlight.storyLine && <p className="choice correct">“{view.spotlight.storyLine}”</p>}</>}
          {view.phase === "spotlightReveal" && <div className="player-grid tv-grid">{view.players.map((p) => <div key={p.id} className="player-chip">{p.avatar} {p.name} {p.id === view.spotlight.featuredId ? `+${p.lastPoints} for fooling` : p.lastCorrect ? `+${p.lastPoints}` : "fooled!"}</div>)}</div>}
        </div>
      )}

      {["spectrum", "spectrumReveal"].includes(view.phase) && view.spectrum && (
        <div className="card center">
          <p className="eyebrow">SPECTRUM · ROUND {view.qIndex + 1}{view.phase === "spectrum" ? ` · ⏱ ${seconds ?? 20}s` : ""}</p>
          <div className="spectrum-track">
            <span className="spectrum-end">{view.spectrum.left}</span>
            <div className="spectrum-line">
              {view.phase === "spectrumReveal" && (() => {
                const layout = spectrumLayout(view.spectrum.placements);
                return view.spectrum.placements.map((pl) => {
                  const p = view.players.find((x) => x.id === pl.id);
                  const cell = layout.get(pl.id);
                  return <span key={pl.id} className="spectrum-dot" style={{ left: `${cell.pos}%`, top: cell.top, fontSize: `${42 * cell.scale}px` }} title={p?.name}>{p?.avatar}</span>;
                });
              })()}
              {view.phase === "spectrumReveal" && <span className="spectrum-median" style={{ left: `${view.spectrum.median}%` }} />}
            </div>
            <span className="spectrum-end">{view.spectrum.right}</span>
          </div>
          {view.phase === "spectrum" ? <p className="sub">Place yourself on your phone — and predict where the crowd lands.</p> : <p className="sub">The crowd leans <strong>{view.spectrum.majority}</strong>. Who read the room best?</p>}
          {view.phase === "spectrumReveal" && view.spectrum.awards?.length > 0 && (
            <div className="player-grid tv-grid">
              {view.spectrum.awards.map((a) => { const p = view.players.find((x) => x.id === a.playerId); return <div key={a.kind} className="player-chip">{a.kind === "Lonely Island" ? "🏝️" : a.kind === "Mind Reader" ? "🔮" : "🎯"} {a.kind}: {p?.avatar} {p?.name}</div>; })}
            </div>
          )}
        </div>
      )}

      {["finishWrite", "finishPresent", "finishVote", "finishReveal"].includes(view.phase) && view.finishit && (
        <div className="card center">
          <p className="eyebrow">FINISH IT · ROUND {view.qIndex + 1}</p>
          <h2>{view.finishit.prompt.replace("___", "________")}</h2>
          {view.phase === "finishWrite" && <p className="sub">{view.players.filter((p) => p.hasAnswer).length}/{view.players.length} answers in — write yours on your phone.</p>}
          {view.phase === "finishPresent" && (
            <>
              <div className={`choices ${view.finishit.candidates.length > 6 ? "tv-finish-grid" : ""}`}>{view.finishit.candidates.map((c, i) => <div key={c.id} className="choice"><b>{i + 1}</b>{c.text}</div>)}</div>
              <p className="sub">{view.finishit.candidates.length} of {view.finishit.totalCandidates} answers on screen — voting opens when they're all out…</p>
            </>
          )}
          {view.phase === "finishVote" && (
            <>
              <div className={`choices ${view.finishit.candidates.length > 6 ? "tv-finish-grid" : ""}`}>{view.finishit.candidates.map((c, i) => <div key={c.id} className="choice"><b>{i + 1}</b>{c.text}</div>)}</div>
              <p className="sub">🗳️ Voting is open on your phones — {view.votedCount} {view.votedCount === 1 ? "vote" : "votes"} in. No voting for your own!</p>
            </>
          )}
          {view.phase === "finishReveal" && <div className={`choices ${view.finishit.candidates.length > 6 ? "tv-finish-grid" : ""}`}>{[...view.finishit.candidates].sort((a, b) => b.votes - a.votes).map((c) => { const a = view.players.find((p) => p.id === c.authorId); return <div key={c.id} className={`choice ${c.votes ? "correct" : "dim"}`}><b>{a?.avatar} {a?.name}</b> “{c.text}” · {c.votes} {c.votes === 1 ? "vote" : "votes"} · +{c.points}</div>; })}</div>}
        </div>
      )}

      {["remember", "rememberReveal"].includes(view.phase) && view.remember && (
        <div className="card center">
          <p className="eyebrow">REMEMBER THIS? · {view.qIndex + 1} OF {view.totalQuestions}</p>
          <div className="big-emoji">🧠</div>
          <h2>“{view.remember.text}”</h2>
          {view.phase === "remember" ? <p className="sub">True story. But whose? Guess on your phones — the writer can't score on their own.</p> : <p className="sub">It was <strong>{view.remember.writerName}</strong>!</p>}
          {view.phase === "rememberReveal" && <div className="player-grid tv-grid">{view.players.map((p) => <div key={p.id} className="player-chip">{p.avatar} {p.name} {p.lastCorrect ? `+${p.lastPoints}` : ""}</div>)}</div>}
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
     </div></div>
     </div>
    </main>
  );
}
