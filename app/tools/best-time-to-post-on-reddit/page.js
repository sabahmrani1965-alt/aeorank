import ToolPage, { toolMetadata } from "@/components/tools/ToolPage";
import BestTimeToPost from "@/components/tools/BestTimeToPost";

const SLUG = "best-time-to-post-on-reddit";
const TITLE = "Best Time to Post on Reddit";

export const metadata = toolMetadata(
  SLUG,
  TITLE,
  "Find the best time to post on any subreddit: when its top posts of the month were published, by day and hour, in your own time zone."
);

export default function Page() {
  return (
    <ToolPage
      slug={SLUG}
      title={`${TITLE} Checker`}
      server
      intro="Enter a subreddit to see when its top posts of the past month were published, by day and hour, in your own time zone."
      guide={[
        {
          heading: "How it works",
          body: (
            <p>
              We read the subreddit&apos;s top posts of the past month and place each one on a grid by the weekday and 3-hour
              window it was published in, converted to your time zone. The darker a cell, the more of the month&apos;s best
              posts went up at that time. It is measured per subreddit, because every community has its own rhythm.
            </p>
          ),
        },
        {
          heading: "Is there one best time to post on Reddit?",
          body: (
            <p>
              No. A subreddit for European developers peaks at a different hour from one for US parents, and weekends behave
              differently from weekdays. Generic advice such as &ldquo;post at 9am Eastern&rdquo; is an average across very
              different communities. Check the subreddit you are posting to.
            </p>
          ),
        },
        {
          heading: "Timing helps, the post decides",
          body: (
            <ul>
              <li>A post gets its first votes in the first hour or two; posting when the subreddit is active gives it that start.</li>
              <li>A clear, specific title matters more than the hour. Check yours with the <a href="/tools/reddit-title-checker">Reddit title checker</a>.</li>
              <li>Answer the comments in the first hours: replies keep a thread moving up.</li>
            </ul>
          ),
        },
      ]}
      faq={[
        { q: "What is the best time to post on Reddit?", a: "It depends on the subreddit. Enter one above to see when its top posts of the past month were published, in your time zone." },
        { q: "What is the best day to post on Reddit?", a: "Also per subreddit. The tool shows the weekday with the most top posts for the subreddit you enter." },
        { q: "Which time zone are the results in?", a: "Your own: times are converted in your browser to the time zone your device uses." },
        { q: "How many posts is it based on?", a: "Up to about 75 of the subreddit's top posts of the past month. Small subreddits have fewer, so read their results as a hint." },
      ]}
    >
      <BestTimeToPost />
    </ToolPage>
  );
}
