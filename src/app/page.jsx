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
            <span className="sticker">Free</span>
            <span className="sticker pink">No signup</span>
            <span className="sticker lav">3–12 players</span>
          </div>
          <h1 className="lp-h1">
            Party with<br />
            the <span className="fam">fam<span className="callout family">family</span><span className="callout friends">friends</span><span className="callout coworkers">coworkers</span><span className="callout community">community</span></span><span className="dot">.</span>
          </h1>
          <div className="lp-callouts-mobile">
            <span className="sticker">family</span><span className="sticker pink">friends</span><span className="sticker lav">coworkers</span><span className="sticker white">community</span>
          </div>
          <p className="lp-lede">The party game show that runs on your TV and everyone's phones. Whoever your fam is tonight, scan, pick an animal, and start fooling them.</p>
          <div className="lp-cta-row">
            <Link className="btn primary lp-cta-main" href="/host">Host a show</Link>
            <Link className="btn lp-cta-ghost" href="/games">See the games</Link>
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
          <h2 className="lp-h2">Five games. One room.</h2>
          <p className="lp-sub">Learn one, you've learned them all. A show is two or three back to back.</p>
          <div className="lp-games">
            {GAMES.map((g) => (
              <Link key={g.slug} className="lp-game" href={`/games/${g.slug}`} style={{ background: g.soft === "#ffffff" ? "#fff" : g.soft }}>
                <span className="lp-game-icon">{g.icon}</span>
                <span className="lp-game-tag">{g.tag}</span>
                <h3>{g.name}</h3>
                <p>{g.blurb}</p>
                <span className="lp-game-mins">{g.length} · {g.players}</span>
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

        <section className="lp-section">
          <h2 className="lp-h2">Wherever people gather</h2>
          <div className="lp-occasions">
            {OCCASIONS.map((o) => (
              <Link key={o.slug} className="lp-occ" href={`/for/${o.slug}`}><span>{o.icon}</span><span><b>{o.name}</b><small>{o.sub}</small></span></Link>
            ))}
          </div>
        </section>

        <section className="lp-section">
          <div className="lp-family">
            <div>
              <p className="eyebrow">The family album</p>
              <h2>Last month's truths are tonight's quiz.</h2>
              <p>One private link for your family, no accounts. It remembers who's who, keeps the true stories people choose to save for 60 days after your last show, and deals them back as Remember This?. Anyone with the link can get in, so share it only with family.</p>
              <Link className="lp-btn-dark" href="/family">Start your family album</Link>
            </div>
            <div aria-hidden="true">
              <div className="lp-memory" style={{ transform: "rotate(-1.5deg)" }}><span>🦊</span><p><q>I once met a penguin.</q><small>Mum · true statement</small></p></div>
              <div className="lp-memory" style={{ transform: "rotate(1deg)" }}><span>🐸</span><p><q>Locked myself out in my pyjamas. Twice.</q><small>Grandpa · story line he chose to save</small></p></div>
              <div className="lp-memory" style={{ transform: "rotate(-.5deg)" }}><span>🦄</span><p><q>I can juggle three balls.</q><small>Zara · true statement</small></p></div>
            </div>
          </div>
        </section>

        <section className="lp-section">
          <div className="lp-blog-head">
            <div><p className="eyebrow">From the blog</p><h2 className="lp-h2 left" style={{ fontSize: "2.3rem" }}>Ideas for your next get-together</h2></div>
            <Link href="/blog" style={{ fontWeight: 600 }}>All posts →</Link>
          </div>
          <div className="lp-blog">
            {POSTS.slice(0, 3).map((post) => (
              <Link key={post.slug} className="lp-post" href={`/blog/${post.slug}`}>
                <span className="lp-post-art" style={{ background: post.soft }}>{post.icon}</span>
                <span className="lp-post-body"><span className="lp-post-meta">{post.cat} · {post.read}</span><h3>{post.title}</h3><p>{post.dek}</p></span>
              </Link>
            ))}
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
