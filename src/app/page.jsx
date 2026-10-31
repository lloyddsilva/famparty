import Link from "next/link";

export default function Page() {
  return (
    <main className="shell">
      <div className="hero card">
        <p className="eyebrow">ONE BIG SCREEN · EVERYONE PLAYS</p>
        <h1>FamParty</h1>
        <p className="sub">Bonding games for family, friends and teams. The host runs the show from their phone, the TV just displays, and everyone else plays on their phone with a room code. No signup, no app.</p>
        <div className="hero-actions">
          <Link className="btn primary big" href="/host">📱 Host a show (on your phone)</Link>
          <Link className="btn big" href="/join">🎮 Join with a code (on your phone)</Link>
          <Link className="btn big" href="/tv">📺 Open the TV display</Link>
          <Link className="btn big" href="/family">👨‍👩‍👧 Create a permanent family link</Link>
        </div>
        <ol className="steps">
          <li>Host creates a room on their phone</li>
          <li>TV opens the display link — it only shows the game</li>
          <li>Players scan the QR code, pick an avatar, and play</li>
        </ol>
      </div>
    </main>
  );
}
