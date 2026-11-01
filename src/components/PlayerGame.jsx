"use client";

import { useState } from "react";
import { SPOTLIGHT_STARTERS } from "../lib/questions";
import { Leaderboard, CHOICE_LABELS } from "./SharedViews";

// The in-game phone view, shared by the player screen and the host's
// play-along screen. Props: view, act (player actions), me, seconds.
export default function PlayerGame({ view, act, me, seconds }) {
  const [texts, setTexts] = useState(["", "", ""]);
  const [submitted, setSubmitted] = useState(false);
  const [pos, setPos] = useState(50);
  const [prediction, setPrediction] = useState("left");
  const [finishText, setFinishText] = useState("");
  const [storyText, setStoryText] = useState("");
  const [localError, setLocalError] = useState("");
  const setError = setLocalError;

  if (me?.waiting && !["lobby", "howto", "finale"].includes(view.phase)) {
    return (
      <div className="center">
        <div className="big-emoji">👋</div>
        <h3 style={{ fontSize: "1.7rem" }}>You're in!</h3>
        <p className="sub" style={{ fontSize: "1.25rem" }}>You'll play from the next round.<br /><strong>Look at the TV.</strong></p>
      </div>
    );
  }

  return (
    <>
{view.phase === "lobby" && <div className="center"><h3 style={{ fontSize: "1.8rem" }}>You're in!</h3><p className="sub" style={{ fontSize: "1.3rem" }}><strong>Look at the TV.</strong><br />Waiting for {Math.max(0, (view.game === "spotlight" || view.game === "finishit" ? 3 : 2) - view.players.length)} more player(s) — the host will start the show.</p><div className="player-grid">{view.players.map((p) => <div key={p.id} className="player-chip">{p.avatar} {p.name}</div>)}</div></div>}
        {view.phase === "howto" && <div className="center"><div className="big-emoji">👀</div><h3 style={{ fontSize: "1.8rem" }}>Look at the TV</h3><p className="sub" style={{ fontSize: "1.25rem" }}>How to play is up there. Get ready…</p></div>}

{/* Emoji Decoder */}
{view.phase === "question" && view.question && (
  <>
    <p className="eyebrow center">ROUND {view.qIndex + 1} / {view.totalQuestions} · {view.paused ? "⏸ PAUSED" : `⏱ ${seconds ?? 20}s`}</p>
    <div className="big-emoji center">{view.question.emoji}</div>
    {view.myAnswer === null ? (
      <div className="choices">{view.question.choices.map((c, i) => <button key={c} className="choice btn-choice" onClick={() => act({ type: "ANSWER", choice: i })}><b>{CHOICE_LABELS[i]}</b>{c}</button>)}</div>
    ) : <p className="center sub">✅ Answer locked in. Waiting for everyone else…</p>}
  </>
)}
{view.phase === "reveal" && view.question && (
  <div className="center"><div className="big-emoji">{view.question.emoji}</div>
    {me?.lastCorrect ? <h3>✅ Correct! +{me.lastPoints} pts</h3> : <h3>✖ Not quite</h3>}
    <p className="sub">Answer: <strong>{view.question.answer}</strong></p></div>
)}

{/* Spotlight prep */}
{view.phase === "prep" && (
  <>
    <p className="eyebrow center">SPOTLIGHT · YOUR TURN TO WRITE</p>
    {submitted || me?.ready ? <div className="center"><h3>✅ Statements in!</h3><p className="sub">The host will start when everyone is ready. Anyone unfinished just watches.</p></div>
    : me?.watching ? <div className="center"><h3>👀 You&apos;re just watching</h3><p className="sub">You can still vote on everyone else&apos;s lie.</p></div>
    : (
      <>
        <p className="sub">Need a start? {SPOTLIGHT_STARTERS[0]}</p>
        {["A true thing", "Another true thing", "Your lie"].map((label, i) => (
          <label key={label}>{label}<input value={texts[i]} maxLength={120} onChange={(e) => setTexts(texts.map((x, j) => j === i ? e.target.value : x))} placeholder={i === 2 ? "Make it plain…" : "Add a detail…"} /></label>
        ))}
        {localError && <p className="error">{localError}</p>}
        <button className="btn primary big" onClick={async () => { const d = await act({ type: "SUBMIT_STATEMENTS", texts, lieIndex: 2, dontSave: [false, false, false] }); if (d.ok) setSubmitted(true); else setError(d.error || "Could not submit."); }}>Submit statements</button>
        <button className="btn big" onClick={() => act({ type: "SET_WATCH" })}>👀 Just watch instead</button>
      </>
    )}
  </>
)}

{/* Spotlight play */}
{view.phase === "spotlight" && view.spotlight && (
  view.iAmFeatured
    ? <div className="center"><h3>🌟 You&apos;re in the spotlight!</h3><p className="sub">Keep a straight face — everyone is guessing your lie.</p></div>
    : <>
        <p className="eyebrow center">{view.spotlight.avatar} {view.spotlight.name} · ⏱ {seconds ?? 30}s</p>
        <h3 className="center">Which one is the lie?</h3>
        {view.myVote === null || view.myVote === undefined ? (
          <div className="choices">{view.spotlight.statements.map((s, i) => <button key={i} className="choice btn-choice" onClick={() => act({ type: "VOTE", choice: i })}><b>{CHOICE_LABELS[i]}</b>{s}</button>)}</div>
        ) : <p className="center sub">✅ Vote in. Waiting for the reveal…</p>}
      </>
)}
{view.phase === "spotlightReveal" && view.spotlight && (
  <div className="center"><h3>{view.iAmFeatured ? `You fooled them for +${me?.lastPoints ?? 0} pts!` : me?.lastCorrect ? `✅ You spotted it! +${me.lastPoints}` : "✖ It fooled you!"}</h3><p className="sub">The lie was: <strong>{view.spotlight.statements[view.spotlight.liePosition]}</strong></p></div>
)}
{view.phase === "story" && (
  <div className="center"><div className="big-emoji">🎤</div><h3>{view.iAmFeatured ? "Your 30 seconds — tell the real story!" : `${view.spotlight?.name} is telling the story…`}</h3><p className="sub">⏱ {seconds ?? 30}s · No typing needed — just talk.</p></div>
)}
{view.phase === "storySave" && (
  view.iAmFeatured ? (
    <>
      <h3 className="center">Save a one-line version?</h3>
      <label>Optional — for the family album<input value={storyText} maxLength={140} onChange={(e) => setStoryText(e.target.value)} placeholder="e.g. Locked myself out in my pyjamas, twice" /></label>
      <button className="btn primary big" onClick={() => act({ type: "STORY_SAVE", text: storyText })}>Save line</button>
      <p className="sub center">Or do nothing — the host will move on.</p>
    </>
  ) : <div className="center"><h3>Next player soon…</h3><p className="sub">{view.spotlight?.storyLine ? `Saved: “${view.spotlight.storyLine}”` : "Waiting for the host."}</p></div>
)}

{/* Spectrum */}
{view.phase === "spectrum" && view.spectrum && (
  <>
    <p className="eyebrow center">SPECTRUM · ROUND {view.qIndex + 1} · ⏱ {seconds ?? 20}s</p>
    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}><span>⬅ {view.spectrum.left}</span><span>{view.spectrum.right} ➡</span></div>
    {view.myPlacement === null ? (
      <>
        <input type="range" min="0" max="100" value={pos} onChange={(e) => setPos(Number(e.target.value))} style={{ width: "100%", margin: "22px 0" }} />
        <p className="center sub">Where will most people land?</p>
        <div className="choices" style={{ gridTemplateColumns: "1fr 1fr", display: "grid" }}>
          <button className={`choice btn-choice ${prediction === "left" ? "correct" : ""}`} onClick={() => setPrediction("left")}>{view.spectrum.left}</button>
          <button className={`choice btn-choice ${prediction === "right" ? "correct" : ""}`} onClick={() => setPrediction("right")}>{view.spectrum.right}</button>
        </div>
        <button className="btn primary big" onClick={() => act({ type: "PLACE", pos, prediction })}>Lock it in</button>
      </>
    ) : <p className="center sub">✅ Placed. Waiting for the big reveal…</p>}
  </>
)}
{view.phase === "spectrumReveal" && <div className="center"><h3>{me?.lastCorrect ? "🔮 You read the room!" : "The crowd went the other way"}</h3><p className="sub">+{me?.lastPoints ?? 0} pts · Look at the TV — who is the outlier?</p></div>}

{/* Finish It */}
{view.phase === "finishWrite" && view.finishit && (
  <>
    <p className="eyebrow center">FINISH IT · ROUND {view.qIndex + 1} · ⏱ {seconds ?? 60}s</p>
    <h3 className="center">{view.finishit.prompt.replace("___", "________")}</h3>
    {me?.hasAnswer ? <p className="center sub">✅ Answer in. Waiting for everyone…</p> : (
      <>
        <label>Your ending (80 characters)<input value={finishText} maxLength={80} onChange={(e) => setFinishText(e.target.value)} placeholder="Make it funny…" /></label>
        <button className="btn primary big" onClick={async () => { const d = await act({ type: "FINISH_SUBMIT", text: finishText }); if (!d.ok) setError(d.error || "Could not submit."); }}>Submit</button>
        {localError && <p className="error">{localError}</p>}
      </>
    )}
  </>
)}
{view.phase === "finishPresent" && view.finishit && (
  <div className="center"><div className="big-emoji">👀</div><h3>Answers are going up on the TV…</h3><p className="sub">Read them all first — voting opens once every answer has had its moment.</p></div>
)}
{view.phase === "finishVote" && view.finishit && (
  <>
    <h3 className="center">Vote for the funniest — not your own</h3>
    {view.myVote === null || view.myVote === undefined ? (
      <div className="choices">{view.finishit.candidates.map((c, i) => (
        <button key={c.id} className="choice btn-choice" disabled={c.mine} onClick={() => act({ type: "VOTE", choice: c.id })}><b>{i + 1}</b>{c.text}{c.mine ? " (yours)" : ""}</button>
      ))}</div>
    ) : <p className="center sub">✅ Vote in.</p>}
    <p className="sub center">Answers are anonymous until the reveal.</p>
  </>
)}
{view.phase === "finishReveal" && <div className="center"><h3>You earned +{me?.lastPoints ?? 0} pts</h3><p className="sub">Authors are on the TV now.</p></div>}

{/* Remember This? */}
{view.phase === "remember" && view.remember && (
  <>
    <p className="eyebrow center">REMEMBER THIS? · ⏱ {seconds ?? 30}s</p>
    <h3 className="center">“{view.remember.text}”</h3>
    <p className="center sub">Who wrote this true statement?</p>
    {view.myVote === null || view.myVote === undefined ? (
      <div className="choices">{view.remember.choices.map((c) => <button key={c.memberId} className="choice btn-choice" onClick={() => act({ type: "VOTE", choice: c.memberId })}>{c.avatar} {c.name}</button>)}</div>
    ) : <p className="center sub">✅ Guess in.</p>}
  </>
)}
{view.phase === "rememberReveal" && view.remember && (
  <div className="center"><h3>{me?.lastCorrect ? `✅ Right! +${me.lastPoints}` : "Not this time"}</h3><p className="sub">It was <strong>{view.remember.writerName}</strong>.</p></div>
)}

{(view.phase === "scores" || view.phase === "finale") && (
  <>
    <h3 className="center">{view.phase === "finale" ? "🎉 Final standings" : "🏆 Leaderboard"}</h3>
    <Leaderboard players={view.players} meId={me?.id} />
    {view.phase === "scores" && <p className="sub center">Waiting for the host…</p>}
  </>
)}

    </>
  );
}
