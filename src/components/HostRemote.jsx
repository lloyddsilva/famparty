"use client";

import { useEffect, useState } from "react";
import { useRoom, useCountdown } from "./useRoom";
import PlayerGame from "./PlayerGame";
import HostBar from "./HostBar";
import { Leaderboard } from "./SharedViews";
import { LogoMark } from "./Logo";
import { AVATARS } from "../lib/questions";

const GAME_OPTIONS = [
  ["emoji", "🧩 Emoji Decoder", "Guess the phrase from the emojis"],
  ["spotlight", "🎤 Spotlight", "Two truths and a lie"],
  ["spectrum", "🎚️ Spectrum", "Place yourself, predict the crowd"],
  ["finishit", "✍️ Finish It", "Funniest ending wins"],
];
const GAME_MIN = { emoji: 2, spectrum: 2, spotlight: 3, finishit: 3 };

export default function HostRemote() {
  const [room, setRoom] = useState(null); // {code, hostToken}
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [setupName, setSetupName] = useState("");
  const [setupAvatar, setSetupAvatar] = useState(AVATARS[0]);
  const [playerCreds, setPlayerCreds] = useState(null);
  const [changeGame, setChangeGame] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // host handover link: /host?code=XXXX&token=...
    if (params.get("code") && params.get("token")) {
      localStorage.setItem("famparty:hostCode", params.get("code").toUpperCase());
      localStorage.setItem("famparty:hostToken", params.get("token"));
      setRoom({ code: params.get("code").toUpperCase(), hostToken: params.get("token") });
      return;
    }
    const code = localStorage.getItem("famparty:hostCode");
    const hostToken = localStorage.getItem("famparty:hostToken");
    if (code && hostToken) setRoom({ code, hostToken });
    const pc = localStorage.getItem("famparty:playerCode");
    const pt = localStorage.getItem("famparty:playerToken");
    if (pc && pt && pc === code) setPlayerCreds({ code: pc, playerToken: pt });
  }, []);

  const { view, act, gone, serverNow } = useRoom(room?.code, { role: "host", token: room?.hostToken || "" });
  const seconds = useCountdown(view, serverNow);
  const { view: playerView, act: playerAct } = useRoom(playerCreds?.code, { role: "player", token: playerCreds?.playerToken || "" });
  const me = playerView?.me;

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

  async function playAsHost() {
    setBusy(true); setError("");
    const savedToken = localStorage.getItem("famparty:playerToken") || undefined;
    const res = await fetch(`/api/rooms/${room.code}/join`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: setupName || "Host", avatar: setupAvatar, playerToken: savedToken }),
    });
    const data = await res.json();
    setBusy(false);
    if (!data.ok) return setError(data.error || "Could not join as a player.");
    localStorage.setItem("famparty:playerCode", data.code);
    localStorage.setItem("famparty:playerToken", data.playerToken);
    setPlayerCreds({ code: data.code, playerToken: data.playerToken });
  }

  if (!room) {
    return (
      <main className="shell">
        <div className="card center">
          <span style={{ display: "block", marginBottom: 10, textAlign: "left" }}><LogoMark size={32} /></span>
          <span className="sticker">Host remote</span>
          <h2 style={{ marginTop: 14 }}>Create the room here</h2>
          <p className="sub">You run the show from this phone. Put the show on the TV with the code shown next.</p>
          {error && <p className="error">{error}</p>}
          <button className="btn primary big" disabled={busy} onClick={create}>{busy ? "Creating…" : "Create room"}</button>
          <p className="sub" style={{ fontSize: ".85rem", textAlign: "center" }}>By playing you agree to the <a href="/terms" target="_blank" rel="noreferrer">Terms</a> and <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.</p>
        </div>
      </main>
    );
  }

  const tvShort = typeof window !== "undefined" ? `${window.location.host}/tv` : "/tv";
  const canStart = view && view.players.length >= (GAME_MIN[view.game] ?? 3);
  const missing = view ? Math.max(0, (GAME_MIN[view.game] ?? 3) - view.players.length) : 0;
  const shareTv = async () => {
    const text = `Put this on the TV: ${tvShort} — then type the code ${room.code}`;
    try {
      if (navigator.share) { await navigator.share({ text }); setCopied("Shared"); return; }
      throw new Error("no share");
    } catch {
      try { await navigator.clipboard.writeText(`${tvShort} (code ${room.code})`); setCopied("Copied"); }
      catch { setCopied(`${tvShort} · code ${room.code}`); }
    }
  };

  return (
    <main className="shell">
      <div className="card">
        <span style={{ display: "block", marginBottom: 10 }}><LogoMark size={32} /></span>
        <span className="sticker">Host remote</span>
        <h2 style={{ fontSize: "1.9rem", marginTop: 12 }}>Room {room.code}</h2>

        <div style={{ background: "var(--dark)", color: "#fff", borderRadius: 24, padding: "18px 20px", margin: "14px 0" }}>
          <p style={{ margin: 0, color: "var(--yellow)", textTransform: "uppercase", letterSpacing: ".08em", fontSize: ".75rem", fontWeight: 700 }}>Show on TV</p>
          <p style={{ margin: "8px 0 2px", fontSize: "1.35rem", fontWeight: 800 }}>{tvShort}</p>
          <p style={{ margin: 0, color: "#c9c2f2" }}>then type the code <strong style={{ color: "#fff", letterSpacing: ".2em" }}>{room.code}</strong></p>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <button className="btn" onClick={shareTv}>📤 Share</button>
            <button className="btn" onClick={async () => { try { await navigator.clipboard.writeText(`${tvShort} (code ${room.code})`); setCopied("Copied"); } catch { setCopied(`${tvShort} · ${room.code}`); } }}>📋 Copy</button>
            {copied && <span style={{ alignSelf: "center" }}>{copied}</span>}
          </div>
        </div>

        {error && <p className="error">{error}</p>}
        {!view && <p className="sub">Connecting…</p>}

        {view && !playerCreds && view.phase === "lobby" && (
          <div style={{ border: "1.5px solid var(--divider)", borderRadius: 18, padding: 16, marginBottom: 14 }}>
            <b>Play along on this phone?</b>
            <label>Your name<input value={setupName} onChange={(e) => setSetupName(e.target.value.slice(0, 16))} placeholder="e.g. Alex" /></label>
            <div className="avatar-grid">{AVATARS.map((a) => <button type="button" key={a} className={`avatar ${setupAvatar === a ? "selected" : ""}`} onClick={() => setSetupAvatar(a)}>{a}</button>)}</div>
            <button className="btn primary big" disabled={busy} onClick={playAsHost}>{busy ? "Joining…" : "▶ Play & host"}</button>
            <p className="center" style={{ margin: "8px 0 0" }}><button type="button" className="link" onClick={() => setPlayerCreds({ skipped: true })}>I'm just running it</button></p>
          </div>
        )}
        {playerCreds?.skipped && view.phase === "lobby" && <p className="sub center">You're just running it — you won't play. <button type="button" className="link" onClick={() => setPlayerCreds(null)}>Play instead</button></p>}

        {view && (
          <>
            <HostBar view={view} hostAct={hostAct} />

            {view.phase === "lobby" && (
              <>
                <button className="btn primary big" disabled={!canStart} onClick={() => hostAct({ type: "START" })}>
                  ▶ Start {GAME_OPTIONS.find(([g]) => g === view.game)?.[1] || "Emoji Decoder"}
                </button>
                {!canStart && <p className="sub center">Waiting for {missing} more player{missing === 1 ? "" : "s"} — show the QR on the TV so people can scan in.</p>}
                <button className="btn big" onClick={() => setChangeGame((c) => !c)}>Change game</button>
                {changeGame && (
                  <div className="choices">
                    {GAME_OPTIONS.map(([g, label, desc]) => (
                      <button key={g} className={`choice btn-choice ${view.game === g ? "correct" : ""}`} onClick={() => hostAct({ type: "SELECT_GAME", game: g })}><b>{label}</b><br /><small>{desc}</small></button>
                    ))}
                  </div>
                )}
              </>
            )}
            {(view.phase === "scores" || view.phase === "finale") && <Leaderboard players={view.players} meId={me?.id} />}
          </>
        )}
      </div>

      {playerCreds && !playerCreds.skipped && playerView && (
        <div className="card">
          <PlayerGame view={playerView} act={playerAct} me={me} seconds={seconds} />
        </div>
      )}
    </main>
  );
}
