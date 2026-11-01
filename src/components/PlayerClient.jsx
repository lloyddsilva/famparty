"use client";

import { useEffect, useState } from "react";
import { AVATARS } from "../lib/questions";
import { useRoom, useCountdown } from "./useRoom";
import PlayerGame from "./PlayerGame";
import HostBar from "./HostBar";
import { LogoMark } from "./Logo";

export default function PlayerClient() {
  const [code, setCode] = useState("");
  const [fromQr, setFromQr] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(() => AVATARS[Math.floor(Math.random() * AVATARS.length)]);
  const [creds, setCreds] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [takenAvatars, setTakenAvatars] = useState([]);
  const [roomFull, setRoomFull] = useState(false);
  const [hostToken, setHostToken] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("code");
    if (c) { setCode(c.toUpperCase()); setFromQr(true); }
    const savedCode = localStorage.getItem("famparty:playerCode");
    const savedToken = localStorage.getItem("famparty:playerToken");
    if (savedCode && savedToken && !params.get("member") && (!c || c.toUpperCase() === savedCode)) {
      setCreds({ code: savedCode, playerToken: savedToken });
    }
    if (localStorage.getItem("famparty:hostCode")) setHostToken(localStorage.getItem("famparty:hostToken") || "");
  }, []);

  function refreshTaken(forCode) {
    fetch(`/api/rooms/${forCode}/peek`).then((r) => r.json()).then((d) => {
      if (d.ok) {
        setTakenAvatars(d.takenAvatars || []);
        setRoomFull((d.playerCount || 0) >= 12);
      }
    }).catch(() => {});
  }
  useEffect(() => { if (code.length === 4) refreshTaken(code); }, [code]);

  const { view, act, serverNow, gone, error: roomError } = useRoom(creds?.code, { role: "player", token: creds?.playerToken || "" });
  const seconds = useCountdown(view, serverNow);
  const me = view?.me;
  const isHost = !!hostToken && view && localStorage.getItem("famparty:hostCode") === view.code;

  const hostAct = async (a) => {
    const res = await fetch(`/api/rooms/${view.code}/actions`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: hostToken, expectedPhase: view?.phase, expectedStep: view?.finishit?.candidates.length ?? 0, ...a }),
    });
    const data = await res.json().catch(() => ({}));
    if (data && data.ok === false) setError(data.error || "That host action did not go through.");
    return data;
  };

  useEffect(() => {
    if (takenAvatars.includes(avatar)) {
      const free = AVATARS.find((a) => !takenAvatars.includes(a));
      if (free) setAvatar(free);
    }
  }, [takenAvatars, avatar]);

  const kicked = !!view && creds && !me;
  useEffect(() => {
    if ((gone || kicked) && creds) {
      localStorage.removeItem("famparty:playerCode");
      localStorage.removeItem("famparty:playerToken");
      setError(gone ? "That room has ended. Join a new one below." : "The host removed you from that room.");
      setCreds(null);
    }
  }, [gone, kicked, creds]);

  async function join(e) {
    e.preventDefault();
    setBusy(true); setError("");
    const savedToken = localStorage.getItem("famparty:playerToken") || undefined;
    // If our pre-picked animal was taken while we typed, switch silently
    // instead of failing the join.
    const chosenAvatar = takenAvatars.includes(avatar) ? (AVATARS.find((a) => !takenAvatars.includes(a)) || avatar) : avatar;
    if (chosenAvatar !== avatar) setAvatar(chosenAvatar);
    const res = await fetch(`/api/rooms/${code}/join`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, avatar: chosenAvatar, playerToken: savedToken }),
    });
    let data = await res.json();
    if (!data.ok && /avatar/i.test(data.error || "")) {
      // Our animal was taken between page load and tapping I'm in: pick the
      // next free one and try once more, no error shown.
      const peek = await fetch(`/api/rooms/${code}/peek`).then((r) => r.json()).catch(() => null);
      const taken = peek?.takenAvatars || [];
      const free = AVATARS.find((a) => !taken.includes(a));
      if (free) {
        setAvatar(free);
        const retry = await fetch(`/api/rooms/${code}/join`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, avatar: free, playerToken: savedToken }),
        });
        data = await retry.json();
      }
    }
    setBusy(false);
    if (!data.ok) { refreshTaken(code); return setError(data.error || "Could not join."); }
    if (data.avatar) setAvatar(data.avatar);
    localStorage.setItem("famparty:playerCode", data.code);
    localStorage.setItem("famparty:playerToken", data.playerToken);
    if (data.hostToken) {
      localStorage.setItem("famparty:hostCode", data.code);
      localStorage.setItem("famparty:hostToken", data.hostToken);
      setHostToken(data.hostToken);
    }
    setCreds({ code: data.code, playerToken: data.playerToken, playerId: data.playerId });
  }

  if (!creds) {
    return (
      <main className="shell">
        <form className="card" onSubmit={join}>
          <span style={{ display: "block", marginBottom: 10 }}><LogoMark size={32} /></span>
          <span className="sticker pink">Join the show</span>
          <h2 style={{ fontSize: "2.2rem", marginTop: 14 }}>{fromQr ? "Enter your name" : "Who are you tonight?"}</h2>
          {!fromQr && (
            <label>Room code<input className="code-input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))} placeholder="ABCD" required /></label>
          )}
          {fromQr && <p className="sub">Room <strong>{code}</strong> — you're joining the show on the TV.</p>}
          <label>Your name<input value={name} onChange={(e) => setName(e.target.value.slice(0, 16))} placeholder="e.g. Alex" required autoFocus /></label>
          <p className="sub" style={{ margin: "10px 0 4px" }}>Your animal (tap to change):</p>
          <div className="avatar-grid">{AVATARS.map((a) => <button type="button" key={a} disabled={takenAvatars.includes(a)} title={takenAvatars.includes(a) ? "Taken in this room" : undefined} className={`avatar ${avatar === a ? "selected" : ""}`} onClick={() => setAvatar(a)}>{a}</button>)}</div>
          {roomFull && <p className="error">This room is full (12 players). Play in pairs: share a phone with someone already in — or ask the host to start a new room.</p>}
          {error && <p className="error">{error}</p>}
          <button className="btn primary big" disabled={busy || roomFull}>{busy ? "Joining…" : roomFull ? "Room full" : "I'm in"}</button>
          <p className="sub" style={{ fontSize: ".85rem", textAlign: "center" }}>By playing you agree to the <a href="/terms" target="_blank" rel="noreferrer">Terms</a> and <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.</p>
        </form>
      </main>
    );
  }

  if (!view) return <main className="shell"><div className="card center">{roomError || "Connecting…"}</div></main>;

  return (
    <main className="shell">
      <div className="card">
        {roomError && <div className="reconnecting">Reconnecting…</div>}
        <div className="me-head"><span className="me-avatar">{me?.avatar || avatar}</span><div><strong>{me?.name || name}</strong><div className="sub">Room {view.code} · {me?.score ?? 0} pts{isHost ? " · 🎛️ You're the host" : ""}</div></div></div>
        {isHost && <HostBar view={view} hostAct={hostAct} allowStart />}
        <PlayerGame view={view} act={act} me={me} seconds={seconds} />
      </div>
    </main>
  );
}
