"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Polls room state ~1s (500ms during an active question), sending the last
 * version so unchanged polls cost a tiny response. Pauses while hidden,
 * fetches immediately when visible again. Timers are drawn from the
 * server-sent deadline + serverNow offset — no client clock trust.
 */
export function useRoom(code, { role = "display", token = "" } = {}) {
  const [view, setView] = useState(null);
  const [error, setError] = useState("");
  const [serverOffset, setServerOffset] = useState(0);
  const versionRef = useRef(-1);

  const fetchNow = useCallback(async () => {
    if (!code) return;
    try {
      const qs = new URLSearchParams({ v: String(versionRef.current), role, token });
      const res = await fetch(`/api/rooms/${code}/state?${qs}`, { cache: "no-store" });
      const data = await res.json();
      if (!data.ok) { setError(data.error || "Room unavailable."); return; }
      setServerOffset(data.serverNow - Date.now());
      if (!data.unchanged && data.view) {
        versionRef.current = data.view.version;
        setView(data.view);
        setError("");
      }
    } catch {
      setError("Connection problem — retrying…");
    }
  }, [code, role, token]);

  useEffect(() => {
    if (!code) return;
    let timer;
    let stopped = false;
    const loop = async () => {
      if (stopped) return;
      if (!document.hidden) await fetchNow();
      const active = view?.phase === "question";
      timer = setTimeout(loop, active ? 500 : 1000);
    };
    loop();
    const onVis = () => { if (!document.hidden) fetchNow(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { stopped = true; clearTimeout(timer); document.removeEventListener("visibilitychange", onVis); };
  }, [code, fetchNow, view?.phase]);

  const act = useCallback(async (action) => {
    const res = await fetch(`/api/rooms/${code}/actions`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...action }),
    });
    const data = await res.json().catch(() => ({}));
    await fetchNow();
    return data;
  }, [code, token, fetchNow]);

  return { view, error, act, refresh: fetchNow, serverNow: Date.now() + serverOffset };
}

export function useCountdown(view, serverNow) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 200);
    return () => clearInterval(id);
  }, []);
  if (!view?.deadline || view.paused) return null;
  return Math.max(0, Math.ceil((view.deadline - serverNow) / 1000));
}
