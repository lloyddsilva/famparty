import "./globals.css";

export const metadata = {
  title: "Family Game Show — Emoji Pictionary",
  description: "One big screen, everyone plays on their phone. No signup.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
