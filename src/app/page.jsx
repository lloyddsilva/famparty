import Link from "next/link";
export const metadata = { alternates: { canonical: "/" } };
import { SiteHeader, SiteFooter } from "../components/SiteChrome";
import { GAMES, OCCASIONS, POSTS } from "../lib/siteContent";

const AVATAR_CARDS = [
  { e: "🦊", n: "Mum", s: "Locked in", cls: "", rot: "-5deg" },
  { e: "🐼", n: "Dad", s: "Thinking…", cls: "thinking", rot: "2deg" },
  { e: "🦄", n: "Zara", s: "Locked in", cls: "", rot: "-2deg" },
  { e: "🐸", n: "Grandpa", s: "Locked in", cls: "", rot: "5deg" },
];

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main className="lp">
        <section className="lp-hero">
          <div className="lp-stickers">
            <span className="sticker">Free · No signup</span>
          </div>
          <h1 className="lp-h1">
            Party with<br />
            the <span className="fam">fam<span className="callout family">family</span><span className="callout friends">friends</span><span className="callout coworkers">coworkers</span><span className="callout community">community</span></span><span className="dot">.</span>
          </h1>
          <div className="lp-callouts-mobile">
            <span className="sticker">family</span><span className="sticker pink">friends</span><span className="sticker lav">coworkers</span><span className="sticker white">community</span>
          </div>
          <p className="lp-lede">The party game show that runs on your TV and everyone's phones. All you need: a TV or laptop, and a phone each.</p>
          <div className="lp-cta-row">
            <Link className="btn primary lp-cta-main" href="/host">Host a show</Link>
            <Link className="btn lp-cta-ghost" href="/join">Join a game</Link>
            <Link className="btn lp-cta-ghost" href="/tv">Start on this screen</Link>
          </div>

          <div className="lp-devices" aria-hidden="true">
            <div className="avatar-card" style={{ transform: `rotate(${AVATAR_CARDS[0].rot})` }}><span className="ac-emoji">{AVATAR_CARDS[0].e}</span><span className="ac-name">{AVATAR_CARDS[0].n}</span><span className={`ac-status ${AVATAR_CARDS[0].cls}`}>{AVATAR_CARDS[0].s}</span></div>
            <div className="avatar-card" style={{ transform: `rotate(${AVATAR_CARDS[1].rot})` }}><span className="ac-emoji">{AVATAR_CARDS[1].e}</span><span className="ac-name">{AVATAR_CARDS[1].n}</span><span className={`ac-status ${AVATAR_CARDS[1].cls}`}>{AVATAR_CARDS[1].s}</span></div>
            <div className="lp-tv">
              <div className="lp-tv-panel">
                <div className="lp-tv-top"><span>Round 3 / 10</span><span>⏱ 14s</span><span>9 / 11 answered</span></div>
                <div className="lp-tv-emoji">🍕🎉</div>
                <p className="lp-tv-q">What phrase is this?</p>
                <div className="lp-tv-choices"><span><b>A</b> Pizza Party</span><span><b>B</b> Movie Night</span><span><b>C</b> Birthday Cake</span><span><b>D</b> Picnic Day</span></div>
              </div>
            </div>
            <div className="avatar-card" style={{ transform: `rotate(${AVATAR_CARDS[2].rot})` }}><span className="ac-emoji">{AVATAR_CARDS[2].e}</span><span className="ac-name">{AVATAR_CARDS[2].n}</span><span className={`ac-status ${AVATAR_CARDS[2].cls}`}>{AVATAR_CARDS[2].s}</span></div>
            <div className="avatar-card" style={{ transform: `rotate(${AVATAR_CARDS[3].rot})` }}><span className="ac-emoji">{AVATAR_CARDS[3].e}</span><span className="ac-name">{AVATAR_CARDS[3].n}</span><span className={`ac-status ${AVATAR_CARDS[3].cls}`}>{AVATAR_CARDS[3].s}</span></div>
          </div>
        </section>

        <div className="lp-strip"><span>📺 TV shows the game</span><span>📱 Phones answer privately</span><span>🎛️ Host runs it from the couch</span><span>🚫 Nothing to install</span></div>

        <section className="lp-section">
          <h2 className="lp-h2">Four games. One room.</h2>
          <p className="lp-sub">Learn one, you've learned them all. A show is two or three back to back.</p>
          <div className="lp-games">
            {GAMES.map((g) => (
              <Link key={g.slug} className="lp-game" href={`/games/${g.slug}`} style={{ background: g.soft === "#ffffff" ? "#fff" : g.soft }}>
                <span className="lp-game-icon">{g.icon}</span>
                <span className="lp-game-tag">{g.tag}</span>
                <h3>{g.name}</h3>
                <p>{g.blurb}</p>
                <span className="lp-game-mins">{g.length} · {g.players}{g.slug === "emoji-decoder" ? " · ★ Start with this" : ""}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="lp-section">
          <div className="lp-steps">
            <div className="lp-step"><span className="lp-step-num" style={{ background: "var(--yellow)" }}>1</span><h3>Host taps “Host a show”</h3><p>Your phone becomes the remote. Start, pause, skip, reveal — all from the couch.</p></div>
            <div className="lp-step"><span className="lp-step-num" style={{ background: "var(--pink-pastel)" }}>2</span><h3>TV shows a giant QR</h3><p>Any screen with a browser. Everyone scans, picks a name and an animal.</p></div>
            <div className="lp-step"><span className="lp-step-num" style={{ background: "var(--lav)" }}>3</span><h3>Play. Argue. Reveal.</h3><p>Answers on phones, drama on the TV, podium at the end.</p></div>
          </div>
        </section>

        <section className="lp-final">
          <div className="lp-avatars"><span>🦊</span><span>🐼</span><span>🦄</span><span>🐸</span><span>🦁</span></div>
          <h2>Ready? <em>Scan in.</em></h2>
          <p className="lp-sub">Free. No signup. Scan, pick an animal, play.</p>
          <div className="lp-cta-row"><Link className="btn primary" href="/host" style={{ fontSize: "1.25rem", padding: "20px 40px" }}>Host a show</Link></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
