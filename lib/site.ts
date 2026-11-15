/**
 * Everything about the practice that appears in more than one place: how to reach Rajeshwari,
 * and the list of consultations with their fees.
 *
 * To change a fee, a duration or a description, edit SERVICES below — the home page, the footer and the
 * WhatsApp booking messages all read from here.
 */
import type { Tri } from '@/lib/astro/names';

/**
 * The folder the site is served from when it does not sit at the root of its domain — "/astrology" for
 * https://name.github.io/astrology/. Set NEXT_PUBLIC_BASE_PATH when building; leave it unset otherwise.
 */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '');

/** The address of a file in /public, wherever the site is served from. Links made with next/link do not need this. */
export const asset = (path: string): string => `${BASE_PATH}${path}`;

/**
 * The public address of the site, such as "https://example.com", from NEXT_PUBLIC_SITE_URL.
 * Optional: it is used only for the sitemap and for the picture shown when a link is shared.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/+$/, '');

export const BRAND = 'AstroConnect';
export const ASTROLOGER = 'Rajeshwari';

export const PHONE = '7892758565';
export const PHONE_E164 = `+91${PHONE}`;
export const PHONE_DISPLAY = '+91 78927 58565';
export const TEL_HREF = `tel:${PHONE_E164}`;

export const INSTAGRAM_HANDLE = 'shivohamastro66';
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}`;

/** A WhatsApp chat with Rajeshwari, opened with `message` already typed. */
export const whatsappHref = (message: string): string => `https://wa.me/91${PHONE}?text=${encodeURIComponent(message)}`;

export const DEFAULT_WHATSAPP_MESSAGE = 'Namaste Rajeshwari madam, I would like to book a consultation.';

export interface Service {
  id: string;
  title: Tri;
  /** The traditional name, shown as a small label. */
  sanskrit: string;
  description: Tri;
  /** Fee in rupees. */
  price: number;
  minutes: number;
  /** A free calculator on this site that pairs with the consultation. */
  tool?: { href: string; label: Tri };
}

export const SERVICES: readonly Service[] = [
  {
    id: 'birth-chart',
    title: { en: 'Birth Chart Reading', hi: 'जन्म कुंडली वाचन', kn: 'ಜನ್ಮ ಕುಂಡಲಿ ವಾಚನ' },
    sanskrit: 'Janma Kundli',
    description: {
      en: 'The planetary structure of your birth: positions, houses, nakshatra and dasha, explained in plain language rather than Sanskrit shlokas.',
      hi: 'आपके जन्म की ग्रह स्थिति: भाव, नक्षत्र और दशा — संस्कृत श्लोकों में नहीं, सरल भाषा में समझाई जाती है।',
      kn: 'ನಿಮ್ಮ ಜನ್ಮದ ಗ್ರಹ ಸ್ಥಿತಿ: ಭಾವ, ನಕ್ಷತ್ರ ಮತ್ತು ದಶೆ — ಸಂಸ್ಕೃತ ಶ್ಲೋಕಗಳಲ್ಲಲ್ಲ, ಸರಳ ಭಾಷೆಯಲ್ಲಿ ವಿವರಣೆ.',
    },
    price: 500,
    minutes: 30,
    tool: { href: '/birth-chart', label: { en: 'Free Kundli', hi: 'निःशुल्क कुंडली', kn: 'ಉಚಿತ ಕುಂಡಲಿ' } },
  },
  {
    id: 'matching',
    title: { en: 'Kundli Matching', hi: 'कुंडली मिलान', kn: 'ಕುಂಡಲಿ ಹೊಂದಾಣಿಕೆ' },
    sanskrit: 'Vivaha Milan',
    description: {
      en: 'Compatibility through traditional Jyotish — not only the guna score. Mangal, Shani, the strength of the 7th lord and how the two families will fit.',
      hi: 'पारंपरिक ज्योतिष से मिलान — केवल गुण अंक नहीं। मंगल, शनि, सप्तमेश का बल और दोनों परिवारों का मेल।',
      kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಜ್ಯೋತಿಷ್ಯದಿಂದ ಹೊಂದಾಣಿಕೆ — ಕೇವಲ ಗುಣ ಅಂಕವಲ್ಲ. ಕುಜ, ಶನಿ, ಸಪ್ತಮಾಧಿಪತಿಯ ಬಲ ಮತ್ತು ಎರಡು ಕುಟುಂಬಗಳ ಹೊಂದಿಕೆ.',
    },
    price: 700,
    minutes: 30,
    tool: { href: '/kundali-matching', label: { en: 'Free guna score', hi: 'निःशुल्क गुण मिलान', kn: 'ಉಚಿತ ಗುಣ ಮಿಲನ' } },
  },
  {
    id: 'career',
    title: { en: 'Career Guidance', hi: 'करियर मार्गदर्शन', kn: 'ವೃತ್ತಿ ಮಾರ್ಗದರ್ಶನ' },
    sanskrit: 'Karma Sthana',
    description: {
      en: 'The 10th house and its lord, the dasha you are running and the current transits: when to change jobs and which field suits you.',
      hi: 'दशम भाव और उसका स्वामी, चल रही दशा और गोचर: नौकरी कब बदलें और कौन-सा क्षेत्र आपके अनुकूल है।',
      kn: 'ದಶಮ ಭಾವ ಮತ್ತು ಅದರ ಅಧಿಪತಿ, ನಡೆಯುತ್ತಿರುವ ದಶೆ ಮತ್ತು ಗೋಚಾರ: ಉದ್ಯೋಗ ಯಾವಾಗ ಬದಲಿಸಬೇಕು, ಯಾವ ಕ್ಷೇತ್ರ ನಿಮಗೆ ಸೂಕ್ತ.',
    },
    price: 500,
    minutes: 30,
  },
  {
    id: 'relationships',
    title: { en: 'Relationships', hi: 'संबंध', kn: 'ಸಂಬಂಧಗಳು' },
    sanskrit: 'Saptama Bhava',
    description: {
      en: 'Relationship patterns in your chart — love, marriage and harmony at home. A practical conversation, not astrology alone.',
      hi: 'आपकी कुंडली में संबंधों का स्वरूप — प्रेम, विवाह और घर की शांति। केवल ज्योतिष नहीं, व्यावहारिक बातचीत।',
      kn: 'ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಸಂಬಂಧಗಳ ಸ್ವರೂಪ — ಪ್ರೀತಿ, ವಿವಾಹ ಮತ್ತು ಮನೆಯ ನೆಮ್ಮದಿ. ಕೇವಲ ಜ್ಯೋತಿಷ್ಯವಲ್ಲ, ಪ್ರಾಯೋಗಿಕ ಮಾತುಕತೆ.',
    },
    price: 500,
    minutes: 30,
  },
  {
    id: 'vastu',
    title: { en: 'Vastu for Flats', hi: 'फ्लैट के लिए वास्तु', kn: 'ಫ್ಲ್ಯಾಟ್‌ಗಳಿಗೆ ವಾಸ್ತು' },
    sanskrit: 'Vastu Shastra',
    description: {
      en: 'Made for Bangalore apartments. No demolition — simple corrections such as bed direction, colours and where the almirah stands.',
      hi: 'बैंगलोर के फ्लैटों के लिए। कोई तोड़-फोड़ नहीं — पलंग की दिशा, रंग और अलमारी की जगह जैसे सरल सुधार।',
      kn: 'ಬೆಂಗಳೂರಿನ ಫ್ಲ್ಯಾಟ್‌ಗಳಿಗಾಗಿ. ಒಡೆಯುವ ಅಗತ್ಯವಿಲ್ಲ — ಮಂಚದ ದಿಕ್ಕು, ಬಣ್ಣ, ಬೀರುವಿನ ಸ್ಥಾನದಂತಹ ಸರಳ ತಿದ್ದುಪಡಿಗಳು.',
    },
    price: 700,
    minutes: 30,
  },
  {
    id: 'yearly',
    title: { en: 'Yearly Guidance', hi: 'वार्षिक मार्गदर्शन', kn: 'ವಾರ್ಷಿಕ ಮಾರ್ಗದರ್ಶನ' },
    sanskrit: 'Varsha Phala',
    description: {
      en: 'The year ahead for career, marriage, health and family: a month-by-month timeline with simple remedies you can do at home.',
      hi: 'आने वाला वर्ष — करियर, विवाह, स्वास्थ्य और परिवार: महीने-दर-महीने समयरेखा और घर पर करने योग्य सरल उपाय।',
      kn: 'ಮುಂದಿನ ವರ್ಷ — ವೃತ್ತಿ, ವಿವಾಹ, ಆರೋಗ್ಯ ಮತ್ತು ಕುಟುಂಬ: ತಿಂಗಳುವಾರು ವಿವರ ಮತ್ತು ಮನೆಯಲ್ಲೇ ಮಾಡಬಹುದಾದ ಸರಳ ಪರಿಹಾರಗಳು.',
    },
    price: 1000,
    minutes: 30,
  },
];

export const formatRupees = (amount: number): string => `₹${amount.toLocaleString('en-IN')}`;
