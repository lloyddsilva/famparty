"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoPrimary } from "../../components/Logo";

export default function Page() {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function startOnThisScreen() {
    setBusy(true); setError("");
    const res = await fetch("/api/rooms", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tvCreated: true }),
    });
    const data = await res.json();
    setBusy(false);
    if (!data.ok) return setError(data.error || "Could not create a room.");
    router.push(`/tv/${data.code}`);
  }

  return (
    <main className="shell">
      <div className="card center">
        <div style={{ width: 170, margin: "0 auto" }}><LogoPrimary width={170} /></div>
        <h2 style={{ marginTop: 16 }}>This screen is the TV</h2>
        <p className="sub">One tap creates the room and puts the big QR code here. The first person to scan becomes the host.</p>
        {error && <p className="error">{error}</p>}
        <button className="btn primary big" disabled={busy} onClick={startOnThisScreen}>{busy ? "Creating…" : "▶ Start on this screen"}</button>
        <div style={{ borderTop: "1px solid var(--divider)", marginTop: 22, paddingTop: 18 }}>
          <p className="sub">Already have a room? Type its code:</p>
          <form onSubmit={(e) => { e.preventDefault(); if (code.length === 4) router.push(`/tv/${code}`); }}>
            <input className="code-input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))} placeholder="ABCD" />
            <button className="btn big">Open display</button>
          </form>
        </div>
      </div>
    </main>
  );
}
