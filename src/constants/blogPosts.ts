export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  content: string;
  image: string;
  category: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "what-is-instagram-dm-automation",
    title: "What is Instagram DM Automation? (2026 Guide)",
    description: "Instagram DM automation automatically sends direct messages when someone comments a keyword on your post. DMflow uses Meta's official Instagram Graph API.",
    date: "2026-04-19",
    category: "Guide",
    image: "https://dmflow.site/images/blog/what-is-instagram-dm-automation-og.jpg",
    content: `
      <h2>The Future of Instagram is Automated</h2>
      <p>Instagram DM automation is changing the game for creators and brands. In 2026, it's not just about posting content; it's about starting conversations at scale.</p>
      <h3>What is DM Automation?</h3>
      <p>Direct Message (DM) automation allows you to trigger specific messages based on user behavior. The most common triggers include:</p>
      <ul>
        <li>Keywords in comments</li>
        <li>Story mentions</li>
        <li>Direct messages with specific phrases</li>
      </ul>
      <h3>Why DMflow?</h3>
      <p>DMflow is built on the official Meta Graph API, ensuring your account remains safe and compliant with Instagram's terms of service.</p>
    `
  },
  {
    slug: "auto-reply-instagram-comments",
    title: "How to Auto-Reply to Instagram Comments in 2026",
    description: "Learn how to auto-reply to Instagram comments instantly. Turn every comment into a lead or sale with Meta-approved automation technology.",
    date: "2026-04-20",
    category: "Tutorial",
    image: "https://dmflow.site/images/blog/auto-reply-instagram-comments-og.jpg",
    content: `
      <h2>Turn Comments into Conversations</h2>
      <p>Auto-replying to comments is the fastest way to increase engagement and drive traffic to your links.</p>
      <h3>The Setup Process</h3>
      <p>With DMflow, setting up a comment-to-DM automation takes less than 5 minutes.</p>
    `
  },
  {
    slug: "dmflow-vs-manychat-vs-creatorflow",
    title: "DMflow vs ManyChat vs CreatorFlow: Honest Comparison",
    description: "Looking for the best Instagram automation tool? We compare DMflow, ManyChat, and CreatorFlow to help you choose the right platform for your growth.",
    date: "2026-04-21",
    category: "Comparison",
    image: "https://dmflow.site/images/blog/dmflow-vs-manychat-vs-creatorflow-og.jpg",
    content: `
      <h2>Which One is Right for You?</h2>
      <p>Choosing an automation platform is a big decision. Here is how DMflow stacks up against the competition.</p>
    `
  }
];
