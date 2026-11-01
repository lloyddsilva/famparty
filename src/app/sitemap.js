import { GAMES, OCCASIONS, POSTS } from "../lib/siteContent";
import { SITE_URL } from "../lib/siteConfig";

// Marketing, game, occasion, blog and legal pages only — never app surfaces
// (/host, /join, /tv) and never family albums (/f/*).
export default function sitemap() {
  const base = SITE_URL.replace(/\/$/, "");
  const paths = [
    "", "/games", "/how-it-works", "/family", "/blog", "/privacy", "/terms", "/about",
    ...GAMES.map((g) => `/games/${g.slug}`),
    ...OCCASIONS.map((o) => `/for/${o.slug}`),
    ...POSTS.map((p) => `/blog/${p.slug}`),
  ];
  return paths.map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: new Date("2026-10-31"),
  }));
}
