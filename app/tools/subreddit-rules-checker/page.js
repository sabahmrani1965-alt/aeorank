import ToolPage, { toolMetadata } from "@/components/tools/ToolPage";
import SubredditRulesChecker from "@/components/tools/SubredditRulesChecker";

const SLUG = "subreddit-rules-checker";
const TITLE = "Subreddit Rules Checker";

export const metadata = toolMetadata(
  SLUG,
  TITLE,
  "Read any subreddit's rules in one place, with self-promotion, link, karma, AI-content and flair rules flagged so you know before you post."
);

export default function Page() {
  return (
    <ToolPage
      slug={SLUG}
      title={TITLE}
      server
      intro="Enter a subreddit to read its rules in one place, with the ones about self-promotion, links, karma, AI content and flair flagged."
      guide={[
        {
          heading: "Why read the rules first",
          body: (
            <p>
              Most removed posts break a rule the poster never read: no links, a required flair, a minimum account age, or
              promotion allowed only in a weekly thread. Moderators remove them without explaining, and a few removals can get an
              account banned from the subreddit. Two minutes with the rules avoids that.
            </p>
          ),
        },
        {
          heading: "What the flags mean",
          body: (
            <ul>
              <li><strong>Self-promotion.</strong> The subreddit limits promoting your own product, blog or service. Many allow it only in a designated thread.</li>
              <li><strong>Links.</strong> Rules about which links or domains are allowed.</li>
              <li><strong>Karma / account age.</strong> New or low-karma accounts may be filtered out automatically.</li>
              <li><strong>AI content.</strong> Rules about AI-generated posts or answers.</li>
              <li><strong>Flair and titles.</strong> Formatting a post must follow to stay up.</li>
              <li><strong>Megathread.</strong> Some topics belong in a pinned weekly or monthly thread.</li>
            </ul>
          ),
        },
        {
          heading: "The flags are a shortcut, not a ruling",
          body: (
            <p>
              Flags come from the wording of each rule, so always read the rule itself, shown in full below the flags. Then check
              your draft with the <a href="/tools/reddit-self-promotion-checker">self-promotion checker</a>.
            </p>
          ),
        },
      ]}
      faq={[
        { q: "How do I find a subreddit's rules?", a: "Enter the subreddit above to see all its rules in one list. On Reddit they are in the sidebar on desktop and under About on mobile." },
        { q: "Does it show karma requirements?", a: "Only when the subreddit writes them into its rules. Many subreddits also filter by karma or account age without saying so publicly." },
        { q: "Are the results up to date?", a: "Rules are read from Reddit and kept for a week, so a change made in the last few days may not show yet." },
      ]}
    >
      <SubredditRulesChecker />
    </ToolPage>
  );
}
