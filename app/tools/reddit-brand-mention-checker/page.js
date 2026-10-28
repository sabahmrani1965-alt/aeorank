import ToolPage, { toolMetadata } from "@/components/tools/ToolPage";
import BrandMentionChecker from "@/components/tools/BrandMentionChecker";

const SLUG = "reddit-brand-mention-checker";
const TITLE = "Reddit Brand Mention Checker";

export const metadata = toolMetadata(
  SLUG,
  TITLE,
  "Free Reddit brand mention checker: see which Reddit posts named your brand in the past month, in which subreddits, with upvotes and comments."
);

export default function Page() {
  return (
    <ToolPage
      slug={SLUG}
      title={TITLE}
      server
      intro="Enter a brand or product name to see the Reddit posts that named it in the past month, and which subreddits talk about it most."
      guide={[
        {
          heading: "Why Reddit mentions matter",
          body: (
            <p>
              People ask Reddit before they buy, and AI assistants read those same threads. When ChatGPT or Google&apos;s AI
              answers a question about your category, the Reddit posts that mention you, or your competitors, are part of what it
              draws on. Knowing where you are mentioned is the first step to showing up in those answers.
            </p>
          ),
        },
        {
          heading: "What the checker covers",
          body: (
            <ul>
              <li>Posts from the past month whose title or text names the brand, newest first.</li>
              <li>The subreddits where it is mentioned most.</li>
              <li>Upvotes and comments, so you can see which threads people actually read.</li>
            </ul>
          ),
        },
        {
          heading: "What it doesn't cover",
          body: (
            <p>
              Mentions inside comments, older threads, and sentiment. Those need daily tracking: AEOrank&apos;s Mentions view
              follows every post and comment that names you, marks each as positive, neutral or negative, and alerts you when one
              needs a reply.
            </p>
          ),
        },
      ]}
      faq={[
        { q: "How do I see if my brand is mentioned on Reddit?", a: "Type the brand name above. The checker lists the Reddit posts from the past month that name it, with their subreddit, upvotes and comments." },
        { q: "Does it include comments?", a: "No, it searches posts. Comment mentions need ongoing tracking, which AEOrank's dashboard does." },
        { q: "Why are some posts missing?", a: "Results come from Reddit search for the past month, so very old posts and removed posts are not included." },
        { q: "How often is it updated?", a: "Each brand is searched live the first time it is checked each day." },
      ]}
    >
      <BrandMentionChecker />
    </ToolPage>
  );
}
