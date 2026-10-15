import ToolPage, { toolMetadata } from "@/components/tools/ToolPage";
import MarkdownFormatter from "@/components/tools/MarkdownFormatter";

const SLUG = "reddit-markdown-formatter";
const TITLE = "Reddit Markdown Formatter";

export const metadata = toolMetadata(
  SLUG,
  TITLE,
  "Free Reddit markdown formatter with a live preview: bold, italics, quotes, lists, links, code and spoilers, exactly as they will look on Reddit."
);

const ROWS = [
  ["Bold", "**text**"],
  ["Italic", "*text*"],
  ["Strikethrough", "~~text~~"],
  ["Inline code", "`text`"],
  ["Superscript", "^text or ^(two words)"],
  ["Spoiler", ">!text!<"],
  ["Quote", "> text"],
  ["Bulleted list", "- item"],
  ["Numbered list", "1. item"],
  ["Link", "[label](https://example.com)"],
  ["Heading", "## Heading"],
  ["Code block", "four spaces before each line"],
  ["Line break", "two spaces at the end of a line"],
];

export default function Page() {
  return (
    <ToolPage
      slug={SLUG}
      title={TITLE}
      intro="Type or paste Reddit markdown and see exactly how it will render. When it looks right, copy it straight into your comment or post."
      guide={[
        {
          heading: "Reddit markdown cheat sheet",
          body: (
            <div style={{ overflowX: "auto" }}>
              <table className="tool-table">
                <thead>
                  <tr>
                    <th>Formatting</th>
                    <th>Type this</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map(([a, b]) => (
                    <tr key={a}>
                      <td>{a}</td>
                      <td>
                        <code>{b}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ),
        },
        {
          heading: "Why line breaks disappear on Reddit",
          body: (
            <p>
              Reddit joins lines that are separated by a single newline into one paragraph. To start a
              new paragraph, leave a blank line. To break a line without starting a paragraph, end it
              with two spaces. Most formatting surprises on Reddit come from this one rule, and the
              preview above follows it.
            </p>
          ),
        },
        {
          heading: "Formatting answers people (and AI assistants) can use",
          body: (
            <p>
              Long Reddit answers get skimmed. A short first sentence that answers the question, then a
              list or a few short paragraphs, is easier for people to read and easier for AI assistants
              to quote when they cite a thread. Use bold for the one thing you most want a skimmer to
              see, not for whole sentences.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Does this work for both comments and posts?",
          a: "Yes. Reddit uses the same markdown for comments and text posts. The preview covers the common formatting; tables and a few rarer features are not previewed.",
        },
        {
          q: "How long can a Reddit comment be?",
          a: "Reddit comments are limited to 10,000 characters. The counter under the editor shows how close you are.",
        },
        {
          q: "Is anything I type saved?",
          a: "No. The formatter runs entirely in your browser and nothing is sent to AEOrank.",
        },
      ]}
    >
      <MarkdownFormatter />
    </ToolPage>
  );
}
