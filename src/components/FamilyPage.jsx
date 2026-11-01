"use client";

import { useCallback, useEffect, useState } from "react";
import { AVATARS } from "../lib/questions";

const PASTELS = ["#fff3cc", "#ffe0e9", "#e4dcff", "#ffffff"];

export default function FamilyPage({ token }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [roomCode, setRoomCode] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [created, setCreated] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/families/${token}`, { cache: "no-store" });
    const d = await res.json();
    if (!d.ok) return setError(d.error || "Family not found.");
    setData(d);
  }, [token]);
  useEffect(() => { load(); }, [load]);

  async function addMember(e) {
    e.preventDefault();
    const res = await fetch(`/api/families/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "addMember", name, avatar }) });
    const d = await res.json();
    if (!d.ok) return setError(d.error);
    setName("");
    setShowAdd(false);
    load();
  }

  async function startShow() {
    const res = await fetch("/api/rooms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ familyToken: token }) });
    const d = await res.json();
    if (!d.ok) return setError(d.error);
    localStorage.setItem("famparty:hostCode", d.code);
    localStorage.setItem("famparty:hostToken", d.hostToken);
    setCreated(d.code);
  }

  async function deleteFamily() {
    const res = await fetch(`/api/families/${token}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirm: confirmText }) });
    const d = await res.json();
    if (!d.ok) return setError(d.error);
    setData(null);
    setError("Album deleted. This link no longer works.");
  }

  if (!data) return <main className="shell"><div className="card center">{error || "Loading album…"}</div></main>;
  const isOwner = data.access === "owner";

  return (
    <main className="shell" style={{ maxWidth: 680 }}>
      <div className="card" style={{ marginTop: 8 }}>
        {/* 1. header */}
        <span className="sticker">Family album · {isOwner ? "owner" : "member"}</span>
        <h2 style={{ fontSize: "2.6rem", marginTop: 14 }}>{data.family.name}</h2>
        <p className="sub">Anyone with this link can get in{isOwner ? ", export, or delete this album" : ""}. Share it only with your family.</p>
        {data.expiresAt && (
          <p className="sub">This album is kept for 60 days after your last show. Last activity: {new Date(data.lastActiveAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })} · Expires {new Date(data.expiresAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}.</p>
        )}

        {/* 2. the two CTAs, straight after the header */}
        <button className="btn primary big" onClick={startShow}>📺 Start a family show</button>
        <button className="btn big" onClick={() => setShowJoin((s) => !s)}>Join a room as…</button>
        {created && <p className="notice">Room <strong>{created}</strong> created. This device is the host remote — open <strong>/host</strong>, put <strong>/tv/{created}</strong> on the TV, then join below as yourselves.</p>}
        {showJoin && (
          <>
            <label>Room code<input className="code-input" value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 4))} placeholder="ABCD" /></label>
            <div className="player-grid" style={{ justifyContent: "flex-start" }}>
              {data.members.map((m) => (
                <a key={m.id} className="btn" aria-disabled={roomCode.length !== 4} href={roomCode.length === 4 ? `/join?code=${roomCode}&member=${m.id}&family=${token}` : undefined}>
                  {m.avatar} Join as {m.name}
                </a>
              ))}
              {data.members.length === 0 && <p className="sub">Add everyone to the roster first.</p>}
            </div>
          </>
        )}

        {/* 3. roster chips + dashed add */}
        <h3 style={{ marginTop: 30 }}>Roster</h3>
        <div className="player-grid" style={{ justifyContent: "flex-start" }}>
          {data.members.map((m, i) => (
            <div key={m.id} className="player-chip" style={{ background: PASTELS[i % PASTELS.length] }}>{m.avatar} {m.name} · {Number(m.total_points || 0)} pts</div>
          ))}
          <button type="button" className="player-chip" style={{ borderStyle: "dashed", cursor: "pointer", background: "transparent" }} onClick={() => setShowAdd((s) => !s)}>+ Add someone</button>
        </div>
        {showAdd && (
          <form onSubmit={addMember}>
            <label>Name<input value={name} onChange={(e) => setName(e.target.value.slice(0, 16))} required placeholder="e.g. Mum" /></label>
            <div className="avatar-grid">{AVATARS.map((a) => { const taken = data.members.some((m) => m.avatar === a); return <button type="button" key={a} disabled={taken} title={taken ? "Taken on this roster" : undefined} className={`avatar ${avatar === a ? "selected" : ""}`} onClick={() => setAvatar(a)}>{a}</button>; })}</div>
            <button className="btn big">Add to roster</button>
          </form>
        )}
        <p className="sub">Games in an album room save true statements and scores to this roster — players are told at join, each statement has a "don't save this" option, and everything is kept for 60 days after your last show.</p>

        {/* 4. saved stories as cards */}
        <h3 style={{ marginTop: 30 }}>Saved stories · {data.statements.length}</h3>
        <p className="sub" style={{ marginTop: -6 }}>These come back in Remember This?</p>
        {data.statements.slice(0, 20).map((s, i) => (
          <div key={s.id} className="lp-memory" style={{ transform: `rotate(${[-1.5, 1, -0.5][i % 3]}deg)`, border: "1px solid var(--divider)" }}>
            <span>{s.writer_avatar}</span>
            <p><q>{s.text}</q><small>{s.writer_name} · {s.kind === "story" ? "story line" : "true statement"} · {new Date(Number(s.created_at)).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</small></p>
          </div>
        ))}
        {data.statements.length === 0 && <p className="sub">Nothing saved yet. Play Spotlight in an album room and true statements land here.</p>}

        {/* 5. owner footer */}
        {isOwner && (
          <>
            <h3 style={{ marginTop: 30 }}>Owner</h3>
            <a className="btn big" href={`/api/families/${token}/export`}>⬇ Export (JSON)</a>
            <label>Type DELETE to delete this album
              <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE" />
            </label>
            <button className="btn big" disabled={confirmText !== "DELETE"} onClick={deleteFamily} style={{ color: "#b3261e" }}>Delete this album…</button>
          </>
        )}
        {error && <p className="error">{error}</p>}
      </div>
    </main>
  );
}
