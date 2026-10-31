import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveImageBytes, assertWebp } from "./imageBytes.js";

const webp = Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBP"), Buffer.from("data")]);
const png = Buffer.concat([Buffer.from([0x89]), Buffer.from("PNG"), Buffer.alloc(8)]);

test("b64_json resolves to bytes and passes the WebP check", async () => {
  const bytes = await resolveImageBytes({ b64_json: webp.toString("base64") });
  assert.equal(assertWebp(bytes).length, webp.length);
});

test("signed URL is downloaded and checked", async () => {
  const fakeFetch = async () => ({ ok: true, arrayBuffer: async () => webp.buffer.slice(webp.byteOffset, webp.byteOffset + webp.length) });
  const bytes = await resolveImageBytes({ url: "https://example.invalid/signed" }, fakeFetch);
  assert.equal(assertWebp(bytes).length, webp.length);
});

test("non-WebP bytes are rejected, missing data errors", async () => {
  assert.throws(() => assertWebp(png, "card"), /not WebP/);
  await assert.rejects(() => resolveImageBytes({}), /No image data/);
  await assert.rejects(() => resolveImageBytes({ url: "x" }, async () => ({ ok: false, status: 403 })), /403/);
});
