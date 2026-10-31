import "./globals.css";

export const metadata = {
  title: "FamParty — Emoji Decoder",
  description: "One big screen, everyone plays on their phone. No signup, just a room code.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
