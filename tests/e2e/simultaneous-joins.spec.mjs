import { test, expect, request } from "@playwright/test";

// Item 3 regression: everyone taps "I'm in" at the same moment, all asking
// for the same animal. The server assigns a free animal atomically —
// nobody may see "That avatar is taken".
test("12 simultaneous joins with the same requested animal all get in", async ({ baseURL }) => {
  const api = await request.newContext({ baseURL });
  const room = await (await api.fetch("/api/rooms", { method: "POST" })).json();
  expect(room.ok).toBeTruthy();
  const joins = await Promise.all(
    Array.from({ length: 12 }, (_, i) =>
      api.fetch(`/api/rooms/${room.code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify({ name: `Sim${i + 1}`, avatar: "🦊" }),
      }).then((r) => r.json()),
    ),
  );
  for (const j of joins) expect(j.ok, JSON.stringify(j)).toBeTruthy();
  const avatars = joins.map((j) => j.avatar);
  expect(new Set(avatars).size).toBe(12);
  const thirteenth = await api.fetch(`/api/rooms/${room.code}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: JSON.stringify({ name: "Extra", avatar: "🦊" }),
  }).then((r) => r.json());
  expect(thirteenth.ok).toBeFalsy();
  await api.dispose();
  console.log("12 SIMULTANEOUS JOINS OK · distinct animals:", avatars.join(" "));
});
