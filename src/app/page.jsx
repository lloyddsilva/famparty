import Link from "next/link";

const GAMES = [
  { icon: "🧩", name: "Emoji Decoder", mins: "~8 min · 3–12 players", blurb: "Guess the phrase from the emojis before the clock runs out. Fast fingers score more — shouting at the TV is encouraged.", tag: "The warm-up" },
  { icon: "🎤", name: "Spotlight", mins: "~12 min · 3–12 players", blurb: "Two truths and a lie, written privately on your phone. Fool the room, then take 30 seconds in the spotlight to tell the real story.", tag: "The heart of it" },
  { icon: "🎚️", name: "Spectrum", mins: "~8 min · 3–12 players", blurb: "Cook at home or order in? Place yourself, predict the crowd, then watch everyone's avatars land on the big spectrum at once.", tag: "The conversation starter" },
  { icon: "✍️", name: "Finish It", mins: "~10 min · 3–12 players", blurb: "Everyone finishes the same sentence. Answers are revealed anonymously, one by one — the funniest ending wins, whoever wrote it.", tag: "The comedy round" },
  { icon: "🧠", name: "Remember This?", mins: "~8 min · family link", blurb: "True stories from your last show come back. Who met a penguin? Who slept in a tent for a week? Your family's history is the quiz.", tag: "The memory game" },
];

const FAQS = [
  ["What do my guests need?", "Just a phone with a browser. They scan the QR code on the TV, pick a name and an avatar, and they're in. No app, no account, no password — it takes about 30 seconds."],
  ["What do I need as the host?", "Two screens you already own: a TV (or laptop, tablet, or a screen shared on a video call) for the show, and your phone to run it. You control the pace — start, pause, skip, and reveal — from your phone."],
  ["How many people can play?", "3 to 12 players per room. Games are built for a crowd: voting, fooling, and crowd-reading don't work with two. One room runs one show at a time, and you can play as many games in a row as the night allows."],
  ["Does it cost anything?", "No. There are no payments, no subscriptions, and no accounts. Create a room and play — that's the whole deal."],
  ["What is the family link?", "An optional permanent link for your family. It keeps a roster of your people, saves true stories from Spotlight (each person can opt out per statement), remembers scores, and unlocks Remember This? for your next get-together. The link itself is the key — anyone who has it can get in, so share it only with family."],
  ["Is it suitable for kids and grandparents?", "Yes — that's who it's designed for. Content is family-safe, answers are big tap targets, the host can pause any timer, and nobody has to perform: every game has a low-pressure way to join in, including just watching and voting."],
  ["What if someone writes something rude?", "The host sees everything first and can hide any player's name or words from the TV at any moment, or remove them from the room. Names also pass a word filter before they ever reach the screen."],
  ["Does it work on a video call?", "Yes. Share the TV screen on Zoom, Meet, or Teams, and everyone else plays on their own phone wherever they are."],
];

export default function Page() {
  return (
    <div className="lp">
      <header className="lp-nav">
        <span className="lp-logo">🎉 FamParty</span>
        <nav>
          <a href="#games">Games</a>
          <a href="#how">How it works</a>
          <a href="#family">Family link</a>
          <a href="#faq">FAQ</a>
        </nav>
        <Link className="btn primary" href="/host">▶ Start a show</Link>
      </header>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-copy">
          <p className="eyebrow">ONE HOST · ONE SCREEN · EVERYONE PLAYS</p>
          <h1>The party game show that lives on your TV.</h1>
          <p className="lp-lede">Open FamParty on the TV, everyone joins on their phone with a QR code, and the room turns into a game show — emoji puzzles, two truths and a lie, outrageous opinions and all. No signup, no app, nothing to print.</p>
          <div className="lp-cta-row">
            <Link className="btn primary big lp-cta" href="/host">📱 Host a show — it's free</Link>
            <Link className="btn big lp-cta" href="/join">🎮 Join with a code</Link>
          </div>
          <p className="lp-micro">Free · No accounts · 3–12 players · Playing in under a minute</p>
          <div className="lp-avatars"><span>🦊</span><span>🐼</span><span>🦄</span><span>🐸</span><span>🦁</span><span>🐙</span><span>🦖</span><span>🦩</span></div>
        </div>

        <div className="lp-tv" aria-hidden="true">
          <div className="lp-tv-screen">
            <div className="lp-tv-top"><span>ROUND 3 / 10</span><span className="timer">⏱ 14s</span><span>9/11 answered</span></div>
            <div className="lp-tv-emoji">🍕🎉</div>
            <p className="lp-tv-q">What phrase is this?</p>
            <div className="lp-tv-choices">
              <span><b>A</b> Pizza Party</span><span><b>B</b> Movie Night</span>
              <span><b>C</b> Birthday Cake</span><span><b>D</b> Picnic Day</span>
            </div>
            <div className="lp-tv-players">
              <span>🦊 Mum ✅</span><span>🐼 Dad ✅</span><span>🦄 Zara …</span><span>🐸 Grandpa ✅</span>
            </div>
          </div>
          <div className="lp-tv-stand" />
          <div className="lp-phone" aria-hidden="true">
            <span className="lp-phone-emoji">🍕🎉</span>
            <span className="lp-phone-btn sel">A&nbsp; Pizza Party</span>
            <span className="lp-phone-btn">B&nbsp; Movie Night</span>
            <span className="lp-phone-btn">C&nbsp; Birthday Cake</span>
          </div>
        </div>
      </section>

      <div className="lp-strip">
        <span>📺 TV shows the game</span><span>📱 Phones are the controllers</span><span>🎛️ Host runs the pace</span><span>🚫 No signup, ever</span>
      </div>

      {/* HOW IT WORKS */}
      <section className="lp-section" id="how">
        <p className="eyebrow center">READY IN UNDER A MINUTE</p>
        <h2 className="lp-h2">Three steps. Zero instructions to read aloud.</h2>
        <div className="lp-steps">
          <div className="lp-step card">
            <span className="lp-step-num">1</span>
            <h3>Host creates a room</h3>
            <p className="sub">On your phone, tap Host a show. You get a room, and you run the whole night from that phone — start, pause, skip, reveal.</p>
          </div>
          <div className="lp-step card">
            <span className="lp-step-num">2</span>
            <h3>TV shows the code</h3>
            <p className="sub">Open the TV link on any big screen. It shows a giant QR code and room code — and nothing else. Guests scan and pick an avatar.</p>
          </div>
          <div className="lp-step card">
            <span className="lp-step-num">3</span>
            <h3>Everyone plays</h3>
            <p className="sub">Answers happen privately on phones. Reveals, scores and the winner's podium happen big, on the TV, where everyone can react together.</p>
          </div>
        </div>
        <div className="center"><Link className="btn primary big lp-cta-inline" href="/tv">📺 Open the TV display</Link></div>
      </section>

      {/* GAMES */}
      <section className="lp-section" id="games">
        <p className="eyebrow center">FIVE GAMES, ONE ROOM</p>
        <h2 className="lp-h2">Pick a game. The room stays the same.</h2>
        <p className="sub center lp-narrow">Every game uses the same lobby, avatars and scoreboard — learn one, you've learned them all. A full show is two or three games back to back.</p>
        <div className="lp-games">
          {GAMES.map((g) => (
            <article key={g.name} className="lp-game card">
              <span className="lp-game-icon">{g.icon}</span>
              <p className="lp-game-tag">{g.tag}</p>
              <h3>{g.name}</h3>
              <p className="sub">{g.blurb}</p>
              <p className="lp-game-mins">{g.mins}</p>
            </article>
          ))}
          <article className="lp-game card lp-game-cta">
            <h3>Your show starts in the lobby</h3>
            <p className="sub">Create a room, get everyone in, and pick the first game together.</p>
            <Link className="btn primary big" href="/host">▶ Create a room</Link>
          </article>
        </div>
      </section>

      {/* OCCASIONS */}
      <section className="lp-section">
        <p className="eyebrow center">WHEREVER PEOPLE GATHER</p>
        <h2 className="lp-h2">Made for the couch. Works anywhere.</h2>
        <div className="lp-occasions">
          <div className="lp-occ card"><span>🛋️</span><h3>Family night</h3><p className="sub">Kids, parents and grandparents in the same game, on the same screen. Spotlight stories become family legend by dessert.</p></div>
          <div className="lp-occ card"><span>🎂</span><h3>Birthdays & reunions</h3><p className="sub">Break the ice in the first five minutes. Anonymous answers in Finish It mean the quiet cousin can beat the loud uncle.</p></div>
          <div className="lp-occ card"><span>💻</span><h3>Teams & video calls</h3><p className="sub">Share the TV screen on your call; everyone plays on their own phone. Five warm minutes, no corporate cringe.</p></div>
        </div>
      </section>

      {/* FAMILY LINK */}
      <section className="lp-section" id="family">
        <div className="lp-family card">
          <div>
            <p className="eyebrow">THE PERMANENT FAMILY LINK</p>
            <h2 className="lp-h2 left">Your family comes back. So do your stories.</h2>
            <p className="sub">Play anonymously tonight, or create a family link and keep a roster of your people. True stories from Spotlight are saved (each person can say "don't save this"), scores accumulate, and next time, Remember This? turns last month's truths into tonight's game.</p>
            <ul className="lp-list">
              <li>👨‍👩‍👧 A roster, so "Mum 🦊" is Mum in every game and on every scoreboard</li>
              <li>🧠 Saved stories resurface as a game only your family can play</li>
              <li>🔑 Two links: one for playing, one for the owner to export or delete</li>
              <li>🤝 No accounts — the link is the key, and we say so plainly</li>
            </ul>
            <Link className="btn primary big lp-cta-inline" href="/family">Create your family link</Link>
          </div>
          <div className="lp-album" aria-hidden="true">
            <p className="eyebrow">FROM YOUR LAST SHOW</p>
            <div className="lp-memory"><span>🦊</span><p>“I once met a penguin.”<br /><small>— Mum · true story · saved</small></p></div>
            <div className="lp-memory"><span>🦄</span><p>“I can juggle three balls.”<br /><small>— Zara · true story · saved</small></p></div>
            <div className="lp-memory"><span>🐸</span><p>“I have never seen snow.”<br /><small>— Grandpa · the lie nobody spotted</small></p></div>
            <p className="lp-album-foot">🧠 Remember This? deals these back next time.</p>
          </div>
        </div>
      </section>

      {/* HOST PROMISE */}
      <section className="lp-section">
        <div className="lp-host">
          <div className="lp-remote" aria-hidden="true">
            <p className="eyebrow">HOST REMOTE</p>
            <p><strong>Round 3</strong> · 9/11 answered</p>
            <span className="lp-remote-btn">⏸ Pause</span>
            <span className="lp-remote-btn primary">Reveal answer →</span>
            <span className="lp-remote-btn">⏭ Skip round</span>
            <span className="lp-remote-btn">🙈 Hide on TV</span>
          </div>
          <div>
            <p className="eyebrow">YOU'RE THE HOST, NOT THE REFEREE</p>
            <h2 className="lp-h2 left">Run the whole show from your phone.</h2>
            <p className="sub">The TV never shows a button. Pace, pauses and reveals are yours: rescue a stalling round, hold a reveal while the room argues, quietly hide anything that shouldn't be on a family TV. You get to be in the moment instead of operating a laptop.</p>
            <Link className="btn big lp-cta-inline" href="/host">Try the host remote</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="lp-section" id="faq">
        <p className="eyebrow center">GOOD QUESTIONS</p>
        <h2 className="lp-h2">Before you ask</h2>
        <div className="lp-faq">
          {FAQS.map(([q, a]) => (
            <details key={q} className="lp-faq-item card">
              <summary>{q}</summary>
              <p className="sub">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="lp-section">
        <div className="lp-final card center">
          <div className="lp-avatars big"><span>🦊</span><span>🐼</span><span>🦄</span><span>🐸</span><span>🦁</span></div>
          <h2 className="lp-h2">The room is already together.<br />Give it a game.</h2>
          <p className="sub">Free. No signup. Playing in under a minute.</p>
          <Link className="btn primary big lp-cta-inline" href="/host">📱 Host a show</Link>
          <p className="lp-micro">On a phone instead? <Link href="/join">Join with a code →</Link></p>
        </div>
      </section>

      <footer className="lp-footer">
        <span>🎉 FamParty — one big screen, everyone plays.</span>
        <nav>
          <Link href="/host">Host</Link><Link href="/join">Join</Link><Link href="/tv">TV display</Link><Link href="/family">Family link</Link>
        </nav>
        <span className="lp-footer-note">No accounts · No payments · Family-safe content · Your family's data stays under your family link</span>
      </footer>
    </div>
  );
}
