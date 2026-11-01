"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [code, setCode] = useState("");
  const router = useRouter();
  return (
    <main className="shell">
      <form className="card center" onSubmit={(e) => { e.preventDefault(); if (code.length === 4) router.push(`/tv/${code}`); }}>
        <p className="eyebrow">TV DISPLAY</p>
        <h2>Enter the room code</h2>
        <p className="sub">The host creates the room on their phone and tells you the code. This screen only displays the game.</p>
        <input className="code-input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))} placeholder="ABCD" required />
        <button className="btn primary big">Open display</button>
      </form>
    </main>
  );
}
