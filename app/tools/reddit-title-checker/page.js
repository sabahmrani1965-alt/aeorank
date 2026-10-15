import ToolPage, { toolMetadata } from "@/components/tools/ToolPage";
import TitleChecker from "@/components/tools/TitleChecker";

const SLUG = "reddit-title-checker";
const TITLE = "Reddit Title Checker";

export const metadata = toolMetadata(
  SLUG,
  TITLE,
  "Free Reddit post title checker: length against the 300-character limit, capitals, clickbait, links and promotional wording, with fixes."
);

export default function Page() {
  return (
    <ToolPage
      slug={SLUG}
      title={TITLE}
      intro="Paste a post title to check it against Reddit's limits and the patterns that get posts ignored or removed by moderators."
      guide={[
        {
          heading: "What the checker looks at",
          body: (
            <ul>
              <li><strong>Length.</strong> Reddit rejects titles over 300 characters, and long titles are cut off in feeds.</li>
              <li><strong>Capitals and punctuation.</strong> All-caps titles and doubled exclamation or question marks read as shouting or ads.</li>
              <li><strong>Clickbait.</strong> Phrases like "you won't believe" are removed on many subreddits.</li>
              <li><strong>Links.</strong> A URL in the title is almost always removed. Put it in the body.</li>
              <li><strong>Promotional wording.</strong> "Check out", "we built", "discount" and similar trip self-promotion rules.</li>
              <li><strong>Question shape.</strong> A clear question invites answers.</li>
            </ul>
          ),
        },
        {
          heading: "Why question titles matter for AI search",
          body: (
            <p>
              AI assistants lean on Reddit threads that look like the question a user is asking them.
              A thread titled as a clear, specific question ("What is the best CRM for a five-person
              team?") maps directly onto those prompts, which is one reason such threads are cited so
              often. A good title helps the thread with people first and with AI assistants second.
            </p>
          ),
        },
        {
          heading: "Always read the subreddit rules",
          body: (
            <p>
              Every subreddit sets its own title rules: required tags like [Question], banned words,
              minimum lengths. This checker covers patterns that are removed almost everywhere, but the
              rules in the sidebar of the subreddit you post to always win.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "What is the maximum length of a Reddit title?",
          a: "300 characters. Shorter is usually better: titles are truncated in many feeds, so put the important words first.",
        },
        {
          q: "Can I edit a Reddit title after posting?",
          a: "No. Reddit does not allow title edits, which is why it is worth checking before you post.",
        },
        {
          q: "Is the score an official Reddit rating?",
          a: "No. It is a simple heuristic from common moderator rules, meant as a checklist, not a guarantee.",
        },
      ]}
    >
      <TitleChecker />
    </ToolPage>
  );
}
