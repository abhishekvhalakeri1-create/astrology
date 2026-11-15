/**
 * The words on the site that are not interface text: Rajeshwari's journal notes and what her clients wrote.
 *
 * To publish a new note, add an entry to ARTICLES. The journal page, the home page and the sitemap all read
 * this list, and the next build makes a page for it at /articles/<slug>/.
 */

export interface Article {
  /** The last part of the page address: /articles/<slug>/. Lower-case letters, digits and hyphens only. */
  slug: string;
  title: string;
  /** One or two sentences shown under the title and in lists. */
  excerpt: string;
  /** The note itself. Leave an empty line between paragraphs. */
  body: string;
  category: string;
  /** A free calculator on this site that goes with the note, by its address. */
  tool?: string;
  /** The consultation in lib/site.ts (by id) that the note leads to. */
  service: string;
}

export const ARTICLES: readonly Article[] = [
  {
    slug: "why-kundli-matching-still-matters",
    title: "Why Kundli Matching Still Matters",
    excerpt: "Real experience from 500+ marriages I have matched - what actually works.",
    body: "In my 15 years, I have seen many cases where only gun matching was done and marriage faced issues. Gun is only one part. We must see Mangal, Shani, 7th lord strength, Dasha. I remember a case from Mysore - 32 guns matched but both had Mangal in 8th, marriage had daily fights. After proper remedies and understanding, they are happy now. Don't just count guns, see the whole chart. I explain this in simple language to families, not in Sanskrit shlokas that no one understands.",
    category: "Marriage",
    tool: "/kundali-matching",
    service: "matching",
  },
  {
    slug: "career-confusion-after-degree",
    title: "Career Confusion After Degree? What Your 10th House Says",
    excerpt: "Engineering done but not interested? How to choose right field as per your chart.",
    body: "Many young people come to me after B.Tech, B.Com - parents forced, but mind not in that field. Your 10th house lord and planets in 10th show where your natural interest is. One boy from Mandya, his father wanted him to do government job, but his chart showed Mercury strong in 10th - he is now successful content writer. I don't give false hopes. If chart shows struggle, I tell clearly and give remedies and practical steps. No sugar coating.",
    category: "Career",
    tool: "/birth-chart",
    service: "career",
  },
  {
    slug: "sade-sati-understand-saturn",
    title: "Sade Sati - Don't Fear Saturn, Understand Him",
    excerpt: "Clients come scared of Sade Sati. Let me explain what I tell them in consultation.",
    body: "Sade Sati is not curse. Shani teaches discipline. I have seen people who grew the most in Sade Sati because they worked hard. Yes, there will be delays, but not destruction. Simple remedies: help workers, be punctual, don't cheat. One lady from Bangalore, during Sade Sati she started small tiffin service, now she has 3 branches. Shani rewarded her hard work. I give simple, practical remedies - not expensive poojas.",
    category: "Astrology",
    tool: "/dosha-check",
    service: "birth-chart",
  },
  {
    slug: "love-marriage-family-not-agreeing",
    title: "Love Marriage Problems - Family Not Agreeing?",
    excerpt: "How I handle love marriage cases - practical approach, not just astrology.",
    body: "Love marriage issue is 50% astrology, 50% family psychology. I first see compatibility honestly. If good, I help convince parents by showing chart strengths. If compatibility has issues, I tell clearly what adjustments needed. I don't give fake assurance. Recently, a couple from Hyderabad - both IT, families against due to caste. Chart showed strong 7th house connection, I explained to parents about future, they agreed. Now married 2 years. Astrology should unite families, not break.",
    category: "Love & Relationship",
    tool: "/kundali-matching",
    service: "relationships",
  },
  {
    slug: "vastu-for-small-houses-bangalore-flats",
    title: "Vastu for Small Houses - Bangalore Flats",
    excerpt: "You don't need to break walls. Small corrections for 2BHK flats.",
    body: "In Bangalore, most people live in flats, not independent houses. You cannot change toilet position. So I give practical Vastu - where to keep bed, which color for north wall, where to keep money locker in almirah. One family in Whitefield, their child was not sleeping well. I just asked to change bed direction from north to east and keep light yellow curtain. Child sleeps peacefully now. No need for expensive Vastu products. Simple logic.",
    category: "Vastu",
    service: "vastu",
  },
  {
    slug: "why-i-dont-sell-gemstones",
    title: "Why I Don't Sell Gemstones",
    excerpt: "Important - read this before you buy any stone from anyone.",
    body: "Many astrologers force you to buy gemstone from them with commission. I never do that. Gemstones work, but only if you need it, and only natural. And weight matters. I tell you which stone, you can buy from anywhere you trust. I don't have any shop. One client spent 30k on blue sapphire from another astrologer, but his Shani was already strong - stone made him lazy. I asked to remove, he improved. Don't wear stone without proper consultation. Sometimes simple mantra is enough.",
    category: "Astrology",
    service: "birth-chart",
  },
];

export const articleHref = (article: Article): string => `/articles/${article.slug}`;

export const findArticle = (slug: string): Article | undefined => ARTICLES.find((a) => a.slug === slug);

export interface Review {
  id: string;
  name: string;
  /** Stars out of five. */
  rating: number;
  /** The client's own words. Quote them as written. */
  comment: string;
}

export const REVIEWS: readonly Review[] = [
  { id: "rev-1", name: "Shreya Kulkarni", rating: 5, comment: "I consulted Rajeshwari madam for my marriage delay. She saw my chart and told me clearly that my Shani is in 7th, so delay is natural till 29. No false promises. She gave simple Hanuman chalisa remedy. I got married at 29 as she said, happily. She speaks very calmly and explains in Kannada which my mother could also understand. Directly contact on 7892758565, no app commission." },
  { id: "rev-2", name: "Ramesh Patil", rating: 5, comment: "Best astrology consultation I had. I am from Hubli, working in Bangalore. Career was stuck. Madam saw my Dasha and told me to wait till June 2023, then change job. I did, and got 40% hike. She doesn't scare you. Very practical. I contacted on WhatsApp 7892758565 and she replied same day. Fees also reasonable compared to other apps charging 50 per minute." },
  { id: "rev-3", name: "Anitha Rao", rating: 5, comment: "My daughter's kundli matching - we were confused with 3 proposals. Rajeshwari madam explained each chart in detail, not just gun score. She told us which family would be more adjustable. We selected as per her advice, marriage happened in Feb 2024, daughter is very happy. She even attended marriage virtually and blessed. Very motherly nature." },
  { id: "rev-4", name: "Suresh Babu", rating: 5, comment: "I was cheated by one astrologer who asked 15000 for pooja. Then my friend gave Rajeshwari number 7892758565. She told me no need for any expensive pooja, just do simple things at home. My business started improving after 2 months. She is honest, not money minded. I recommend to everyone in my circle in Rajajinagar." },
  { id: "rev-5", name: "Lakshmi S", rating: 5, comment: "Love marriage issue - my parents were not agreeing. Rajeshwari madam spoke to my mother on phone in Kannada and convinced her by explaining our charts compatibility. She didn't take extra money for that. Now my mother also consults her for everything. Very down to earth person, not like those TV astrologers." },
  { id: "rev-6", name: "Praveen Kumar", rating: 5, comment: "I am not much into astrology, but my wife forced me to consult for our second baby planning. Rajeshwari madam gave us good muhurat and explained why. Baby born healthy. She is not like those who say everything is dosha. She says clearly if something is not in chart also. That honesty I liked." },
  { id: "rev-7", name: "Divya Nair", rating: 4, comment: "Consulted for my brother's job - he was trying for abroad. Madam told Rahu period going, so foreign chance high after September. He got offer in October from Canada. We were shocked how accurate. She is available on WhatsApp always, replies even at night if urgent. 7892758565 save this number." },
  { id: "rev-8", name: "Manjunath Gowda", rating: 5, comment: "Vastu consultation for my new house in Mysore. She didn't ask to demolish anything. Just suggested to shift kitchen platform color and keep main door clutter free. My wife was having health issues, after changes she feels better. Simple and practical. Fees 500 only for Vastu visit, very reasonable." },
  { id: "rev-9", name: "Priya Sharma", rating: 5, comment: "My husband and I had daily fights. We thought of divorce. Rajeshwari madam saw both charts and told us it's Mangal-Shani combination causing ego clashes, gave us simple remedy to do together. Now we understand each other better. She saved our marriage. Thank you madam." },
  { id: "rev-10", name: "Arun Kumar", rating: 5, comment: "I have consulted 3-4 astrologers before, but Rajeshwari madam is different. She doesn't use big Sanskrit words to confuse. She speaks like your own family member. My mother who is 65 years old also understood everything. And she never forces to buy anything. Direct phone number 7892758565, no middleman." },
  { id: "rev-11", name: "Sunita Reddy", rating: 5, comment: "For my son's education - he was not concentrating. Madam saw his chart and told us Mercury is weak, suggested to make him write daily and chant Saraswati mantra. Also changed his study table direction to east. In 3 months, his marks improved from 60% to 78%. Very grateful." },
  { id: "rev-12", name: "Venkatesh Murthy", rating: 5, comment: "Business was going through loss. Rajeshwari madam checked my chart and told me Shani dasha running, so slow growth is expected, but after April 2024 it will improve. She was right, from May we got new contract. She gives realistic timeline, not fake immediate results. Honest astrologer." },
];
