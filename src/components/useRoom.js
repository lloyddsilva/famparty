"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Polls room state every 1s, sending the last version so unchanged polls cost a
 * tiny response. The player token travels in a header (never the URL); the host
 * token is never sent on polls at all — only with host actions (review item 8).
 * Presence is refreshed at most every ~5s, and unchanged responses carry fresh
 * presence so "away" labels stay correct (item 9). A 404 sets `gone` so callers
 * can clear saved credentials and recover (item 3).
 */
export function useRoom(code, { role = "display", token = "", pollToken = null } = {}) {
  const [view, setView] = useState(null);
  const [error, setError] = useState("");
  const [gone, setGone] = useState(false);
  const [serverOffset, setServerOffset] = useState(0);
  const versionRef = useRef(-1);
  const answersDigestRef = useRef("");
  const lastPresenceRef = useRef(0);
  const effectivePollToken = pollToken ?? (role === "player" ? token : "");

  const fetchNow = useCallback(async () => {
    if (!code) return;
    try {
      const now = Date.now();
      const sendPresence = role === "player" && now - lastPresenceRef.current > 4500;
      if (sendPresence) lastPresenceRef.current = now;
      const qs = new URLSearchParams({ v: String(versionRef.current), role, ad: answersDigestRef.current });
      const res = await fetch(`/api/rooms/${code}/state?${qs}`, {
        cache: "no-store",
        headers: {
          ...(effectivePollToken ? { "x-room-token": effectivePollToken } : {}),
          ...(sendPresence ? { "x-presence": "1" } : {}),
        },
      });
      const data = await res.json();
      if (res.status === 404) { setGone(true); setError(data.error || "Room not found."); return; }
      if (!data.ok) { setError(data.error || "Room unavailable."); return; }
      setServerOffset(data.serverNow - Date.now());
      if (data.unchanged) {
        if (data.presence) {
          setView((v) => v ? { ...v, players: v.players.map((p) => ({ ...p, connected: data.presence[p.id] ? data.serverNow - data.presence[p.id] < 6000 : false })) } : v);
        }
        return;
      }
      if (data.view) {
        versionRef.current = data.view.version;
        answersDigestRef.current = data.view.answersDigest ?? "";
        setView(data.view);
        setError("");
        setGone(false);
      }
    } catch {
      setError("Connection problem — retrying…");
    }
  }, [code, role, effectivePollToken]);

  useEffect(() => {
    if (!code) return;
    let timer;
    let stopped = false;
    const loop = async () => {
      if (stopped) return;
      if (!document.hidden) await fetchNow();
      timer = setTimeout(loop, 1000);
    };
    loop();
    const onVis = () => { if (!document.hidden) fetchNow(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { stopped = true; clearTimeout(timer); document.removeEventListener("visibilitychange", onVis); };
  }, [code, fetchNow]);

  const act = useCallback(async (action) => {
    const res = await fetch(`/api/rooms/${code}/actions`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...action }),
    });
    const data = await res.json().catch(() => ({}));
    await fetchNow();
    return data;
  }, [code, token, fetchNow]);

  return { view, error, gone, act, refresh: fetchNow, serverNow: Date.now() + serverOffset };
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
