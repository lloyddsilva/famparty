"use client";

import { useCallback, useEffect, useState } from "react";
import { AVATARS } from "../lib/questions";

export default function FamilyPage({ token }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [roomCode, setRoomCode] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [created, setCreated] = useState(null);

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
    setError("Family deleted. This link no longer works.");
  }

  if (!data) return <main className="shell"><div className="card center">{error || "Loading family…"}</div></main>;
  const isOwner = data.access === "owner";

  return (
    <main className="shell">
      <div className="card">
        <p className="eyebrow">FAMILY LINK · {isOwner ? "OWNER" : "MEMBER"} ACCESS</p>
        <h2>{data.family.name}</h2>
        <p className="error">⚠️ This link is the only protection. Anyone who has it can get in{isOwner ? ", export, and delete this family" : ""}. Share it only with your family.</p>

        <h3>Roster</h3>
        <div className="player-grid" style={{ justifyContent: "flex-start" }}>
          {data.members.map((m) => (
            <div key={m.id} className="player-chip">{m.avatar} {m.name} · {Number(m.total_points || 0)} pts</div>
          ))}
          {data.members.length === 0 && <p className="sub">No members yet — add everyone below.</p>}
        </div>
        <form onSubmit={addMember}>
          <label>Name<input value={name} onChange={(e) => setName(e.target.value.slice(0, 16))} required placeholder="e.g. Mum" /></label>
          <div className="avatar-grid">{AVATARS.map((a) => <button type="button" key={a} className={`avatar ${avatar === a ? "selected" : ""}`} onClick={() => setAvatar(a)}>{a}</button>)}</div>
          <button className="btn big">Add to roster</button>
        </form>

        <h3 style={{ marginTop: 28 }}>Play</h3>
        <button className="btn primary big" onClick={startShow}>📺 Start a family show</button>
        {created && <p className="sub">Room <strong>{created}</strong> created. This device is now the host remote — open <strong>/host</strong>, put <strong>/tv/{created}</strong> on the TV, and players join below with the room code.</p>}
        <form onSubmit={(e) => e.preventDefault()}>
          <label>Join a room as a roster member<input className="code-input" value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 4))} placeholder="ABCD" /></label>
        </form>
        <div className="player-grid" style={{ justifyContent: "flex-start" }}>
          {data.members.map((m) => (
            <a key={m.id} className={`btn ${roomCode.length === 4 ? "" : "disabled"}`} href={roomCode.length === 4 ? `/join?code=${roomCode}&member=${m.id}&family=${token}` : undefined}>
              {m.avatar} Join as {m.name}
            </a>
          ))}
        </div>
        <p className="sub">Games played in a family room save true statements and scores to this roster — every player is told at join, and each statement has a "don't save this" option.</p>

        <h3 style={{ marginTop: 28 }}>Saved statements ({data.statements.length})</h3>
        {data.statements.slice(0, 20).map((s) => (
          <p key={s.id} className="sub" style={{ margin: "6px 0" }}>{s.writer_avatar} <strong>{s.writer_name}:</strong> “{s.text}” <em>({s.kind})</em></p>
        ))}
        {data.statements.length === 0 && <p className="sub">Nothing saved yet. Play Spotlight in a family room and true statements land here — then try Remember This?</p>}

        {isOwner && (
          <>
            <h3 style={{ marginTop: 28 }}>Owner</h3>
            <a className="btn big" href={`/api/families/${token}/export`}>⬇ Export family data (JSON)</a>
            <label>Type DELETE to delete this family permanently
              <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE" />
            </label>
            <button className="btn big" disabled={confirmText !== "DELETE"} onClick={deleteFamily}>Delete family forever</button>
          </>
        )}
        {error && <p className="error">{error}</p>}
      </div>
    </main>
  );
}
