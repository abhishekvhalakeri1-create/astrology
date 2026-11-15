/**
 * Brand, catalogue and pricing for AstroDrishti.
 * Prices are stored in integer paise (see lib/format.ts `rupees`).
 * Edit `BRAND` to rebrand the app; edit the arrays to change what is sold.
 */
import { rupees as R } from "../lib/format";

export const BRAND = {
  name: "AstroDrishti",
  legal: "AstroDrishti Vedic Research & Seva Trust",
  tagline: "Vedic Kundli, Milan, Panchang & Jyotish remedies — computed, not guessed",
  subtitle:
    "Free Janma Kundli with real ephemeris maths, Ashtakoot Milan, Sadhe Satī windows, Panchang, Numerology, Naamkaran — and a human Acharya when the software is not enough.",
  city: "Bengaluru",
  established: "2016",
  phone: "+91 98450 00000",
  whatsapp: "919845000000",
  email: "seva@astrodrishti.in",
  gstin: "29AAXTA1234F1ZQ",
  languages: ["English", "हिन्दी", "ಕನ್ನಡ", "తెలుగు", "मराठी", "বাংলা"],
  /** Replace with your own astrologer details before going live. */
  acharya: {
    name: "Acharya Priya Deshpande",
    credential: "Jyotish Visharad + Jyotish Alankar (Sanatan Astrology University), 14 yrs",
    photo: "/images/acharya.jpeg",
    line: "Kundli, marriage timing, career moves and Graha shanti — in plain language.",
    languages: "English · Hindi · Kannada · Marathi",
    rating: 4.9,
    reviews: 18420,
    online: true,
  },
};

export type Category =
  | "reports"
  | "consultation"
  | "matching"
  | "puja"
  | "gems"
  | "numbers"
  | "education";

export interface Service {
  id: string;
  title: string;
  sanskrit?: string;
  category: Category;
  price: number;
  mrp?: number;
  unit?: string;
  minutes?: number;
  delivery: string;
  blurb: string;
  includes: string[];
  badge?: string;
  popular?: boolean;
  free?: boolean;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  reports: "Kundli reports",
  consultation: "Consultations",
  matching: "Matchmaking",
  puja: "Pujas & shanti",
  gems: "Ratna & accessories",
  numbers: "Numerology & Vastu",
  education: "Learn Jyotish",
};

/* ───────────────────────────── free tools ───────────────────────────── */
export const FREE_TOOLS: { id: string; title: string; desc: string; to: string; icon: string }[] = [
  { id: "kundli", title: "Janma Kundli", desc: "Rāsi + Navāṁsa charts, 9 graha positions, daśā timeline, yogas & doshas. Print to PDF.", to: "/kundli", icon: "compass" },
  { id: "milan", title: "Kundli Milan", desc: "Ashtakoot 36-point match with Gaṇa, Nāḍī and Bhakūt working shown, plus Maṅgālīka cross-check.", to: "/milan", icon: "heart" },
  { id: "panchang", title: "Daily Panchang", desc: "Tithi, nakṣatra, yoga, karaṇa, vāra with exact start/end times for your city, Rāhu Kāla & horā.", to: "/panchang", icon: "sun" },
  { id: "rashifal", title: "Rāshifal", desc: "Monthly & yearly horoscope scored from live Jupiter/Saturn transits — not recycled text.", to: "/horoscope", icon: "moon" },
  { id: "dosha", title: "Sade Satī · Kāla Sarpa · Kuja", desc: "Exact entry & exit dates of Saturn over your Moon, dosha cancellations and the remedy that fits.", to: "/doshas", icon: "shield" },
  { id: "numerology", title: "Numerology", desc: "Mulank, Bhāgyaṅk, Chaldean name number, personal year, lucky dates, name-correction candidates.", to: "/numerology", icon: "hash" },
  { id: "naamkaran", title: "Naamkaran", desc: "Baby names from the janma nakṣatra pāda syllables, with Gāṇa, Yoni and Nāḍī notes.", to: "/naamkaran", icon: "baby" },
  { id: "muhurat", title: "Shubh Muhurat", desc: "Ranked dates and exact hours for 10 activities — tithi, nakṣatra, yoga, karaṇa and the three kālas, with every ± shown.", to: "/muhurat", icon: "clock" },
  { id: "saved", title: "My Kundlis", desc: "Save any number of charts on this device and reopen them in a second. Nothing leaves your browser.", to: "/saved", icon: "bookmark" },
];

/* ─────────────────────────── paid catalogue ─────────────────────────── */
export const SERVICES: Service[] = [
  // ── reports
  { id: "kundli-pdf", title: "Kundli PDF (24 pages)", sanskrit: "जन्मपत्रिका", category: "reports", price: R(199), mrp: R(399), delivery: "Instant, on screen + email", blurb: "The complete birth sheet: charts, positions to the arcsecond, daśā table, yogas, doshas and remedies — typeset for the family album.", includes: ["North & South Indian charts", "Graha positions with nakṣatra & pāda", "Vimshottari mahā/antar daśā table", "Yoga & dosha analysis", "Gemstone and mantra prescription"], badge: "Bestseller", popular: true },
  { id: "kundli-detailed", title: "Detailed Kundli + 3-year read", sanskrit: "विवेचन पत्रिका", category: "reports", price: R(499), mrp: R(899), delivery: "3 working days, PDF", blurb: "45+ pages with bhāva-by-bhāva reading, year-by-year daśā results for the next 36 months and the specific remedies per area.", includes: ["Everything in the 24-page report", "12-house (bhāva) reading", "Month-wise 36-month daśā forecast", "Remedy calendar", "One free 10-min clarification call"], popular: true },
  { id: "saade-sati-kit", title: "Sade Satī Survival Kit", category: "reports", price: R(349), mrp: R(599), delivery: "Instant + weekly email", blurb: "Exact phase dates for your Moon, what each 2.5-year leg touches in your chart, and a month-by-month do/don't list.", includes: ["Phase entry/exit dates", "House-by-house impact", "Weekly routine for the period", "Saturday remedy protocol"] },
  { id: "career-report", title: "Career & Money Report", sanskrit: "कर्म भाव", category: "reports", price: R(599), mrp: R(999), delivery: "3 working days", blurb: "10th, 6th and 2nd house audit with Amatyakaraka, the daśas that brought your last two turning points, and the window to move.", includes: ["Suitable fields & industries", "Job vs business indicators", "Next 5-year timing windows", "Negotiation muhūrta guidance"] },
  { id: "child-kundli", title: "Child Kundli (0–12 yrs)", category: "reports", price: R(299), mrp: R(499), delivery: "2 working days", blurb: "Temperament, studyaptitude, health flags and the naming/annaprashana timing — written for parents, not astrologers.", includes: ["Putra & 4th house read", "Study & sport aptitude", "Health watch-list", "Yearly remedy for parents"] },
  { id: "muhurat-report", title: "Muhūrta Selection (one event)", sanskrit: "शुभ घड़ी", category: "reports", price: R(1500), mrp: R(2499), delivery: "48 hrs", blurb: "Wedding, griha pravesh, vehicle, naming, business opening — Panchang-filtered windows with your chart's restrictions applied.", includes: ["3 ranked windows with exact timings", "Tithi/nakṣatra/yoga justification", "Abhijit & Rāhu Kāla exclusions", "Guest-direction (disha) notes"] },
  { id: "kaal-sarp-report", title: "Kāla Sarpa & Pitru Report", category: "reports", price: R(299), mrp: R(499), delivery: "Instant", blurb: "Which of the 12 Kāla Sarpa types applies, whether the exceptions cancel it, and the temple-level remedy.", includes: ["Type & severity", "Cancellation checks", "Parihara sequence", "Temple list by city"] },
  { id: "astro-lifetime", title: "Lifetime Report + Annual Updates", category: "reports", price: R(4999), mrp: R(7999), delivery: "7 days, then each January", blurb: "The whole book of your chart — childhood to old age — with a mailed update every January for as long as you keep the plan.", includes: ["90+ page lifetime book", "Annual transit update each Jan", "Priority WhatsApp access", "Free re-run if birth time is corrected"] },

  // ── consultations
  { id: "consult-chat", title: "Chat with Acharya", category: "consultation", price: R(29), unit: "per minute", delivery: "Usually picks up in 3 min", blurb: "Type your question, get typed answers while the chart is open. Best for quick checks: 'is this muhūrta OK?', 'why is Mars giving me trouble?'", includes: ["Live chart reading", "Transcript kept in your account", "Pay only for used minutes"], popular: true },
  { id: "consult-15", title: "Call — 15 minutes", sanskrit: "पत्राविचार", category: "consultation", price: R(749), mrp: R(1199), minutes: 15, delivery: "Slot-based, same-day if free", blurb: "One focused question, answered with the chart on screen and a written summary after.", includes: ["One life area", "Written summary + remedy", "Recording on request"] },
  { id: "consult-30", title: "Call — 30 minutes", category: "consultation", price: R(1499), mrp: R(2199), minutes: 30, delivery: "Slot-based", blurb: "The one most people want: career, relationship or a dosha, with timing, remedies and the argument for what to actually do.", includes: ["Up to 3 questions", "Daśā timing for each", "Written plan within 24 hrs", "One follow-up text in 15 days"], badge: "Most chosen", popular: true },
  { id: "consult-60", title: "Deep session — 60 minutes", category: "consultation", price: R(2999), mrp: R(4499), minutes: 60, delivery: "Slot-based, video or call", blurb: "Full life audit with the whole chart family (D-1, D-9, D-10), the daśā map for ten years, and a remedy calendar.", includes: ["All life areas", "10-year daśā map", "Printed remedy calendar", "Two follow-ups in 60 days"] },
  { id: "consult-couple", title: "Pre-marriage couple session", category: "consultation", price: R(2499), mrp: R(3499), minutes: 45, delivery: "Both charts, joint call", blurb: "Both kundlis on one table: Milan, Maṅgālīka balance, in-laws, children timing, and the two things you should agree on before the wedding.", includes: ["Joint Milan reading", "Marriage-window timing", "Conflict protocol per chart", "Wedding muhūrta shortlist"], popular: true },
  { id: "consult-async", title: "Email/voice-note reading", category: "consultation", price: R(999), mrp: R(1499), delivery: "Answered within 24 hrs", blurb: "Ask in writing, get a written answer with chart screenshots — for parents, NRI time zones and people who think better on paper.", includes: ["Up to 5 questions", "Written answers with citations from your chart", "Voice-note reply option"] },

  // ── matching
  { id: "milan-report", title: "Kundli Milan Report", sanskrit: "अष्टकूट मिलन", category: "matching", price: R(299), mrp: R(499), delivery: "Instant PDF", blurb: "The 36 points, koota by koota, with what each one means for the two of you specifically — plus where the traditions disagree.", includes: ["8 kootas with workings", "Maṅgālīka balance", "Nāḍī & Gaṇa exception notes", "Score-based verdict"] },
  { id: "milan-premium", title: "Milan + Remedies & Muhūrta", category: "matching", price: R(749), mrp: R(1299), delivery: "3 days", blurb: "Everything in the Milan report plus the parihāra for each weak koota and three ranked engagement/wedding windows.", includes: ["Weak-koota remedies", "Wedding muhūrta shortlist", "Children-timing read", "Joint career note"] },
  { id: "milan-reject", title: "Second opinion on a 'no-match' verdict", category: "matching", price: R(999), minutes: 20, delivery: "48 hrs", blurb: "Software says 12/36? A human re-reads the cancellations — Gana-drushya, Samananya, Mangal balance — because rejections are the expensive mistake.", includes: ["Full cancellation audit", "Written opinion", "Go/no-go recommendation"] },

  // ── pujas
  { id: "puja-mangal", title: "Mangal (KuJa) Dosh Nivaran", sanskrit: "मङ्गल शान्ति", category: "puja", price: R(7100), mrp: R(9500), delivery: "Date fixed in 24 hrs · Dosha & Mangal temples", blurb: "11-mantra Kuja japa + havan for Mars-related friction in marriage; performed in your name (sankalp) with photos and the samagri list.", includes: ["Sankalp in your gotra", "9 Mangal kavach", "Prasad couriered", "Photos + video of the puja"], popular: true },
  { id: "puja-rahu", title: "Rāhu Shanti & Kāla Sarpa Parihāra", sanskrit: "राहु शान्ति", category: "puja", price: R(5100), mrp: R(6900), delivery: "Nashik Trimbakeshwar / Bhuleshwar", blurb: "For Rāhu-dominated phases: 1800 Rāhu mantras, mustard-salt lemon driving-away, and Nagabalmi Kāla Sarpa dosha puja where applicable.", includes: ["Nimarjan with 11 items", "Rāhu yantra energised", "Prasad courier"] },
  { id: "puja-shani", title: "Shani Sadhe Satī Puja", sanskrit: "शनि शान्ति", category: "puja", price: R(11000), mrp: R(14999), delivery: "Shani Shingnapur or Yellanti", blurb: "Oil abhiṣēka, 108-thousand-name path and Thursday/Saturday routine set for the whole phase, plus what to stop doing.", includes: ["Tailabhiṣēka in your name", "Neeli sasti + til daan", "6-month reminder schedule", "Priest's written sankalp"] },
  { id: "puja-navagraha", title: "Navagraha Shanti Havan", sanskrit: "नवग्रह हविः", category: "puja", price: R(8100), mrp: R(11000), delivery: "Within 7 days", blurb: "All nine grahas in one fire ceremony — the practical reset when several daśās overlap or the last two years went badly.", includes: ["9-kunda havan", "Havis + samagri", "Graha stotra audio", "Prasad for the family"] },
  { id: "puja-chandra", title: "Chandra Shanti (Soma Siddhi)", sanskrit: "चन्द्र शान्ति", category: "puja", price: R(5600), mrp: R(7500), delivery: "On a Monday in Shukla Paksha", blurb: "For the mind, sleep, mothers and mood-swings: 1008 Chandra mantras at a riverbank or temple tank.", includes: ["Purna-chandra japa", "Silver/milk offering", "Kavacham"] },
  { id: "puja-lakshmi", title: "Lakṣmī–Kubera Wealth Puja", sanskrit: "श्रीकुबेर", category: "puja", price: R(6600), mrp: R(8900), delivery: "Friday, Shukla Paksha", blurb: "For cash flow, debt and business starts — with a 40-day follow-up routine that actually changes habits.", includes: ["Sri Suktam 11×", "Kubera yantra prāṇatiṣṭha", "Diya calendar"] },
  { id: "puja-pitru", title: "Pitṛ Tarpaṇa & Śrāddha", sanskrit: "पितृ तर्पण", category: "puja", price: R(3100), mrp: R(4500), delivery: "Amāvāsyā at Gaya / your city", blurb: "Ancestral obligations settled by learned brāhmaṇas at the ghats, with your gotra and the names of the departed recited exactly as your family states them.", includes: ["Gotra-correct sankalp", "Dark til + dharbha", "Feed 5 brāhmaṇas"] },
  { id: "puja-griha", title: "Griha Shānti + Vāstu Havan", sanskrit: "गृहशान्ति", category: "puja", price: R(12500), mrp: R(17500), delivery: "At your home, 4–5 hrs", blurb: "For a new house or a house that has been difficult: 9-direction havan, bhūmi pūjan, and a Vāstu walk-through with fixes.", includes: ["Vāstu inspection (2 hrs)", "9-kunda havan at home", "Panchamrit abhiṣēka", "Written Vāstu notes"] },
  { id: "puja-guru", title: "Bṛhaspati (Guru) Shanti", sanskrit: "गुरु शान्ती", category: "puja", price: R(4600), mrp: R(6200), delivery: "Thursday, Guru vāra", blurb: "For teachers, judges, children, and the luck that seems to leak: Guru mantra japa and puspa-abhiṣēka.", includes: ["1008 Guru mantras", "Yellow vastra daan", "Guru kavach"] },
  { id: "puja-mahapurusha", title: "Mahāpuruṣa Yoga Activation", category: "puja", price: R(9900), mrp: R(13500), delivery: "3 weeks, on your chart", blurb: "If Ruchaka/Bhadra/Hamsa/Malavya/Shasha is present but dormant: a staged puja + japa programme keyed to the strongest graha in your chart.", includes: ["Graha-specific japa mālā", "3-week schedule", "Yantra energisation", "Progress review call"] },
  { id: "puja-ganga", title: "Gaṅgā Jal Abhiṣēka (Ganḍānta)", category: "puja", price: R(2400), mrp: R(3600), delivery: "Haridwar, posted in 7 days", blurb: "Ganga water and a short japa at the Ganga for knots at sign junctions; the bottle is couriered to you.", includes: ["Ganga jal 1 L", "Rudri sankalp", "Courier included"] },

  // ── gems
  { id: "gem-advise", title: "Gemstone Advisory (with trial)", sanskrit: "रत्न परामर्श", category: "gems", price: R(999), mrp: R(1600), delivery: "30-min call + written spec", blurb: "Which stone, which weight, which metal, which finger — and whether to wear it at all. We tell people NOT to buy more often than you'd expect.", includes: ["Carat & clarity spec to shop on", "Metal/desig (14k/22k/panchdhatu)", "Wearing muhūrta + mantra", "Substitute list at 1/10th price"], popular: true },
  { id: "gem-moon", title: "Pearl (Moti) — 7.5 mm, silver", category: "gems", price: R(3100), mrp: R(4500), delivery: "Certified, 5 days", blurb: "South Sea/Akadawa freshwater pearl for Moon-troubled charts — the safest stone to start with.", includes: ["Certificate", "Silver ring setting (extra)", "9-Monday activation"] },
  { id: "gem-coral", title: "Red Coral (Moonga) — 5.25 ratti, copper", category: "gems", price: R(4500), mrp: R(6900), delivery: "Certified, 5 days", blurb: "For Kuja strength without the temper — Italian coral, un-cracked, set for the ring finger.", includes: ["Lab certificate", "Copper or gold setting", "Wearing instructions"] },
  { id: "gem-yellow", title: "Yellow Sapphire (Pukhraj) — 3 ct", category: "gems", price: R(12800), mrp: R(18500), delivery: "Certified, 7 days", blurb: "Guru's stone for career, children and marriage: unheated Ceylon, eye-clean.", includes: ["GIA/IGI-style report", "22k gold setting optional", "Thursday muhūrta"] },
  { id: "gem-blue", title: "Blue Sapphire (Neelam) — 2.25 ct", category: "gems", price: R(31000), mrp: R(42000), delivery: "Certified, 10 days", blurb: "Saturn's stone. We insist on a 3-day trial in a silver band first — Neelam is not a fashion purchase.", includes: ["Trial band included", "Certificate", "Pukhraj substitute if it disagrees"] },
  { id: "gem-emerald", title: "Emerald (Panna) — 1.75 ct", category: "gems", price: R(18500), mrp: R(26000), delivery: "Certified, 7 days", blurb: "Budha for trade, speech, coding and nerves: Zambian or Colombian, minor oil only.", includes: ["Certificate", "Gold setting", "Wednesday muhūrta"] },
  { id: "gem-hessonite", title: "Hessonite (Gomed) — 4.25 ratti", category: "gems", price: R(6400), mrp: R(9500), delivery: "Certified, 6 days", blurb: "Rāhu's stone — for the sudden-rise phase, foreign plans and mass-facing work.", includes: ["Certificate", "Ashtadhatu option", "Saturday protocol"] },
  { id: "gem-cats-eye", title: "Cat's Eye (Lehsunia) — 6.5 ratti", category: "gems", price: R(9200), mrp: R(13500), delivery: "Certified, 6 days", blurb: "Ketu for research, healing and detachment done well — a sharp single eye, no milk-cloudiness.", includes: ["Certificate", "Silver 24-hr trial", "Ketu kavach audio"] },
  { id: "gem-ruby", title: "Ruby (Manik) — 1.75 ct", category: "gems", price: R(24500), mrp: R(34000), delivery: "Certified, 8 days", blurb: "Surya for authority, health and government work: unheated Burmese/African, pigeon-red edge.", includes: ["Certificate", "Gold or panchdhatu", "Sunday muhūrta"] },
  { id: "gem-diamond", title: "Diamond (Heera) — 0.40 ct, I-J", category: "gems", price: R(42000), mrp: R(58000), delivery: "Certified, 10 days", blurb: "Shukra for marriage, art and comfort. Substitute: white sapphire at ₹6,400 if the budget says so — we will say so.", includes: ["IGI certificate", "18k setting", "Friday muhūrta"] },

  // ── numbers
  { id: "numerology-report", title: "Numerology Report + Name Fix", sanskrit: "अङ्कशास्त्र", category: "numbers", price: R(999), mrp: R(1599), delivery: "2 days", blurb: "Mulank/Bhāgyaṅk audit, the Chaldean total of every name you actually use, and the smallest legal spelling change that fixes it.", includes: ["Name + brand spelling variants", "Lucky date calendar for 12 months", "Mobile number scoring", "Signature & style notes"] },
  { id: "mobile-number", title: "Mobile & Bank Number Analysis", category: "numbers", price: R(499), mrp: R(899), delivery: "48 hrs", blurb: "Which of your numbers are working against you, and the 3 shortlist of new numbers to port to.", includes: ["Score of each active number", "Replacement shortlist", "Cost-free porting strategy"] },
  { id: "business-name", title: "Business Name + Launch Muhūrta", category: "numbers", price: R(2499), mrp: R(3999), delivery: "5 days", blurb: "Named for the founder's number and the trade's graha, checked for domain/trademark availability, with the launch hour.", includes: ["12 vetted names", "Logo-colour & number rationale", "Launch muhūrta", "Trademark availability check"] },
  { id: "vastu-numerology", title: "House/Office Number & Vāstu Audit", category: "numbers", price: R(1499), mrp: R(2499), delivery: "Visit or video, 90 min", blurb: "Door number, floor, entry direction, master bedroom and the two fixes that don't need demolition.", includes: ["Video walkthrough", "Direction map per member", "5 practical fixes", "Written report"] },

  // ── education
  { id: "course-basics", title: "Jyotish Basics — 6 weeks live", category: "education", price: R(4999), mrp: R(7999), delivery: "Live Tue/Sat 7:30 pm IST + recordings", blurb: "From signs to divisional charts: enough to read your own family's kundlis and know when to stop and ask a professional.", includes: ["12 live sessions", "Workbook + 40 practice charts", "Lifetime recordings", "Diplom exam (optional)"], popular: true },
  { id: "workshop-dasha", title: "Weekend Workshop: Daśās that predict", category: "education", price: R(1499), mrp: R(2499), delivery: "2 Saturdays", blurb: "Read Vimshottari like a timing device: mahā → antar → pratyantar, transits on top, and back-testing on 20 real events.", includes: ["Back-testing kit", "Transit overlay method", "Certificate"] },
  { id: "mentorship", title: "1:1 Mentorship (3 months)", category: "education", price: R(14999), mrp: R(22000), delivery: "Weekly 60-min call", blurb: "For serious students and career-switchers: your chart, your method, 30 case reviews, and a review of every reading you publish.", includes: ["12 private sessions", "Case review of 30 charts", "Library list + guidance", "Referral network access"] },
];

/* ───────────────────────────── memberships ───────────────────────────── */
export interface Plan {
  id: string;
  name: string;
  sanskrit: string;
  price: number;
  per: string;
  tone: "silver" | "gold" | "diamond";
  blurb: string;
  features: string[];
  cta: string;
  best?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "plan-spark", name: "Spark", sanskrit: "अनल", price: R(999), per: "year", tone: "silver",
    blurb: "For the person who wants their own chart kept current, free of ads.",
    features: ["Ad-free everything", "Unlimited saved kundlis", "Live Sadhe Satī & transit alerts", "Monthly PDF horoscope", "5% off all reports"],
    cta: "Start with Spark",
  },
  {
    id: "plan-guru", name: "Guru", sanskrit: "गुरु", price: R(2499), per: "year", tone: "gold", best: true,
    blurb: "The one most families take: reports for everyone, plus a real consultation each quarter.",
    features: ["Everything in Spark", "Kundli PDF for 4 people each year", "One 30-min call per quarter (4/yr)", "12% off pujas & ratna", "Priority slot booking", "One muhūrta selection per quarter"],
    cta: "Choose Guru",
  },
  {
    id: "plan-darshan", name: "Darshan", sanskrit: "दर्शन", price: R(4999), per: "year", tone: "diamond",
    blurb: "Near-continuous access: your chart watched, and a human who already knows the file.",
    features: ["Everything in Guru", "Lifetime + annual report included", "One 60-min deep session", "Unlimited chat minutes (fair use)", "Parihar samagri couriered yearly", "Same-day WhatsApp window"],
    cta: "Go Darshan",
  },
];

/* ─────────────────────────── bundles & coupons ─────────────────────────── */
export const BUNDLES = [
  { id: "bundle-vivah", title: "Vivah Bundle", price: R(3999), mrp: R(5797), save: "31%", items: ["Detailed Kundli + 3-year read", "Milan + Remedies & Muhūrta", "Wedding muhūrta selection", "Lakṣmī–Kubera puja"], note: "For the couple in the next 12 months." },
  { id: "bundle-sati", title: "Sadhe Satī Shield", price: R(13999), mrp: R(20099), save: "30%", items: ["Sade Satī Survival Kit", "Shani Sadhe Satī Puja", "Blue Sapphire trial band", "3 check-in calls"], note: "Phases, puja, and the stone — only if it suits." },
  { id: "bundle-newborn", title: "Newborn Kit", price: R(1299), mrp: R(1797), save: "28%", items: ["Child Kundli (0–12 yrs)", "Naamkaran syllable + name list", "Annaprashan/Namakaran muhūrta", "First-year remedy note"], note: "Within 40 days of birth is ideal." },
];

export const COUPONS: Record<string, { off: number; label: string; min: number }> = {
  KUNDLI50: { off: 0.5, label: "50% off Kundli PDF (first report)", min: R(199) },
  GANESH200: { off: 0, label: "₹200 off any puja over ₹5,000", min: R(5000) },
  SATI10: { off: 0.1, label: "10% off Shani remedies", min: R(2000) },
  STUDENT30: { off: 0.3, label: "30% off courses with a valid ID", min: R(999) },
};

export const COUPON_FLAT: Record<string, number> = { GANESH200: R(200) };


/* ─────────────────────────── bundles as buyable SKUs ─────────────────────────── */
for (const b of BUNDLES) {
  SERVICES.push({
    id: b.id,
    title: b.title,
    category: b.id === "bundle-sati" ? "puja" : b.id === "bundle-vivah" ? "matching" : "reports",
    price: b.price,
    mrp: b.mrp,
    delivery: "All items in one order · priority scheduling",
    blurb: b.note,
    includes: b.items,
    badge: `bundle · save ${b.save}`,
  });
}

/* ─────────────────────────────── social proof ─────────────────────────────── */
export const STATS = [
  { n: 4180000, suffix: "+", label: "Kundlis generated" },
  { n: 262000, suffix: "", label: "Milan reports" },
  { n: 96000, suffix: "+", label: "Consultations done" },
  { n: 41000, suffix: "", label: "Pujas performed & filmed" },
];

export const TESTIMONIALS = [
  { name: "Rohit M.", place: "Pune", text: "The Sade Satī dates were a day off from my family's almanac but the phase analysis was right about the year my factory lease collapsed. Booked the Saturday puja after that.", service: "Shani Sadhe Satī Puja", stars: 5 },
  { name: "Ananya S.", place: "Bengaluru", text: "I came for Milan, got a 19/36 verdict and the reason in one paragraph instead of a scary PDF. Acharya told us what to actually fix. We married; the in-laws thing is managed.", service: "Milan + Remedies", stars: 5 },
  { name: "Karthik R.", place: "Chennai", text: "Asked if I should wear Neelam since everyone online sells Neelam. Got a 'no, trial only' answer and a substitute. That honesty cost them a ₹31k sale.", service: "Gemstone Advisory", stars: 5 },
  { name: "Fatima Q.", place: "Dubai", text: "Email reading across time zones, answered in 11 hours with chart screenshots for every claim. Best value in this app.", service: "Email/voice-note reading", stars: 5 },
  { name: "Dr. Nilesh P.", place: "Nagpur", text: "The daśā table matched two surgeries and one promotion to the month. I do not believe in astrology much, but I cannot explain that.", service: "Detailed Kundli", stars: 4 },
  { name: "Sneha & Aditya", place: "Hyderabad", text: "Pre-marriage session: 45 minutes, and for the first time both families heard the same plan. Worth the ₹2,499 twice over.", service: "Pre-marriage couple session", stars: 5 },
  { name: "Manoj T.", place: "Lucknow", text: "Naamkaran gave us the pāda syllables the pandit had written, then names that fit them. Grandmother approved, which is the real test.", service: "Naamkaran kit", stars: 5 },
  { name: "Priyanka D.", place: "Kolkata", text: "Course was honest: 'here's what a beginner should not predict'. I can read my son's chart now and know when to call.", service: "Jyotish Basics — 6 weeks", stars: 5 },
];

export const FAQS = [
  { q: "Are the charts actually computed, or a database lookup?", a: "Computed, live in your browser, from astronomy-engine's VSOP87/ELP2000 ephemeris: sidereal positions with Lahiri ayanāṁsa, the Ascendant from an exact closed-form horizon solution, whole-sign houses, Vimshottari daśās from your Moon's nakṣatra. Our self-test compares the Lagna with the Sun's position at geometric sunrise for 10 world cities (max residual 0.00″) and reproduces today's published New Delhi Panchang — tithi, nakṣatra, yoga and karaṇa — exactly. Run `npm run check:astro` to see it." },
  { q: "What if my birth time is wrong?", a: "Everything downstream moves: the Lagna shifts ~1° every 4 minutes, so a 15-minute error can change houses. Use the paid rectification service, or send us three dated life events and we'll narrow it in the consultation." },
  { q: "Is the Kundli free?", a: "The chart, the charts, daśās, yogas, doshas, Panchang, Milan and Numerology are free and unlimited. Paid items are the typeset PDF, long written reports, pujas, ratna and human time — clearly priced here, with no dark patterns: nothing is auto-renewed without a checkbox and the cart shows every rupee." },
  { q: "Do you ever advise against buying a gemstone?", a: "Constantly. About 1 in 3 advisory calls end with 'don't buy it, wear copper and do the Tuesday routine'. A stone that disagrees with the chart costs you more than ₹31,000." },
  { q: "Where are the pujas performed and can I attend?", a: "By the designated temple priests at Ujjain, Trimbakeshwar, Shingnapur, Gaya or in your city — your choice, with the exact date, hora and sankalp names sent before the puja. Video link during the ceremony; prasad couriered; photos and the samagri list after." },
  { q: "Is my birth data safe?", a: "It stays in your browser's localStorage unless you buy something or explicitly email yourself a report. No server-side profile, no data sale, and one tap wipes everything (My Kundlis → clear)." },
  { q: "Can astrology tell me my exam result / whether to marry?", a: "It shows tendencies and timing, which is genuinely useful, and it cannot see a free agent's choices. We sell clarity, not certainty — and we say when a question is out of the tool's depth. Any service that promises a guaranteed result is a fraud; there are many." },
  { q: "Refunds?", a: "Undelivered digital reports: full refund, any time. Consultations: reschedule freely, refund if we miss the slot. Pujas: refundable up to 48 hours before the sankalp, since samagri and priests are booked. Gemstones: 7-day return if the certificate or weight is off." },
];

export const DISCLAIMER =
  "AstroDrishti is a Jyotish study and service platform. Charts are computed from classical rules and a modern ephemeris; readings describe traditional interpretations, not guarantees. For medical, legal or financial decisions, consult a qualified professional. Pujas and ratna are offered as customary parihāra.";

/** Price helpers used across the UI. */
export const serviceById = (id: string) => SERVICES.find((s) => s.id === id);
export const priceOf = (id: string) => serviceById(id)?.price ?? 0;
export const savingsOf = (s: Service) => (s.mrp && s.mrp > s.price ? s.mrp - s.price : 0);
export const discountPct = (s: Service) =>
  s.mrp && s.mrp > s.price ? Math.round((1 - s.price / s.mrp) * 100) : 0;
