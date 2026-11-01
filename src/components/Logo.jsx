// FamParty logo — direction 3c "Split sticker" (design handoff, logo/LOGO.md).
// Inline SVG so the wordmark text renders in the site's self-hosted Gelasio.
// Source SVGs (metadata stripped) live in public/logo/.

const SPRINKLES = (
  <>
    <rect x="306" y="10" width="14" height="5" rx="2.5" fill="#ff5c8a" transform="rotate(-35 313 12)"></rect>
    <circle cx="330" cy="28" r="5" fill="#6c4bff"></circle>
    <rect x="322" y="46" width="8" height="8" rx="2" fill="#ff5c8a" transform="rotate(20 326 50)"></rect>
    <circle cx="14" cy="100" r="4" fill="#ff5c8a"></circle>
    <rect x="6" y="82" width="12" height="4.5" rx="2" fill="#ffd166" stroke="#22223b" strokeWidth="1.2" transform="rotate(30 12 84)"></rect>
  </>
);

function Lockup({ famFill, partyOutline, sprinkles, title }) {
  return (
    <svg viewBox="0 0 350 120" role="img" aria-label={title || "FamParty"} style={{ display: "block", width: "100%", height: "auto" }}>
      <g transform="rotate(-3 170 60)">
        <rect x="12" y="28" width="134" height="64" rx="32" fill={famFill}></rect>
        <text x="79" y="73" textAnchor="middle" fontFamily="Gelasio, Georgia, serif" fontWeight="700" fontStyle="italic" fontSize="40" letterSpacing="-1" fill="#fff">Fam</text>
      </g>
      <g transform="rotate(4 236 58)">
        <rect x="140" y="26" width="186" height="64" rx="32" fill="#ffd166"></rect>
        {partyOutline && <rect x="142.5" y="28.5" width="181" height="59" rx="29.5" fill="none" stroke="#22223b" strokeWidth="2.5"></rect>}
        <text x="233" y="71" textAnchor="middle" fontFamily="Gelasio, Georgia, serif" fontWeight="700" fontSize="40" letterSpacing="-1" fill="#22223b">Party</text>
      </g>
      {sprinkles && SPRINKLES}
    </svg>
  );
}

/** Default lockup for light backgrounds. */
export function LogoPrimary({ width = 140 }) {
  return <span style={{ display: "inline-block", width }}><Lockup famFill="#6c4bff" partyOutline sprinkles /></span>;
}

/** Tight spaces (nav under 900px per the handoff). */
export function LogoCompact({ width = 118 }) {
  return <span style={{ display: "inline-block", width }}><Lockup famFill="#6c4bff" partyOutline /></span>;
}

/** Dark grounds: footer, TV lobby. Violet lifted, no outline. */
export function LogoReversed({ width = 175 }) {
  return (
    <span style={{ display: "inline-block", width }}>
      <svg viewBox="0 0 350 120" role="img" aria-label="FamParty" style={{ display: "block", width: "100%", height: "auto" }}>
        <g transform="rotate(-3 170 60)">
          <rect x="12" y="28" width="134" height="64" rx="32" fill="#8f73ff"></rect>
          <text x="79" y="73" textAnchor="middle" fontFamily="Gelasio, Georgia, serif" fontWeight="700" fontStyle="italic" fontSize="40" letterSpacing="-1" fill="#fff">Fam</text>
        </g>
        <g transform="rotate(4 236 58)">
          <rect x="140" y="26" width="186" height="64" rx="32" fill="#ffd166"></rect>
          <text x="233" y="71" textAnchor="middle" fontFamily="Gelasio, Georgia, serif" fontWeight="700" fontSize="40" letterSpacing="-1" fill="#22223b">Party</text>
        </g>
        <rect x="306" y="10" width="14" height="5" rx="2.5" fill="#ff5c8a" transform="rotate(-35 313 12)"></rect>
        <circle cx="330" cy="28" r="5" fill="#8f73ff"></circle>
        <rect x="322" y="46" width="8" height="8" rx="2" fill="#ff5c8a" transform="rotate(20 326 50)"></rect>
        <circle cx="14" cy="100" r="4" fill="#ff5c8a"></circle>
        <rect x="6" y="82" width="12" height="4.5" rx="2" fill="#ffd166" transform="rotate(30 12 84)"></rect>
      </svg>
    </span>
  );
}

/** Square mark (80 viewBox) on a white tile by default. */
export function LogoMark({ size = 32, tile = true }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} role="img" aria-label="FamParty" style={{ display: "block" }}>
      {tile && <rect width="80" height="80" rx="20" fill="#fff"></rect>}
      <g transform="rotate(-10 30 40)">
        <rect x="8" y="26" width="30" height="28" rx="14" fill="#6c4bff"></rect>
        <text x="23" y="47" textAnchor="middle" fontFamily="Gelasio, Georgia, serif" fontWeight="700" fontStyle="italic" fontSize="19" fill="#fff">F</text>
      </g>
      <g transform="rotate(6 54 40)">
        <rect x="38" y="26" width="34" height="28" rx="14" fill="#ffd166"></rect>
        <rect x="39.5" y="27.5" width="31" height="25" rx="12.5" fill="none" stroke="#22223b" strokeWidth="1.8"></rect>
        <text x="55" y="47" textAnchor="middle" fontFamily="Gelasio, Georgia, serif" fontWeight="700" fontSize="19" fill="#22223b">P</text>
      </g>
      <circle cx="68" cy="14" r="3.5" fill="#ff5c8a"></circle>
      <circle cx="12" cy="66" r="3" fill="#ff5c8a"></circle>
    </svg>
  );
}
