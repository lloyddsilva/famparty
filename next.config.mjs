/** @type {import('next').NextConfig} */
export default {
  async headers() {
    return [
      {
        // Family links: noindex via header only (never robots.txt — crawlers must reach the header),
        // no referrer leakage, and these pages load no third-party scripts.
        source: "/f/:token*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
      {
        source: "/api/families/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ];
  },
};
