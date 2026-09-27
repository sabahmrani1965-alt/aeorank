import Link from "next/link";

// Shared prose renderer. Lives here rather than in the blog route because
// the industry pages need the same list, table and bold handling — a guide
// section rendered as one <p> is the exact extraction loss the blog just
// finished fixing.

// Turns [label](href) and **bold** inside prose into nodes, so section
// content stays plain strings while still rendering links and emphasis.
// External links get rel/target; internal ones stay <Link>.
export function renderInline(text) {
  const parts = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let key = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[3] !== undefined) {
      parts.push(<strong key={key++} style={{ color: "var(--text)" }}>{match[3]}</strong>);
    } else if (/^https?:\/\//.test(match[2])) {
      parts.push(
        <a
          key={key++}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--accent)", textDecoration: "underline" }}
        >
          {match[1]}
        </a>
      );
    } else {
      parts.push(
        <Link
          key={key++}
          href={match[2]}
          style={{ color: "var(--accent)", textDecoration: "underline" }}
        >
          {match[1]}
        </Link>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

const PROSE = {
  fontSize: 16.5,
  color: "var(--text-dim)",
  lineHeight: 1.8,
  marginBottom: 16,
};

// A block is a bullet list, a numbered list, a pipe table, or a paragraph.
// Answer engines read list and table markup; the same words inside one <p>
// collapse into run-on prose when extracted.
export function renderBlock(block, key) {
  const lines = block.split("\n").filter((l) => l.trim() !== "");

  if (lines.length > 1 && lines.every((l) => l.trim().startsWith("|"))) {
    const rows = lines
      .filter((l) => !/^\s*\|[\s|:-]+\|\s*$/.test(l))
      .map((l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
    const [head, ...body] = rows;
    return (
      <div key={key} style={{ overflowX: "auto", marginBottom: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15.5 }}>
          <thead>
            <tr>
              {head.map((c, i) => (
                <th
                  key={i}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderBottom: "1px solid var(--accent)",
                    color: "var(--text)",
                    fontWeight: 700,
                  }}
                >
                  {renderInline(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td
                    key={j}
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid var(--border)",
                      color: "var(--text-dim)",
                      lineHeight: 1.6,
                      verticalAlign: "top",
                    }}
                  >
                    {renderInline(c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const bulleted = lines.length > 0 && lines.every((l) => /^\s*[•-]\s+/.test(l));
  const numbered = lines.length > 0 && lines.every((l) => /^\s*\d+[.)]\s+/.test(l));
  if (bulleted || numbered) {
    const ListTag = numbered ? "ol" : "ul";
    return (
      <ListTag key={key} style={{ ...PROSE, paddingLeft: 24 }}>
        {lines.map((l, i) => (
          <li key={i} style={{ marginBottom: 8 }}>
            {renderInline(l.replace(/^\s*(?:[•-]|\d+[.)])\s+/, ""))}
          </li>
        ))}
      </ListTag>
    );
  }

  return (
    <p key={key} style={PROSE}>
      {renderInline(block)}
    </p>
  );
}
