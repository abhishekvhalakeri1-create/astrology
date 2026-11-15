import { Astrologer, Article, Review, Booking, Horoscope, WalletTransaction, Notification, Question } from './types';

export const zodiacSigns = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];

// SINGLE ASTROLOGER - Rajeshwari
export const astrologers: Astrologer[] = [
  {
    id: "rajeshwari",
    name: "Rajeshwari",
    avatar: "https://i.pravatar.cc/300?img=25",
    verified: true,
    experience: 15,
    languages: ["Kannada","Hindi","English","Telugu"],
    specializations: ["Vedic Astrology","Marriage & Compatibility","Career & Business","Love & Relationship","Vastu","Numerology"],
    rating: 4.9,
    reviewCount: 847,
    consultationCount: 5234,
    pricePerMinute: 30,
    bio: "Namaste, I am Rajeshwari. For 15 years, I have been guiding people through Vedic astrology with honesty and practical remedies. I don't believe in creating fear - I believe in giving clarity. My readings are straightforward, in simple Kannada, Hindi or English, as you prefer. Specialized in marriage compatibility, career decisions, and family harmony. Every chart is studied personally, no computer generated predictions. Based in Bangalore, consultations available on call, WhatsApp and in-person by appointment. Contact directly: 7892758565",
    available: true,
    chatAvailable: true,
    callAvailable: true,
    videoAvailable: true,
    availableHours: "9 AM - 9 PM (All Days)",
    certifications: ["Jyotish Acharya - Kashi", "Vastu Shastra Diploma", "15 Years Practical Experience"],
    isOnline: true,
    tags: ["Most Trusted in Bangalore", "Direct Contact", "No Middleman"]
  }
];

// Keep old list for compatibility but only Rajeshwari is main
export const mainAstrologer = astrologers[0];

export const articles: Article[] = [
  { id: "art-1", title: "Why Kundli Matching Still Matters in 2024", excerpt: "Real experience from 500+ marriages I have matched - what actually works.", content: "In my 15 years, I have seen many cases where only gun matching was done and marriage faced issues. Gun is only one part. We must see Mangal, Shani, 7th lord strength, Dasha. I remember a case from Mysore - 32 guns matched but both had Mangal in 8th, marriage had daily fights. After proper remedies and understanding, they are happy now. Don't just count guns, see the whole chart. I explain this in simple language to families, not in Sanskrit shlokas that no one understands.", category: "Marriage", author: "Rajeshwari", image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop&q=60", readTime: 6, createdAt: "2024-03-15", views: 3421 },
  { id: "art-2", title: "Career Confusion After Degree? What Your 10th House Says", excerpt: "Engineering done but not interested? How to choose right field as per your chart.", content: "Many young people come to me after B.Tech, B.Com - parents forced, but mind not in that field. Your 10th house lord and planets in 10th show where your natural interest is. One boy from Mandya, his father wanted him to do government job, but his chart showed Mercury strong in 10th - he is now successful content writer. I don't give false hopes. If chart shows struggle, I tell clearly and give remedies and practical steps. No sugar coating.", category: "Career", author: "Rajeshwari", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop&q=60", readTime: 5, createdAt: "2024-03-10", views: 2156 },
  { id: "art-3", title: "Sade Sati - Don't Fear Saturn, Understand Him", excerpt: "Clients come scared of Sade Sati. Let me explain what I tell them in consultation.", content: "Sade Sati is not curse. Shani teaches discipline. I have seen people who grew the most in Sade Sati because they worked hard. Yes, there will be delays, but not destruction. Simple remedies: help workers, be punctual, don't cheat. One lady from Bangalore, during Sade Sati she started small tiffin service, now she has 3 branches. Shani rewarded her hard work. I give simple, practical remedies - not expensive poojas.", category: "Astrology", author: "Rajeshwari", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&q=60", readTime: 7, createdAt: "2024-03-08", views: 4123 },
  { id: "art-4", title: "Love Marriage Problems - Family Not Agreeing?", excerpt: "How I handle love marriage cases - practical approach, not just astrology.", content: "Love marriage issue is 50% astrology, 50% family psychology. I first see compatibility honestly. If good, I help convince parents by showing chart strengths. If compatibility has issues, I tell clearly what adjustments needed. I don't give fake assurance. Recently, a couple from Hyderabad - both IT, families against due to caste. Chart showed strong 7th house connection, I explained to parents about future, they agreed. Now married 2 years. Astrology should unite families, not break.", category: "Love & Relationship", author: "Rajeshwari", image: "https://images.unsplash.com/photo-1520854221256-17451ccdf07b?w=600&h=400&fit=crop&q=60", readTime: 6, createdAt: "2024-03-05", views: 2890 },
  { id: "art-5", title: "Vastu for Small Houses - Bangalore Flats", excerpt: "You don't need to break walls. Small corrections for 2BHK flats.", content: "In Bangalore, most people live in flats, not independent houses. You cannot change toilet position. So I give practical Vastu - where to keep bed, which color for north wall, where to keep money locker in almirah. One family in Whitefield, their child was not sleeping well. I just asked to change bed direction from north to east and keep light yellow curtain. Child sleeps peacefully now. No need for expensive Vastu products. Simple logic.", category: "Vastu", author: "Rajeshwari", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop&q=60", readTime: 5, createdAt: "2024-03-01", views: 1876 },
  { id: "art-6", title: "Why I Don't Sell Gemstones", excerpt: "Important - read this before you buy any stone from anyone.", content: "Many astrologers force you to buy gemstone from them with commission. I never do that. Gemstones work, but only if you need it, and only natural. And weight matters. I tell you which stone, you can buy from anywhere you trust. I don't have any shop. One client spent 30k on blue sapphire from another astrologer, but his Shani was already strong - stone made him lazy. I asked to remove, he improved. Don't wear stone without proper consultation. Sometimes simple mantra is enough.", category: "Astrology", author: "Rajeshwari", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=400&fit=crop&q=60", readTime: 4, createdAt: "2024-02-28", views: 3421 }
];

// REALISTIC REVIEWS - like real people talking
export const reviews: Review[] = [
  { id: "rev-1", userId: "user-1", userName: "Shreya Kulkarni", astrologerId: "rajeshwari", rating: 5, comment: "I consulted Rajeshwari madam for my marriage delay. She saw my chart and told me clearly that my Shani is in 7th, so delay is natural till 29. No false promises. She gave simple Hanuman chalisa remedy. I got married at 29 as she said, happily. She speaks very calmly and explains in Kannada which my mother could also understand. Directly contact on 7892758565, no app commission.", createdAt: "2024-03-20T10:30:00Z", verified: true },
  { id: "rev-2", userId: "user-2", userName: "Ramesh Patil", astrologerId: "rajeshwari", rating: 5, comment: "Best astrology consultation I had. I am from Hubli, working in Bangalore. Career was stuck. Madam saw my Dasha and told me to wait till June 2023, then change job. I did, and got 40% hike. She doesn't scare you. Very practical. I contacted on WhatsApp 7892758565 and she replied same day. Fees also reasonable compared to other apps charging 50 per minute.", createdAt: "2024-03-18T14:20:00Z", verified: true },
  { id: "rev-3", userId: "user-3", userName: "Anitha Rao", astrologerId: "rajeshwari", rating: 5, comment: "My daughter's kundli matching - we were confused with 3 proposals. Rajeshwari madam explained each chart in detail, not just gun score. She told us which family would be more adjustable. We selected as per her advice, marriage happened in Feb 2024, daughter is very happy. She even attended marriage virtually and blessed. Very motherly nature.", createdAt: "2024-03-15T09:15:00Z", verified: true },
  { id: "rev-4", userId: "user-4", userName: "Suresh Babu", astrologerId: "rajeshwari", rating: 5, comment: "I was cheated by one astrologer who asked 15000 for pooja. Then my friend gave Rajeshwari number 7892758565. She told me no need for any expensive pooja, just do simple things at home. My business started improving after 2 months. She is honest, not money minded. I recommend to everyone in my circle in Rajajinagar.", createdAt: "2024-03-12T16:45:00Z", verified: true },
  { id: "rev-5", userId: "user-5", userName: "Lakshmi S", astrologerId: "rajeshwari", rating: 5, comment: "Love marriage issue - my parents were not agreeing. Rajeshwari madam spoke to my mother on phone in Kannada and convinced her by explaining our charts compatibility. She didn't take extra money for that. Now my mother also consults her for everything. Very down to earth person, not like those TV astrologers.", createdAt: "2024-03-10T11:20:00Z", verified: true },
  { id: "rev-6", userId: "user-6", userName: "Praveen Kumar", astrologerId: "rajeshwari", rating: 5, comment: "I am not much into astrology, but my wife forced me to consult for our second baby planning. Rajeshwari madam gave us good muhurat and explained why. Baby born healthy. She is not like those who say everything is dosha. She says clearly if something is not in chart also. That honesty I liked.", createdAt: "2024-03-08T13:10:00Z", verified: true },
  { id: "rev-7", userId: "user-7", userName: "Divya Nair", astrologerId: "rajeshwari", rating: 4, comment: "Consulted for my brother's job - he was trying for abroad. Madam told Rahu period going, so foreign chance high after September. He got offer in October from Canada. We were shocked how accurate. She is available on WhatsApp always, replies even at night if urgent. 7892758565 save this number.", createdAt: "2024-03-05T10:00:00Z", verified: true },
  { id: "rev-8", userId: "user-8", userName: "Manjunath Gowda", astrologerId: "rajeshwari", rating: 5, comment: "Vastu consultation for my new house in Mysore. She didn't ask to demolish anything. Just suggested to shift kitchen platform color and keep main door clutter free. My wife was having health issues, after changes she feels better. Simple and practical. Fees 500 only for Vastu visit, very reasonable.", createdAt: "2024-03-02T15:30:00Z", verified: true },
  { id: "rev-9", userId: "user-9", userName: "Priya Sharma", astrologerId: "rajeshwari", rating: 5, comment: "My husband and I had daily fights. We thought of divorce. Rajeshwari madam saw both charts and told us it's Mangal-Shani combination causing ego clashes, gave us simple remedy to do together. Now we understand each other better. She saved our marriage. Thank you madam.", createdAt: "2024-02-28T09:00:00Z", verified: true },
  { id: "rev-10", userId: "user-10", userName: "Arun Kumar", astrologerId: "rajeshwari", rating: 5, comment: "I have consulted 3-4 astrologers before, but Rajeshwari madam is different. She doesn't use big Sanskrit words to confuse. She speaks like your own family member. My mother who is 65 years old also understood everything. And she never forces to buy anything. Direct phone number 7892758565, no middleman.", createdAt: "2024-02-25T14:00:00Z", verified: true },
  { id: "rev-11", userId: "user-11", userName: "Sunita Reddy", astrologerId: "rajeshwari", rating: 5, comment: "For my son's education - he was not concentrating. Madam saw his chart and told us Mercury is weak, suggested to make him write daily and chant Saraswati mantra. Also changed his study table direction to east. In 3 months, his marks improved from 60% to 78%. Very grateful.", createdAt: "2024-02-20T11:30:00Z", verified: true },
  { id: "rev-12", userId: "user-12", userName: "Venkatesh Murthy", astrologerId: "rajeshwari", rating: 5, comment: "Business was going through loss. Rajeshwari madam checked my chart and told me Shani dasha running, so slow growth is expected, but after April 2024 it will improve. She was right, from May we got new contract. She gives realistic timeline, not fake immediate results. Honest astrologer.", createdAt: "2024-02-18T16:00:00Z", verified: true }
];

export const bookings: Booking[] = [
  { id: "book-1", userId: "user-1", astrologerId: "rajeshwari", astrologerName: "Rajeshwari", astrologerAvatar: "https://i.pravatar.cc/300?img=25", type: "voice", date: new Date().toISOString().split('T')[0], time: "10:00", duration: 30, price: 900, status: "upcoming", createdAt: new Date().toISOString(), notes: "Marriage compatibility" },
  { id: "book-2", userId: "user-1", astrologerId: "rajeshwari", astrologerName: "Rajeshwari", astrologerAvatar: "https://i.pravatar.cc/300?img=25", type: "chat", date: new Date(Date.now()-86400000).toISOString().split('T')[0], time: "18:00", duration: 20, price: 600, status: "completed", createdAt: new Date(Date.now()-86400000).toISOString(), notes: "Career guidance" }
];

export const horoscopes: Record<string, Horoscope> = {};
zodiacSigns.forEach(sign => {
  horoscopes[sign] = {
    sign,
    date: new Date().toISOString().split('T')[0],
    period: 'daily',
    love: `${sign} - In relationships, today calls for patience. If you are married, avoid bringing old issues. If single, don't rush. Let things happen naturally.`,
    career: `Work front: Focus on completing pending tasks. Avoid arguments with senior. Good day to plan, not to start new big work.`,
    money: `Money: Avoid lending today. Small expenses may come. Keep accounts clear.`,
    health: `Health: Take care of stomach and sleep. Avoid outside food today. Drink more water.`,
    family: `Family: Spend time with elders. Their advice will help.`,
    luckyNumber: Math.floor(Math.random()*9)+1,
    luckyColor: ["White","Yellow","Light Blue","Green"][Math.floor(Math.random()*4)],
    advice: `Today, be calm and speak less. Chant your ishta devata mantra 11 times morning.`
  };
});

export const walletTransactions: WalletTransaction[] = [
  { id: "txn-1", userId: "user-1", type: "credit", amount: 1000, description: "Added via UPI", method: "upi", createdAt: new Date(Date.now()-1000*60*60*24*5).toISOString(), status: "success" },
  { id: "txn-2", userId: "user-1", type: "debit", amount: 600, description: "Consultation with Rajeshwari - 20 mins", createdAt: new Date(Date.now()-1000*60*60*24*2).toISOString(), status: "success" },
];

export const notifications: Notification[] = [
  { id: "notif-1", userId: "user-1", title: "Consultation Tomorrow", message: "Your consultation with Rajeshwari is tomorrow at 10 AM. Be ready with your questions.", type: "booking", read: false, createdAt: new Date(Date.now()-1000*60*10).toISOString(), actionUrl: "/bookings" },
  { id: "notif-2", userId: "user-1", title: "Message from Rajeshwari", message: "Rajeshwari replied to your question. Check now.", type: "chat", read: false, createdAt: new Date(Date.now()-1000*60*30).toISOString(), actionUrl: "/chat" },
];

export const sampleQuestions: Question[] = [
  { id: "q-1", userId: "user-1", category: "career", question: "When will I get job change?", price: 99, status: "answered", createdAt: new Date().toISOString(), answer: "Your 10th lord is strong but Saturn transit causing delay. After June, good time for change. Don't resign before offer. Do Hanuman chalisa Tuesday." },
];

export const specialOffers = [
  { id: "offer-1", title: "First Consultation", discount: "₹200 OFF", code: "FIRST200", description: "For new clients", color: "from-amber-600 to-orange-700" }
];
