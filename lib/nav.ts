import type { Tri } from '@/lib/astro/names';

export interface NavItem {
  href: string;
  label: Tri;
  /** One line on what the page gives you — used on the home page and in the mobile menu. */
  blurb: Tri;
}

/** The free calculators, in the order they are offered everywhere on the site. */
export const TOOLS: readonly NavItem[] = [
  {
    href: '/birth-chart',
    label: { en: 'Kundli', hi: 'कुंडली', kn: 'ಕುಂಡಲಿ' },
    blurb: {
      en: 'Your birth chart, nakshatra, navamsa and Vimshottari dasha.',
      hi: 'आपकी जन्म कुंडली, नक्षत्र, नवांश और विंशोत्तरी दशा।',
      kn: 'ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿ, ನಕ್ಷತ್ರ, ನವಾಂಶ ಮತ್ತು ವಿಂಶೋತ್ತರಿ ದಶೆ.',
    },
  },
  {
    href: '/kundali-matching',
    label: { en: 'Matching', hi: 'मिलान', kn: 'ಹೊಂದಾಣಿಕೆ' },
    blurb: {
      en: 'Ashtakoota guna milan for bride and groom, out of 36.',
      hi: 'वर-वधू का अष्टकूट गुण मिलान, 36 में से।',
      kn: 'ವಧು-ವರರ ಅಷ್ಟಕೂಟ ಗುಣ ಮಿಲನ, 36 ರಲ್ಲಿ.',
    },
  },
  {
    href: '/panchang',
    label: { en: 'Panchanga', hi: 'पंचांग', kn: 'ಪಂಚಾಂಗ' },
    blurb: {
      en: 'Tithi, nakshatra, yoga, karana and Rahu Kala for any day and place.',
      hi: 'किसी भी दिन और स्थान के लिए तिथि, नक्षत्र, योग, करण और राहु काल।',
      kn: 'ಯಾವುದೇ ದಿನ ಮತ್ತು ಸ್ಥಳಕ್ಕೆ ತಿಥಿ, ನಕ್ಷತ್ರ, ಯೋಗ, ಕರಣ ಮತ್ತು ರಾಹು ಕಾಲ.',
    },
  },
  {
    href: '/horoscope',
    label: { en: 'Rashi Phala', hi: 'राशिफल', kn: 'ರಾಶಿ ಫಲ' },
    blurb: {
      en: 'Where the Moon and the slow planets stand from your rashi today.',
      hi: 'आज आपकी राशि से चंद्र और मंद ग्रह कहाँ हैं।',
      kn: 'ಇಂದು ನಿಮ್ಮ ರಾಶಿಯಿಂದ ಚಂದ್ರ ಮತ್ತು ಮಂದ ಗ್ರಹಗಳು ಎಲ್ಲಿವೆ.',
    },
  },
  {
    href: '/dosha-check',
    label: { en: 'Dosha Check', hi: 'दोष जाँच', kn: 'ದೋಷ ಪರಿಶೀಲನೆ' },
    blurb: {
      en: 'Manglik, Kaal Sarp and Sade Sati — checked calmly, with dates.',
      hi: 'मांगलिक, काल सर्प और साढ़े साती — शांति से, तिथियों सहित।',
      kn: 'ಕುಜ ದೋಷ, ಕಾಳ ಸರ್ಪ ಮತ್ತು ಸಾಡೇ ಸಾತಿ — ಶಾಂತವಾಗಿ, ದಿನಾಂಕಗಳೊಂದಿಗೆ.',
    },
  },
  {
    href: '/numerology',
    label: { en: 'Numerology', hi: 'अंक ज्योतिष', kn: 'ಸಂಖ್ಯಾಶಾಸ್ತ್ರ' },
    blurb: {
      en: 'Mulank, Bhagyank and name number, with the planet behind each.',
      hi: 'मूलांक, भाग्यांक और नामांक — हर अंक के ग्रह सहित।',
      kn: 'ಮೂಲಾಂಕ, ಭಾಗ್ಯಾಂಕ ಮತ್ತು ನಾಮಾಂಕ — ಪ್ರತಿ ಅಂಕದ ಗ್ರಹದೊಂದಿಗೆ.',
    },
  },
];

export const SERVICES_LINK = { href: '/#services', label: { en: 'Services', hi: 'सेवाएं', kn: 'ಸೇವೆಗಳು' } as Tri };
export const ABOUT_LINK = { href: '/#astrologer', label: { en: 'About', hi: 'परिचय', kn: 'ಪರಿಚಯ' } as Tri };
export const JOURNAL_LINK = { href: '/articles', label: { en: 'Journal', hi: 'लेख', kn: 'ಲೇಖನಗಳು' } as Tri };
