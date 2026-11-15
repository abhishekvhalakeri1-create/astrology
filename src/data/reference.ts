/**
 * Vedic astrology reference tables used by the computation engine.
 * Sources: classical Parashari conventions (BPHS-style rules as commonly
 * published by Indian almanacs / AstroSage-class software).
 */

export type Graha = "Su" | "Mo" | "Ma" | "Me" | "Ju" | "Ve" | "Sa" | "Ra" | "Ke";

export interface PlanetInfo {
  id: Graha;
  name: string;
  sanskrit: string;
  deva: string;
  glyph: string;
  color: string;
  gem: string;
  metal: string;
  day: string;
  direction: string;
  tree: string;
  mantras: string[];
  significations: string[];
  /** Mahadasha length in Vimshottari (years) */
  dashaYears: number;
  /** degrees of solar separation that cause combustion (applicable to 5 visible grahas) */
  combustLimit?: number;
  /** deep exaltation sign index + degree, deep debilitation sign index + degree */
  exaltSign?: number;
  exaltDeg?: number;
  debilitSign?: number;
  debilitDeg?: number;
  ownSigns?: number[];
  friendSigns?: number[];
  enemySigns?: number[];
}

export interface SignInfo {
  index: number;
  name: string;
  sanskrit: string;
  glyph: string;
  lord: Graha;
  element: "Fire" | "Earth" | "Air" | "Water";
  quality: "Movable" | "Fixed" | "Dual";
  gender: "Male" | "Female";
  number: number;
  color: string;
  gem: string;
  metal: string;
  stone: string;
  direction: string;
  body: string;
  nature: string;
}

export interface NakshatraInfo {
  index: number;
  name: string;
  sanskrit: string;
  lord: Graha;
  deity: string;
  symbol: string;
  gana: "Deva" | "Manushya" | "Rakshasa";
  yoni: string;
  /** 0 Brahmin, 1 Kshatriya, 2 Vaishya, 3 Shudra (cyclic nakshatra rule) */
  varna: number;
  /** name-giving syllables for the four padas */
  syllables: [string, string, string, string];
  nature: string;
  remedies: string;
}

export const SIGNS: SignInfo[] = [
  { index: 0, name: "Aries", sanskrit: "मेष", glyph: "Meṣa", lord: "Ma", element: "Fire", quality: "Movable", gender: "Male", number: 9, color: "Red", gem: "Red Coral", metal: "Copper", stone: "Ruby", direction: "East", body: "Head, face", nature: "Initiative, courage, quick starts" },
  { index: 1, name: "Taurus", sanskrit: "वृषभ", glyph: "Vṛṣabha", lord: "Ve", element: "Earth", quality: "Fixed", gender: "Female", number: 6, color: "White", gem: "Diamond", metal: "Silver", stone: "Sapphire", direction: "South-East", body: "Throat, neck", nature: "Steadiness, comfort, value" },
  { index: 2, name: "Gemini", sanskrit: "मिथुन", glyph: "Mithuna", lord: "Me", element: "Air", quality: "Dual", gender: "Male", number: 5, color: "Green", gem: "Emerald", metal: "Bronze", stone: "Emerald", direction: "North-West", body: "Lungs, arms", nature: "Speech, curiosity, exchange" },
  { index: 3, name: "Cancer", sanskrit: "कर्क", glyph: "Karka", lord: "Mo", element: "Water", quality: "Movable", gender: "Female", number: 2, color: "Cream", gem: "Pearl", metal: "Silver", stone: "Pearl", direction: "North", body: "Chest, stomach", nature: "Care, memory, belonging" },
  { index: 4, name: "Leo", sanskrit: "सिंह", glyph: "Siṃha", lord: "Su", element: "Fire", quality: "Fixed", gender: "Male", number: 1, color: "Orange", gem: "Ruby", metal: "Gold", stone: "Ruby", direction: "East", body: "Heart, spine", nature: "Authority, creativity, pride" },
  { index: 5, name: "Virgo", sanskrit: "कन्या", glyph: "Kanyā", lord: "Me", element: "Earth", quality: "Dual", gender: "Female", number: 5, color: "Olive green", gem: "Emerald", metal: "Brass", stone: "Emerald", direction: "South-East", body: "Nerves, digestion", nature: "Analysis, service, precision" },
  { index: 6, name: "Libra", sanskrit: "तुला", glyph: " Tulā", lord: "Ve", element: "Air", quality: "Movable", gender: "Male", number: 6, color: "Light blue", gem: "Diamond", metal: "Silver", stone: "Opal", direction: "West", body: "Waist, kidneys", nature: "Balance, partnership, taste" },
  { index: 7, name: "Scorpio", sanskrit: "वृश्चिक", glyph: "Vṛścika", lord: "Ma", element: "Water", quality: "Fixed", gender: "Female", number: 9, color: "Dark red", gem: "Red Coral", metal: "Copper", stone: "Topaz", direction: "South", body: "Reproductive organs", nature: "Depth, research, transformation" },
  { index: 8, name: "Sagittarius", sanskrit: "धनु", glyph: "Dhanu", lord: "Ju", element: "Fire", quality: "Dual", gender: "Male", number: 3, color: "Saffron", gem: "Yellow Sapphire", metal: "Gold", stone: "Topaz", direction: "North-East", body: "Hips, thighs", nature: "Wisdom, travel, dharma" },
  { index: 9, name: "Capricorn", sanskrit: "मकर", glyph: "Makara", lord: "Sa", element: "Earth", quality: "Movable", gender: "Female", number: 8, color: "Dark blue", gem: "Blue Sapphire", metal: "Iron", stone: "Garnet", direction: "South-West", body: "Bones, knees", nature: "Discipline, structure, patience" },
  { index: 10, name: "Aquarius", sanskrit: "कुंभ", glyph: "Kumbha", lord: "Sa", element: "Air", quality: "Fixed", gender: "Male", number: 4, color: "Blue", gem: "Blue Sapphire", metal: "Steel", stone: "Lapis", direction: "West", body: "Calves, ankles", nature: "Ideas, networks, reform" },
  { index: 11, name: "Pisces", sanskrit: "मीन", glyph: "Mīna", lord: "Ju", element: "Water", quality: "Dual", gender: "Female", number: 7, color: "Turquoise", gem: "Yellow Sapphire", metal: "Silver", stone: "Moonstone", direction: "North-East", body: "Feet, immunity", nature: "Faith, art, release" },
];

export const PLANETS: PlanetInfo[] = [
  {
    id: "Su", name: "Sun", sanskrit: "सूर्य", deva: "Lord Surya", glyph: "☉",
    color: "Orange / Red", gem: "Ruby (Manik)", metal: "Gold", day: "Sunday", direction: "East", tree: "Padma / Bilva",
    mantras: ["ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः", "आदित्याय नमः"],
    significations: ["Soul, ego", "Father", "Authority & govt", "Health of the eyes", "Name and power"],
    dashaYears: 6, combustLimit: 0, exaltSign: 0, exaltDeg: 10, debilitSign: 6, debilitDeg: 10, ownSigns: [4], friendSigns: [0, 8, 3], enemySigns: [1, 6],
  },
  {
    id: "Mo", name: "Moon", sanskrit: "चन्द्र", deva: "Lord Chandra", glyph: "☽",
    color: "White / Cream", gem: "Pearl (Moti)", metal: "Silver", day: "Monday", direction: "North-West", tree: "Parijata / Banyan",
    mantras: ["ॐ श्रां श्रीं श्रौं सः चन्द्राय नमः", "सोमाय नमः"],
    significations: ["Mind & emotions", "Mother", "Public image", "Fluids, memory", "Happiness (mana)"],
    dashaYears: 10, exaltSign: 1, exaltDeg: 3, debilitSign: 7, debilitDeg: 3, ownSigns: [3], friendSigns: [0, 2, 4, 8, 10, 11], enemySigns: [],
  },
  {
    id: "Ma", name: "Mars", sanskrit: "मङ्गल", deva: "Lord Kartikeya", glyph: "♂",
    color: "Red", gem: "Red Coral (Moonga)", metal: "Copper", day: "Tuesday", direction: "South", tree: "Jaggery / Dhak",
    mantras: ["ॐ क्रां क्रीं क्रौं सः भौमाय नमः", "मङ्गलाय नमः"],
    significations: ["Courage & physical strength", "Siblings", "Land & property", "Logic, war, engineering", "Marital energy (for women)"],
    dashaYears: 7, combustLimit: 17, exaltSign: 9, exaltDeg: 28, debilitSign: 3, debilitDeg: 28, ownSigns: [0, 7], friendSigns: [0, 1, 4, 8], enemySigns: [2, 5],
  },
  {
    id: "Me", name: "Mercury", sanskrit: "बुध", deva: "Lord Budha", glyph: "☿",
    color: "Green", gem: "Emerald (Panna)", metal: "Bronze", day: "Wednesday", direction: "North", tree: "Peepal / Guggul",
    mantras: ["ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः", "बुधाय नमः"],
    significations: ["Speech & intellect", "Business & trade", "Writing, analytics", "Nervous system", "Maternal uncle"],
    dashaYears: 17, combustLimit: 12, exaltSign: 5, exaltDeg: 15, debilitSign: 11, debilitDeg: 15, ownSigns: [2, 5], friendSigns: [0, 1, 4, 6, 8, 10, 11], enemySigns: [3, 7],
  },
  {
    id: "Ju", name: "Jupiter", sanskrit: "गुरु", deva: "Lord Brihaspati", glyph: "♃",
    color: "Yellow / Saffron", gem: "Yellow Sapphire (Pukhraj)", metal: "Gold / Brass", day: "Thursday", direction: "North-East", tree: "Peepal / Parijata",
    mantras: ["ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः", "बृहस्पतये नमः"],
    significations: ["Wisdom & dharma", "Children (putra karaka)", "Wealth & expansion", "Teachers, law, finance", "Marriage guidance (for men)"],
    dashaYears: 16, combustLimit: 11, exaltSign: 3, exaltDeg: 5, debilitSign: 9, debilitDeg: 5, ownSigns: [8, 11], friendSigns: [0, 3, 4, 7, 8, 10, 11], enemySigns: [5],
  },
  {
    id: "Ve", name: "Venus", sanskrit: "शुक्र", deva: "Lord Shukracharya", glyph: "♀",
    color: "White / Pastel", gem: "Diamond (Heera)", metal: "Silver / Platinum", day: "Friday", direction: "South-East", tree: "Fig / Chameli",
    mantras: ["ॐ द्रां द्रीं द्रौं सः शुक्राय नमः", "शुक्राय नमः"],
    significations: ["Love & marriage", "Art, luxury, vehicles", "Comfort and taste", "Reproductive health", "Wife (for men)"],
    dashaYears: 20, combustLimit: 8, exaltSign: 11, exaltDeg: 27, debilitSign: 5, debilitDeg: 27, ownSigns: [1, 6], friendSigns: [0, 2, 4, 5, 10, 11], enemySigns: [1, 6, 9],
  },
  {
    id: "Sa", name: "Saturn", sanskrit: "शनि", deva: "Lord Shani Dev", glyph: "♄",
    color: "Black / Dark blue", gem: "Blue Sapphire (Neelam)", metal: "Iron / Steel", day: "Saturday", direction: "West", tree: "Peepal / Neem",
    mantras: ["ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः", "ॐ शं शनैश्चराय नमः", "शनिभगवते नमः"],
    significations: ["Karma & discipline", "Longevity, ageing", "Labour, service class", "Delay and justice", "Elder siblings, father-in-law"],
    dashaYears: 19, combustLimit: 15, exaltSign: 6, exaltDeg: 20, debilitSign: 0, debilitDeg: 20, ownSigns: [9, 10], friendSigns: [2, 5, 6, 10, 11], enemySigns: [0, 4, 7, 8],
  },
  {
    id: "Ra", name: "Rahu", sanskrit: "राहु", deva: "Lord Rahu (Chhaya Graha)", glyph: "☊",
    color: "Smoke grey / Blue", gem: "Hessonite (Gomed)", metal: "Ashtadhatu", day: "Saturday", direction: "South-West", tree: "Peepal / Amla",
    mantras: ["ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः", "राहवे नमः"],
    significations: ["Ambition, obsession", "Foreign lands, tech, mass media", "Sudden rise and fall", "Illusion, unconventional paths", "Eclipse karma"],
    dashaYears: 18, ownSigns: [10], friendSigns: [2, 5, 9, 10, 11], enemySigns: [0, 1, 3, 4, 6, 7, 8],
  },
  {
    id: "Ke", name: "Ketu", sanskrit: "केतु", deva: "Lord Ketu (Chhaya Graha)", glyph: "☋",
    color: "Bright red / Multicolour", gem: "Cat's Eye (Lehsunia)", metal: "Ashtadhatu", day: "Tuesday", direction: "North-West", tree: "Lotus / Apamarga",
    mantras: ["ॐ त्रां त्रीं त्रौं सः केतवे नमः", "केतवे नमः"],
    significations: ["Moksha, detachment", "Research, occult, coding", "Isolation and purification", "Maternal karma", "Sudden events"],
    dashaYears: 7, ownSigns: [7], friendSigns: [1, 6, 9, 10, 11], enemySigns: [0, 2, 3, 4, 5, 7, 8],
  },
];

export const PLANET_BY_ID: Record<Graha, PlanetInfo> = Object.fromEntries(
  PLANETS.map((p) => [p.id, p]),
) as Record<Graha, PlanetInfo>;

/** Vimshottari sequence — the nakshatra-lord cycle. Sum of periods = 120 years. */
export const DASHA_ORDER: Graha[] = ["Ke", "Ve", "Su", "Mo", "Ma", "Ra", "Ju", "Sa", "Me"];

/** Special (graha drishti) aspects: houses counted from the planet's own house. */
export const SPECIAL_ASPECTS: Record<Graha, number[]> = {
  Su: [7], Mo: [7], Ma: [4, 7, 8], Me: [7], Ju: [5, 7, 9],
  Ve: [7], Sa: [3, 7, 10], Ra: [5, 9], Ke: [5, 9],
};

/** Natural friendship (naisargika) among the seven visible grahas + nodes. 2 = friend, 1 = neutral, 0 = enemy */
const NATURAL_FRIENDS: Record<Graha, Graha[]> = {
  Su: ["Mo", "Ma", "Ju"], Mo: ["Su", "Me"], Ma: ["Su", "Mo", "Ju"],
  Me: ["Su", "Ve"], Ju: ["Su", "Mo", "Ma"], Ve: ["Me", "Sa"], Sa: ["Me", "Ve"],
  Ra: ["Sa", "Ve", "Me"], Ke: ["Ve", "Sa", "Mo"],
};
const NATURAL_ENEMIES: Record<Graha, Graha[]> = {
  Su: ["Ve", "Sa"], Mo: [], Ma: ["Me", "Sa"], Me: ["Mo"], Ju: ["Me", "Ve"],
  Ve: ["Su", "Mo"], Sa: ["Su", "Mo", "Ma"], Ra: ["Su", "Mo"], Ke: ["Su", "Mo"],
};

export function grahaRelationship(a: Graha, b: Graha): "friend" | "neutral" | "enemy" {
  if (a === b) return "friend";
  if (NATURAL_ENEMIES[a].includes(b) || NATURAL_ENEMIES[b].includes(a)) return "enemy";
  if (NATURAL_FRIENDS[a].includes(b) && NATURAL_FRIENDS[b].includes(a)) return "friend";
  if (NATURAL_FRIENDS[a].includes(b) || NATURAL_FRIENDS[b].includes(a)) return "neutral";
  return "neutral";
}

export const VARNA_NAMES = ["Brahmin", "Kshatriya", "Vaishya", "Shudra"] as const;

/** 14 yoni (animal) groups traditionally used for Yoni koota. */
export const YONI_ENEMIES: [string, string][] = [
  ["Serpent", "Mongoose"], ["Cat", "Rat"], ["Elephant", "Lion"], ["Tiger", "Deer"],
  ["Tiger", "Cow"], ["Tiger", "Goat"], ["Horse", "Buffalo"], ["Monkey", "Lion"],
  ["Dog", "Monkey"], ["Cow", "Bull"], ["Goat", "Dog"], ["Buffalo", "Lion"],
];

export const NAKSHATRAS: NakshatraInfo[] = [
  { index: 0, name: "Ashwini", sanskrit: "अश्विनी", lord: "Ke", deity: "Ashwini Kumaras", symbol: "Horse's head", gana: "Deva", yoni: "Horse", varna: 0, syllables: ["Chu", "Che", "Cho", "La"], nature: "Swift healing, pioneering energy, travel", remedies: "Hanuman Chalisa on Tuesday; feed horses/cows" },
  { index: 1, name: "Bharani", sanskrit: "भरणी", lord: "Ve", deity: "Yama", symbol: "Yoni", gana: "Manushya", yoni: "Elephant", varna: 1, syllables: ["Lee", "Lu", "Le", "Lo"], nature: "Bearing, restraint, transformation through discipline", remedies: "Durga Saptashati path; donate on Friday" },
  { index: 2, name: "Krittika", sanskrit: "कृत्तिका", lord: "Su", deity: "Agni", symbol: "Razor / flame", gana: "Rakshasa", yoni: "Sheep", varna: 2, syllables: ["A", "Ee", "U", "E"], nature: "Purifying fire, sharp intellect, courage", remedies: "Surya Namaskar; offer water to the Sun at sunrise" },
  { index: 3, name: "Rohini", sanskrit: "रोहिणी", lord: "Mo", deity: "Brahma / Prajapati", symbol: "Ox cart", gana: "Manushya", yoni: "Serpent", varna: 3, syllables: ["O", "Va", "Vi", "Vu"], nature: "Growth, beauty, fertility, material attraction", remedies: "Lakshmi worship on Friday; pearl charity" },
  { index: 4, name: "Mrigashira", sanskrit: "मृगशीर्ष", lord: "Ma", deity: "Soma", symbol: "Deer's head", gana: "Deva", yoni: "Serpent", varna: 0, syllables: ["Ve", "Vo", "Ka", "Ki"], nature: "Search, curiosity, gentle charm", remedies: "Mars mantra on Tuesday; help siblings" },
  { index: 5, name: "Ardra", sanskrit: "आर्द्रा", lord: "Ra", deity: "Rudra", symbol: "Teardrop", gana: "Manushya", yoni: "Dog", varna: 1, syllables: ["Ku", "Gha", "Nga", "Chha"], nature: "Storm, catharsis, research and upheaval", remedies: "Mahamrityunjaya japa; Rudrabhishek" },
  { index: 6, name: "Punarvasu", sanskrit: "पुनर्वसु", lord: "Ju", deity: "Aditi", symbol: "Quiver", gana: "Deva", yoni: "Cat", varna: 2, syllables: ["Ke", "Ko", "Ha", "Hi"], nature: "Return of light, renewal, optimism", remedies: "Brihaspati mantra Thursday; donate books" },
  { index: 7, name: "Pushya", sanskrit: "पुष्य", lord: "Sa", deity: "Brihaspati", symbol: "Cow's udder / lotus", gana: "Deva", yoni: "Sheep", varna: 3, syllables: ["Hu", "He", "Ho", "Da"], nature: "Nourishment, the most auspicious star, protection", remedies: "Saturn oil lamp on Saturday; feed the hungry" },
  { index: 8, name: "Ashlesha", sanskrit: "आश्लेषा", lord: "Me", deity: "Nagas", symbol: "Coiled serpent", gana: "Rakshasa", yoni: "Cat", varna: 0, syllables: ["Di", "Du", "De", "Do"], nature: "Penetrating insight, hypnotic speech, kundalini", remedies: "Naga Devata worship; Guru mantra" },
  { index: 9, name: "Magha", sanskrit: "मघा", lord: "Ke", deity: "Pitrs", symbol: "Royal throne", gana: "Rakshasa", yoni: "Rat", varna: 1, syllables: ["Ma", "Mi", "Mu", "Me"], nature: "Ancestral authority, legacy, dignity", remedies: "Shraddha / Tarpan for ancestors on Amavasya" },
  { index: 10, name: "Purva Phalguni", sanskrit: "पूर्वफाल्गुनी", lord: "Ve", deity: "Bhaga", symbol: "Front legs of a bed", gana: "Manushya", yoni: "Rat", varna: 2, syllables: ["Mo", "Ta", "Ti", "Tu"], nature: "Rest after effort, romance, creativity", remedies: "Shukra mantra Friday; support couples in need" },
  { index: 11, name: "Uttara Phalguni", sanskrit: "उत्तरफाल्गुनी", lord: "Su", deity: "Aryaman", symbol: "Rear legs of a bed", gana: "Manushya", yoni: "Cow", varna: 3, syllables: ["Te", "To", "Pa", "Pi"], nature: "Patronage, friendship, contracts, marriage", remedies: "Sun japa on Sunday; donate wheat" },
  { index: 12, name: "Hasta", sanskrit: "हस्त", lord: "Mo", deity: "Savitr", symbol: "Open hand", gana: "Deva", yoni: "Buffalo", varna: 0, syllables: ["Pu", "Sha", "Na", "Tha"], nature: "Skill of hand, craft, healing touch", remedies: "Ganesha worship; help with your own hands" },
  { index: 13, name: "Chitra", sanskrit: "चित्रा", lord: "Ma", deity: "Vishvakarma", symbol: "Bright jewel", gana: "Rakshasa", yoni: "Tiger", varna: 1, syllables: ["Pe", "Po", "Ra", "Ri"], nature: "Design, artifice, dazzling appearance", remedies: "Hanuman puja; donate colourful cloth" },
  { index: 14, name: "Swati", sanskrit: "स्वाती", lord: "Ra", deity: "Vayu", symbol: "Coral sprig in wind", gana: "Deva", yoni: "Buffalo", varna: 2, syllables: ["Ru", "Re", "Ro", "Ta"], nature: "Independence, flexibility, trade and travel", remedies: "Vayu puja; Durga Chalisa" },
  { index: 15, name: "Vishakha", sanskrit: "विशाखा", lord: "Ju", deity: "Indra-Agni", symbol: "Triumphal arch", gana: "Rakshasa", yoni: "Tiger", varna: 3, syllables: ["Ti", "Tu", "Te", "To"], nature: "Purposeful ambition, fixation on a goal", remedies: "Indra-Agni worship; feed birds" },
  { index: 16, name: "Anuradha", sanskrit: "अनुराधा", lord: "Sa", deity: "Mitra", symbol: "Lotus", gana: "Deva", yoni: "Deer", varna: 0, syllables: ["Na", "Ni", "Nu", "Ne"], nature: "Devotion, friendship, teamwork, devotion to a cause", remedies: "Saraswati puja; serve a devotee community" },
  { index: 17, name: "Jyeshtha", sanskrit: "ज्येष्ठा", lord: "Me", deity: "Indra", symbol: "Umbrella / earring", gana: "Rakshasa", yoni: "Elephant", varna: 1, syllables: ["No", "Ya", "Yi", "Yu"], nature: "Seniority, protection, hard-won leadership", remedies: "Indra/Hanuman worship; respect elders" },
  { index: 18, name: "Mula", sanskrit: "मूल", lord: "Ke", deity: "Nirriti", symbol: "Tied roots", gana: "Rakshasa", yoni: "Dog", varna: 2, syllables: ["Ye", "Yo", "Bha", "Bhi"], nature: "Root investigation, destruction of falsehood, uprooting", remedies: "Maa Tarpan; Nrisingha mantra" },
  { index: 19, name: "Purva Ashadha", sanskrit: "पूर्वाषाढा", lord: "Ve", deity: "Apah", symbol: "Elephant tusk / fan", gana: "Manushya", yoni: "Monkey", varna: 3, syllables: ["Bhu", "Dha", "Pha", "Dha"], nature: "Invincible early victory, water purification", remedies: "Varuna japa; donate water-related goods" },
  { index: 20, name: "Uttara Ashadha", sanskrit: "उत्तराषाढा", lord: "Su", deity: "Vishvedevas", symbol: "Elephant tusk", gana: "Manushya", yoni: "Mongoose", varna: 0, syllables: ["Bhe", "Bho", "Ja", "Ji"], nature: "Later victory, permanence, righteousness", remedies: "Vishvedeva puja; feed Brahmins on Sunday" },
  { index: 21, name: "Shravana", sanskrit: "श्रवण", lord: "Mo", deity: "Vishnu", symbol: "Three footprints / ear", gana: "Manushya", yoni: "Monkey", varna: 1, syllables: ["Khi", "Khu", "Khe", "Kho"], nature: "Listening, learning by transmission, pilgrimage", remedies: "Vishnu Sahasranama; listen to good counsel" },
  { index: 22, name: "Dhanishta", sanskrit: "धनिष्ठा", lord: "Ma", deity: "Vasus", symbol: "Drum / wheat", gana: "Rakshasa", yoni: "Lion", varna: 2, syllables: ["Ga", "Gi", "Gu", "Ge"], nature: "Rhythm, wealth, fame through the crowd", remedies: "Vasu / Ganesha puja; donate grains" },
  { index: 23, name: "Shatabhisha", sanskrit: "शतभिषा", lord: "Ra", deity: "Varuna", symbol: "Empty circle / 100 physicians", gana: "Rakshasa", yoni: "Tiger", varna: 3, syllables: ["Go", "Sa", "Si", "Su"], nature: "Healing networks, data, secrecy, reform", remedies: "Varuna japa; medicine charity" },
  { index: 24, name: "Purva Bhadrapada", sanskrit: "पूर्वभाद्रपदा", lord: "Ju", deity: "Aja Ekapada", symbol: "Front legs of a funeral cot", gana: "Manushya", yoni: "Bull", varna: 0, syllables: ["Se", "So", "Da", "Di"], nature: "Fiery austerity, spirituality, detachment", remedies: "Rudra abhishek; donate blankets" },
  { index: 25, name: "Uttara Bhadrapada", sanskrit: "उत्तरभाद्रपदा", lord: "Sa", deity: "Ahir Budhnya", symbol: "Rear legs of a cot", gana: "Manushya", yoni: "Cow", varna: 1, syllables: ["Du", "Tha", "Jha", "Nya"], nature: "Deep still water, patience, occult knowledge", remedies: "Shani mantra; feed cows on Saturday" },
  { index: 26, name: "Revati", sanskrit: "रेवती", lord: "Me", deity: "Pushan", symbol: "Fish / drum", gana: "Deva", yoni: "Elephant", varna: 2, syllables: ["De", "Do", "Cha", "Chi"], nature: "The journey's end, nurturing, wealth in motion", remedies: "Pushan / Vishnu worship; donate food on Wednesday" },
];

export const NAKSHATRA_SPAN = 360 / 27; // 13°20'
export const PADA_SPAN = NAKSHATRA_SPAN / 4; // 3°20'

/** 12 bhavas — what each house rules, used for readings and for pricing remedy bundles. */
export const HOUSES = [
  { n: 1, name: "Lagna / Tanu", rules: "Self, body, character, vitality, appearance", theme: "Identity" },
  { n: 2, name: "Dhana", rules: "Wealth, family, speech, food, accumulated savings", theme: "Wealth" },
  { n: 3, name: "Bhratri", rules: "Courage, siblings, short travel, skills, communication", theme: "Effort" },
  { n: 4, name: "Matru / Sukha", rules: "Mother, home, vehicles, property, education, peace of mind", theme: "Home" },
  { n: 5, name: "Putra", rules: "Children, romance, creativity, intelligence, past-life merit", theme: "Creativity" },
  { n: 6, name: "Ripu / Ari", rules: "Debt, disease, enemies, litigation, service, daily work", theme: "Obstacles" },
  { n: 7, name: "Kalatra / Yuvati", rules: "Marriage, partnership, business contracts, public dealings", theme: "Partnership" },
  { n: 8, name: "Ayur / Randhra", rules: "Longevity, sudden events, inheritance, research, occult", theme: "Transformation" },
  { n: 9, name: "Dharma / Bhagya", rules: "Fortune, father, guru, religion, long travel, higher learning", theme: "Fortune" },
  { n: 10, name: "Karma", rules: "Profession, status, authority, fame, life's work", theme: "Career" },
  { n: 11, name: "Labha", rules: "Gains, income, friends, networks, elder siblings, fulfilment", theme: "Gains" },
  { n: 12, name: "Byaya / Vishnu", rules: "Expenditure, foreign lands, bed pleasures, moksha, hospitalisation", theme: "Release" },
] as const;

/** Rashifal — sign-level themes used to compose horoscope text. */
export const RASHI_THEMES: Record<number, { love: string; career: string; money: string; health: string }> = {
  0: { love: "Passion rises fast but cools faster — speak before the argument ends itself.", career: "New initiatives and solo drives favour you; avoid impulsive resignations.", money: "Impulse spending on gadgets and travel needs a cap this month.", health: "Headaches, minor cuts and heat in the eyes — hydrate and sleep early." },
  1: { love: "Stability is the romance language this period; plan something sensory and slow.", career: "Patient effort gets noticed by seniors; income follows reputation.", money: "Property, gold and long SIPs look strong; avoid lending to relatives.", health: "Throat, thyroid and neck strain — voice rest and steam help." },
  2: { love: "Wit wins over drama; conversations reconnect you after a dry spell.", career: "Writing, sales, teaching and travel-linked work deliver.", money: "Two income streams possible; keep contracts in writing.", health: "Nervous tension and breathlessness — pranayama on time." },
  3: { love: "Emotional needs run high; nurture instead of testing your partner.", career: "Public-facing roles, HR, hospitality, realty go well.", money: "Family money matters need patience; mother's health costs.", health: "Stomach acidity and water retention; keep dinner light." },
  4: { love: "Pride is the only enemy here; compliment more, command less.", career: "Leadership roles, government work, creative recognition.", money: "Steady inflow from authority-linked sources; avoid speculation.", health: "Heart, BP and spine care; sunlight and posture breaks." },
  5: { love: "Over-analysis kills intimacy — say the simple thing out loud.", career: "Analytical, audit, healthcare and detail-heavy work peaks.", money: "Small savings compound; avoid cosmetic overspend.", health: "Digestion and skin; probiotics and routine sleep." },
  6: { love: "Partnership equity is renegotiated — diplomatically, in writing.", career: "Negotiations, legal matters, design and client work flourish.", money: "Balanced budget beats windfalls; tax planning matters.", health: "Lower back, kidneys; walk more, sit less." },
  7: { love: "Intensity, jealousy and deep bonding — honesty is the antidote.", career: "Research, investigation, medicine, insurance and occult work.", money: "Others' money: loans, insurance and inheritance move.", health: "Reproductive health and sleep hygiene; avoid suppression." },
  8: { love: "Growth happens when both of you share a purpose, not just a home.", career: "Higher studies, law, publishing, overseas offers, teaching.", money: "Gains through mentors and father's network.", health: "Hips, thighs, liver; moderation with rich food and alcohol." },
  9: { love: "Commitment matures slowly; duty is mistaken for lack of romance.", career: "Hard work finally converts into position and authority.", money: "Delayed but durable gains; property and machinery.", health: "Knees, teeth, ageing skin; oil massage and early dinner." },
  10: { love: "Friendship-first love; give space and you get closeness.", career: "Tech, social impact, innovation and group ventures.", money: "Unexpected gains via networks; protect savings from friends.", health: "Circulation, calves, ankles; keep warm and move." },
  11: { love: "Tender, spiritual, sometimes dreamy — need clarity on commitments.", career: "Healing arts, film, charity, research, overseas work.", money: "Income rises with effort; spend on rituals and family.", health: "Feet, immunity, lymph; rest and salt reduction." },
};

export const WEEKDAY_LORDS: Graha[] = ["Su", "Mo", "Ma", "Me", "Ju", "Ve", "Sa"];
export const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Planetary-hour (horā) cycle — reverse-Chaldean order starting from the day lord at sunrise. */
export const HORA_CYCLE: Graha[] = ["Su", "Ve", "Me", "Mo", "Sa", "Ju", "Ma"];
/** Rahu kāla index (of the 8 day-parts) by weekday, 0 = Sunday. */
export const RAHU_KAAL_PART: Record<number, number> = { 0: 7, 1: 1, 2: 5, 3: 3, 4: 4, 5: 0, 6: 2 };
export const YAMAGHANTA_PART: Record<number, number> = { 0: 4, 1: 2, 2: 6, 3: 5, 4: 1, 5: 3, 6: 0 };
export const GULIKA_PART: Record<number, number> = { 0: 6, 1: 4, 2: 2, 3: 0, 4: 7, 5: 5, 6: 3 };

/** Muhurta-friendly weekday notes for the Panchang page. */
export const WEEKDAY_NOTES: Record<number, string> = {
  0: "Sun — authority, government work, health rituals.",
  1: "Moon — travel, mother, water, public-facing starts.",
  2: "Mars — land, engineering, courage, surgery (avoid inauspicious for marriages).",
  3: "Mercury — study, trade, writing, contracts.",
  4: "Jupiter — teaching, marriage, donations, guru work.",
  5: "Venus — weddings, luxury, vehicles, arts.",
  6: "Saturn — service, labour, ancestor rites, long-term commitments.",
};

export const TITHIS = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami",
  "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashti", "Trayodashi", "Chaturdashi",
];
export const COMPLETE_TITHIS = ["Purnima", "Amavasya"];
/** 7 movable + 4 fixed karanas (the classical 11). */
export const KARANAS = [
  "Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti",
  "Sakuni", "Chatushpada", "Naga", "Kimstughna",
];
/** The 27 Nitya Yogas, in the order used by Indian almanacs. */
export const YOGAS_PANCHANG = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma",
  "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
  "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva", "Siddha", "Sadhya",
  "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti",
];
/** Nature of each nakshatra for the day-planner (traditional 5-fold karma split). */
export const NAKSHATRA_KARMA: Record<number, { type: string; goodFor: string[] }> = {
  0: { type: "Mridu (soft)", goodFor: ["marriage", "healing", "art", "travel by air"] },
  1: { type: "Tikshna (sharp)", goodFor: ["surgery", "legal action", "fencing", "endings"] },
  2: { type: "Tikshna (sharp)", goodFor: ["surgery", "cutting", "fire rituals", "repairs"] },
  3: { type: "Mridu (soft)", goodFor: ["marriage", "beauty work", "planting", "banking"] },
  4: { type: "Mishra (mixed)", goodFor: ["study", "short travel", "trade", "friendship"] },
  5: { type: "Ugra (fierce)", goodFor: ["breaking ground", "stormy work", "research", "debts"] },
  6: { type: "Mishra (mixed)", goodFor: ["renewal", "housing", "teaching", "travel"] },
  7: { type: "Mridu (soft)", goodFor: ["marriage", "food", "nourishing work", "study"] },
  8: { type: "Ugra (fierce)", goodFor: ["occult", "binding", "medicine", "investigation"] },
  9: { type: "Kshipra (swift)", goodFor: ["ceremony", "ancestral rites", "authority work"] },
  10: { type: "Mridu (soft)", goodFor: ["marriage", "rest", "creativity", "luxury buys"] },
  11: { type: "Mridu (soft)", goodFor: ["marriage", "contracts", "patronage", "charity"] },
  12: { type: "Kshipra (swift)", goodFor: ["craft", "healing", "handwork", "signings"] },
  13: { type: "Mishra (mixed)", goodFor: ["design", "jewellery", "beauty", "theatre"] },
  14: { type: "Kshipra (swift)", goodFor: ["trade", "travel", "independent work"] },
  15: { type: "Ugra (fierce)", goodFor: ["competition", "goal-pushing", "confrontation"] },
  16: { type: "Mridu (soft)", goodFor: ["friendship", "team projects", "worship"] },
  17: { type: "Ugra (fierce)", goodFor: ["seniority", "protection", "management"] },
  18: { type: "Tikshna (sharp)", goodFor: ["research", "uprooting", "soil work", "medicine"] },
  19: { type: "Mridu (soft)", goodFor: ["water work", "early victory", "purification"] },
  20: { type: "Mridu (soft)", goodFor: ["later victory", "enduring projects", "rites"] },
  21: { type: "Mishra (mixed)", goodFor: ["learning", "listening", "pilgrimage", "music"] },
  22: { type: "Kshipra (swift)", goodFor: ["music", "wealth", "crowds", "public work"] },
  23: { type: "Riksha (dry)", goodFor: ["healing networks", "data", "secrecy", "reform"] },
  24: { type: "Tikshna (sharp)", goodFor: ["austerity", "spiritual practice", "repairs"] },
  25: { type: "Mridu (soft)", goodFor: ["stillness", "occult study", "long projects"] },
  26: { type: "Mridu (soft)", goodFor: ["nourishing", "wealth", "closing journeys"] },
};

/** Auspicious/inauspicious tarā numbers used in Dina-tara (9-fold) checks. */
export const AUSPICIOUS_TARA = new Set([2, 4, 5, 7, 9]);

/** 12 Kāla Sarpa types by the house occupied by Rahu from the Lagna. */
export const KAAL_SARP_TYPES = [
  { name: "Anant", impact: "Obstacles in early life, strong inner resilience, slow but lasting success." },
  { name: "Kulik", impact: "Financial volatility, family tensions; gains through research and technology." },
  { name: "Vasuki", impact: "Emotional intensity, good for occult, healing and analytical careers." },
  { name: "Shankhapal", impact: "Confusion in decisions; spiritual inclinations and strong later-life gains." },
  { name: "Padma", impact: "Fame and recognition, but health and ego need tending." },
  { name: "Mahapadma", impact: "High ambition with abrupt ups and downs; leadership after struggle." },
  { name: "Bhatri / Bhujang", impact: "Courage and travel, sibling and partnership lessons." },
  { name: "Ghatakarbhar / Karkotak", impact: "Property and legal matters; strong protective instinct." },
  { name: "Shankhu / Vishdhar", impact: "Speech and diplomacy succeed; avoid secrecy in contracts." },
  { name: "Lohit / Sheshnag", impact: "Deep research, inheritance, transformation through discipline." },
  { name: "Pishnag / Ling", impact: "Identity reinvention; foreign or tech-linked gains." },
  { name: "Gandhool / Vishnag", impact: "Travel, migration and unconventional paths; health routine matters." },
];
