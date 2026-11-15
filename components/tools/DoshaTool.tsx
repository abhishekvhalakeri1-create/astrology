"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { BirthFields, EMPTY_BIRTH, loadBirth, saveBirth, showFirstError, toBirthDetails, validateBirth, type BirthErrors, type BirthInput } from "@/components/astro/BirthForm";
import { ConsultCTA, FormWithAside, Panel, PrivacyNote, ToolHero } from "@/components/astro/ui";
import { dateOf, formatDate, formatHourMinute, formatMonthYear } from "@/lib/astro/format";
import { computeKundli, sadeSatiCycles, sadeSatiStatus, type Kundli, type SadeSatiPhase } from "@/lib/astro/kundli";
import { GRAHA, NAKSHATRA, RASHI, type Lang, type Tri } from "@/lib/astro/names";
import { placeLabel } from "@/lib/astro/places";
import { ordinal } from "@/lib/astro/words";
import { houseFrom } from "@/lib/astro/zodiac";
import { useLang } from "@/lib/useLang";

const T = {
  eyebrow: { en: "Free tool • Dosha check", hi: "निःशुल्क साधन • दोष जाँच", kn: "ಉಚಿತ ಸಾಧನ • ದೋಷ ಪರಿಶೀಲನೆ" },
  title: { en: "Manglik, Kaal Sarp and Sade Sati", hi: "मांगलिक, काल सर्प और साढ़े साती", kn: "ಕುಜ ದೋಷ, ಕಾಳ ಸರ್ಪ ಮತ್ತು ಸಾಡೇ ಸಾತಿ" },
  intro: {
    en: "Three words that frighten families more than they should. This page checks each one against your chart and tells you plainly what was found, with the dates.",
    hi: "तीन शब्द जो परिवारों को ज़रूरत से ज़्यादा डराते हैं। यह पृष्ठ आपकी कुंडली में तीनों की जाँच करता है और जो मिला उसे तिथियों सहित साफ़ बताता है।",
    kn: "ಕುಟುಂಬಗಳನ್ನು ಅಗತ್ಯಕ್ಕಿಂತ ಹೆಚ್ಚು ಹೆದರಿಸುವ ಮೂರು ಪದಗಳು. ಈ ಪುಟ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಮೂರನ್ನೂ ಪರಿಶೀಲಿಸಿ, ಕಂಡದ್ದನ್ನು ದಿನಾಂಕಗಳೊಂದಿಗೆ ಸ್ಪಷ್ಟವಾಗಿ ತಿಳಿಸುತ್ತದೆ.",
  },
  formTitle: { en: "Birth details", hi: "जन्म विवरण", kn: "ಜನ್ಮ ವಿವರ" },
  asideTitle: { en: "What is checked", hi: "क्या जाँचा जाता है", kn: "ಏನನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ" },
  submit: { en: "Check my chart", hi: "मेरी कुंडली जाँचें", kn: "ನನ್ನ ಜಾತಕ ಪರಿಶೀಲಿಸಿ" },
  resultFor: { en: "Result", hi: "परिणाम", kn: "ಫಲಿತಾಂಶ" },
  manglik: { en: "Mangal dosha (Manglik)", hi: "मंगल दोष (मांगलिक)", kn: "ಕುಜ ದೋಷ" },
  kaalSarp: { en: "Kaal Sarp yoga", hi: "काल सर्प योग", kn: "ಕಾಳ ಸರ್ಪ ಯೋಗ" },
  sadeSati: { en: "Sade Sati", hi: "साढ़े साती", kn: "ಸಾಡೇ ಸಾತಿ" },
  present: { en: "Present", hi: "है", kn: "ಇದೆ" },
  absent: { en: "Not present", hi: "नहीं है", kn: "ಇಲ್ಲ" },
  mild: { en: "Mild", hi: "हल्का", kn: "ಸೌಮ್ಯ" },
  running: { en: "Running now", hi: "अभी चल रही है", kn: "ಈಗ ನಡೆಯುತ್ತಿದೆ" },
  notRunning: { en: "Not running", hi: "नहीं चल रही", kn: "ನಡೆಯುತ್ತಿಲ್ಲ" },
  manglikNote: {
    en: "Mangal dosha is counted when Mars is in the 1st, 2nd, 4th, 7th, 8th or 12th house. That is six houses out of twelve, so half of all charts have it. It speaks of energy and directness in marriage, not of misfortune.",
    hi: "मंगल दोष तब गिना जाता है जब मंगल 1, 2, 4, 7, 8 या 12वें भाव में हो। ये बारह में से छह भाव हैं, यानी आधी कुंडलियों में यह होता है। यह विवाह में ऊर्जा और स्पष्टवादिता बताता है, दुर्भाग्य नहीं।",
    kn: "ಕುಜ 1, 2, 4, 7, 8 ಅಥವಾ 12ನೇ ಭಾವದಲ್ಲಿದ್ದಾಗ ಕುಜ ದೋಷ ಎಂದು ಎಣಿಸುತ್ತಾರೆ. ಹನ್ನೆರಡರಲ್ಲಿ ಇವು ಆರು ಭಾವಗಳು, ಅಂದರೆ ಅರ್ಧದಷ್ಟು ಜಾತಕಗಳಲ್ಲಿ ಇದು ಇರುತ್ತದೆ. ಇದು ದಾಂಪತ್ಯದಲ್ಲಿ ಶಕ್ತಿ ಮತ್ತು ನೇರ ನುಡಿಯನ್ನು ಸೂಚಿಸುತ್ತದೆ, ದುರದೃಷ್ಟವನ್ನಲ್ಲ.",
  },
  softeners: { en: "Softening factors found in this chart", hi: "इस कुंडली में मिले परिहार", kn: "ಈ ಜಾತಕದಲ್ಲಿ ಕಂಡ ಪರಿಹಾರ ಅಂಶಗಳು" },
  noSofteners: {
    en: "None of the common cancellations shows at first glance. Others depend on the navamsa and on the partner’s chart.",
    hi: "पहली नज़र में कोई सामान्य परिहार नहीं दिखता। अन्य परिहार नवांश और जीवनसाथी की कुंडली पर निर्भर करते हैं।",
    kn: "ಮೊದಲ ನೋಟಕ್ಕೆ ಸಾಮಾನ್ಯ ಪರಿಹಾರಗಳು ಕಾಣುತ್ತಿಲ್ಲ. ಉಳಿದವು ನವಾಂಶ ಮತ್ತು ಸಂಗಾತಿಯ ಜಾತಕವನ್ನು ಅವಲಂಬಿಸಿವೆ.",
  },
  withGuru: { en: "Guru sits with Mars in the same sign.", hi: "गुरु मंगल के साथ उसी राशि में है।", kn: "ಗುರು ಕುಜನೊಂದಿಗೆ ಅದೇ ರಾಶಿಯಲ್ಲಿದ್ದಾನೆ." },
  guruAspect: { en: "Guru aspects Mars.", hi: "मंगल पर गुरु की दृष्टि है।", kn: "ಕುಜನ ಮೇಲೆ ಗುರುವಿನ ದೃಷ್ಟಿ ಇದೆ." },
  kaalSarpNo: {
    en: "The grahas stand on both sides of the Rahu–Ketu axis. There is no Kaal Sarp yoga in this chart.",
    hi: "ग्रह राहु–केतु अक्ष के दोनों ओर हैं। इस कुंडली में काल सर्प योग नहीं है।",
    kn: "ಗ್ರಹಗಳು ರಾಹು–ಕೇತು ಅಕ್ಷದ ಎರಡೂ ಬದಿಗಳಲ್ಲಿವೆ. ಈ ಜಾತಕದಲ್ಲಿ ಕಾಳ ಸರ್ಪ ಯೋಗ ಇಲ್ಲ.",
  },
  kaalSarpNote: {
    en: "The oldest texts of Jyotish do not describe Kaal Sarp; it came into practice much later. It is read as a life that gathers pace after a slow start. It does not call for a costly pooja.",
    hi: "ज्योतिष के प्राचीनतम ग्रंथों में काल सर्प का वर्णन नहीं है; यह बहुत बाद में प्रचलन में आया। इसे ऐसे जीवन के रूप में पढ़ा जाता है जो धीमी शुरुआत के बाद गति पकड़ता है। इसके लिए महँगी पूजा आवश्यक नहीं।",
    kn: "ಜ್ಯೋತಿಷ್ಯದ ಅತಿ ಪ್ರಾಚೀನ ಗ್ರಂಥಗಳಲ್ಲಿ ಕಾಳ ಸರ್ಪದ ವಿವರಣೆ ಇಲ್ಲ; ಇದು ಬಹಳ ನಂತರ ಬಳಕೆಗೆ ಬಂದಿತು. ನಿಧಾನ ಆರಂಭದ ನಂತರ ವೇಗ ಪಡೆಯುವ ಜೀವನ ಎಂದು ಇದನ್ನು ಓದುತ್ತಾರೆ. ಇದಕ್ಕೆ ದುಬಾರಿ ಪೂಜೆ ಅಗತ್ಯವಿಲ್ಲ.",
  },
  sadeSatiNote: {
    en: "Saturn takes about 29½ years to circle the zodiac, so everyone meets Sade Sati two or three times. It is a period of slower, steadier work and of added responsibility. Shani is a teacher, not a punisher.",
    hi: "शनि को राशिचक्र का एक चक्कर लगाने में लगभग 29½ वर्ष लगते हैं, इसलिए हर व्यक्ति के जीवन में साढ़े साती दो-तीन बार आती है। यह धीमे, स्थिर परिश्रम और बढ़ी हुई ज़िम्मेदारी का समय है। शनि दंड देने वाला नहीं, सिखाने वाला है।",
    kn: "ಶನಿ ರಾಶಿಚಕ್ರವನ್ನು ಒಮ್ಮೆ ಸುತ್ತಲು ಸುಮಾರು 29½ ವರ್ಷ ಬೇಕು; ಆದ್ದರಿಂದ ಪ್ರತಿಯೊಬ್ಬರ ಜೀವನದಲ್ಲೂ ಸಾಡೇ ಸಾತಿ ಎರಡು-ಮೂರು ಬಾರಿ ಬರುತ್ತದೆ. ಇದು ನಿಧಾನ, ಸ್ಥಿರ ಪರಿಶ್ರಮ ಮತ್ತು ಹೆಚ್ಚಿದ ಜವಾಬ್ದಾರಿಯ ಕಾಲ. ಶನಿ ಶಿಕ್ಷಿಸುವವನಲ್ಲ, ಕಲಿಸುವವನು.",
  },
  cycles: { en: "Your Sade Sati periods", hi: "आपकी साढ़े साती की अवधियाँ", kn: "ನಿಮ್ಮ ಸಾಡೇ ಸಾತಿ ಅವಧಿಗಳು" },
  begins: { en: "Begins", hi: "आरंभ", kn: "ಆರಂಭ" },
  peak: { en: "Peak phase from", hi: "मध्य चरण", kn: "ಮಧ್ಯ ಹಂತ" },
  last: { en: "Last phase from", hi: "अंतिम चरण", kn: "ಕೊನೆಯ ಹಂತ" },
  ends: { en: "Ends", hi: "समाप्ति", kn: "ಮುಕ್ತಾಯ" },
  past: { en: "Past", hi: "बीत चुकी", kn: "ಮುಗಿದಿದೆ" },
  now: { en: "Now", hi: "अभी", kn: "ಈಗ" },
  ahead: { en: "Ahead", hi: "आगे", kn: "ಮುಂದೆ" },
  ctaTitle: { en: "Worried by what someone told you?", hi: "किसी की बात से चिंतित हैं?", kn: "ಯಾರೋ ಹೇಳಿದ ಮಾತಿನಿಂದ ಚಿಂತೆಯಾಗಿದೆಯೇ?" },
  ctaBody: {
    en: "If you were told to do an expensive pooja for one of these, send me the chart first. I will tell you honestly whether anything needs doing, and if so, the simple remedy at home.",
    hi: "यदि इनमें से किसी के लिए आपको महँगी पूजा बताई गई है, तो पहले कुंडली मुझे भेजिए। मैं ईमानदारी से बताऊँगी कि कुछ करने की ज़रूरत है या नहीं, और है तो घर पर करने योग्य सरल उपाय।",
    kn: "ಇವುಗಳಲ್ಲಿ ಯಾವುದಕ್ಕಾದರೂ ದುಬಾರಿ ಪೂಜೆ ಮಾಡಿಸಲು ಹೇಳಿದ್ದರೆ, ಮೊದಲು ಜಾತಕವನ್ನು ನನಗೆ ಕಳುಹಿಸಿ. ಏನಾದರೂ ಮಾಡಬೇಕೇ ಎಂದು ಪ್ರಾಮಾಣಿಕವಾಗಿ ಹೇಳುತ್ತೇನೆ; ಬೇಕಿದ್ದರೆ ಮನೆಯಲ್ಲೇ ಮಾಡಬಹುದಾದ ಸರಳ ಪರಿಹಾರ ತಿಳಿಸುತ್ತೇನೆ.",
  },
} satisfies Record<string, Tri>;

const ASIDE: readonly { title: Tri; text: Tri }[] = [
  {
    title: { en: "Mangal dosha (Manglik)", hi: "मंगल दोष (मांगलिक)", kn: "ಕುಜ ದೋಷ" },
    text: {
      en: "Mars in the 1st, 2nd, 4th, 7th, 8th or 12th house, counted from the lagna and from the Moon, with the softening factors the chart shows.",
      hi: "मंगल 1, 2, 4, 7, 8 या 12वें भाव में है या नहीं, लग्न से और चंद्र से गिनकर, और कुंडली में दिखने वाले परिहार।",
      kn: "ಕುಜ 1, 2, 4, 7, 8 ಅಥವಾ 12ನೇ ಭಾವದಲ್ಲಿದ್ದಾನೆಯೇ ಎಂದು ಲಗ್ನದಿಂದ ಮತ್ತು ಚಂದ್ರನಿಂದ ಎಣಿಸಿ, ಜಾತಕದಲ್ಲಿ ಕಾಣುವ ಪರಿಹಾರ ಅಂಶಗಳೊಂದಿಗೆ.",
    },
  },
  {
    title: { en: "Kaal Sarp yoga", hi: "काल सर्प योग", kn: "ಕಾಳ ಸರ್ಪ ಯೋಗ" },
    text: {
      en: "Whether all seven grahas stand on one side of the Rahu–Ketu axis.",
      hi: "सातों ग्रह राहु–केतु अक्ष के एक ही ओर हैं या नहीं।",
      kn: "ಏಳೂ ಗ್ರಹಗಳು ರಾಹು–ಕೇತು ಅಕ್ಷದ ಒಂದೇ ಬದಿಯಲ್ಲಿವೆಯೇ ಎಂದು.",
    },
  },
  {
    title: { en: "Sade Sati", hi: "साढ़े साती", kn: "ಸಾಡೇ ಸಾತಿ" },
    text: {
      en: "Whether Shani is passing the 12th, 1st or 2nd from your Moon today, and the dates of every Sade Sati in your life.",
      hi: "आज शनि आपके चंद्र से 12वें, पहले या दूसरे स्थान से गुज़र रहा है या नहीं, और जीवन की हर साढ़े साती की तिथियाँ।",
      kn: "ಇಂದು ಶನಿ ನಿಮ್ಮ ಚಂದ್ರನಿಂದ 12, 1 ಅಥವಾ 2ನೇ ಸ್ಥಾನದಲ್ಲಿ ಸಾಗುತ್ತಿದ್ದಾನೆಯೇ ಎಂದು, ಮತ್ತು ಜೀವನದ ಪ್ರತಿ ಸಾಡೇ ಸಾತಿಯ ದಿನಾಂಕಗಳು.",
    },
  },
];

const PHASE: Record<SadeSatiPhase, Tri> = {
  rising: { en: "first phase", hi: "पहला चरण", kn: "ಮೊದಲ ಹಂತ" },
  peak: { en: "second phase, the peak", hi: "दूसरा चरण (मध्य)", kn: "ಎರಡನೇ ಹಂತ (ಮಧ್ಯ)" },
  setting: { en: "third and last phase", hi: "तीसरा और अंतिम चरण", kn: "ಮೂರನೇ ಮತ್ತು ಕೊನೆಯ ಹಂತ" },
};

/** The twelve varieties of Kaal Sarp, named by the house Rahu occupies. */
const KAAL_SARP_TYPE: Record<Lang, readonly string[]> = {
  en: ["Ananta", "Kulika", "Vasuki", "Shankhapala", "Padma", "Mahapadma", "Takshaka", "Karkotaka", "Shankhachuda", "Ghataka", "Vishadhara", "Sheshanaga"],
  hi: ["अनंत", "कुलिक", "वासुकि", "शंखपाल", "पद्म", "महापद्म", "तक्षक", "कर्कोटक", "शंखचूड़", "घातक", "विषधर", "शेषनाग"],
  kn: ["ಅನಂತ", "ಕುಲಿಕ", "ವಾಸುಕಿ", "ಶಂಖಪಾಲ", "ಪದ್ಮ", "ಮಹಾಪದ್ಮ", "ತಕ್ಷಕ", "ಕಾರ್ಕೋಟಕ", "ಶಂಖಚೂಡ", "ಘಾತಕ", "ವಿಷಧರ", "ಶೇಷನಾಗ"],
};

/** Sign placements in which the texts exempt Mars in a given house: house → rashis. */
const HOUSE_SIGN_EXEMPT: Record<number, readonly number[]> = { 2: [2, 5], 12: [1, 6], 4: [0, 7], 7: [3, 9], 8: [8, 11] };

function manglikSofteners(k: Kundli, lang: Lang): string[] {
  const mars = k.grahas.Mars;
  const guru = k.grahas.Jupiter;
  const out: string[] = [];
  const rashi = RASHI[lang][mars.rashi];
  if (mars.dignity === "own" || mars.dignity === "exalted") {
    const own = mars.dignity === "own";
    out.push(
      lang === "hi"
        ? `मंगल अपनी ${own ? "स्वराशि" : "उच्च राशि"} ${rashi} में है।`
        : lang === "kn"
          ? `ಕುಜ ತನ್ನ ${own ? "ಸ್ವಕ್ಷೇತ್ರವಾದ" : "ಉಚ್ಚ ರಾಶಿಯಾದ"} ${rashi} ರಾಶಿಯಲ್ಲಿದ್ದಾನೆ.`
          : `Mars is in ${rashi}, its ${own ? "own" : "exalted"} sign.`,
    );
  } else if (HOUSE_SIGN_EXEMPT[mars.house]?.includes(mars.rashi)) {
    const h = ordinal(lang, mars.house);
    out.push(
      lang === "hi"
        ? `${h} भाव का मंगल ${rashi} राशि में है, जिसे शास्त्र दोष नहीं मानते।`
        : lang === "kn"
          ? `${h} ಭಾವದ ಕುಜ ${rashi} ರಾಶಿಯಲ್ಲಿದ್ದಾನೆ; ಇದನ್ನು ಶಾಸ್ತ್ರಗಳು ದೋಷವೆಂದು ಪರಿಗಣಿಸುವುದಿಲ್ಲ.`
          : `Mars in the ${h} house falls in ${rashi}, a placement the texts exempt.`,
    );
  }
  if (guru.rashi === mars.rashi) out.push(T.withGuru[lang]);
  else if ([5, 7, 9].includes(houseFrom(guru.rashi, mars.rashi))) out.push(T.guruAspect[lang]);
  return out;
}

function manglikVerdict(k: Kundli, lang: Lang): string {
  const m = k.manglik;
  const rashi = RASHI[lang][k.grahas.Mars.rashi];
  const a = ordinal(lang, m.houseFromLagna);
  const b = ordinal(lang, m.houseFromMoon);
  if (m.fromLagna) {
    if (lang === "hi") return `मंगल दोष है। मंगल ${rashi} राशि में है, जो आपके लग्न से ${a} भाव है।`;
    if (lang === "kn") return `ಕುಜ ದೋಷ ಇದೆ. ಕುಜ ${rashi} ರಾಶಿಯಲ್ಲಿ, ನಿಮ್ಮ ಲಗ್ನದಿಂದ ${a} ಭಾವದಲ್ಲಿದ್ದಾನೆ.`;
    return `Mangal dosha is present. Mars is in ${rashi}, the ${a} house from your lagna.`;
  }
  if (m.fromMoon) {
    if (lang === "hi") return `लग्न से मंगल दोष नहीं है (मंगल ${a} भाव में है)। चंद्र से गिनने पर मंगल ${b} भाव में है — यह हल्का रूप है, जिसे बाकी कुंडली के साथ ही तौला जाता है।`;
    if (lang === "kn") return `ಲಗ್ನದಿಂದ ಕುಜ ದೋಷ ಇಲ್ಲ (ಕುಜ ${a} ಭಾವದಲ್ಲಿದ್ದಾನೆ). ಚಂದ್ರನಿಂದ ಎಣಿಸಿದರೆ ಕುಜ ${b} ಭಾವದಲ್ಲಿದ್ದಾನೆ — ಇದು ಸೌಮ್ಯ ರೂಪ; ಉಳಿದ ಜಾತಕದೊಂದಿಗೆ ಮಾತ್ರ ಇದನ್ನು ತೂಗಬೇಕು.`;
    return `From the lagna there is no Mangal dosha (Mars is in the ${a} house). Counted from the Moon, Mars is in the ${b} — a milder form that is weighed only together with the rest of the chart.`;
  }
  if (lang === "hi") return `मंगल दोष नहीं है। मंगल आपके लग्न से ${a} और चंद्र से ${b} भाव में है।`;
  if (lang === "kn") return `ಕುಜ ದೋಷ ಇಲ್ಲ. ಕುಜ ನಿಮ್ಮ ಲಗ್ನದಿಂದ ${a} ಮತ್ತು ಚಂದ್ರನಿಂದ ${b} ಭಾವದಲ್ಲಿದ್ದಾನೆ.`;
  return `No Mangal dosha. Mars is in the ${a} house from your lagna and the ${b} from your Moon.`;
}

function kaalSarpVerdict(k: Kundli, lang: Lang): string {
  if (!k.kaalSarp.present) return T.kaalSarpNo[lang];
  const h = ordinal(lang, k.kaalSarp.rahuHouse);
  const type = KAAL_SARP_TYPE[lang][k.kaalSarp.rahuHouse - 1];
  if (lang === "hi") return `सातों ग्रह राहु–केतु अक्ष के एक ही ओर हैं। राहु ${h} भाव में होने से इसे ${type} काल सर्प योग कहते हैं।`;
  if (lang === "kn") return `ಏಳೂ ಗ್ರಹಗಳು ರಾಹು–ಕೇತು ಅಕ್ಷದ ಒಂದೇ ಬದಿಯಲ್ಲಿವೆ. ರಾಹು ${h} ಭಾವದಲ್ಲಿರುವುದರಿಂದ ಇದನ್ನು ${type} ಕಾಳ ಸರ್ಪ ಯೋಗ ಎನ್ನುತ್ತಾರೆ.`;
  return `All seven grahas lie on one side of the Rahu–Ketu axis. With Rahu in the ${h} house this is called ${type} Kaal Sarp yoga.`;
}

function sadeSatiVerdict(k: Kundli, now: Date, lang: Lang): string {
  const s = sadeSatiStatus(k.grahas.Moon.rashi, now);
  const saturn = RASHI[lang][s.saturnRashi];
  const moon = RASHI[lang][k.grahas.Moon.rashi];
  const h = ordinal(lang, s.houseFromMoon);
  if (s.phase) {
    const phase = PHASE[s.phase][lang];
    if (lang === "hi") return `साढ़े साती चल रही है — ${phase}। शनि ${saturn} राशि में है, जो आपकी चंद्र राशि ${moon} से ${h} है।`;
    if (lang === "kn") return `ಸಾಡೇ ಸಾತಿ ನಡೆಯುತ್ತಿದೆ — ${phase}. ಶನಿ ${saturn} ರಾಶಿಯಲ್ಲಿದ್ದಾನೆ; ನಿಮ್ಮ ${moon} ರಾಶಿಯಿಂದ ಇದು ${h} ಸ್ಥಾನ.`;
    return `Sade Sati is running — the ${phase}. Saturn is in ${saturn}, the ${h} from your Moon sign ${moon}.`;
  }
  if (s.dhaiya) {
    const eighth = s.houseFromMoon === 8;
    if (lang === "hi") return `साढ़े साती नहीं चल रही। शनि ${saturn} राशि में, आपकी चंद्र राशि ${moon} से ${h} है — ढाई वर्ष की ढैया (${eighth ? "अष्टम शनि" : "अर्धाष्टम शनि"})।`;
    if (lang === "kn") return `ಸಾಡೇ ಸಾತಿ ನಡೆಯುತ್ತಿಲ್ಲ. ಶನಿ ${saturn} ರಾಶಿಯಲ್ಲಿ, ನಿಮ್ಮ ${moon} ರಾಶಿಯಿಂದ ${h} ಸ್ಥಾನದಲ್ಲಿದ್ದಾನೆ — ಎರಡೂವರೆ ವರ್ಷಗಳ ${eighth ? "ಅಷ್ಟಮ ಶನಿ" : "ಅರ್ಧಾಷ್ಟಮ ಶನಿ"}.`;
    return `Sade Sati is not running. Saturn is in ${saturn}, the ${h} from your Moon sign ${moon} — the shorter two-and-a-half-year dhaiya (${eighth ? "Ashtama Shani" : "Ardhashtama Shani"}).`;
  }
  if (lang === "hi") return `साढ़े साती नहीं चल रही। शनि ${saturn} राशि में है, जो आपकी चंद्र राशि ${moon} से ${h} है।`;
  if (lang === "kn") return `ಸಾಡೇ ಸಾತಿ ನಡೆಯುತ್ತಿಲ್ಲ. ಶನಿ ${saturn} ರಾಶಿಯಲ್ಲಿದ್ದಾನೆ; ನಿಮ್ಮ ${moon} ರಾಶಿಯಿಂದ ಇದು ${h} ಸ್ಥಾನ.`;
  return `Sade Sati is not running. Saturn is in ${saturn}, the ${h} from your Moon sign ${moon}.`;
}

function Chip({ tone, children }: { tone: "good" | "warn" | "note"; children: React.ReactNode }) {
  const cls = tone === "good" ? "bg-[#E8F3EC] text-[#1F6B43]" : tone === "warn" ? "bg-[#FBEAEA] text-[#9B2C2C]" : "bg-[#FBF1DC] text-[#8A5A0B]";
  return <span className={`inline-flex items-center px-2.5 py-1 text-[12.5px] font-semibold ${cls}`}>{children}</span>;
}

function whatsappMessage(k: Kundli, now: Date): string {
  const b = k.birth;
  const s = sadeSatiStatus(k.grahas.Moon.rashi, now);
  return [
    "Namaste Rajeshwari madam, I ran the dosha check on your website.",
    `Name: ${b.name || "-"}`,
    `Born: ${formatDate("en", b)}, ${formatHourMinute(b.hour, b.minute)}, ${placeLabel(b.place)}`,
    `Lagna: ${RASHI.en[k.lagna.rashi]} | Rashi: ${RASHI.en[k.grahas.Moon.rashi]} | Nakshatra: ${NAKSHATRA.en[k.grahas.Moon.nakshatra]}`,
    `Mangal dosha: ${k.manglik.fromLagna ? "yes" : k.manglik.fromMoon ? "from Moon only" : "no"} | Kaal Sarp: ${k.kaalSarp.present ? "yes" : "no"} | Sade Sati now: ${s.phase ? "yes" : "no"}`,
    "I would like your guidance on this.",
  ].join("\n");
}

export function DoshaTool() {
  const lang = useLang();
  const [input, setInput] = useState<BirthInput>(EMPTY_BIRTH);
  const [attempted, setAttempted] = useState(false);
  const [result, setResult] = useState<{ kundli: Kundli; now: Date } | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const scrollOnResult = useRef(false);

  useEffect(() => {
    const saved = loadBirth("self");
    if (!saved) return;
    setInput(saved);
    // Arriving from the Kundli page with details already entered: show the answer straight away.
    const wantsResult = new URLSearchParams(window.location.search).get("go") === "1";
    if (wantsResult && Object.keys(validateBirth(saved, "en")).length === 0) {
      setResult({ kundli: computeKundli(toBirthDetails(saved)), now: new Date() });
    }
  }, []);

  useEffect(() => {
    if (result && scrollOnResult.current) {
      scrollOnResult.current = false;
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      resultRef.current?.focus({ preventScroll: true });
    }
  }, [result]);

  // After the first attempt, each message goes away as soon as its field is put right.
  const errors: BirthErrors = attempted ? validateBirth(input, lang) : {};

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (Object.keys(validateBirth(input, lang)).length) {
      setResult(null);
      showFirstError(e.currentTarget as HTMLElement);
      return;
    }
    saveBirth("self", input);
    scrollOnResult.current = true;
    setResult({ kundli: computeKundli(toBirthDetails(input)), now: new Date() });
  };

  const cycles = useMemo(() => {
    if (!result) return [];
    const { kundli } = result;
    const ninety = new Date(kundli.instant.getTime() + 90 * 365.25 * 86400000);
    return sadeSatiCycles(kundli.grahas.Moon.rashi, kundli.instant, ninety);
  }, [result]);

  const k = result?.kundli;
  const now = result?.now;
  const status = k && now ? sadeSatiStatus(k.grahas.Moon.rashi, now) : null;
  const softeners = k && k.manglik.fromLagna ? manglikSofteners(k, lang) : [];
  const monthYear = (d: Date | null) => (d && k ? formatMonthYear(lang, dateOf(d, k.birth.place.tz)) : "—");

  return (
    <>
      <ToolHero eyebrow={T.eyebrow[lang]} title={T.title[lang]} intro={T.intro[lang]} />

      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8 lg:py-12 space-y-8 lg:space-y-10">
        <FormWithAside title={T.asideTitle[lang]} items={ASIDE.map((a) => ({ title: a.title[lang], text: a.text[lang] }))}>
          <form onSubmit={submit} noValidate>
            <Panel title={T.formTitle[lang]}>
              <BirthFields idPrefix="dosha" value={input} onChange={setInput} errors={errors} lang={lang} />
              <button type="submit" className="btn btn-maroon w-full sm:w-auto sm:min-w-[260px] !min-h-[54px] !text-[16px] mt-6">
                {T.submit[lang]}
              </button>
              <PrivacyNote lang={lang} className="mt-4" />
            </Panel>
          </form>
        </FormWithAside>

        {k && now && status && (
          <div ref={resultRef} tabIndex={-1} className="space-y-6 lg:space-y-8 outline-none scroll-mt-24 animate-rise">
            <div>
              <div className="eyebrow">{T.resultFor[lang]}</div>
              <h2 className="mt-2 font-serif text-[28px] lg:text-[36px]">{k.birth.name || RASHI[lang][k.grahas.Moon.rashi]}</h2>
              <p className="mt-1 text-[14.5px] text-[#5A4A3D]">
                {formatDate(lang, k.birth)} • {formatHourMinute(k.birth.hour, k.birth.minute)} • {placeLabel(k.birth.place)} • {RASHI[lang][k.lagna.rashi]} {lang === "en" ? "lagna" : lang === "hi" ? "लग्न" : "ಲಗ್ನ"} • {RASHI[lang][k.grahas.Moon.rashi]} {lang === "en" ? "rashi" : lang === "hi" ? "राशि" : "ರಾಶಿ"}
              </p>
            </div>

            <Panel>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-serif text-[24px] lg:text-[28px]">{T.manglik[lang]}</h2>
                {k.manglik.fromLagna ? <Chip tone={softeners.length ? "note" : "warn"}>{T.present[lang]}</Chip> : k.manglik.fromMoon ? <Chip tone="note">{T.mild[lang]}</Chip> : <Chip tone="good">{T.absent[lang]}</Chip>}
              </div>
              <p className="mt-4 text-[16px] leading-[1.65] text-[#1A0F0A] max-w-[780px]">{manglikVerdict(k, lang)}</p>
              {k.manglik.fromLagna && (
                <div className="mt-5 border-l-2 border-[#C9A86A] pl-4">
                  <h3 className="text-[14px] font-semibold text-[#1A0F0A]">{T.softeners[lang]}</h3>
                  {softeners.length ? (
                    <ul className="mt-1.5 space-y-1 text-[15px] leading-[1.6] text-[#3D2F26]">
                      {softeners.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1.5 text-[15px] leading-[1.6] text-[#3D2F26] max-w-[720px]">{T.noSofteners[lang]}</p>
                  )}
                </div>
              )}
              <p className="mt-5 text-[14px] leading-[1.65] text-[#5A4A3D] max-w-[780px]">{T.manglikNote[lang]}</p>
            </Panel>

            <Panel>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-serif text-[24px] lg:text-[28px]">{T.kaalSarp[lang]}</h2>
                {k.kaalSarp.present ? <Chip tone="note">{T.present[lang]}</Chip> : <Chip tone="good">{T.absent[lang]}</Chip>}
              </div>
              <p className="mt-4 text-[16px] leading-[1.65] text-[#1A0F0A] max-w-[780px]">{kaalSarpVerdict(k, lang)}</p>
              <p className="mt-4 text-[14px] leading-[1.65] text-[#5A4A3D] max-w-[780px]">{T.kaalSarpNote[lang]}</p>
            </Panel>

            <Panel>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-serif text-[24px] lg:text-[28px]">{T.sadeSati[lang]}</h2>
                {status.phase ? <Chip tone="note">{T.running[lang]}</Chip> : <Chip tone="good">{T.notRunning[lang]}</Chip>}
              </div>
              <p className="mt-4 text-[16px] leading-[1.65] text-[#1A0F0A] max-w-[780px]">{sadeSatiVerdict(k, now, lang)}</p>

              {cycles.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-[15px] font-semibold text-[#1A0F0A]">{T.cycles[lang]}</h3>
                  <ol className={`mt-3 grid gap-3 md:grid-cols-2 ${cycles.length === 4 ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}>
                    {cycles.map((c) => {
                      const state = c.end.getTime() < now.getTime() ? "past" : c.start.getTime() > now.getTime() ? "ahead" : "now";
                      return (
                        <li key={c.start.getTime()} className={`border p-4 ${state === "now" ? "border-[#C9A86A] bg-[#FBF1DC]" : "border-[#E8DDD0] bg-white"} ${state === "past" ? "opacity-70" : ""}`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-serif text-[20px] tabular">
                              {dateOf(c.start, k.birth.place.tz).year} – {dateOf(c.end, k.birth.place.tz).year}
                            </span>
                            <span className={`px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${state === "now" ? "bg-[#7C2D2D] text-white" : "bg-[#F1ECE4] text-[#5A4A3D]"}`}>{T[state][lang]}</span>
                          </div>
                          <dl className="mt-3 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-[13.5px] tabular">
                            <dt className="text-[#6B5D52]">{T.begins[lang]}</dt>
                            <dd className="text-right">{monthYear(c.start)}</dd>
                            <dt className="text-[#6B5D52]">{T.peak[lang]}</dt>
                            <dd className="text-right">{monthYear(c.peakStart)}</dd>
                            <dt className="text-[#6B5D52]">{T.last[lang]}</dt>
                            <dd className="text-right">{monthYear(c.settingStart)}</dd>
                            <dt className="text-[#6B5D52]">{T.ends[lang]}</dt>
                            <dd className="text-right">{monthYear(c.end)}</dd>
                          </dl>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
              <p className="mt-5 text-[14px] leading-[1.65] text-[#5A4A3D] max-w-[780px]">{T.sadeSatiNote[lang]}</p>
            </Panel>

            <ConsultCTA lang={lang} title={T.ctaTitle[lang]} body={T.ctaBody[lang]} message={whatsappMessage(k, now)} />
          </div>
        )}
      </div>
    </>
  );
}
