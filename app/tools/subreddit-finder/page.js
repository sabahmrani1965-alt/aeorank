import ToolPage, { toolMetadata } from "@/components/tools/ToolPage";
import SubredditFinder from "@/components/tools/SubredditFinder";

const SLUG = "subreddit-finder";
const TITLE = "Subreddit Finder";

export const metadata = toolMetadata(
  SLUG,
  TITLE,
  "Free subreddit finder: type a topic and see the subreddits where it is discussed most, with weekly visitors, activity and example threads."
);

export default function Page() {
  return (
    <ToolPage
      slug={SLUG}
      title={TITLE}
      server
      intro="Type a topic, product category or audience. We search a year of Reddit posts and show the subreddits where it comes up most, with how active each one is."
      guide={[
        {
          heading: "How the finder ranks subreddits",
          body: (
            <ul>
              <li><strong>Matching posts.</strong> How many of the past year&apos;s most relevant posts on your topic were published there. This is real conversation, not a name match.</li>
              <li><strong>Weekly visitors and contributions.</strong> Reddit&apos;s own activity numbers for the subreddit, so you can tell a busy community from a quiet one.</li>
              <li><strong>Comments on matching posts.</strong> Where people actually discuss the topic rather than just post links.</li>
            </ul>
          ),
        },
        {
          heading: "Big subreddits are not always the best ones",
          body: (
            <p>
              A huge general subreddit buries a niche question within minutes, while a smaller community about exactly your
              topic reads every post. For finding buyers, the subreddits with the most matching posts and comments are usually
              worth more than the ones with the most members. Read a week of posts before you take part, and check the rules
              with the <a href="/tools/subreddit-rules-checker">subreddit rules checker</a>.
            </p>
          ),
        },
        {
          heading: "Why it matters for AI search",
          body: (
            <p>
              ChatGPT, Perplexity and Google&apos;s AI answers cite Reddit threads constantly, and they cite them from the
              subreddits where a topic is really discussed. The subreddits this tool finds are the ones most likely to feed AI
              answers about your category.
            </p>
          ),
        },
      ]}
      faq={[
        { q: "How do I find subreddits about a topic?", a: "Type the topic in the box above. The finder searches a year of Reddit posts on it and lists the subreddits where it was discussed most, with weekly visitors and activity for each." },
        { q: "Does it show NSFW subreddits?", a: "No. Posts marked NSFW and user profile pages are left out." },
        { q: "How fresh are the results?", a: "Each topic is searched live the first time and the result is kept for a week, so popular topics load instantly." },
        { q: "Is it free?", a: "Yes, with a daily limit per visitor so the tool stays free for everyone." },
      ]}
    >
      <SubredditFinder />
    </ToolPage>
  );
}
