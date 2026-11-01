import Link from "next/link";

// Typed blog content blocks, rendered as real HTML text in the poster style.
const PASTEL_CYCLE = ["#fff3cc", "#ffe0e9", "#e4dcff", "#ffffff"];

export function Block({ block, index }) {
  switch (block.type) {
    case "paragraph":
      return <p className="blog-p">{block.text}</p>;
    case "heading":
      return <h2 className="blog-h2">{block.text}</h2>;
    case "gameCard":
      return (
        <article className="blog-game-card">
          <h3>{block.name}</h3>
          <div className="blog-meta-row">
            <span>👥 {block.players}</span><span>⏱ {block.time}</span><span>🧺 {block.needs}</span>
          </div>
          <p>{block.how}</p>
        </article>
      );
    case "ideaGrid":
      return (
        <section>
          {block.title && <h3 className="blog-h3">{block.title}</h3>}
          <div className="blog-idea-grid">
            {block.items.map((item, i) => (
              <div key={i} className="blog-idea" style={{ background: PASTEL_CYCLE[i % PASTEL_CYCLE.length] }}>
                <b>{item.title}</b><p>{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      );
    case "steps":
      return (
        <section className="blog-steps">
          {block.title && <h3 className="blog-h3">{block.title}</h3>}
          <ol>
            {block.items.map((item, i) => (
              <li key={i}><span className="blog-step-num" style={{ background: PASTEL_CYCLE[i % 3] }}>{i + 1}</span><p>{item}</p></li>
            ))}
          </ol>
        </section>
      );
    case "table":
      return (
        <div className="blog-table-wrap">
          <table className="blog-table">
            {block.caption && <caption>{block.caption}</caption>}
            <thead><tr>{block.head.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i}>{row.map((cell, j) => <td key={j} data-label={block.head[j]}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "pickerChart":
      return (
        <section className="blog-picker">
          {block.title && <h3 className="blog-h3">{block.title}</h3>}
          {block.items.map((item, i) => (
            <div key={i} className="blog-picker-row">
              <span className="blog-picker-if">{item.if}</span>
              <span className="blog-picker-arrow">→</span>
              <span className="blog-picker-play">{item.play}</span>
              {item.note && <span className="blog-picker-note">{item.note}</span>}
            </div>
          ))}
        </section>
      );
    case "tvMock":
      return (
        <figure className="blog-tv" role="img" aria-label={`${block.game || "FamParty"} on the TV: ${block.question}`}>
          <div className="blog-tv-panel">
            <p className="blog-tv-head">{block.header}</p>
            {block.emoji && <div className="blog-tv-emoji">{block.emoji}</div>}
            <p className="blog-tv-q">{block.question}</p>
            {block.dots ? (
              <div className="blog-tv-spectrum" aria-hidden="true">
                <div className="blog-tv-track">
                  {block.dots.map((d, i) => <span key={i} className="blog-tv-dot" style={{ left: `${d.left}%` }}>{d.emoji}</span>)}
                </div>
                <div className="blog-tv-ends"><span>{block.left}</span><span>{block.right}</span></div>
              </div>
            ) : block.choices ? (
              <div className="blog-tv-choices">
                {block.choices.map((c, i) => <span key={i}><b>{"ABCD"[i]}</b>{c}</span>)}
              </div>
            ) : null}
            {block.footer && <p className="blog-tv-foot">{block.footer}</p>}
          </div>
          <figcaption>{block.game ? `${block.game} on the TV` : "On the TV"}</figcaption>
        </figure>
      );
    case "phoneMock":
      return (
        <figure className="blog-phone" role="img" aria-label={`On the phone: ${block.title}`}>
          <p className="blog-phone-title">{block.title}</p>
          {(block.lines || []).map((line, i) => <span key={i} className="blog-phone-line">{line}</span>)}
        </figure>
      );
    case "example":
      return (
        <section className="blog-example">
          {block.title && <h3 className="blog-h3">{block.title}</h3>}
          {block.items.map((item, i) => (
            <div key={i} className="blog-example-row"><span className="blog-example-label">{item.label}</span><p>{item.text}</p></div>
          ))}
        </section>
      );
    case "callout":
      return (
        <aside className={`blog-callout ${block.tone === "warn" ? "warn" : ""}`}>
          <b>{block.tone === "warn" ? "⚠️ " : "💡 "}{block.title}</b>
          <p>{block.text}</p>
        </aside>
      );
    case "pullQuote":
      return <blockquote className="blog-pullquote">{block.text}</blockquote>;
    case "revealGrid":
      return (
        <section>
          {block.title && <h3 className="blog-h3">{block.title}</h3>}
          <div className="blog-reveal-grid">
            {block.items.map((item, i) => (
              <details key={i} className="blog-reveal">
                <summary>{item.clue}<span className="blog-reveal-hint">Tap for the answer</span></summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      );
    default:
      return null;
  }
}
