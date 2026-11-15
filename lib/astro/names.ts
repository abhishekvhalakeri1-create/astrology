/**
 * Names of the Jyotish building blocks in the three languages the site speaks.
 * Every list is indexed the same way as the tables in zodiac.ts.
 */
import type { GrahaId } from './graha';

export type Lang = 'en' | 'hi' | 'kn';
export type Tri = Record<Lang, string>;
type TriList = Record<Lang, readonly string[]>;

export const pick = <T,>(lang: Lang, value: Record<Lang, T>): T => value[lang] ?? value.en;

export const RASHI: TriList = {
  en: ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'],
  hi: ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'],
  kn: ['ಮೇಷ', 'ವೃಷಭ', 'ಮಿಥುನ', 'ಕರ್ಕಾಟಕ', 'ಸಿಂಹ', 'ಕನ್ಯಾ', 'ತುಲಾ', 'ವೃಶ್ಚಿಕ', 'ಧನು', 'ಮಕರ', 'ಕುಂಭ', 'ಮೀನ'],
};

/** Western names, shown beside the Sanskrit ones for readers who know their sign that way. */
export const RASHI_WESTERN = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'] as const;

export const NAKSHATRA: TriList = {
  en: [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
    'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
  ],
  hi: [
    'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा', 'पुनर्वसु', 'पुष्य', 'आश्लेषा',
    'मघा', 'पूर्वा फाल्गुनी', 'उत्तरा फाल्गुनी', 'हस्त', 'चित्रा', 'स्वाति', 'विशाखा', 'अनुराधा', 'ज्येष्ठा',
    'मूल', 'पूर्वाषाढ़ा', 'उत्तराषाढ़ा', 'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पूर्वा भाद्रपद', 'उत्तरा भाद्रपद', 'रेवती',
  ],
  kn: [
    'ಅಶ್ವಿನಿ', 'ಭರಣಿ', 'ಕೃತ್ತಿಕಾ', 'ರೋಹಿಣಿ', 'ಮೃಗಶಿರ', 'ಆರ್ದ್ರಾ', 'ಪುನರ್ವಸು', 'ಪುಷ್ಯ', 'ಆಶ್ಲೇಷ',
    'ಮಘಾ', 'ಪೂರ್ವ ಫಲ್ಗುಣಿ', 'ಉತ್ತರ ಫಲ್ಗುಣಿ', 'ಹಸ್ತ', 'ಚಿತ್ರಾ', 'ಸ್ವಾತಿ', 'ವಿಶಾಖ', 'ಅನುರಾಧ', 'ಜ್ಯೇಷ್ಠ',
    'ಮೂಲ', 'ಪೂರ್ವಾಷಾಢ', 'ಉತ್ತರಾಷಾಢ', 'ಶ್ರವಣ', 'ಧನಿಷ್ಠ', 'ಶತಭಿಷ', 'ಪೂರ್ವಾಭಾದ್ರ', 'ಉತ್ತರಾಭಾದ್ರ', 'ರೇವತಿ',
  ],
};

export const GRAHA: Record<GrahaId, Tri> = {
  Sun: { en: 'Surya', hi: 'सूर्य', kn: 'ಸೂರ್ಯ' },
  Moon: { en: 'Chandra', hi: 'चंद्र', kn: 'ಚಂದ್ರ' },
  Mars: { en: 'Mangal', hi: 'मंगल', kn: 'ಕುಜ' },
  Mercury: { en: 'Budha', hi: 'बुध', kn: 'ಬುಧ' },
  Jupiter: { en: 'Guru', hi: 'गुरु', kn: 'ಗುರು' },
  Venus: { en: 'Shukra', hi: 'शुक्र', kn: 'ಶುಕ್ರ' },
  Saturn: { en: 'Shani', hi: 'शनि', kn: 'ಶನಿ' },
  Rahu: { en: 'Rahu', hi: 'राहु', kn: 'ರಾಹು' },
  Ketu: { en: 'Ketu', hi: 'केतु', kn: 'ಕೇತು' },
};

/** English planet names, shown beside the Sanskrit ones in the English interface. */
export const GRAHA_WESTERN: Record<GrahaId, string> = {
  Sun: 'Sun', Moon: 'Moon', Mars: 'Mars', Mercury: 'Mercury', Jupiter: 'Jupiter', Venus: 'Venus', Saturn: 'Saturn', Rahu: 'North node', Ketu: 'South node',
};

/** Two-letter marks written inside the chart. */
export const GRAHA_SHORT: Record<GrahaId, Tri> = {
  Sun: { en: 'Su', hi: 'सू', kn: 'ರ' },
  Moon: { en: 'Mo', hi: 'चं', kn: 'ಚಂ' },
  Mars: { en: 'Ma', hi: 'मं', kn: 'ಕು' },
  Mercury: { en: 'Me', hi: 'बु', kn: 'ಬು' },
  Jupiter: { en: 'Ju', hi: 'गु', kn: 'ಗು' },
  Venus: { en: 'Ve', hi: 'शु', kn: 'ಶು' },
  Saturn: { en: 'Sa', hi: 'श', kn: 'ಶ' },
  Rahu: { en: 'Ra', hi: 'रा', kn: 'ರಾ' },
  Ketu: { en: 'Ke', hi: 'के', kn: 'ಕೇ' },
};

export const LAGNA: Tri = { en: 'Lagna', hi: 'लग्न', kn: 'ಲಗ್ನ' };
export const LAGNA_SHORT: Tri = { en: 'Asc', hi: 'ल', kn: 'ಲ' };

/** Weekdays, Sunday first. */
export const VARA: TriList = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  hi: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
  kn: ['ಭಾನುವಾರ', 'ಸೋಮವಾರ', 'ಮಂಗಳವಾರ', 'ಬುಧವಾರ', 'ಗುರುವಾರ', 'ಶುಕ್ರವಾರ', 'ಶನಿವಾರ'],
};

/** The fourteen tithis shared by both fortnights; the fifteenth is Purnima or Amavasya. */
export const TITHI: TriList = {
  en: ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi'],
  hi: ['प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी'],
  kn: ['ಪಾಡ್ಯ', 'ಬಿದಿಗೆ', 'ತದಿಗೆ', 'ಚೌತಿ', 'ಪಂಚಮಿ', 'ಷಷ್ಠಿ', 'ಸಪ್ತಮಿ', 'ಅಷ್ಟಮಿ', 'ನವಮಿ', 'ದಶಮಿ', 'ಏಕಾದಶಿ', 'ದ್ವಾದಶಿ', 'ತ್ರಯೋದಶಿ', 'ಚತುರ್ದಶಿ'],
};
export const PURNIMA: Tri = { en: 'Purnima', hi: 'पूर्णिमा', kn: 'ಹುಣ್ಣಿಮೆ' };
export const AMAVASYA: Tri = { en: 'Amavasya', hi: 'अमावस्या', kn: 'ಅಮಾವಾಸ್ಯೆ' };
export const PAKSHA: Record<'shukla' | 'krishna', Tri> = {
  shukla: { en: 'Shukla Paksha', hi: 'शुक्ल पक्ष', kn: 'ಶುಕ್ಲ ಪಕ್ಷ' },
  krishna: { en: 'Krishna Paksha', hi: 'कृष्ण पक्ष', kn: 'ಕೃಷ್ಣ ಪಕ್ಷ' },
};

/** Name of a tithi from its index 0–29 (0 = Shukla Pratipada, 14 = Purnima, 29 = Amavasya). */
export function tithiName(lang: Lang, index: number): string {
  if (index === 14) return pick(lang, PURNIMA);
  if (index === 29) return pick(lang, AMAVASYA);
  return pick(lang, TITHI)[index % 15];
}

export const YOGA: TriList = {
  en: [
    'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula',
    'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan',
    'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti',
  ],
  hi: [
    'विष्कंभ', 'प्रीति', 'आयुष्मान', 'सौभाग्य', 'शोभन', 'अतिगंड', 'सुकर्मा', 'धृति', 'शूल',
    'गंड', 'वृद्धि', 'ध्रुव', 'व्याघात', 'हर्षण', 'वज्र', 'सिद्धि', 'व्यतीपात', 'वरीयान',
    'परिघ', 'शिव', 'सिद्ध', 'साध्य', 'शुभ', 'शुक्ल', 'ब्रह्म', 'इंद्र', 'वैधृति',
  ],
  kn: [
    'ವಿಷ್ಕಂಭ', 'ಪ್ರೀತಿ', 'ಆಯುಷ್ಮಾನ್', 'ಸೌಭಾಗ್ಯ', 'ಶೋಭನ', 'ಅತಿಗಂಡ', 'ಸುಕರ್ಮ', 'ಧೃತಿ', 'ಶೂಲ',
    'ಗಂಡ', 'ವೃದ್ಧಿ', 'ಧ್ರುವ', 'ವ್ಯಾಘಾತ', 'ಹರ್ಷಣ', 'ವಜ್ರ', 'ಸಿದ್ಧಿ', 'ವ್ಯತೀಪಾತ', 'ವರೀಯಾನ್',
    'ಪರಿಘ', 'ಶಿವ', 'ಸಿದ್ಧ', 'ಸಾಧ್ಯ', 'ಶುಭ', 'ಶುಕ್ಲ', 'ಬ್ರಹ್ಮ', 'ಇಂದ್ರ', 'ವೈಧೃತಿ',
  ],
};

/** The seven moving karanas followed by the four fixed ones. */
export const KARANA: TriList = {
  en: ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti (Bhadra)', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'],
  hi: ['बव', 'बालव', 'कौलव', 'तैतिल', 'गर', 'वणिज', 'विष्टि (भद्रा)', 'शकुनि', 'चतुष्पाद', 'नाग', 'किंस्तुघ्न'],
  kn: ['ಬವ', 'ಬಾಲವ', 'ಕೌಲವ', 'ತೈತಿಲ', 'ಗರಜ', 'ವಣಿಜ', 'ವಿಷ್ಟಿ (ಭದ್ರಾ)', 'ಶಕುನಿ', 'ಚತುಷ್ಪಾದ', 'ನಾಗ', 'ಕಿಂಸ್ತುಘ್ನ'],
};

/** Lunar months, Chaitra first. */
export const MASA: TriList = {
  en: ['Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada', 'Ashwina', 'Kartika', 'Margashirsha', 'Pausha', 'Magha', 'Phalguna'],
  hi: ['चैत्र', 'वैशाख', 'ज्येष्ठ', 'आषाढ़', 'श्रावण', 'भाद्रपद', 'आश्विन', 'कार्तिक', 'मार्गशीर्ष', 'पौष', 'माघ', 'फाल्गुन'],
  kn: ['ಚೈತ್ರ', 'ವೈಶಾಖ', 'ಜ್ಯೇಷ್ಠ', 'ಆಷಾಢ', 'ಶ್ರಾವಣ', 'ಭಾದ್ರಪದ', 'ಆಶ್ವಯುಜ', 'ಕಾರ್ತಿಕ', 'ಮಾರ್ಗಶಿರ', 'ಪುಷ್ಯ', 'ಮಾಘ', 'ಫಾಲ್ಗುಣ'],
};
export const ADHIKA: Tri = { en: 'Adhika', hi: 'अधिक', kn: 'ಅಧಿಕ' };

/** Calendar months for dates of birth. */
export const MONTH: TriList = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  hi: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'],
  kn: ['ಜನವರಿ', 'ಫೆಬ್ರವರಿ', 'ಮಾರ್ಚ್', 'ಏಪ್ರಿಲ್', 'ಮೇ', 'ಜೂನ್', 'ಜುಲೈ', 'ಆಗಸ್ಟ್', 'ಸೆಪ್ಟೆಂಬರ್', 'ಅಕ್ಟೋಬರ್', 'ನವೆಂಬರ್', 'ಡಿಸೆಂಬರ್'],
};
export const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

/* ---- Ashtakoota vocabulary ---- */

export const VARNA: TriList = {
  en: ['Brahmin', 'Kshatriya', 'Vaishya', 'Shudra'],
  hi: ['ब्राह्मण', 'क्षत्रिय', 'वैश्य', 'शूद्र'],
  kn: ['ಬ್ರಾಹ್ಮಣ', 'ಕ್ಷತ್ರಿಯ', 'ವೈಶ್ಯ', 'ಶೂದ್ರ'],
};

export const VASHYA: TriList = {
  en: ['Chatushpada', 'Manava', 'Jalachara', 'Vanachara', 'Keeta'],
  hi: ['चतुष्पद', 'मानव', 'जलचर', 'वनचर', 'कीट'],
  kn: ['ಚತುಷ್ಪಾದ', 'ಮಾನವ', 'ಜಲಚರ', 'ವನಚರ', 'ಕೀಟ'],
};

export const TARA: TriList = {
  en: ['Janma', 'Sampat', 'Vipat', 'Kshema', 'Pratyari', 'Sadhaka', 'Vadha', 'Mitra', 'Ati-Mitra'],
  hi: ['जन्म', 'संपत', 'विपत', 'क्षेम', 'प्रत्यरि', 'साधक', 'वध', 'मित्र', 'अतिमित्र'],
  kn: ['ಜನ್ಮ', 'ಸಂಪತ್', 'ವಿಪತ್', 'ಕ್ಷೇಮ', 'ಪ್ರತ್ಯರಿ', 'ಸಾಧಕ', 'ವಧ', 'ಮಿತ್ರ', 'ಅತಿಮಿತ್ರ'],
};

export const YONI: TriList = {
  en: ['Horse', 'Elephant', 'Sheep', 'Serpent', 'Dog', 'Cat', 'Rat', 'Cow', 'Buffalo', 'Tiger', 'Deer', 'Monkey', 'Mongoose', 'Lion'],
  hi: ['अश्व', 'गज', 'मेष', 'सर्प', 'श्वान', 'मार्जार', 'मूषक', 'गौ', 'महिष', 'व्याघ्र', 'मृग', 'वानर', 'नकुल', 'सिंह'],
  kn: ['ಕುದುರೆ', 'ಆನೆ', 'ಕುರಿ', 'ಸರ್ಪ', 'ನಾಯಿ', 'ಬೆಕ್ಕು', 'ಇಲಿ', 'ಹಸು', 'ಎಮ್ಮೆ', 'ಹುಲಿ', 'ಜಿಂಕೆ', 'ಕೋತಿ', 'ಮುಂಗುಸಿ', 'ಸಿಂಹ'],
};

export const GANA: TriList = {
  en: ['Deva', 'Manushya', 'Rakshasa'],
  hi: ['देव', 'मनुष्य', 'राक्षस'],
  kn: ['ದೇವ', 'ಮನುಷ್ಯ', 'ರಾಕ್ಷಸ'],
};

export const NADI: TriList = {
  en: ['Adi', 'Madhya', 'Antya'],
  hi: ['आदि', 'मध्य', 'अंत्य'],
  kn: ['ಆದಿ', 'ಮಧ್ಯ', 'ಅಂತ್ಯ'],
};
