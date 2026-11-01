// One place for site-wide legal/config values. Do not hardcode the future
// domain: famparty.com is not connected yet, so the base URL comes from env.

export const OPERATOR = "Hilly Shore Inc.";
export const OPERATOR_REGION = "California, United States";
export const GOVERNING_LAW = "California";

// TODO (Lloyd): supply the real contact address and set
// NEXT_PUBLIC_CONTACT_EMAIL in Vercel before the legal pages are final.
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";

// Canonical base URL for metadata/sitemap. Until famparty.com is connected,
// this is the live deployment host. Set NEXT_PUBLIC_SITE_URL when the real
// domain goes live and every canonical/sitemap entry follows.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://famparty.vercel.app";

export const LAST_UPDATED = "October 31, 2026";
