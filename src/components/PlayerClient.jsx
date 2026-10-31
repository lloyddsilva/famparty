"use client";

import { useEffect, useState } from "react";
import { AVATARS, SPOTLIGHT_STARTERS } from "../lib/questions";
import { useRoom, useCountdown } from "./useRoom";
import { Leaderboard, CHOICE_LABELS } from "./SharedViews";

export default function PlayerClient() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [creds, setCreds] = useState(null);
  const [memberJoin, setMemberJoin] = useState(null); // {memberId, familyToken}
  const [familyLinkedRoom, setFamilyLinkedRoom] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // spotlight prep
  const [texts, setTexts] = useState(["", "", ""]);
  const [lieIndex, setLieIndex] = useState(0);
  const [dontSave, setDontSave] = useState([false, false, false]);
  const [submitted, setSubmitted] = useState(false);
  // spectrum / finish / story
  const [pos, setPos] = useState(50);
  const [prediction, setPrediction] = useState("left");
  const [finishText, setFinishText] = useState("");
  const [storyText, setStoryText] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("code");
    if (c) setCode(c.toUpperCase());
    if (params.get("member") && params.get("family")) setMemberJoin({ memberId: params.get("member"), familyToken: params.get("family") });
    const savedCode = localStorage.getItem("famparty:playerCode");
    const savedToken = localStorage.getItem("famparty:playerToken");
    // A fresh ?code= (new QR scan) always wins over a stale saved room (item 3).
    if (savedCode && savedToken && !params.get("member") && (!c || c === savedCode)) {
      setCreds({ code: savedCode, playerToken: savedToken });
    }
  }, []);

  useEffect(() => {
    if (code.length !== 4) return;
    fetch(`/api/rooms/${code}/peek`).then((r) => r.json()).then((d) => setFamilyLinkedRoom(!!d.familyLinked)).catch(() => {});
  }, [code]);

  const { view, act, serverNow, gone } = useRoom(creds?.code, { role: "player", token: creds?.playerToken || "" });
  const seconds = useCountdown(view, serverNow);
  const me = view?.me;

  // Room expired or host removed us: clear saved credentials and offer rejoin (item 3).
  const kicked = !!view && creds && !me;
  useEffect(() => {
    if ((gone || kicked) && creds) {
      localStorage.removeItem("famparty:playerCode");
      localStorage.removeItem("famparty:playerToken");
      setError(gone ? "That room has ended. Join a new one below." : "The host removed you from that room.");
      setCreds(null);
    }
  }, [gone, kicked, creds]);

  async function join(e) {
    e.preventDefault();
    setBusy(true); setError("");
    const savedToken = localStorage.getItem("famparty:playerToken") || undefined;
    const payload = memberJoin ? { memberId: memberJoin.memberId, familyToken: memberJoin.familyToken } : { name, avatar, playerToken: savedToken };
    const res = await fetch(`/api/rooms/${code}/join`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    setBusy(false);
    if (!data.ok) return setError(data.error || "Could not join.");
    localStorage.setItem("famparty:playerCode", data.code);
    localStorage.setItem("famparty:playerToken", data.playerToken);
    setCreds({ code: data.code, playerToken: data.playerToken, playerId: data.playerId });
  }

  if (!creds) {
    return (
      <main className="shell">
        <form className="card" onSubmit={join}>
          <p className="eyebrow">JOIN THE SHOW</p>
          {memberJoin ? (
            <>
              <h2>Joining as a family member</h2>
              <p className="sub">Your name and avatar come from the family roster.</p>
              <label>Room code<input className="code-input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))} placeholder="ABCD" required /></label>
            </>
          ) : (
            <>
              <h2>Pick your avatar</h2>
              <label>Room code<input className="code-input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))} placeholder="ABCD" required /></label>
              <label>Your name<input value={name} onChange={(e) => setName(e.target.value.slice(0, 16))} placeholder="e.g. Alex" required /></label>
              <div className="avatar-grid">{AVATARS.map((a) => <button type="button" key={a} className={`avatar ${avatar === a ? "selected" : ""}`} onClick={() => setAvatar(a)}>{a}</button>)}</div>
            </>
          )}
          {familyLinkedRoom && <p className="error">💾 This room is linked to a family. Spotlight true statements and scores may save to the family roster — you can opt out per statement with "don't save this".</p>}
          {error && <p className="error">{error}</p>}
          <button className="btn primary big" disabled={busy}>{busy ? "Joining…" : "Join game"}</button>
        </form>
      </main>
    );
  }

  if (!view) return <main className="shell"><div className="card center">{error || "Connecting…"}</div></main>;
  const header = (
    <div className="me-head"><span className="me-avatar">{me?.avatar || avatar}</span><div><strong>{me?.name || name}</strong><div className="sub">Room {view.code} · {me?.score ?? 0} pts{me?.streak > 1 ? ` · 🔥 ${me.streak}` : ""}{view.familyLinked ? " · 💾 family saves on" : ""}</div></div></div>
  );

  return (
    <main className="shell">
      <div className="card">
        {header}

        {view.phase === "lobby" && <div className="center"><h3>You&apos;re in!</h3><p className="sub">Look at the big screen. The host picks a game and starts from their phone.</p><div className="player-grid">{view.players.map((p) => <div key={p.id} className="player-chip">{p.avatar} {p.name}</div>)}</div></div>}

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
                <p className="sub">Write two true things and one lie about you. Need a start? {SPOTLIGHT_STARTERS[Math.floor(Math.random() * SPOTLIGHT_STARTERS.length)]}</p>
                {texts.map((t, i) => (
                  <div key={i}>
                    <label>Statement {i + 1}<input value={t} maxLength={120} onChange={(e) => setTexts(texts.map((x, j) => j === i ? e.target.value : x))} placeholder={i === lieIndex ? "Your lie…" : "A truth…"} /></label>
                    <label style={{ display: "inline", fontWeight: 400 }}><input type="radio" style={{ width: "auto" }} name="lie" checked={lieIndex === i} onChange={() => setLieIndex(i)} /> This is my lie</label>{" "}
                    <label style={{ display: "inline", fontWeight: 400 }}><input type="checkbox" style={{ width: "auto" }} checked={dontSave[i]} onChange={(e) => setDontSave(dontSave.map((x, j) => j === i ? e.target.checked : x))} /> Don&apos;t save this</label>
                  </div>
                ))}
                {error && <p className="error">{error}</p>}
                <button className="btn primary big" onClick={async () => { const d = await act({ type: "SUBMIT_STATEMENTS", texts, lieIndex, dontSave }); if (d.ok) setSubmitted(true); else setError(d.error || "Could not submit."); }}>Submit statements</button>
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
                {error && <p className="error">{error}</p>}
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
                <button key={c.id} className="choice btn-choice" disabled={c.id === me?.id} onClick={() => act({ type: "VOTE", choice: c.id })}><b>{i + 1}</b>{c.text}{c.id === me?.id ? " (yours)" : ""}</button>
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
      </div>
    </main>
  );
}
