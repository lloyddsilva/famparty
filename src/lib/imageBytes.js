// Muse Image returns either base64 (data[].b64_json) or a signed URL
// (data[].url), depending on response_format. Resolve either to bytes, and
// never let a file be named .webp unless the bytes really are WebP.

export async function resolveImageBytes(item, fetchFn = fetch) {
  if (item?.b64_json) return Buffer.from(item.b64_json, "base64");
  if (item?.url) {
    const res = await fetchFn(item.url);
    if (!res.ok) throw new Error(`Signed image URL returned ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  }
  throw new Error("No image data (b64_json or signed URL) in the response.");
}

export function assertWebp(bytes, label = "image") {
  const isWebp = bytes.length > 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  if (!isWebp) {
    const kind = bytes[0] === 0x89 && bytes.toString("ascii", 1, 4) === "PNG" ? "PNG"
      : bytes[0] === 0xff && bytes[1] === 0xd8 ? "JPEG" : "unknown format";
    throw new Error(`Image for ${label} is ${kind}, not WebP — refusing to save it with a .webp name.`);
  }
  return bytes;
}
