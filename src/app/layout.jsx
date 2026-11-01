import "./globals.css";
import { SITE_URL } from "../lib/siteConfig";

const description = "The party game show that runs on your TV and everyone's phones. Host from your phone, guests join with a QR code — no accounts, no app, 3–12 players.";

export const metadata = {
  ...(SITE_URL ? { metadataBase: new URL(SITE_URL) } : {}),
  title: { default: "FamParty — Party with the fam.", template: "%s" },
  description,
  ...(SITE_URL ? { alternates: { canonical: "/" } } : {}),
  openGraph: {
    title: "FamParty — Party with the fam.",
    description,
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "FamParty — one big screen, everyone plays" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FamParty — Party with the fam.",
    description,
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
    other: [{ rel: "icon", url: "/icon-192.png", sizes: "192x192" }, { rel: "icon", url: "/icon-512.png", sizes: "512x512" }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
