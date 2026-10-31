"use client";

import { useState } from "react";

export default function Page() {
  const [name, setName] = useState("");
  const [links, setLinks] = useState(null);
  const [error, setError] = useState("");

  async function create(e) {
    e.preventDefault();
    const res = await fetch("/api/families", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const d = await res.json();
    if (!d.ok) return setError(d.error);
    setLinks(d);
  }

  return (
    <main className="shell">
      <div className="card">
        <p className="eyebrow">PERMANENT FAMILY LINK</p>
        <h2>Save your family&apos;s games</h2>
        <p className="sub">Create a family space with a roster. True statements and scores from Spotlight save here, and come back in Remember This? Nobody signs in — the links below are the only keys, so share them carefully.</p>
        {!links ? (
          <form onSubmit={create}>
            <label>Family name<input value={name} onChange={(e) => setName(e.target.value.slice(0, 40))} placeholder="e.g. The D'Silva Family" required /></label>
            {error && <p className="error">{error}</p>}
            <button className="btn primary big">Create family link</button>
          </form>
        ) : (
          <>
            <p className="sub">Save these now — the owner link is shown only once here:</p>
            <label>Member link (play + view)<input readOnly value={`${window.location.origin}/f/${links.memberToken}`} onFocus={(e) => e.target.select()} /></label>
            <label>Owner link (export + delete)<input readOnly value={`${window.location.origin}/f/${links.ownerToken}`} onFocus={(e) => e.target.select()} /></label>
            <a className="btn primary big" href={`/f/${links.memberToken}`}>Open your family →</a>
          </>
        )}
      </div>
    </main>
  );
}
