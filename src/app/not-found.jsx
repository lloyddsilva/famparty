import Link from "next/link";
import { SiteHeader, SiteFooter } from "../components/SiteChrome";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mkt center" style={{ paddingTop: 70, paddingBottom: 40 }}>
        <div style={{ fontSize: 72 }}>🦊</div>
        <h1 style={{ fontSize: "3rem" }}>This room doesn't exist.</h1>
        <p className="sub" style={{ maxWidth: 460, margin: "0 auto" }}>The page may have moved, or the room code has expired — rooms only live for a couple of hours.</p>
        <div className="lp-cta-row">
          <Link className="btn primary lp-cta-main" href="/">Back to the party</Link>
          <Link className="btn lp-cta-ghost" href="/join">Join with a code</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
