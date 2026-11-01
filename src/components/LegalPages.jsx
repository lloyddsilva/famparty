import Link from "next/link";
import { SiteHeader, SiteFooter } from "./SiteChrome";
import { CONTACT_EMAIL, LAST_UPDATED, OPERATOR } from "../lib/siteConfig";

function Shell({ title, children }) {
  return (
    <>
      <SiteHeader />
      <main className="mkt-narrow legal">
        <h1>{title}</h1>
        <p className="sub">Last updated: {LAST_UPDATED} · Run by {OPERATOR}</p>
        {children}
        <ContactBlock />
      </main>
      <SiteFooter />
    </>
  );
}

export function ContactBlock() {
  return (
    <section>
      <h2>Contact</h2>
      {CONTACT_EMAIL
        ? <p>Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
        : <p>Email: <em>contact address to be added before launch — this page is not final until it appears here.</em></p>}
    </section>
  );
}

const H = ({ children }) => <h2 style={{ marginTop: 34 }}>{children}</h2>;
const P = ({ children }) => <p style={{ lineHeight: 1.65, color: "var(--body)" }}>{children}</p>;

export function PrivacyPage() {
  return (
    <Shell title="Privacy Policy">
      <P>FamParty is a party game with no accounts. This policy says what the service stores, why, and how to get it deleted. It is written from how the app actually works.</P>

      <H>What we don't do</H>
      <P>There are no accounts, sign-ups, payments, ads, analytics, or tracking cookies. The app sets no cookies. Fonts are self-hosted, so loading a page makes no font requests to third parties.</P>

      <H>What your browser stores</H>
      <P>Your browser's localStorage holds room codes and host/player tokens so you can rejoin a room after a refresh or a locked phone. Clear your browser storage and they're gone; the room itself expires on its own.</P>

      <H>Live rooms (kept 2 hours)</H>
      <P>While a game is live, our room store (Upstash Redis) holds the things a game needs: player names and avatars, answers and votes, typed statements and answers, and scores. Room keys expire automatically after 2 hours. Nothing from a live room is kept after that, unless the room belongs to a family album (below).</P>

      <H>Nothing is saved beyond the game</H>
      <P>There are currently no accounts and no saved stories or scores. When a room ends or expires, its names, answers, statements and scores are gone. (An earlier version of FamParty offered an optional family album that kept saved statements for 60 days; that feature is currently switched off, and no new albums can be created.)</P>

      <H>Room codes and host links</H>
      <P>A room code lets anyone who has it join that room while it's live, and a host link lets its holder run that room. Both stop working when the room expires. Share them the way you'd share a meeting link.</P>

      <H>IP addresses and hosting logs</H>
      <P>We use IP addresses for short-lived rate limiting (stored briefly in Redis to stop abuse). Our host, Vercel, may also keep ordinary request logs for a limited time. Other processor: Upstash (rooms and albums).</P>

      <H>AI</H>
      <P>Player input is never sent to any AI model. Meta's models were used at build time to help write this app; the running app makes no model calls and holds no model API keys. Game content packs are currently hand-written starters, awaiting the offline generation run and human review described on the About page.</P>

      <H>Your rights</H>
      <P>Because there are no accounts and rooms delete themselves within 2 hours, there is usually nothing left to access or delete by the time you'd ask. For anything else — including requests from California or EEA/UK residents — use the contact email below and we'll respond. We don't sell or share personal data.</P>

      <H>Children</H>
      <P>FamParty is meant to be run by an adult host, and it isn't directed at children using it alone. Children play with a parent or guardian in the room and should use a nickname, not personal details. We don't verify ages. A parent or guardian can ask us about data via the contact email; live-room data deletes itself within 2 hours regardless.</P>
    </Shell>
  );
}

export function TermsPage() {
  return (
    <Shell title="Terms of Service">
      <P>Short version: it's a free party game with no accounts. Be kind, don't abuse it, and export anything you want to keep.</P>

      <H>What FamParty is</H>
      <P>FamParty is a free service provided as is. It may change, break, or stop at any time. There are no accounts and no payments.</P>

      <H>Who can use it</H>
      <P>Hosts must be adults. Children may only play with a parent or guardian in the room.</P>

      <H>Your content</H>
      <P>You're responsible for what you type: names, statements, answers and stories. Don't post anything illegal, hateful, or sexual, and don't share private details about someone else without their consent. Hosts can hide any player's words from the TV or remove them from the room at any time.</P>

      <H>Don't abuse the service</H>
      <P>Don't scrape, overload, or try to get around rate limits or room codes, and don't use FamParty to bother people.</P>

      <H>Rooms and availability</H>
      <P>Rooms are temporary: they expire after about 2 hours, and scores and statements go with them. We don't guarantee the service will always be available.</P>

      <H>Game content</H>
      <P>Game questions and prompts in the current build are hand-written starter packs. They will be regenerated with AI assistance offline and human-reviewed before any release that claims otherwise. Third-party material (fonts, the word list) is credited in our third-party notices.</P>

      <H>Warranties and liability</H>
      <P>The service is provided "as is" without warranties of any kind. To the extent the law allows, {OPERATOR} isn't liable for indirect or incidental damages arising from use of the service. Nothing here limits liability that can't be limited by law.</P>

      <H>Changes and governing law</H>
      <P>We may update these terms; the "last updated" date will change when we do, and continuing to play means accepting the new terms. These terms are governed by the laws of California, United States.</P>
    </Shell>
  );
}

export function AboutPage() {
  return (
    <Shell title="About FamParty">
      <P>FamParty is a party game show for one big screen and everyone's phones. A host runs the show from their phone, the TV only displays, and players join with a QR code — no accounts, no app, nothing to print. It was built for families first, and works just as well for friends and small teams.</P>

      <H>Who runs it</H>
      <P>FamParty is run by {OPERATOR}, based in California, United States.</P>

      <H>How it was built</H>
      <P>Built with OpenCode connected to Meta's Model API, using Muse Wonder 1.0 — built during this hackathon (first commit: October 31, 2026). The running app makes no live model calls.</P>

      <H>How the content is made</H>
      <P>Today's facts: the content packs in the current build are hand-written starters — the Muse Spark / Muse Image generation run has not happened yet, and no pack is marked reviewed. When the run happens, content will be generated once, offline (scripts, prompts and raw outputs committed in the repository), and a pack will only be marked reviewed after a person has read every line.</P>
    </Shell>
  );
}
