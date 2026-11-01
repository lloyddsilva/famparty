"use client";

import { useState } from "react";

const GAME_LABELS = { emoji: "Emoji Decoder", spotlight: "Spotlight", spectrum: "Spectrum", finishit: "Finish It" };
const SUGGESTED_LABELS = { emoji: "Emoji Decoder", spotlight: "Spotlight", spectrum: "Spectrum", finishit: "Finish It" };

// Small host control bar that sits on the same screen as the game.
// Props: view, hostAct (host-token actions), onPlayAgain optional.
const PHASE_WORDS = {
  lobby: "Lobby", howto: "How to play", prep: "Writing time", question: "Round live",
  reveal: "Answer shown", spotlight: "Guessing the lie", spotlightReveal: "The lie revealed",
  story: "Story time", storySave: "Story time", spectrum: "Placing", spectrumReveal: "The crowd revealed",
  finishWrite: "Writing answers", finishPresent: "Answers going up", finishVote: "Voting",
  finishReveal: "Authors revealed", scores: "Scores", finale: "Final results",
};
const PICKER_GAMES = [["emoji", "🧩 Emoji"], ["spotlight", "🎤 Spotlight"], ["spectrum", "🎚️ Spectrum"], ["finishit", "✍️ Finish It"]];

export default function HostBar({ view, hostAct, allowStart = false, compact = false }) {
  const [manage, setManage] = useState(false);
  const [copied, setCopied] = useState("");
  if (!view || !hostAct) return null;

  const GAME_MIN = { emoji: 2, spectrum: 2, spotlight: 3, finishit: 3 };
  const primary = (() => {
    switch (view.phase) {
      case "lobby": return allowStart ? { label: `▶ Start ${GAME_LABELS[view.game] || "Emoji Decoder"}`, type: "START", disabled: view.players.length < (GAME_MIN[view.game] ?? 3) } : null;
      case "howto": return { label: "Skip intro →", type: "NEXT" };
      case "prep": return { label: "Start anyway →", type: "BEGIN_SPOTLIGHT" };
      case "question": return { label: "Reveal answer now →", type: "NEXT" };
      case "reveal": return { label: "Show scores →", type: "NEXT" };
      case "spotlight": return { label: "Reveal the lie →", type: "NEXT" };
      case "spotlightReveal": return { label: "Start story beat →", type: "NEXT" };
      case "story": return { label: "End story beat →", type: "NEXT" };
      case "storySave": return { label: "Next player →", type: "NEXT" };
      case "spectrum": return { label: "Reveal the crowd →", type: "NEXT" };
      case "spectrumReveal": return { label: "Show scores →", type: "NEXT" };
      case "finishWrite": return { label: "Show the answers →", type: "NEXT" };
      case "finishPresent": return {
        label: (view.finishit?.candidates.length ?? 0) < (view.finishit?.totalCandidates ?? 0)
          ? `Reveal answer ${(view.finishit?.candidates.length ?? 0) + 1}/${view.finishit?.totalCandidates ?? 0} →` : "Open voting →",
        type: "NEXT",
      };
      case "finishVote": return { label: "Close voting →", type: "NEXT" };
      case "finishReveal": return { label: "Show scores →", type: "NEXT" };
      case "scores": return { label: view.qIndex + 1 >= view.totalQuestions ? "Final results →" : "Next round →", type: "NEXT" };
      case "finale": return { label: `Next: ${SUGGESTED_LABELS[view.suggestedNext] || "Emoji Decoder"} →`, type: "NEXT_GAME" };
      default: return null;
    }
  })();

  const hostLink = typeof window !== "undefined"
    ? `${window.location.origin}/host?code=${view.code}&token=${localStorage.getItem("famparty:hostToken") || ""}`
    : "";

  return (
    <div className="host-bar" style={compact ? { position: "fixed", top: "auto", left: 10, right: 10, bottom: 10, zIndex: 60, maxWidth: 560, margin: "0 auto", padding: "8px 10px" } : undefined}>
      <div className="host-bar-main">
        {!compact && <span className="host-bar-label">🎛️ {GAME_LABELS[view.game] || view.game} · {view.phase === "lobby" ? `${view.players.length} in` : PHASE_WORDS[view.phase] || ""}</span>}
        {primary && <button className="btn primary host-bar-btn" disabled={primary.disabled} onClick={() => hostAct({ type: primary.type })}>{primary.label}</button>}
        <button className="btn host-bar-btn" onClick={() => setManage((m) => !m)} aria-expanded={manage}>Manage</button>
      </div>
      {(view.phase === "lobby" || view.phase === "finale") && (!compact || view.phase === "finale") && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
          {PICKER_GAMES.map(([g, label]) => {
            const belowMin = view.players.length < (GAME_MIN[g] ?? 3);
            return <button key={g} disabled={belowMin} title={belowMin ? `Needs ${GAME_MIN[g] ?? 3}+ players` : undefined} className="btn" style={{ ...(view.game === g ? { borderColor: "var(--yellow)", color: "var(--yellow)" } : {}), ...(belowMin ? { opacity: .45 } : {}) }} onClick={() => hostAct({ type: "SELECT_GAME", game: g })}>{label}</button>;
          })}
        </div>
      )}
      {manage && (
        <div className="host-manage">
          {!["lobby", "finale"].includes(view.phase) && (
            <button className="btn" style={{ color: "#ff8fa3" }} onClick={() => hostAct({ type: "END_GAME" })}>⏹ End game → podium</button>
          )}
          {view.phase === "lobby" && (
            <span style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700 }}>Rounds:</span>
              {[3, 5, 10].map((n) => (
                <button key={n} className="btn" style={(view.totalRounds || 5) === n ? { borderColor: "var(--yellow)", color: "var(--yellow)" } : {}} onClick={() => hostAct({ type: "SET_ROUNDS", rounds: n })}>{n}</button>
              ))}
            </span>
          )}
          {view.deadline && <button className="btn" onClick={() => hostAct({ type: view.paused ? "RESUME" : "PAUSE" })}>{view.paused ? "▶ Resume" : "⏸ Pause"}</button>}
          <button className="btn" onClick={() => hostAct({ type: "LOCK", locked: !view.locked })}>{view.locked ? "🔓 Unlock room" : "🔒 Lock room"}</button>
          <label className="host-relaxed">
            <input type="checkbox" checked={!!view.relaxed} onChange={(e) => hostAct({ type: "SET_RELAXED", relaxed: e.target.checked })} />
            Relaxed timer (longer rounds)
          </label>
          <button className="btn" onClick={async () => { try { await navigator.clipboard.writeText(hostLink); setCopied("Copied — give it to a guest you trust."); } catch { setCopied(hostLink); } }}>🔗 Copy host link</button>
          {copied && <span style={{ alignSelf: "center", fontWeight: 600 }}>{copied}</span>}
          {view.phase === "finale" && <button className="btn" onClick={() => hostAct({ type: "PLAY_AGAIN" })}>↺ New show (reset scores)</button>}
          <div className="player-grid" style={{ justifyContent: "flex-start", margin: "8px 0" }}>
            {view.players.map((p) => (
              <div key={p.id} className="player-chip" style={{ fontSize: ".9rem" }}>
                {p.avatar} {p.name}{p.connected ? "" : " · away"}
                <button className="kick" title={p.hidden ? "Unhide on TV" : "Hide on TV"} onClick={() => hostAct({ type: "HIDE", targetId: p.id, hidden: !p.hidden })}>{p.hidden ? "👁" : "🙈"}</button>
                <button className="kick" title="Remove" onClick={() => hostAct({ type: "KICK", playerId: p.id })}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
