import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader, SiteFooter } from "./SiteChrome";
import { GAMES, OCCASIONS, POSTS } from "../lib/siteContent";

const gameBySlug = (slug) => GAMES.find((g) => g.slug === slug);

export function GamesIndex() {
  return (
    <>
      <SiteHeader />
      <main className="mkt">
        <p className="eyebrow">The games</p>
        <h1>Five games. One room.</h1>
        <p className="sub" style={{ maxWidth: 640, fontSize: "1.15rem" }}>Every game uses the same lobby, the same avatars and the same scoreboard. Learn one and you've learned them all — a show is just two or three of these back to back, hosted from one phone.</p>
        <div className="lp-games" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))" }}>
          {GAMES.map((g) => (
            <Link key={g.slug} className="lp-game" href={`/games/${g.slug}`} style={{ background: g.soft === "#ffffff" ? "#fff" : g.soft }}>
              <span className="lp-game-icon">{g.icon}</span><span className="lp-game-tag">{g.tag}</span><h3>{g.name}</h3><p>{g.blurb}</p>
              <span className="lp-game-mins">{g.length} · {g.players}</span>
            </Link>
          ))}
        </div>

        <section className="lp-section">
          <h2 className="lp-h2">How a show flows</h2>
          <div className="lp-steps">
            <div className="lp-step"><span className="lp-step-num" style={{ background: "var(--yellow)" }}>1</span><h3>The lobby</h3><p>Host creates a room, the TV shows a giant QR, everyone scans in as an animal. Thirty seconds of chaos, maximum.</p></div>
            <div className="lp-step"><span className="lp-step-num" style={{ background: "var(--pink-pastel)" }}>2</span><h3>The games</h3><p>Pick a game, play it, land on the leaderboard. Swap games between rounds without anyone rejoining.</p></div>
            <div className="lp-step"><span className="lp-step-num" style={{ background: "var(--lav)" }}>3</span><h3>The podium</h3><p>Final standings, top three on the podium, teasing rights until next time. Family album on? The stories stay for the rematch.</p></div>
          </div>
          <div className="center"><Link className="btn primary" href="/host" style={{ marginTop: 22, padding: "16px 30px" }}>Host a show</Link></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

export function GameDetail({ slug }) {
  const g = gameBySlug(slug);
  if (!g) notFound();
  const others = GAMES.filter((x) => x.slug !== slug).slice(0, 3);
  return (
    <>
      <SiteHeader />
      <main className="mkt">
        <section className="game-hero" style={{ background: g.soft }}>
          <span style={{ fontSize: 54 }}>{g.icon}</span>
          <p className="eyebrow" style={{ marginTop: 8 }}>{g.tag} · {g.length} · {g.players}</p>
          <h1>{g.name}</h1>
          <p style={{ fontSize: "1.25rem", lineHeight: 1.55, maxWidth: 620, color: "var(--body)" }}>{g.feels}</p>
          <Link className="btn primary" href="/host" style={{ padding: "16px 30px", marginTop: 8 }}>Host this game</Link>
        </section>

        <div className="frames">
          <div className="tv-frame" aria-hidden="true">
            <div className="tv-inner">
              <p className="eyebrow" style={{ color: "var(--yellow-ink)" }}>On the TV</p>
              <div style={{ fontSize: 84 }}>{g.icon}</div>
              <p style={{ fontFamily: "Gelasio, Georgia, serif", fontWeight: 700, fontSize: "1.8rem", margin: "6px 0" }}>{g.name}</p>
              <p style={{ color: "var(--yellow-ink)", margin: 0 }}>Big, readable from the couch. No buttons — the TV only shows the show.</p>
            </div>
          </div>
          <div>
            <div className="phone-frame" aria-hidden="true">
              <p className="eyebrow" style={{ margin: 0 }}>On your phone</p>
              <span className="choice"><b>A</b> Your private answer</span>
              <span className="choice"><b>B</b> Nobody sees it yet</span>
              <span className="btn primary" style={{ textAlign: "center" }}>Lock it in</span>
            </div>
            <div className="how-list">
              {g.how.map((step, i) => (
                <div key={i} className="how-item"><span className="lp-step-num" style={{ background: g.soft, flex: "none" }}>{i + 1}</span><p style={{ margin: 0, lineHeight: 1.55 }}>{step}</p></div>
              ))}
            </div>
          </div>
        </div>

        <section className="lp-section">
          <h2 className="lp-h2" style={{ fontSize: "2.2rem" }}>Keep the show going</h2>
          <div className="lp-games" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))" }}>
            {others.map((o) => (
              <Link key={o.slug} className="lp-game" href={`/games/${o.slug}`} style={{ background: o.soft === "#ffffff" ? "#fff" : o.soft }}>
                <span className="lp-game-icon">{o.icon}</span><span className="lp-game-tag">{o.tag}</span><h3>{o.name}</h3><p>{o.blurb}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

export function OccasionDetail({ slug }) {
  const o = OCCASIONS.find((x) => x.slug === slug);
  if (!o) notFound();
  return (
    <>
      <SiteHeader />
      <main className="mkt">
        <section className="game-hero" style={{ background: o.soft }}>
          <span style={{ fontSize: 54 }}>{o.icon}</span>
          <p className="eyebrow" style={{ marginTop: 8 }}>Occasions</p>
          <h1>{o.name}</h1>
          <p style={{ fontSize: "1.25rem", lineHeight: 1.55, maxWidth: 620, color: "var(--body)" }}>{o.intro}</p>
        </section>

        <section className="lp-section">
          <h2 className="lp-h2" style={{ fontSize: "2.2rem" }}>A show order that works</h2>
          <div className="lp-games" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))" }}>
            {o.show.map((slug2, i) => { const g = gameBySlug(slug2); return (
              <Link key={slug2} className="lp-game" href={`/games/${slug2}`} style={{ background: g.soft === "#ffffff" ? "#fff" : g.soft }}>
                <span className="lp-game-tag">Part {i + 1}</span><span className="lp-game-icon">{g.icon}</span><h3>{g.name}</h3><p>{g.blurb}</p>
              </Link> ); })}
          </div>
        </section>

        <section className="lp-section">
          <h2 className="lp-h2" style={{ fontSize: "2.2rem" }}>Setup tips</h2>
          <div className="how-list" style={{ maxWidth: 760, margin: "22px auto 0" }}>
            {o.tips.map((tip, i) => (
              <div key={i} className="how-item"><span className="lp-step-num" style={{ background: o.soft, flex: "none" }}>{i + 1}</span><p style={{ margin: 0, lineHeight: 1.55 }}>{tip}</p></div>
            ))}
          </div>
          <div className="center"><Link className="btn primary" href="/host" style={{ marginTop: 24, padding: "16px 30px" }}>Host a show</Link></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

const FAQS = [
  ["What do my guests need?", "Just a phone with a browser. They scan the QR code on the TV, pick a name and an animal, and they're in. No app, no account, no password."],
  ["What do I need as the host?", "Two screens you already own: a TV (or laptop or tablet) for the show, and your phone to run it. Screen-sharing the display on a video call is the idea for remote groups — we haven't finished testing that flow yet. You control the pace — start, pause, skip, and reveal — from your phone."],
  ["How many people can play?", "3 to 12 players per room. Games are built for a crowd: voting, fooling, and crowd-reading don't work with two."],
  ["Does it cost anything?", "No. There are no payments, no subscriptions, and no accounts. Create a room and play — that's the whole deal."],
  ["What is the family album?", "An optional private link for your family. It keeps a roster of your people, saves true stories from Spotlight (each person can opt out per statement), remembers scores, and unlocks Remember This?. It is kept for 60 days after your last show, then deleted. The link itself is the key — anyone who has it can get in, so share it only with family."],
  ["Is it suitable for kids and grandparents?", "Yes — that's who it's designed for. Content is written to be family-friendly, answers are big tap targets, the host can pause any timer, and nobody has to perform: every game has a low-pressure way to join in, including just watching and voting."],
  ["What if someone writes something rude?", "Nobody pre-reads answers — the game would stall. Instead, the host can hide any player's name or words from the TV at any moment, or remove them from the room entirely. Names and written answers also pass a word filter, but filters can miss things; the host's hide button is the real safety net."],
  ["Does it work on a video call?", "The idea: share the TV screen on Zoom, Meet, or Teams and everyone plays on their own phone wherever they are, in a browser tab with nothing to install. We haven't finished testing this flow yet, so try it with a quick game before the real night."],
];

export function HowItWorks() {
  return (
    <>
      <SiteHeader />
      <main className="mkt">
        <p className="eyebrow">How it works</p>
        <h1>Set up in the time it takes to find the remote.</h1>
        <div className="lp-steps">
          <div className="lp-step"><span className="lp-step-num" style={{ background: "var(--yellow)" }}>📱</span><h3>The host's phone is the remote</h3><p>Create the room, pick the game, and run the night — start, pause, skip, reveal — from the couch. Your phone is the only screen with buttons that matter.</p></div>
          <div className="lp-step"><span className="lp-step-num" style={{ background: "var(--pink-pastel)" }}>📺</span><h3>The TV only shows the show</h3><p>Open the display link on a TV, laptop, or tablet — or share it on a video call. It shows the QR code, the questions, the reveals and the podium. Never a form, never controls.</p></div>
          <div className="lp-step"><span className="lp-step-num" style={{ background: "var(--lav)" }}>🎮</span><h3>Phones are private controllers</h3><p>Players scan, pick a name and an animal, and answer privately. Nobody sees a vote, a lie, or an ending until the TV reveals it.</p></div>
        </div>

        <section className="lp-section">
          <h2 className="lp-h2" style={{ fontSize: "2.2rem" }}>Three ways to gather</h2>
          <div className="lp-occasions">
            <div className="lp-occ"><span>🛋️</span><span><b>On the TV</b><small>HDMI from a laptop, a cast tab, or the TV's own browser. The display tries to keep the screen on (best effort — many TV browsers ignore it, so turning off the TV's sleep setting helps).</small></span></div>
            <div className="lp-occ"><span>💻</span><span><b>On a laptop</b><small>A kitchen-table screen works fine for small rooms. Prop it where everyone can see it.</small></span></div>
            <div className="lp-occ"><span>📞</span><span><b>On a video call</b><small>Share the display screen; everyone else plays on their own phone. Still being tested — run one quick game first.</small></span></div>
          </div>
        </section>

        <section className="lp-section">
          <h2 className="lp-h2" style={{ fontSize: "2.2rem" }}>Safe on a family TV</h2>
          <div className="how-list" style={{ maxWidth: 760, margin: "22px auto 0" }}>
            <div className="how-item"><span style={{ fontSize: 26 }}>🙈</span><p style={{ margin: 0, lineHeight: 1.55 }}><b>Hide anything, instantly.</b> The host can hide any player's name or words from the TV at any moment — or remove them from the room. It works at every phase, not just the lobby.</p></div>
            <div className="how-item"><span style={{ fontSize: 26 }}>🧹</span><p style={{ margin: 0, lineHeight: 1.55 }}><b>A word filter as the first net.</b> Names, statements, answers and stories pass an open-source word list. It will miss things; that's why the hide button exists.</p></div>
            <div className="how-item"><span style={{ fontSize: 26 }}>👀</span><p style={{ margin: 0, lineHeight: 1.55 }}><b>Just watch is a real role.</b> Nobody is forced into the spotlight. Shy players and young kids can watch and vote until they demand a turn.</p></div>
            <div className="how-item"><span style={{ fontSize: 26 }}>🔑</span><p style={{ margin: 0, lineHeight: 1.55 }}><b>No accounts, honest security.</b> A room code gets you into a room; a family album link is the only key to an album. We say that plainly rather than dress it up.</p></div>
          </div>
        </section>

        <section className="lp-section" id="faq">
          <h2 className="lp-h2" style={{ fontSize: "2.2rem" }}>Good questions</h2>
          <div style={{ maxWidth: 760, margin: "22px auto 0", display: "grid", gap: 10 }}>
            {FAQS.map(([q, a]) => <details key={q} className="faq-item"><summary>{q}</summary><p>{a}</p></details>)}
          </div>
          <div className="center"><Link className="btn primary" href="/host" style={{ marginTop: 26, padding: "16px 30px" }}>Host a show</Link></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

export function BlogIndex({ active = "All" }) {
  const cats = ["All", ...new Set(POSTS.map((p) => p.cat))];
  const shown = active === "All" ? POSTS : POSTS.filter((p) => p.cat === active);
  const [featured, ...rest] = shown;
  return (
    <>
      <SiteHeader />
      <main className="mkt">
        <p className="eyebrow">Blog</p>
        <h1>The FamParty blog</h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "14px 0 26px" }}>
          {cats.map((c) => (
            <Link key={c} href={c === "All" ? "/blog" : `/blog?cat=${encodeURIComponent(c)}`} className="btn" style={c === active ? { background: "var(--dark)", color: "#fff", borderColor: "var(--dark)" } : {}}>{c}</Link>
          ))}
        </div>
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="lp-occ" style={{ padding: 0, overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1.2fr", marginBottom: 16 }}>
            <span className="lp-post-art" style={{ background: featured.soft, height: "100%", minHeight: 240 }}>{featured.icon}</span>
            <span style={{ padding: 28 }}><span className="lp-post-meta">{featured.cat} · {featured.read}</span><b style={{ fontSize: "2rem", lineHeight: 1.05, marginTop: 8 }}>{featured.title}</b><small style={{ fontSize: "1rem", marginTop: 8 }}>{featured.dek}</small></span>
          </Link>
        )}
        <div className="lp-blog">
          {rest.map((post) => (
            <Link key={post.slug} className="lp-post" href={`/blog/${post.slug}`}>
              <span className="lp-post-art" style={{ background: post.soft }}>{post.icon}</span>
              <span className="lp-post-body"><span className="lp-post-meta">{post.cat} · {post.read}</span><h3>{post.title}</h3><p>{post.dek}</p></span>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export function BlogPost({ slug }) {
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) notFound();
  return (
    <>
      <SiteHeader />
      <main className="mkt-narrow">
        <p className="eyebrow">{post.cat} · {post.read}</p>
        <h1>{post.title}</h1>
        <p className="sub" style={{ fontSize: "1.15rem" }}>{post.dek}</p>
        <div className="lp-post-art" style={{ background: post.soft, borderRadius: 24, margin: "22px 0" }}>{post.icon}</div>
        {post.body.map((para, i) => <p key={i} style={{ fontSize: "1.12rem", lineHeight: 1.65, color: "var(--body)" }}>{para}</p>)}
        <div className="center"><Link className="btn primary" href="/host" style={{ marginTop: 20, padding: "16px 30px" }}>Host a show</Link></div>
        <p className="center"><Link href="/blog">← All posts</Link></p>
      </main>
      <SiteFooter />
    </>
  );
}
