// A "news item" is the underlying story; postInstances are where it actually got posted
const newsItems = [
  { newsId: "news-1", topic: "Product launch" },
  { newsId: "news-2", topic: "Hiring announcement" },
  { newsId: "news-3", topic: "Price increase" },
  { newsId: "news-4", topic: "Company anniversary" }
];

const postInstances = [
  { postId: "li-post-1", newsId: "news-1", platform: "LinkedIn" },
  { postId: "tw-post-1", newsId: "news-1", platform: "Twitter" },
  { postId: "fb-post-1", newsId: "news-1", platform: "Facebook" },

  { postId: "li-post-2", newsId: "news-2", platform: "LinkedIn" },
  { postId: "tw-post-2", newsId: "news-2", platform: "Twitter" },

  { postId: "ig-post-3", newsId: "news-3", platform: "Instagram" },
  { postId: "tt-post-3", newsId: "news-3", platform: "TikTok" },
  { postId: "tw-post-3", newsId: "news-3", platform: "Twitter" },

  { postId: "fb-post-4", newsId: "news-4", platform: "Facebook" },
  { postId: "ig-post-4", newsId: "news-4", platform: "Instagram" }
];

// 50 comments, distributed across postInstances/platforms, content matches the news + platform tone
const comments = [
  // news-1 / Product launch — LinkedIn
  { authorName: "Selam T.", content: "This is exactly what we needed, congrats team!", postId: "li-post-1", platform: "LinkedIn", signalType: "Comment" },
  { authorName: "Marcus W.", content: "Been waiting for this feature for months, nice work.", postId: "li-post-1", platform: "LinkedIn", signalType: "Comment" },
  { authorName: "Priya N.", content: "Clean rollout, the demo video sold me instantly.", postId: "li-post-1", platform: "LinkedIn", signalType: "Comment" },
  { authorName: "Tomás R.", content: "Signed up for the beta already, looks solid so far.", postId: "li-post-1", platform: "LinkedIn", signalType: "Comment" },
  { authorName: "Hana B.", content: "Good to know, thanks for the update.", postId: "li-post-1", platform: "LinkedIn", signalType: "Comment" },

  // news-1 / Product launch — Twitter
  { authorName: "Jordan P.", content: "finally!! been asking for this forever", postId: "tw-post-1", platform: "Twitter", signalType: "Comment" },
  { authorName: "Casey L.", content: "ok this actually looks good", postId: "tw-post-1", platform: "Twitter", signalType: "Comment" },
  { authorName: "Devon R.", content: "not sure the price matches the value tbh", postId: "tw-post-1", platform: "Twitter", signalType: "Comment" },
  { authorName: "Alex M.", content: "in the beta, works great so far", postId: "tw-post-1", platform: "Twitter", signalType: "Comment" },
  { authorName: "Sam K.", content: "cool launch, when's the API docs coming", postId: "tw-post-1", platform: "Twitter", signalType: "Comment" },

  // news-1 / Product launch — Facebook
  { authorName: "Linda F.", content: "So proud of this team, been following the journey!", postId: "fb-post-1", platform: "Facebook", signalType: "Comment" },
  { authorName: "George H.", content: "My business has been waiting for something like this.", postId: "fb-post-1", platform: "Facebook", signalType: "Comment" },
  { authorName: "Rita N.", content: "Does this work with the old plan or do we need to upgrade?", postId: "fb-post-1", platform: "Facebook", signalType: "Comment" },
  { authorName: "Mike D.", content: "Looks great, will definitely try it out this week.", postId: "fb-post-1", platform: "Facebook", signalType: "Comment" },
  { authorName: "Carla V.", content: "Another feature nobody asked for, hope it's actually useful.", postId: "fb-post-1", platform: "Facebook", signalType: "Comment" },

  // news-2 / Hiring announcement — LinkedIn
  { authorName: "Daniel C.", content: "Congrats on the growth, hope you're hiring remote too!", postId: "li-post-2", platform: "LinkedIn", signalType: "Comment" },
  { authorName: "Aster T.", content: "Love seeing the team expand, great culture from what I've heard.", postId: "li-post-2", platform: "LinkedIn", signalType: "Comment" },
  { authorName: "Liam O.", content: "Just applied for the backend role, fingers crossed.", postId: "li-post-2", platform: "LinkedIn", signalType: "Comment" },
  { authorName: "Wendimu A.", content: "Noted, will keep an eye on the careers page.", postId: "li-post-2", platform: "LinkedIn", signalType: "Comment" },
  { authorName: "Nina P.", content: "Great to see continued investment in the team.", postId: "li-post-2", platform: "LinkedIn", signalType: "Comment" },

  // news-2 / Hiring announcement — Twitter
  { authorName: "Owen T.", content: "hiring during a market like this, respect", postId: "tw-post-2", platform: "Twitter", signalType: "Comment" },
  { authorName: "Zoe B.", content: "applying rn", postId: "tw-post-2", platform: "Twitter", signalType: "Comment" },
  { authorName: "Farah S.", content: "do they sponsor visas though", postId: "tw-post-2", platform: "Twitter", signalType: "Comment" },
  { authorName: "Ravi D.", content: "good sign for the company tbh", postId: "tw-post-2", platform: "Twitter", signalType: "Comment" },
  { authorName: "Chad M.", content: "wish they posted salary ranges", postId: "tw-post-2", platform: "Twitter", signalType: "Comment" },

  // news-3 / Price increase — Instagram
  { authorName: "Kwame O.", content: "not happy about this at all", postId: "ig-post-3", platform: "Instagram", signalType: "Comment" },
  { authorName: "Bianca R.", content: "feels like a cash grab honestly", postId: "ig-post-3", platform: "Instagram", signalType: "Comment" },
  { authorName: "Trevor J.", content: "guess we're cancelling then", postId: "ig-post-3", platform: "Instagram", signalType: "Comment" },
  { authorName: "Amara K.", content: "wish they explained why before just raising it", postId: "ig-post-3", platform: "Instagram", signalType: "Comment" },
  { authorName: "Diego P.", content: "still gonna use it but not thrilled", postId: "ig-post-3", platform: "Instagram", signalType: "Comment" },

  // news-3 / Price increase — TikTok
  { authorName: "Skye L.", content: "bro really said pay more for the same thing", postId: "tt-post-3", platform: "TikTok", signalType: "Comment" },
  { authorName: "Marcus J.", content: "nah this ain't it", postId: "tt-post-3", platform: "TikTok", signalType: "Comment" },
  { authorName: "Priya S.", content: "everyone's price is going up lol not surprised", postId: "tt-post-3", platform: "TikTok", signalType: "Comment" },
  { authorName: "Devin R.", content: "switching to the competitor after this", postId: "tt-post-3", platform: "TikTok", signalType: "Comment" },
  { authorName: "Jules F.", content: "at least give us new features for the price hike", postId: "tt-post-3", platform: "TikTok", signalType: "Comment" },

  // news-3 / Price increase — Twitter
  { authorName: "Grace M.", content: "third price hike this year, honestly reconsidering", postId: "tw-post-3", platform: "Twitter", signalType: "Comment" },
  { authorName: "Fatima A.", content: "no warning, no migration plan, not great", postId: "tw-post-3", platform: "Twitter", signalType: "Comment" },
  { authorName: "Robel G.", content: "small teams get hit hardest by this", postId: "tw-post-3", platform: "Twitter", signalType: "Comment" },
  { authorName: "Nadia P.", content: "cancelling over this, too steep", postId: "tw-post-3", platform: "Twitter", signalType: "Comment" },
  { authorName: "Samuel O.", content: "would help to see what actually changed in the plan", postId: "tw-post-3", platform: "Twitter", signalType: "Comment" },

  // news-4 / Company anniversary — Facebook
  { authorName: "Meron A.", content: "Five years strong, proud to have been a customer since year one!", postId: "fb-post-4", platform: "Facebook", signalType: "Comment" },
  { authorName: "Chris B.", content: "Anniversary post but still no fix for the bug I reported last month.", postId: "fb-post-4", platform: "Facebook", signalType: "Comment" },
  { authorName: "Lily Z.", content: "Nice milestone, curious what's planned for year six.", postId: "fb-post-4", platform: "Facebook", signalType: "Comment" },
  { authorName: "Yosef T.", content: "Congrats on the anniversary, here's to the next chapter.", postId: "fb-post-4", platform: "Facebook", signalType: "Comment" },
  { authorName: "Paula G.", content: "Hope the next year brings better support response times.", postId: "fb-post-4", platform: "Facebook", signalType: "Comment" },

  // news-4 / Company anniversary — Instagram
  { authorName: "Nia W.", content: "happy anniversary! been with you since day one", postId: "ig-post-4", platform: "Instagram", signalType: "Comment" },
  { authorName: "Tariq H.", content: "congrats but pls fix the app crashes", postId: "ig-post-4", platform: "Instagram", signalType: "Comment" },
  { authorName: "Ella S.", content: "5 years already?? time flies", postId: "ig-post-4", platform: "Instagram", signalType: "Comment" },
  { authorName: "Marco B.", content: "cute post, still waiting on my refund tho", postId: "ig-post-4", platform: "Instagram", signalType: "Comment" },
  { authorName: "Grace T.", content: "wishing the team more milestones ahead", postId: "ig-post-4", platform: "Instagram", signalType: "Comment" }
];

// 30 mentions, same idea — someone tagging the company on their own post, spread across all 5 platforms
const mentions = [
  // LinkedIn
  { authorName: "Naomi F.", content: "Big thanks to our vendor for the great service this quarter.", postId: "li-ext-1", platform: "LinkedIn", signalType: "Mention" },
  { authorName: "Betelhem Y.", content: "Congrats to the team on the new product launch!", postId: "li-ext-2", platform: "LinkedIn", signalType: "Mention" },
  { authorName: "Derek H.", content: "Not happy with how support handled my ticket.", postId: "li-ext-3", platform: "LinkedIn", signalType: "Mention" },
  { authorName: "Ines M.", content: "Saw their post today, interesting approach.", postId: "li-ext-4", platform: "LinkedIn", signalType: "Mention" },
  { authorName: "Abel K.", content: "Switched vendors last month, onboarding was smoother than expected.", postId: "li-ext-5", platform: "LinkedIn", signalType: "Mention" },
  { authorName: "Sofia L.", content: "Great to see them investing in their team, congrats on the new hires.", postId: "li-ext-6", platform: "LinkedIn", signalType: "Mention" },

  // Twitter
  { authorName: "Ryan P.", content: "shoutout to them for fixing my issue same day", postId: "tw-ext-1", platform: "Twitter", signalType: "Mention" },
  { authorName: "Maya C.", content: "still waiting on a reply to my ticket from last week", postId: "tw-ext-2", platform: "Twitter", signalType: "Mention" },
  { authorName: "Tobi A.", content: "saw the anniversary post, wild it's been 5 years", postId: "tw-ext-3", platform: "Twitter", signalType: "Mention" },
  { authorName: "Josh N.", content: "been recommending them to everyone on my team", postId: "tw-ext-4", platform: "Twitter", signalType: "Mention" },
  { authorName: "Bella R.", content: "price hike killed it for us, moved on", postId: "tw-ext-5", platform: "Twitter", signalType: "Mention" },
  { authorName: "Femi O.", content: "congrats on the launch, looks like a solid update", postId: "tw-ext-6", platform: "Twitter", signalType: "Mention" },

  // Facebook
  { authorName: "Carmen L.", content: "Wanted to publicly thank their support team for going above and beyond.", postId: "fb-ext-1", platform: "Facebook", signalType: "Mention" },
  { authorName: "Victor H.", content: "Cancelled after the price increase, wish it hadn't come to that.", postId: "fb-ext-2", platform: "Facebook", signalType: "Mention" },
  { authorName: "Ana P.", content: "Interesting to see their anniversary post today.", postId: "fb-ext-3", platform: "Facebook", signalType: "Mention" },
  { authorName: "Samir Q.", content: "Told my whole network to check them out after our experience.", postId: "fb-ext-4", platform: "Facebook", signalType: "Mention" },
  { authorName: "Wanjiru K.", content: "Congrats to them on 5 years, big milestone!", postId: "fb-ext-5", platform: "Facebook", signalType: "Mention" },
  { authorName: "Ola B.", content: "Wish they'd communicate changes before rolling them out.", postId: "fb-ext-6", platform: "Facebook", signalType: "Mention" },

  // Instagram
  { authorName: "Lulu M.", content: "shoutout for the quick support response", postId: "ig-ext-1", platform: "Instagram", signalType: "Mention" },
  { authorName: "Nate B.", content: "congrats on 5 years!!", postId: "ig-ext-2", platform: "Instagram", signalType: "Mention" },
  { authorName: "Iris D.", content: "not loving the new pricing tbh", postId: "ig-ext-3", platform: "Instagram", signalType: "Mention" },
  { authorName: "Kofi A.", content: "just saw their launch post, looks decent", postId: "ig-ext-4", platform: "Instagram", signalType: "Mention" },
  { authorName: "Renee T.", content: "if you're looking for a good tool, these guys are solid", postId: "ig-ext-5", platform: "Instagram", signalType: "Mention" },
  { authorName: "Theo S.", content: "app's been buggy since the last update", postId: "ig-ext-6", platform: "Instagram", signalType: "Mention" },

  // TikTok
  { authorName: "Milo J.", content: "ngl their support team came through for me", postId: "tt-ext-1", platform: "TikTok", signalType: "Mention" },
  { authorName: "Zara Q.", content: "happy bday to them, 5 years is crazy", postId: "tt-ext-2", platform: "TikTok", signalType: "Mention" },
  { authorName: "Cole D.", content: "price went up and nothing else changed??", postId: "tt-ext-3", platform: "TikTok", signalType: "Mention" },
  { authorName: "Ayana R.", content: "saw this brand pop up on my fyp today", postId: "tt-ext-4", platform: "TikTok", signalType: "Mention" },
  { authorName: "Dex M.", content: "been using this for months, actually solid", postId: "tt-ext-5", platform: "TikTok", signalType: "Mention" },
  { authorName: "Piper K.", content: "still no reply from support after a week", postId: "tt-ext-6", platform: "TikTok", signalType: "Mention" }
];

// Reactions as discrete events now, not counts — content stays null
const likes = [
  { authorName: "Anon", content: null, postId: "li-post-1", platform: "LinkedIn", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "li-post-1", platform: "LinkedIn", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "tw-post-1", platform: "Twitter", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "fb-post-1", platform: "Facebook", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "li-post-2", platform: "LinkedIn", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "tw-post-2", platform: "Twitter", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "fb-post-4", platform: "Facebook", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "fb-post-4", platform: "Facebook", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "ig-post-4", platform: "Instagram", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "ig-post-4", platform: "Instagram", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "ig-post-3", platform: "Instagram", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "tt-post-3", platform: "TikTok", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "li-post-1", platform: "LinkedIn", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "li-post-1", platform: "LinkedIn", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "li-post-1", platform: "LinkedIn", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "li-post-1", platform: "LinkedIn", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "li-post-1", platform: "LinkedIn", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "tw-post-1", platform: "Twitter", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "tw-post-1", platform: "Twitter", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "tw-post-1", platform: "Twitter", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "tw-post-1", platform: "Twitter", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "tw-post-1", platform: "Twitter", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "fb-post-1", platform: "Facebook", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "fb-post-1", platform: "Facebook", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "fb-post-1", platform: "Facebook", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "fb-post-1", platform: "Facebook", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "fb-post-1", platform: "Facebook", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "li-post-2", platform: "LinkedIn", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "li-post-2", platform: "LinkedIn", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "li-post-2", platform: "LinkedIn", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "li-post-2", platform: "LinkedIn", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "li-post-2", platform: "LinkedIn", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "li-post-2", platform: "LinkedIn", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "tw-post-2", platform: "Twitter", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "tw-post-2", platform: "Twitter", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "tw-post-2", platform: "Twitter", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "tw-post-2", platform: "Twitter", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "tw-post-2", platform: "Twitter", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "tw-post-2", platform: "Twitter", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "fb-post-4", platform: "Facebook", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "fb-post-4", platform: "Facebook", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "fb-post-4", platform: "Facebook", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "fb-post-4", platform: "Facebook", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "fb-post-4", platform: "Facebook", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "ig-post-4", platform: "Instagram", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "ig-post-4", platform: "Instagram", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "ig-post-4", platform: "Instagram", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "ig-post-4", platform: "Instagram", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "ig-post-4", platform: "Instagram", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "ig-post-3", platform: "Instagram", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "ig-post-3", platform: "Instagram", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "ig-post-3", platform: "Instagram", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "ig-post-3", platform: "Instagram", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "ig-post-3", platform: "Instagram", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "tt-post-3", platform: "TikTok", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "tt-post-3", platform: "TikTok", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "tt-post-3", platform: "TikTok", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "tt-post-3", platform: "TikTok", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "tw-post-3", platform: "Twitter", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "tw-post-3", platform: "Twitter", signalType: "Like" },
  { authorName: "Anon", content: null, postId: "tw-post-3", platform: "Twitter", signalType: "Like" }
];

const shares = [
  { authorName: "Anon", content: null, postId: "ig-post-3", platform: "Instagram", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "ig-post-3", platform: "Instagram", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "tt-post-3", platform: "TikTok", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "tt-post-3", platform: "TikTok", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "tw-post-3", platform: "Twitter", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "tw-post-3", platform: "Twitter", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "li-post-1", platform: "LinkedIn", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "tw-post-1", platform: "Twitter", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "li-post-1", platform: "LinkedIn", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "li-post-1", platform: "LinkedIn", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "tw-post-1", platform: "Twitter", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "tw-post-1", platform: "Twitter", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "fb-post-1", platform: "Facebook", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "fb-post-1", platform: "Facebook", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "li-post-2", platform: "LinkedIn", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "li-post-2", platform: "LinkedIn", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "tw-post-2", platform: "Twitter", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "tw-post-2", platform: "Twitter", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "fb-post-4", platform: "Facebook", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "fb-post-4", platform: "Facebook", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "ig-post-4", platform: "Instagram", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "ig-post-4", platform: "Instagram", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "ig-post-3", platform: "Instagram", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "ig-post-3", platform: "Instagram", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "ig-post-3", platform: "Instagram", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "tt-post-3", platform: "TikTok", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "tt-post-3", platform: "TikTok", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "tt-post-3", platform: "TikTok", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "tw-post-3", platform: "Twitter", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "tw-post-3", platform: "Twitter", signalType: "Share" },
  { authorName: "Anon", content: null, postId: "tw-post-3", platform: "Twitter", signalType: "Share" }
];

const follows = [
  { authorName: "Anon", content: null, postId: "li-post-1", platform: "LinkedIn", signalType: "Follow" },
  { authorName: "Anon", content: null, postId: "li-post-1", platform: "LinkedIn", signalType: "Follow" },
  { authorName: "Anon", content: null, postId: "tw-post-2", platform: "Twitter", signalType: "Follow" },
  { authorName: "Anon", content: null, postId: "li-post-2", platform: "LinkedIn", signalType: "Follow" },
  { authorName: "Anon", content: null, postId: "li-post-2", platform: "LinkedIn", signalType: "Follow" },
  { authorName: "Anon", content: null, postId: "fb-post-4", platform: "Facebook", signalType: "Follow" },
  { authorName: "Anon", content: null, postId: "li-post-1", platform: "LinkedIn", signalType: "Follow" },
  { authorName: "Anon", content: null, postId: "tw-post-1", platform: "Twitter", signalType: "Follow" },
  { authorName: "Anon", content: null, postId: "fb-post-1", platform: "Facebook", signalType: "Follow" },
  { authorName: "Anon", content: null, postId: "li-post-2", platform: "LinkedIn", signalType: "Follow" },
  { authorName: "Anon", content: null, postId: "tw-post-2", platform: "Twitter", signalType: "Follow" },
  { authorName: "Anon", content: null, postId: "fb-post-4", platform: "Facebook", signalType: "Follow" },
  { authorName: "Anon", content: null, postId: "ig-post-4", platform: "Instagram", signalType: "Follow" }
];

const allEvents = [...comments, ...mentions, ...likes, ...shares, ...follows];
const picked = allEvents[Math.floor(Math.random() * allEvents.length)];
return [{ json: picked }];
