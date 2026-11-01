"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { GAMES, OCCASIONS } from "../lib/siteContent";
import { CONTACT_EMAIL, OPERATOR } from "../lib/siteConfig";
import { LogoPrimary, LogoCompact, LogoReversed } from "./Logo";

function Dropdown({ label, panelClass, children, width }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onClick); };
  }, []);
  return (
    <span className="nav-item" ref={ref} tabIndex={-1}
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
      <button type="button" className={`nav-trigger ${open ? "open" : ""}`} aria-expanded={open}
        onClick={() => setOpen(true)} onFocus={() => setOpen(true)}>
        {label} <span style={{ fontSize: 10 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && <span className={`nav-panel ${panelClass}`} style={{ display: "block" }}>{children}</span>}
    </span>
  );
}

export function SiteHeader() {
  const [menu, setMenu] = useState(false);
  return (
    <header className="site-header">
      <div className="site-header-in">
        <Link href="/" aria-label="FamParty home" style={{ display: "inline-flex" }}>
          <span className="logo-full"><LogoPrimary width={140} /></span>
          <span className="logo-compact"><LogoCompact width={118} /></span>
        </Link>
        <nav className="site-nav" aria-label="Main">
          <Dropdown label="Games" panelClass="games">
            <span className="nav-grid">
              {GAMES.map((g) => (
                <Link key={g.slug} className="nav-link-item" href={`/games/${g.slug}`}>
                  <span className="nav-tile" style={{ background: g.soft }}>{g.icon}</span>
                  <span><b>{g.name}</b><small>{g.tag} · {g.length}</small></span>
                </Link>
              ))}
              <Link className="nav-all" href="/games">
                <span className="nav-tile">→</span> All games &amp; how a show flows
              </Link>
            </span>
          </Dropdown>
          <Dropdown label="Occasions" panelClass="occasions">
            {OCCASIONS.map((o) => (
              <Link key={o.slug} className="nav-link-item" href={`/for/${o.slug}`}>
                <span className="nav-tile" style={{ background: o.soft }}>{o.icon}</span>
                <span><b>{o.name}</b><small>{o.sub}</small></span>
              </Link>
            ))}
          </Dropdown>
          <Link href="/how-it-works">How it works</Link>
        </nav>
        <button className="hamburger" aria-label="Menu" onClick={() => setMenu((m) => !m)}>☰</button>
        <span className="header-ctas">
          <Link className="btn outline" href="/join">Join a game</Link>
          <Link className="btn primary" href="/host">Host a show</Link>
        </span>
      </div>
      {menu && (
        <nav className="mobile-menu">
          <b>Games</b>
          {GAMES.map((g) => <Link key={g.slug} className="mm-sub" href={`/games/${g.slug}`}>{g.icon} {g.name}</Link>)}
          <Link href="/games">All games</Link>
          <b>Occasions</b>
          {OCCASIONS.map((o) => <Link key={o.slug} className="mm-sub" href={`/for/${o.slug}`}>{o.icon} {o.name}</Link>)}
          <Link href="/how-it-works">How it works</Link>
          <Link href="/join">Join a game</Link>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-in">
        <Link href="/" aria-label="FamParty home"><LogoReversed width={175} /></Link>
        <nav>
          <Link href="/games">Games</Link>
          <Link href="/for/family-night">Occasions</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/about">About</Link>
          {CONTACT_EMAIL && <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>}
        </nav>
        <span>© {new Date().getFullYear()} {OPERATOR} · No accounts · No payments · Family-friendly</span>
      </div>
    </footer>
  );
}
