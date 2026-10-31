"use client";

import { useEffect, useState } from "react";
import { useRoom } from "./useRoom";
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

  const { view, act } = useRoom(room?.code, { role: "host", token: room?.hostToken || "" });

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
        </div>
      </main>
    );
  }

  const tvUrl = typeof window !== "undefined" ? `${window.location.origin}/tv/${room.code}` : "";
  const canStart = (view?.players.length ?? 0) >= 3;

  return (
    <main className="shell">
      <div className="card">
        <p className="eyebrow">HOST REMOTE</p>
        <h2>Room {room.code}</h2>
        <p className="sub">On the TV, open:<br /><strong className="join-url">{tvUrl.replace(/^https?:\/\//, "")}</strong></p>
        {!view && <p className="sub">Connecting…</p>}
        {view && (
          <>
            <p className="sub">Phase: <strong>{view.phase}</strong> · {view.players.length} player(s){view.locked ? " · 🔒 locked" : ""}</p>
            <div className="player-grid">
              {view.players.map((p) => (
                <div key={p.id} className="player-chip">{p.avatar} {p.name}
                  {view.phase === "lobby" && <button className="kick" title="Kick" onClick={() => act({ type: "KICK", playerId: p.id })}>✕</button>}
                </div>
              ))}
              {view.players.length === 0 && <p className="sub">Waiting for players…</p>}
            </div>

            {view.phase === "lobby" && (
              <>
                <button className="btn primary big" disabled={!canStart} onClick={() => act({ type: "START" })}>
                  ▶ Start Emoji Decoder ({view.totalQuestions} rounds)
                </button>
                {!canStart && <p className="sub center">Need at least 3 players ({view.players.length}/3).</p>}
                <button className="btn big" onClick={() => act({ type: "LOCK", locked: !view.locked })}>{view.locked ? "🔓 Unlock room" : "🔒 Lock room"}</button>
              </>
            )}
            {view.phase === "question" && (
              <>
                <p className="sub center">{view.answeredCount}/{view.players.length} answered{view.paused ? " · ⏸ paused" : ""}</p>
                <button className="btn big" onClick={() => act({ type: view.paused ? "RESUME" : "PAUSE" })}>{view.paused ? "▶ Resume" : "⏸ Pause"}</button>
                <button className="btn primary big" onClick={() => act({ type: "NEXT" })}>Reveal answer now →</button>
              </>
            )}
            {view.phase === "reveal" && <button className="btn primary big" onClick={() => act({ type: "NEXT" })}>Show scores →</button>}
            {view.phase === "scores" && <button className="btn primary big" onClick={() => act({ type: "NEXT" })}>{view.qIndex + 1 >= view.totalQuestions ? "Final results →" : "Next round →"}</button>}
            {view.phase === "finale" && <button className="btn primary big" onClick={() => act({ type: "PLAY_AGAIN" })}>↺ Back to lobby</button>}
            {(view.phase === "scores" || view.phase === "finale") && <Leaderboard players={view.players} />}
          </>
        )}
      </div>
    </main>
  );
}
