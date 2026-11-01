import { SITE_URL } from "../lib/siteConfig";

// Allow crawling everywhere. /f/* must stay reachable so crawlers can read
// the X-Robots-Tag: noindex header on family album pages — do not disallow it.
export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    ...(SITE_URL ? { sitemap: `${SITE_URL.replace(/\/$/, "")}/sitemap.xml` } : {}),
  };
}
