"use client";

import { useEffect, useState } from "react";
import { useRoom, useCountdown } from "./useRoom";
import { Leaderboard } from "./SharedViews";

export default function HostRemote() {
  const [room, setRoom] = useState(null); // {code, hostToken}
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const code = localStorage.getItem("famparty:hostCode");
    const hostToken = localStorage.getItem("famparty:hostToken");
    if (code && hostToken) setRoom({ code, hostToken });
  }, []);

  const { view, act, gone, serverNow } = useRoom(room?.code, { role: "host", token: room?.hostToken || "" });
  const seconds = useCountdown(view, serverNow);
  // Host actions carry the phase on screen so stale taps are rejected server-side (item 4).
  const hostAct = async (a) => {
    const data = await act({ ...a, expectedPhase: view?.phase, expectedStep: view?.finishit?.candidates.length ?? 0 });
    if (data && data.ok === false) setError(data.error || "That action did not go through — your screen may be out of date.");
    else setError("");
    return data;
  };

  useEffect(() => {
    if (gone && room) {
      localStorage.removeItem("famparty:hostCode");
      localStorage.removeItem("famparty:hostToken");
      setError("That room has expired. Create a new one.");
      setRoom(null);
    }
  }, [gone, room]);

  async function create() {
    setBusy(true); setError("");
    const res = await fetch("/api/rooms", { method: "POST" });
    const data = await res.json();
    setBusy(false);
    if (!data.ok) return setError(data.error || "Could not create a room.");
    localStorage.setItem("famparty:hostCode", data.code);
    localStorage.setItem("famparty:hostToken", data.hostToken);
    setRoom({ code: data.code, hostToken: data.hostToken });
  }

  if (!room) {
    return (
      <main className="shell">
        <div className="card center">
          <p className="eyebrow">HOST REMOTE · ON YOUR PHONE</p>
          <h2>Create the room here</h2>
          <p className="sub">You run the show from this phone. The TV only displays — open the TV link shown after you create the room.</p>
          {error && <p className="error">{error}</p>}
          <button className="btn primary big" disabled={busy} onClick={create}>{busy ? "Creating…" : "Create room"}</button>
          <p className="sub" style={{ fontSize: ".85rem", textAlign: "center" }}>By playing you agree to the <a href="/terms" target="_blank" rel="noreferrer">Terms</a> and <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.</p>

        </div>
      </main>
    );
  }

  const tvUrl = typeof window !== "undefined" ? `${window.location.origin}/tv/${room.code}` : "";
  const canStart = (view?.players.length ?? 0) >= 3;

  return (
    <main className="shell">
      <div className="card">
        <span className="sticker">Host remote</span>
        <h2 style={{ fontSize: "1.9rem", marginTop: 12 }}>Room {room.code} {view ? <span className="player-chip" style={{ fontSize: ".85rem", verticalAlign: "middle" }}>{view.players.length} in{view.locked ? " · 🔒" : ""}</span> : null}</h2>
        {!view && <p className="sub">Connecting…</p>}
        {error && view && <p className="error">{error}</p>}
        {view && (
          <>
            <div style={{ background: "var(--dark)", color: "#fff", borderRadius: 24, padding: "18px 20px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                <p style={{ margin: 0, color: "var(--yellow)", textTransform: "uppercase", letterSpacing: ".08em", fontSize: ".72rem", fontWeight: 700 }}>
                  {{ emoji: "Emoji Decoder", spotlight: "Spotlight", spectrum: "Spectrum", finishit: "Finish It", remember: "Remember This?" }[view.game] || view.game}
                  {view.phase === "question" || view.phase === "reveal" || view.phase === "scores" ? ` · Round ${view.qIndex + 1}/${view.totalQuestions}` : ""}
                </p>
                {(view.deadline || view.paused) && <p style={{ margin: 0, fontWeight: 700, fontSize: "1.2rem", whiteSpace: "nowrap" }}>{view.paused ? "⏸ Paused" : `⏱ ${seconds ?? ""}s`}</p>}
              </div>
              <p style={{ margin: "8px 0 0", fontFamily: "Gelasio, Georgia, serif", fontWeight: 700, fontSize: "2rem" }}>
                {view.phase === "question" ? `${view.answeredCount} of ${view.players.length} answered`
                  : view.phase === "prep" ? `${view.players.filter((p) => p.ready).length} of ${view.players.length} ready`
                  : view.phase === "lobby" ? `${view.players.length} in the room`
                  : view.phase === "finale" ? "Final results"
                  : `${view.players.length} in the room`}
              </p>
              {view.phase === "question" && (
                <div style={{ height: 8, background: "rgba(255,255,255,.18)", borderRadius: 99, overflow: "hidden", marginTop: 10 }}>
                  <div style={{ height: "100%", width: `${view.players.length ? (view.answeredCount / view.players.length) * 100 : 0}%`, background: "var(--yellow)" }} />
                </div>
              )}
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 12, fontSize: "1.25rem" }}>
                {view.players.map((p) => (
                  <span key={p.id} title={p.name} style={{ opacity: view.phase === "question" ? (p.answered ? 1 : .35) : (p.connected ? 1 : .35) }}>{p.avatar}</span>
                ))}
              </div>
              <p style={{ margin: "12px 0 0", color: "#c9c2f2", fontSize: ".9rem" }}>TV: <strong style={{ color: "#fff" }}>{tvUrl.replace(/^https?:\/\//, "")}</strong></p>
            </div>
            {view.phase === "lobby" && (
              <>
                <div className="choices">
                  {[["emoji", "🧩 Emoji Decoder", "Guess the phrase from emojis"], ["spotlight", "🎤 Spotlight", "Two truths and a lie"], ["spectrum", "🎚️ Spectrum", "Place yourself, predict the crowd"], ["finishit", "✍️ Finish It", "Funniest ending wins"], ["remember", "🧠 Remember This?", "Whose true statement is this?"]].map(([g, label, desc]) => (
                    <button key={g} className={`choice btn-choice ${view.game === g ? "correct" : ""}`} onClick={() => hostAct({ type: "SELECT_GAME", game: g })}><b>{label}</b><br /><small>{desc}</small></button>
                  ))}
                </div>
                <button className="btn primary big" disabled={!canStart} onClick={() => hostAct({ type: "START" })}>
                  ▶ Start {view.game === "emoji" ? "Emoji Decoder" : view.game === "spotlight" ? "Spotlight — writing time" : view.game === "spectrum" ? "Spectrum" : view.game === "finishit" ? "Finish It" : "Remember This?"}
                </button>
                {!canStart && <p className="sub center">Need at least 3 players ({view.players.length}/3).</p>}
                {view.game === "remember" && !view.familyLinked && <p className="error">Remember This? needs a family-linked room with saved statements. Create the room from your family page.</p>}
                <button className="btn big" onClick={() => hostAct({ type: "LOCK", locked: !view.locked })}>{view.locked ? "🔓 Unlock room" : "🔒 Lock room"}</button>
              </>
            )}
            {view.phase === "prep" && (
              <>
                <p className="sub center">{view.players.filter((p) => p.ready).length} ready · {view.players.filter((p) => p.watching).length} just watching · {view.players.filter((p) => !p.ready && !p.watching).length} still writing</p>
                <button className="btn primary big" onClick={() => hostAct({ type: "BEGIN_SPOTLIGHT" })}>▶ Start anyway — unfinished players just watch</button>
              </>
            )}
            {["spotlight", "story", "spectrum", "finishWrite", "remember"].includes(view.phase) && (
              <>
                <p className="sub center">{view.phase === "spotlight" ? `${view.votedCount} ${view.votedCount === 1 ? "vote" : "votes"} in` : view.phase === "story" ? "Story beat — featured player is talking" : "Round in progress"}</p>
                <button className="btn big" onClick={() => hostAct({ type: view.paused ? "RESUME" : "PAUSE" })}>{view.paused ? "▶ Resume" : "⏸ Pause"}</button>
                <button className="btn primary big" onClick={() => hostAct({ type: "NEXT" })}>{view.phase === "story" ? "End story beat →" : "Skip / reveal now →"}</button>
              </>
            )}
            {["spotlightReveal", "spectrumReveal", "finishReveal", "rememberReveal", "storySave"].includes(view.phase) && (
              <button className="btn primary big" onClick={() => hostAct({ type: "NEXT" })}>
                {view.phase === "spotlightReveal" ? "Start story beat →"
                  : view.phase === "storySave" ? "Next player →"
                  : view.phase === "finishReveal" ? "Show scores →"
                  : "Show scores / next →"}
              </button>
            )}
            {view.phase === "finishPresent" && (
              <button className="btn primary big" onClick={() => hostAct({ type: "NEXT" })}>
                {(view.finishit?.candidates.length ?? 0) < (view.finishit?.totalCandidates ?? 0)
                  ? `Reveal answer ${(view.finishit?.candidates.length ?? 0) + 1}/${view.finishit?.totalCandidates ?? 0} →`
                  : "Open voting →"}
              </button>
            )}
            {view.phase === "finishVote" && <button className="btn primary big" onClick={() => hostAct({ type: "NEXT" })}>Close voting →</button>}
            {view.phase === "question" && (
              <>
                <button className="btn big" onClick={() => hostAct({ type: view.paused ? "RESUME" : "PAUSE" })}>{view.paused ? "▶ Resume" : "⏸ Pause"}</button>
                <button className="btn primary big" onClick={() => hostAct({ type: "NEXT" })}>Reveal answer now →</button>
              </>
            )}
            {view.phase === "reveal" && <button className="btn primary big" onClick={() => hostAct({ type: "NEXT" })}>Show scores →</button>}
            {view.phase === "scores" && <button className="btn primary big" onClick={() => hostAct({ type: "NEXT" })}>{view.qIndex + 1 >= view.totalQuestions ? "Final results →" : "Next round →"}</button>}
            {view.phase === "finale" && <button className="btn primary big" onClick={() => hostAct({ type: "PLAY_AGAIN" })}>↺ Back to lobby</button>}
            {(view.phase === "scores" || view.phase === "finale") && <Leaderboard players={view.players} />}

            <div>
              <p className="sub" style={{ margin: "18px 0 4px", fontWeight: 700 }}>Players · 🙈 hide on TV · ✕ remove (every phase)</p>
              <div className="player-grid" style={{ justifyContent: "flex-start", margin: "8px 0" }}>
              {view.players.map((p) => (
                <div key={p.id} className="player-chip">{p.avatar} {p.name}
                  <button className="kick" title={p.hidden ? "Unhide name/text on TV" : "Hide name/text on TV"} onClick={() => hostAct({ type: "HIDE", targetId: p.id, hidden: !p.hidden })}>{p.hidden ? "👁" : "🙈"}</button>
                  <button className="kick" title="Kick" onClick={() => hostAct({ type: "KICK", playerId: p.id })}>✕</button>
                </div>
              ))}
              {view.players.length === 0 && <p className="sub">Waiting for players…</p>}
            </div>
            </div>

          </>
        )}
      </div>
    </main>
  );
}
