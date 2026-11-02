import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader, SiteFooter } from "./SiteChrome";
import { GAMES, OCCASIONS, POSTS } from "../lib/siteContent";
import { BLOG_POSTS } from "../lib/blogPosts";
import { Block } from "./BlogBlocks";

const gameBySlug = (slug) => GAMES.find((g) => g.slug === slug);

export function GamesIndex() {
  return (
    <>
      <SiteHeader />
      <main className="mkt">
        <p className="eyebrow">The games</p>
        <h1>Four games. One room.</h1>
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
  ["What do my guests need?", "Just a phone with a browser. They scan the QR code on the TV, type a name, pick an animal, and they're in. No app, no account, no password."],
  ["Who is the host?", "The first person to scan the QR code becomes the host and runs the show from their phone. If you start on your phone instead, you're the host from the beginning. Either way, hosting and playing can happen on the same phone."],
  ["What do I need?", "A TV or laptop for the big screen, and a phone each. That's it — no accounts, nothing to install, nothing to print."],
  ["How many people can play?", "2 to 12 players, depending on the game. Story and comedy games need at least 3; guessing games work with 2. If the room is full, play in pairs and share a phone."],
  ["Does it cost anything?", "Not during the beta: no payments, no card, no accounts. We plan to add paid options after the beta, and we plan to keep at least one game free."],
  ["What if someone writes something rude?", "Nobody reads answers before they appear — the game would stall. Instead, the host can hide any player's words from the TV at any moment, or remove them from the room. Names and answers also pass a word filter, but filters can miss things; the host's hide button is the safety net."],
  ["Can someone join late?", "Yes. Scan the QR code at any point: you'll watch the current round and play from the next one. Nothing is disturbed."],
  ["Does it work on a video call?", "That's the idea — share the big screen in the call and everyone plays on their own phone. We are still testing this properly, so try one quick game first."],
];

export function HowItWorks() {
  const screens = [
    ["📺 Smart TV", "Open the TV's browser and go to the site, then tap Start on this screen.", "Scan the QR code with your phone. Smart TV browsers are hit and miss — if the page looks wrong, use a laptop instead."],
    ["💻 Laptop + HDMI", "Plug the laptop into the TV with an HDMI cable and pick the right input.", "Open the site on the laptop and tap Start on this screen. This is the most reliable setup."],
    ["📡 Chromecast / AirPlay", "Cast this browser tab to the TV from Chrome or Safari.", "Then tap Start on this screen. Keep the laptop awake and nearby."],
    ["📽️ Projector", "Connect a laptop to the projector the way you would for slides.", "Make the room a bit darker and put the sound through any speaker you have."],
    ["📞 Zoom (still being tested)", "Share your screen in the call, then open the site in the shared tab.", "Everyone joins on their own phone. We are still testing this properly — try one quick game first."],
  ];
  return (
    <>
      <SiteHeader />
      <main className="mkt">
        <p className="eyebrow">How it works</p>
        <h1>Three steps. No explaining.</h1>
        <div className="lp-steps">
          <div className="lp-step"><span className="lp-step-num" style={{ background: "var(--yellow)" }}>1</span><h3>Put the show on a big screen</h3><p>On the TV or laptop, tap <b>Start on this screen</b>. A big QR code appears. (Or start on your phone with Host a show.)</p></div>
          <div className="lp-step"><span className="lp-step-num" style={{ background: "var(--pink-pastel)" }}>2</span><h3>Everyone scans and picks an animal</h3><p>Point a phone camera at the QR code, type a name, tap I'm in. The first person to scan becomes the host. That's the whole signup.</p></div>
          <div className="lp-step"><span className="lp-step-num" style={{ background: "var(--lav)" }}>3</span><h3>Play on your phones, watch the TV</h3><p>Questions and scores are on the big screen. Answers happen privately on phones. The host taps one button to move the show along.</p></div>
        </div>

        <section className="lp-section">
          <h2 className="lp-h2" style={{ fontSize: "2.2rem" }}>What's your screen?</h2>
          <div className="how-list" style={{ maxWidth: 820, margin: "22px auto 0" }}>
            {screens.map(([name, s1, s2]) => (
              <div key={name} className="how-item"><span style={{ fontSize: 28 }}>{name.split(" ")[0]}</span><p style={{ margin: 0, lineHeight: 1.55 }}><b>{name.replace(/^\S+ /, "")}</b><br />1. {s1}<br />2. {s2}</p></div>
            ))}
          </div>
        </section>

        <section className="lp-section" id="faq">
          <h2 className="lp-h2" style={{ fontSize: "2.2rem" }}>Good questions</h2>
          <div style={{ maxWidth: 760, margin: "22px auto 0", display: "grid", gap: 10 }}>
            {FAQS.map(([q, a]) => <details key={q} className="faq-item"><summary>{q}</summary><p>{a}</p></details>)}
          </div>
          <div className="center"><Link className="btn primary" href="/tv" style={{ marginTop: 26, padding: "16px 30px" }}>Start on this screen</Link></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
export function BlogIndex({ active = "All" }) {
  const cats = ["All", ...new Set(BLOG_POSTS.filter((p) => p.published).map((p) => p.cat))];
  const shown = (active === "All" ? BLOG_POSTS.filter((p) => p.published) : BLOG_POSTS.filter((p) => p.published && p.cat === active));
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
  const post = BLOG_POSTS.find((p) => p.slug === slug && p.published);
  if (!post) notFound();
  const related = (post.related || []).map((s) => BLOG_POSTS.find((p) => p.slug === s && p.published)).filter(Boolean);
  const game = post.gameSlug ? GAMES.find((g) => g.slug === post.gameSlug) : null;
  return (
    <>
      <SiteHeader />
      <main className="mkt-narrow blog-post">
        <p className="eyebrow">{post.cat} · {post.read}</p>
        <h1>{post.title}</h1>
        <p className="blog-dek">{post.description}</p>

        <aside className="blog-quick">
          <b>Quick answer</b>
          <p>{post.quickAnswer}</p>
        </aside>

        {post.takeaways?.length > 0 && (
          <section className="blog-takeaways">
            <b>Key takeaways</b>
            <ul>{post.takeaways.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </section>
        )}

        <div className="blog-cover" style={{ background: post.soft }} role="img" aria-label={`${post.title} cover art`}>
          <span>{post.icon}</span>
        </div>

        {post.blocks.map((block, i) => <Block key={i} block={block} index={i} />)}

        {post.faq?.length > 0 && (
          <section>
            <h2 className="blog-h2">Questions</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {post.faq.map((f, i) => (
                <details key={i} className="faq-item"><summary>{f.q}</summary><p>{f.a}</p></details>
              ))}
            </div>
          </section>
        )}

        {(related.length > 0 || game) && (
          <section className="blog-related">
            <h2 className="blog-h2">Keep reading</h2>
            <div className="blog-related-links">
              {related.map((r) => <Link key={r.slug} href={`/blog/${r.slug}`}>{r.icon} {r.title}</Link>)}
              {game && <Link href={`/games/${game.slug}`}>{game.icon} {game.name} — the game page</Link>}
            </div>
          </section>
        )}

        <div className="blog-cta card center">
          <h2>Run it on the big screen</h2>
          <p className="sub">Host a show: the TV displays, everyone plays on their phone. No signup.</p>
          <Link className="btn primary" href="/host" style={{ padding: "14px 28px" }}>Host a show</Link>
        </div>
        <p className="center"><Link href="/blog">← All posts</Link></p>
      </main>
      <SiteFooter />
    </>
  );
}
