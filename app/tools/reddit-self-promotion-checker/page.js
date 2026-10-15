import ToolPage, { toolMetadata } from "@/components/tools/ToolPage";
import PromoChecker from "@/components/tools/PromoChecker";

const SLUG = "reddit-self-promotion-checker";
const TITLE = "Reddit Self-Promotion Checker";

export const metadata = toolMetadata(
  SLUG,
  TITLE,
  "Free checker for Reddit comments that mention your product: disclosure, links, sales language and how promotional it reads, with fixes."
);

export default function Page() {
  return (
    <ToolPage
      slug={SLUG}
      title={TITLE}
      intro="Paste a comment or post that mentions your product. The checker flags what moderators remove first, and whether you have disclosed your connection to the product."
      guide={[
        {
          heading: "What it checks",
          body: (
            <ul>
              <li><strong>Disclosure.</strong> If you mention a product you are connected to, say so: "I work on…", "I'm the founder of…". Most subreddits require it.</li>
              <li><strong>Where the product appears.</strong> Leading with a product name reads as an ad. Answer first.</li>
              <li><strong>Links.</strong> More than one link is a common spam-filter trigger.</li>
              <li><strong>Sales language.</strong> "Sign up", "discount", "DM me" and promo codes are removed first.</li>
              <li><strong>Substance.</strong> Specific, first-hand detail makes a comment worth reading.</li>
            </ul>
          ),
        },
        {
          heading: "What a good product mention looks like",
          body: (
            <p>
              The comments that survive moderation and get upvoted answer the question in their own
              right, would still be useful with the product name removed, mention the product once
              where it is genuinely relevant, say plainly who is speaking, and include the drawbacks. The
              example loaded into the checker follows that pattern.
            </p>
          ),
        },
        {
          heading: "Reddit's rules",
          body: (
            <p>
              Reddit's sitewide rules prohibit spam and vote manipulation, and each subreddit sets its
              own limits on self-promotion. Read the sidebar rules of any subreddit before you post. This
              checker is a heuristic, not a ruling, and it cannot tell you how a particular moderator will
              react.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Do I have to disclose that I work for the company?",
          a: "If you are promoting something you are connected to, yes. Most subreddits require it, and undisclosed promotion is the most common reason product mentions are removed.",
        },
        {
          q: "Will passing this checker stop my comment being removed?",
          a: "No tool can promise that. Every subreddit has its own rules and moderators. The checker catches common problems before you post.",
        },
        {
          q: "Is my text stored?",
          a: "No. The check runs in your browser and nothing is sent to AEOrank.",
        },
      ]}
    >
      <PromoChecker />
    </ToolPage>
  );
}
