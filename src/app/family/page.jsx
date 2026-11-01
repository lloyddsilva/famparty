"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "../../components/SiteChrome";

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
    <>
      <SiteHeader />
      <main className="shell">
        <div style={{ marginTop: 26 }}>
          <span className="sticker">Family album</span>
          <h1 style={{ fontSize: "2.6rem", marginTop: 14 }}>Your family, remembered — for a while.</h1>
          <p className="sub" style={{ fontSize: "1.08rem" }}>A family album is one private link with your roster on it. True stories saved from Spotlight land here (anyone can opt out of saving theirs), scores add up across shows, and Remember This? deals the stories back as a game. No accounts — the link is the only key.</p>
          <div className="how-list">
            <div className="how-item"><span style={{ fontSize: 24 }}>👨‍👩‍👧</span><p style={{ margin: 0, lineHeight: 1.55 }}><b>One roster.</b> Everyone joins as themselves, so scores and stories attach to the person.</p></div>
            <div className="how-item"><span style={{ fontSize: 24 }}>🗓️</span><p style={{ margin: 0, lineHeight: 1.55 }}><b>Kept for 60 days after your last show</b>, then deleted. Every show, member or saved story restarts the clock.</p></div>
            <div className="how-item"><span style={{ fontSize: 24 }}>🔑</span><p style={{ margin: 0, lineHeight: 1.55 }}><b>Two links:</b> a member link to play and view, an owner link to export or delete. Share them only with family.</p></div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Start your family album</h2>
          {!links ? (
            <form onSubmit={create}>
              <label>Family name<input value={name} onChange={(e) => setName(e.target.value.slice(0, 40))} placeholder="e.g. The River Family" required /></label>
              {error && <p className="error">{error}</p>}
              <button className="btn primary big">Create family album</button>
              <p className="sub" style={{ fontSize: ".9rem" }}>We keep your album for 60 days after your last show, then delete it. There are no accounts; the link is the only key. See the <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.</p>
            </form>
          ) : (
            <>
              <p className="sub"><strong>Save these now — the owner link is shown only once here.</strong> We keep your album for 60 days after your last show, then delete it. There are no accounts; the link is the only key. See the <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.</p>
              <label>Member link (play + view)<input readOnly value={`${window.location.origin}/f/${links.memberToken}`} onFocus={(e) => e.target.select()} /></label>
              <label>Owner link (export + delete)<input readOnly value={`${window.location.origin}/f/${links.ownerToken}`} onFocus={(e) => e.target.select()} /></label>
              <a className="btn primary big" href={`/f/${links.memberToken}`}>Open your album →</a>
            </>
          )}
        </div>
        <p className="center" style={{ marginTop: 18 }}><Link href="/blog/your-family-album-explained">How the family album works →</Link></p>
      </main>
      <SiteFooter />
    </>
  );
}
