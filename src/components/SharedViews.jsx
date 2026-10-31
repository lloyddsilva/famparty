"use client";

export const CHOICE_LABELS = ["A", "B", "C", "D"];

export function Leaderboard({ players, meId }) {
  const max = Math.max(1, ...players.map((p) => p.score));
  return (
    <div className="leaderboard">
      {players.map((p, i) => (
        <div key={p.id} className={`lb-row ${p.id === meId ? "me" : ""}`}>
          <span className="rank">{i + 1}</span>
          <span className="lb-avatar">{p.avatar}</span>
          <span className="lb-name">{p.name}{!p.connected ? " · away" : ""}</span>
          <span className="lb-bar"><span style={{ width: `${(p.score / max) * 100}%` }} /></span>
          <strong>{p.score}</strong>
        </div>
      ))}
    </div>
  );
}

export function Podium({ players }) {
  return (
    <div className="podium">
      {players.slice(0, 3).map((p, i) => (
        <div key={p.id} className={`podium-spot p${i}`}>
          <span className="podium-avatar">{p.avatar}</span>
          <strong>{p.name}</strong><span>{p.score} pts</span>
          <span className="medal">{["🥇", "🥈", "🥉"][i]}</span>
        </div>
      ))}
    </div>
  );
}
