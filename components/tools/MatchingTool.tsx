"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, Info } from "lucide-react";
import { BirthFields, EMPTY_BIRTH, loadBirth, saveBirth, showFirstError, toBirthDetails, validateBirth, type BirthErrors, type BirthInput } from "@/components/astro/BirthForm";
import { ConsultCTA, Panel, PrivacyNote, ToolHero } from "@/components/astro/ui";
import { formatDate, formatHourMinute } from "@/lib/astro/format";
import { computeKundli, type Kundli } from "@/lib/astro/kundli";
import { ashtakoota, type DoshaException, type KootaKey, type KootaResult, type MatchBand, type MatchResult } from "@/lib/astro/matching";
import { GANA, GRAHA, NADI, NAKSHATRA, RASHI, TARA, VARNA, VASHYA, YONI, type Lang, type Tri } from "@/lib/astro/names";
import { placeLabel } from "@/lib/astro/places";
import { formatPoints, ordinal } from "@/lib/astro/words";
import { RASHI_LORD } from "@/lib/astro/zodiac";
import { SERVICES, formatRupees } from "@/lib/site";
import { useLang } from "@/lib/useLang";

const T = {
  eyebrow: { en: "Free tool • Ashtakoota Guna Milan", hi: "निःशुल्क साधन • अष्टकूट गुण मिलान", kn: "ಉಚಿತ ಸಾಧನ • ಅಷ್ಟಕೂಟ ಗುಣ ಮಿಲನ" },
  title: { en: "Kundli Matching", hi: "कुंडली मिलान", kn: "ಕುಂಡಲಿ ಹೊಂದಾಣಿಕೆ" },
  intro: {
    en: "Enter the birth details of the boy and the girl. You get the traditional score out of 36, each of the eight kootas explained, and the Nadi, Bhakoot, Gana and Mangal dosha checks.",
    hi: "वर और वधू का जन्म विवरण भरें। आपको 36 में से पारंपरिक अंक, आठों कूटों की व्याख्या और नाड़ी, भकूट, गण तथा मंगल दोष की जाँच मिलेगी।",
    kn: "ವರ ಮತ್ತು ವಧುವಿನ ಜನ್ಮ ವಿವರ ನಮೂದಿಸಿ. 36 ರಲ್ಲಿ ಸಾಂಪ್ರದಾಯಿಕ ಅಂಕ, ಎಂಟು ಕೂಟಗಳ ವಿವರಣೆ ಮತ್ತು ನಾಡಿ, ಭಕೂಟ, ಗಣ ಹಾಗೂ ಕುಜ ದೋಷಗಳ ಪರಿಶೀಲನೆ ಸಿಗುತ್ತದೆ.",
  },
  boy: { en: "Boy", hi: "वर", kn: "ವರ" },
  girl: { en: "Girl", hi: "वधू", kn: "ವಧು" },
  boyDetails: { en: "Boy’s birth details", hi: "वर का जन्म विवरण", kn: "ವರನ ಜನ್ಮ ವಿವರ" },
  girlDetails: { en: "Girl’s birth details", hi: "वधू का जन्म विवरण", kn: "ವಧುವಿನ ಜನ್ಮ ವಿವರ" },
  submit: { en: "Match the Kundlis", hi: "कुंडली मिलाएँ", kn: "ಕುಂಡಲಿ ಹೊಂದಿಸಿ" },
  fix: { en: "Some details are missing. Please check the fields marked above.", hi: "कुछ विवरण छूट गए हैं। ऊपर चिह्नित खाने देखें।", kn: "ಕೆಲವು ವಿವರಗಳು ಬಿಟ್ಟುಹೋಗಿವೆ. ಮೇಲೆ ಗುರುತಿಸಿದ ಜಾಗಗಳನ್ನು ನೋಡಿ." },
  result: { en: "Guna Milan result", hi: "गुण मिलान का परिणाम", kn: "ಗುಣ ಮಿಲನದ ಫಲಿತಾಂಶ" },
  outOf: { en: "out of 36", hi: "36 में से", kn: "36 ರಲ್ಲಿ" },
  threshold: { en: "18 is the traditional minimum", hi: "18 पारंपरिक न्यूनतम है", kn: "18 ಸಾಂಪ್ರದಾಯಿಕ ಕನಿಷ್ಠ" },
  rashi: { en: "Rashi", hi: "राशि", kn: "ರಾಶಿ" },
  nakshatra: { en: "Nakshatra", hi: "नक्षत्र", kn: "ನಕ್ಷತ್ರ" },
  pada: { en: "pada", hi: "चरण", kn: "ಪಾದ" },
  lagna: { en: "Lagna", hi: "लग्न", kn: "ಲಗ್ನ" },
  kootas: { en: "The eight kootas", hi: "आठ कूट", kn: "ಎಂಟು ಕೂಟಗಳು" },
  koota: { en: "Koota", hi: "कूट", kn: "ಕೂಟ" },
  points: { en: "Points", hi: "अंक", kn: "ಅಂಕ" },
  total: { en: "Total", hi: "कुल", kn: "ಒಟ್ಟು" },
  doshas: { en: "Dosha checks", hi: "दोष जाँच", kn: "ದೋಷ ಪರಿಶೀಲನೆ" },
  nadiDosha: { en: "Nadi dosha", hi: "नाड़ी दोष", kn: "ನಾಡಿ ದೋಷ" },
  bhakootDosha: { en: "Bhakoot dosha", hi: "भकूट दोष", kn: "ಭಕೂಟ ದೋಷ" },
  ganaDosha: { en: "Gana dosha", hi: "गण दोष", kn: "ಗಣ ದೋಷ" },
  mangalDosha: { en: "Mangal dosha (Manglik)", hi: "मंगल दोष (मांगलिक)", kn: "ಕುಜ ದೋಷ" },
  absent: { en: "Not present", hi: "नहीं है", kn: "ಇಲ್ಲ" },
  present: { en: "Present", hi: "है", kn: "ಇದೆ" },
  setAside: { en: "Present, set aside by tradition", hi: "है, पर परंपरा से निरस्त", kn: "ಇದೆ, ಆದರೆ ಸಂಪ್ರದಾಯದಂತೆ ಪರಿಹಾರ" },
  noNadi: { en: "The two nadis differ. Nadi scores the full 8.", hi: "दोनों की नाड़ी अलग है। नाड़ी कूट में पूरे 8 अंक।", kn: "ಇಬ್ಬರ ನಾಡಿ ಬೇರೆ ಬೇರೆ. ನಾಡಿ ಕೂಟಕ್ಕೆ ಪೂರ್ಣ 8 ಅಂಕ." },
  noBhakoot: { en: "The two rashis are well placed from each other. Bhakoot scores the full 7.", hi: "दोनों राशियाँ एक-दूसरे से शुभ स्थान पर हैं। भकूट में पूरे 7 अंक।", kn: "ಎರಡು ರಾಶಿಗಳು ಪರಸ್ಪರ ಶುಭ ಸ್ಥಾನದಲ್ಲಿವೆ. ಭಕೂಟಕ್ಕೆ ಪೂರ್ಣ 7 ಅಂಕ." },
  noGana: { en: "The two temperaments are compatible.", hi: "दोनों के स्वभाव अनुकूल हैं।", kn: "ಇಬ್ಬರ ಸ್ವಭಾವಗಳು ಹೊಂದುತ್ತವೆ." },
  exceptionLead: { en: "Tradition sets this dosha aside here, because", hi: "परंपरा में यहाँ यह दोष नहीं माना जाता, क्योंकि", kn: "ಸಂಪ್ರದಾಯದಲ್ಲಿ ಇಲ್ಲಿ ಈ ದೋಷವನ್ನು ಪರಿಗಣಿಸುವುದಿಲ್ಲ, ಏಕೆಂದರೆ" },
  noException: {
    en: "No traditional exception applies, so both full charts need a careful look before deciding.",
    hi: "कोई पारंपरिक अपवाद लागू नहीं होता, इसलिए निर्णय से पहले दोनों पूरी कुंडलियाँ ध्यान से देखनी चाहिए।",
    kn: "ಯಾವುದೇ ಸಾಂಪ್ರದಾಯಿಕ ವಿನಾಯಿತಿ ಅನ್ವಯಿಸುವುದಿಲ್ಲ, ಆದ್ದರಿಂದ ನಿರ್ಧಾರಕ್ಕೆ ಮೊದಲು ಇಬ್ಬರ ಪೂರ್ಣ ಜಾತಕಗಳನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ನೋಡಬೇಕು.",
  },
  notManglik: { en: "Not Manglik", hi: "मांगलिक नहीं", kn: "ಕುಜ ದೋಷ ಇಲ್ಲ" },
  manglikBoth: {
    en: "Both charts carry Mangal dosha from the lagna. By tradition the two balance each other.",
    hi: "दोनों कुंडलियों में लग्न से मंगल दोष है। परंपरा के अनुसार दोनों एक-दूसरे को संतुलित करते हैं।",
    kn: "ಇಬ್ಬರ ಜಾತಕದಲ್ಲೂ ಲಗ್ನದಿಂದ ಕುಜ ದೋಷ ಇದೆ. ಸಂಪ್ರದಾಯದಂತೆ ಇವು ಪರಸ್ಪರ ಸಮತೋಲನಗೊಳ್ಳುತ್ತವೆ.",
  },
  manglikOne: {
    en: "Only one chart carries Mangal dosha from the lagna. Mars sits in one of these six houses in half of all charts, and there are several classical cancellations — this is judged from the full chart, not from this line.",
    hi: "केवल एक कुंडली में लग्न से मंगल दोष है। आधी कुंडलियों में मंगल इन्हीं छह भावों में होता है, और इसके कई शास्त्रीय परिहार हैं — इसका निर्णय पूरी कुंडली से होता है, इस एक पंक्ति से नहीं।",
    kn: "ಒಬ್ಬರ ಜಾತಕದಲ್ಲಿ ಮಾತ್ರ ಲಗ್ನದಿಂದ ಕುಜ ದೋಷ ಇದೆ. ಅರ್ಧದಷ್ಟು ಜಾತಕಗಳಲ್ಲಿ ಕುಜ ಈ ಆರು ಭಾವಗಳಲ್ಲೇ ಇರುತ್ತಾನೆ, ಮತ್ತು ಇದಕ್ಕೆ ಹಲವು ಶಾಸ್ತ್ರೀಯ ಪರಿಹಾರಗಳಿವೆ — ಇದನ್ನು ಪೂರ್ಣ ಜಾತಕದಿಂದ ನಿರ್ಣಯಿಸಬೇಕು, ಈ ಒಂದು ಸಾಲಿನಿಂದಲ್ಲ.",
  },
  manglikNone: {
    en: "Neither chart carries Mangal dosha from the lagna.",
    hi: "किसी भी कुंडली में लग्न से मंगल दोष नहीं है।",
    kn: "ಯಾರ ಜಾತಕದಲ್ಲೂ ಲಗ್ನದಿಂದ ಕುಜ ದೋಷ ಇಲ್ಲ.",
  },
  timeNote: {
    en: "Use the birth times written on the birth certificate or family record. If a time is not known, choose 12:00 PM; the nakshatra can then be one place off, and the score changes with it.",
    hi: "जन्म समय वही लें जो जन्म प्रमाणपत्र या पारिवारिक अभिलेख में लिखा है। समय न पता हो तो 12:00 PM चुनें; तब नक्षत्र एक स्थान आगे-पीछे हो सकता है, और उसके साथ अंक भी बदलते हैं।",
    kn: "ಜನನ ಪ್ರಮಾಣಪತ್ರ ಅಥವಾ ಮನೆಯ ದಾಖಲೆಯಲ್ಲಿ ಇರುವ ಹುಟ್ಟಿದ ಸಮಯವನ್ನೇ ಬಳಸಿ. ಸಮಯ ಗೊತ್ತಿಲ್ಲದಿದ್ದರೆ 12:00 PM ಆಯ್ಕೆ ಮಾಡಿ; ಆಗ ನಕ್ಷತ್ರ ಒಂದು ಸ್ಥಾನ ಹಿಂದೆ ಮುಂದೆ ಆಗಬಹುದು, ಅದರೊಂದಿಗೆ ಅಂಕವೂ ಬದಲಾಗುತ್ತದೆ.",
  },
  caveatTitle: { en: "What this score does not tell you", hi: "यह अंक क्या नहीं बताता", kn: "ಈ ಅಂಕ ಏನನ್ನು ಹೇಳುವುದಿಲ್ಲ" },
  caveat: {
    en: "Guna Milan compares only the two Moons. It is a first filter. A marriage is judged from the whole of both charts: the 7th house and its lord, Shukra and Guru, the dashas that will run in the first years, and how the two families fit. A high score does not settle the question, and a score near 18 does not rule a match out.",
    hi: "गुण मिलान केवल दोनों के चंद्र की तुलना करता है। यह पहली छलनी है। विवाह का निर्णय दोनों पूरी कुंडलियों से होता है: सप्तम भाव और उसका स्वामी, शुक्र और गुरु, पहले वर्षों में चलने वाली दशाएँ, और दोनों परिवारों का मेल। अधिक अंक से निर्णय पूरा नहीं होता, और 18 के आसपास का अंक मेल को नकारता नहीं।",
    kn: "ಗುಣ ಮಿಲನ ಇಬ್ಬರ ಚಂದ್ರನನ್ನು ಮಾತ್ರ ಹೋಲಿಸುತ್ತದೆ. ಇದು ಮೊದಲ ಜರಡಿ ಅಷ್ಟೇ. ವಿವಾಹವನ್ನು ಇಬ್ಬರ ಪೂರ್ಣ ಜಾತಕಗಳಿಂದ ನಿರ್ಣಯಿಸಬೇಕು: ಸಪ್ತಮ ಭಾವ ಮತ್ತು ಅದರ ಅಧಿಪತಿ, ಶುಕ್ರ ಮತ್ತು ಗುರು, ಮೊದಲ ವರ್ಷಗಳಲ್ಲಿ ನಡೆಯುವ ದಶೆಗಳು, ಎರಡು ಕುಟುಂಬಗಳ ಹೊಂದಿಕೆ. ಹೆಚ್ಚು ಅಂಕ ಬಂದ ಮಾತ್ರಕ್ಕೆ ನಿರ್ಣಯ ಮುಗಿಯುವುದಿಲ್ಲ, 18ರ ಆಸುಪಾಸಿನ ಅಂಕ ಹೊಂದಾಣಿಕೆಯನ್ನು ತಳ್ಳಿಹಾಕುವುದಿಲ್ಲ.",
  },
  tables: {
    en: "Printed panchangas differ in a few cells of the Vashya, Yoni and Gana tables, so another website may show one or two points more or less. Positions use the Lahiri ayanamsa.",
    hi: "छपे पंचांगों में वश्य, योनि और गण तालिकाओं के कुछ खाने अलग होते हैं, इसलिए किसी और वेबसाइट पर एक-दो अंक कम या अधिक दिख सकते हैं। ग्रह स्थिति लाहिरी अयनांश से है।",
    kn: "ಮುದ್ರಿತ ಪಂಚಾಂಗಗಳಲ್ಲಿ ವಶ್ಯ, ಯೋನಿ ಮತ್ತು ಗಣ ಕೋಷ್ಟಕಗಳ ಕೆಲವು ಮನೆಗಳು ಭಿನ್ನವಾಗಿರುತ್ತವೆ; ಆದ್ದರಿಂದ ಬೇರೆ ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ಒಂದೆರಡು ಅಂಕ ಹೆಚ್ಚು-ಕಡಿಮೆ ಕಾಣಬಹುದು. ಗ್ರಹ ಸ್ಥಿತಿ ಲಾಹಿರಿ ಅಯನಾಂಶದಂತೆ.",
  },
  ctaTitle: { en: "Have both charts read together", hi: "दोनों कुंडलियाँ साथ में दिखवाएँ", kn: "ಇಬ್ಬರ ಜಾತಕಗಳನ್ನು ಒಟ್ಟಿಗೆ ತೋರಿಸಿ" },
  ctaBody: {
    en: "Send this result on WhatsApp. I study both charts by hand and tell you plainly whether the match is good, what to watch for, and when.",
    hi: "यह परिणाम WhatsApp पर भेजें। मैं दोनों कुंडलियाँ हाथ से देखकर साफ़ बताती हूँ कि मिलान अच्छा है या नहीं, किस बात का ध्यान रखना है, और कब।",
    kn: "ಈ ಫಲಿತಾಂಶವನ್ನು WhatsApp ನಲ್ಲಿ ಕಳುಹಿಸಿ. ಇಬ್ಬರ ಜಾತಕಗಳನ್ನು ಕೈಯಿಂದ ನೋಡಿ, ಹೊಂದಾಣಿಕೆ ಚೆನ್ನಾಗಿದೆಯೇ, ಯಾವುದರ ಬಗ್ಗೆ ಎಚ್ಚರ ಬೇಕು, ಯಾವಾಗ ಎಂದು ಸ್ಪಷ್ಟವಾಗಿ ಹೇಳುತ್ತೇನೆ.",
  },
  fullChart: { en: "See the full Kundli", hi: "पूरी कुंडली देखें", kn: "ಪೂರ್ಣ ಕುಂಡಲಿ ನೋಡಿ" },
  edit: { en: "Change the details", hi: "विवरण बदलें", kn: "ವಿವರ ಬದಲಿಸಿ" },
} satisfies Record<string, Tri>;

const BAND: Record<MatchBand, { label: Tri; text: Tri; colour: string }> = {
  low: {
    label: { en: "Below the traditional minimum", hi: "पारंपरिक न्यूनतम से कम", kn: "ಸಾಂಪ್ರದಾಯಿಕ ಕನಿಷ್ಠಕ್ಕಿಂತ ಕಡಿಮೆ" },
    text: {
      en: "On gunas alone this match falls short of 18. That is a reason to look closely at both charts, not a verdict by itself.",
      hi: "केवल गुणों के आधार पर यह मिलान 18 से कम है। यह दोनों कुंडलियों को ध्यान से देखने का कारण है, अपने आप में निर्णय नहीं।",
      kn: "ಗುಣಗಳ ಆಧಾರದಲ್ಲಿ ಮಾತ್ರ ನೋಡಿದರೆ ಈ ಹೊಂದಾಣಿಕೆ 18 ಕ್ಕಿಂತ ಕಡಿಮೆ. ಇದು ಇಬ್ಬರ ಜಾತಕಗಳನ್ನು ಹತ್ತಿರದಿಂದ ನೋಡಲು ಕಾರಣ, ಇದೇ ಅಂತಿಮ ತೀರ್ಪು ಅಲ್ಲ.",
    },
    colour: "#9B2C2C",
  },
  average: {
    label: { en: "Acceptable match", hi: "स्वीकार्य मिलान", kn: "ಸ್ವೀಕಾರಾರ್ಹ ಹೊಂದಾಣಿಕೆ" },
    text: {
      en: "The match meets the traditional minimum of 18. Most marriages that are arranged fall in this band.",
      hi: "मिलान पारंपरिक न्यूनतम 18 को पूरा करता है। अधिकांश तय विवाह इसी श्रेणी में आते हैं।",
      kn: "ಹೊಂದಾಣಿಕೆ ಸಾಂಪ್ರದಾಯಿಕ ಕನಿಷ್ಠ 18 ಅನ್ನು ತಲುಪಿದೆ. ಹೆಚ್ಚಿನ ನಿಶ್ಚಿತ ವಿವಾಹಗಳು ಈ ಶ್ರೇಣಿಯಲ್ಲೇ ಬರುತ್ತವೆ.",
    },
    colour: "#B45309",
  },
  good: {
    label: { en: "Good match", hi: "अच्छा मिलान", kn: "ಉತ್ತಮ ಹೊಂದಾಣಿಕೆ" },
    text: {
      en: "A comfortable score. The two Moons agree on most of the eight counts.",
      hi: "संतोषजनक अंक। आठ में से अधिकांश कूटों पर दोनों के चंद्र सहमत हैं।",
      kn: "ಸಮಾಧಾನಕರ ಅಂಕ. ಎಂಟರಲ್ಲಿ ಹೆಚ್ಚಿನ ಕೂಟಗಳಲ್ಲಿ ಇಬ್ಬರ ಚಂದ್ರರು ಹೊಂದುತ್ತಾರೆ.",
    },
    colour: "#2F7D4F",
  },
  excellent: {
    label: { en: "Excellent match", hi: "उत्तम मिलान", kn: "ಅತ್ಯುತ್ತಮ ಹೊಂದಾಣಿಕೆ" },
    text: {
      en: "A rare score. On the eight kootas the two charts agree almost completely.",
      hi: "दुर्लभ अंक। आठों कूटों पर दोनों कुंडलियाँ लगभग पूरी तरह सहमत हैं।",
      kn: "ಅಪರೂಪದ ಅಂಕ. ಎಂಟು ಕೂಟಗಳಲ್ಲೂ ಇಬ್ಬರ ಜಾತಕಗಳು ಬಹುತೇಕ ಸಂಪೂರ್ಣ ಹೊಂದುತ್ತವೆ.",
    },
    colour: "#1F6B43",
  },
};

const KOOTA: Record<KootaKey, { name: Tri; measures: Tri }> = {
  varna: { name: { en: "Varna", hi: "वर्ण", kn: "ವರ್ಣ" }, measures: { en: "Outlook and sense of duty", hi: "दृष्टिकोण और कर्तव्य-भाव", kn: "ದೃಷ್ಟಿಕೋನ ಮತ್ತು ಕರ್ತವ್ಯ ಭಾವ" } },
  vashya: { name: { en: "Vashya", hi: "वश्य", kn: "ವಶ್ಯ" }, measures: { en: "Mutual pull, give and take", hi: "आपसी आकर्षण और तालमेल", kn: "ಪರಸ್ಪರ ಆಕರ್ಷಣೆ ಮತ್ತು ಹೊಂದಿಕೆ" } },
  tara: { name: { en: "Tara", hi: "तारा", kn: "ತಾರಾ" }, measures: { en: "Well-being and fortune together", hi: "साथ में स्वास्थ्य और भाग्य", kn: "ಜೊತೆಯಾಗಿ ಆರೋಗ್ಯ ಮತ್ತು ಭಾಗ್ಯ" } },
  yoni: { name: { en: "Yoni", hi: "योनि", kn: "ಯೋನಿ" }, measures: { en: "Physical compatibility", hi: "शारीरिक अनुकूलता", kn: "ದೈಹಿಕ ಹೊಂದಾಣಿಕೆ" } },
  maitri: { name: { en: "Graha Maitri", hi: "ग्रह मैत्री", kn: "ಗ್ರಹ ಮೈತ್ರಿ" }, measures: { en: "Friendship of minds", hi: "मानसिक मित्रता", kn: "ಮನಸ್ಸುಗಳ ಸ್ನೇಹ" } },
  gana: { name: { en: "Gana", hi: "गण", kn: "ಗಣ" }, measures: { en: "Temperament", hi: "स्वभाव", kn: "ಸ್ವಭಾವ" } },
  bhakoot: { name: { en: "Bhakoot", hi: "भकूट", kn: "ಭಕೂಟ" }, measures: { en: "Family welfare and prosperity", hi: "परिवार का कल्याण और समृद्धि", kn: "ಕುಟುಂಬದ ಕ್ಷೇಮ ಮತ್ತು ಸಮೃದ್ಧಿ" } },
  nadi: { name: { en: "Nadi", hi: "नाड़ी", kn: "ನಾಡಿ" }, measures: { en: "Health and children", hi: "स्वास्थ्य और संतान", kn: "ಆರೋಗ್ಯ ಮತ್ತು ಸಂತಾನ" } },
};

const EXCEPTION: Record<DoshaException, Tri> = {
  "same-rashi-different-nakshatra": { en: "the two share a rashi but have different nakshatras", hi: "दोनों की राशि एक है पर नक्षत्र अलग", kn: "ಇಬ್ಬರ ರಾಶಿ ಒಂದೇ, ಆದರೆ ನಕ್ಷತ್ರ ಬೇರೆ" },
  "same-nakshatra-different-rashi": { en: "the two share a nakshatra that lies in different rashis", hi: "दोनों का नक्षत्र एक है पर राशि अलग", kn: "ಇಬ್ಬರ ನಕ್ಷತ್ರ ಒಂದೇ, ಆದರೆ ರಾಶಿ ಬೇರೆ" },
  "same-nakshatra-different-pada": { en: "the two share a nakshatra but were born in different padas", hi: "दोनों का नक्षत्र एक है पर चरण अलग", kn: "ಇಬ್ಬರ ನಕ್ಷತ್ರ ಒಂದೇ, ಆದರೆ ಪಾದ ಬೇರೆ" },
  "same-lord": { en: "both rashis are ruled by the same planet", hi: "दोनों राशियों का स्वामी एक ही ग्रह है", kn: "ಎರಡೂ ರಾಶಿಗಳ ಅಧಿಪತಿ ಒಂದೇ ಗ್ರಹ" },
  "friendly-lords": { en: "the lords of the two rashis are mutual friends", hi: "दोनों राशियों के स्वामी परस्पर मित्र हैं", kn: "ಎರಡು ರಾಶಿಗಳ ಅಧಿಪತಿಗಳು ಪರಸ್ಪರ ಮಿತ್ರರು" },
};

const PATTERN: Record<"2/12" | "5/9" | "6/8", Tri> = {
  "2/12": { en: "2/12 (Dwi-Dwadasha)", hi: "2/12 (द्वि-द्वादश)", kn: "2/12 (ದ್ವಿ-ದ್ವಾದಶ)" },
  "5/9": { en: "5/9 (Nava-Panchama)", hi: "5/9 (नव-पंचम)", kn: "5/9 (ನವ-ಪಂಚಮ)" },
  "6/8": { en: "6/8 (Shadashtaka)", hi: "6/8 (षडाष्टक)", kn: "6/8 (ಷಡಷ್ಟಕ)" },
};

/** What each side contributes to a koota, in words. */
function kootaValue(lang: Lang, k: KootaResult, side: "boy" | "girl"): string {
  const i = k[side];
  switch (k.key) {
    case "varna": return VARNA[lang][i];
    case "vashya": return VASHYA[lang][i];
    case "tara": return TARA[lang][i];
    case "yoni": return YONI[lang][i];
    case "maitri": return GRAHA[RASHI_LORD[i]][lang];
    case "gana": return GANA[lang][i];
    case "bhakoot": return RASHI[lang][i];
    default: return NADI[lang][i];
  }
}

interface Outcome {
  boy: Kundli;
  girl: Kundli;
  match: MatchResult;
}

function ScoreDial({ total, band, lang }: { total: number; band: MatchBand; lang: Lang }) {
  const length = Math.PI * 100;
  const filled = (Math.min(total, 36) / 36) * length;
  return (
    <svg viewBox="0 0 240 150" className="w-full max-w-[300px]" role="img" aria-label={`${formatPoints(total)} ${T.outOf[lang]}`}>
      <path d="M 20 128 A 100 100 0 0 1 220 128" fill="none" stroke="#EFE6D8" strokeWidth="14" strokeLinecap="round" />
      <path d="M 20 128 A 100 100 0 0 1 220 128" fill="none" stroke={BAND[band].colour} strokeWidth="14" strokeLinecap="round" strokeDasharray={`${filled} ${length}`} style={{ transition: "stroke-dasharray 0.9s ease-out" }} />
      {/* 18 of 36 sits at the top of the arc */}
      <line x1="120" y1="14" x2="120" y2="42" stroke="#1A0F0A" strokeWidth="1.5" />
      <text x="120" y="9" textAnchor="middle" fontSize="10" fill="#6B5D52" className="tabular">
        18
      </text>
      <text x="120" y="112" textAnchor="middle" fontSize="60" fontWeight={600} fill="#1A0F0A" className="font-serif tabular">
        {formatPoints(total)}
      </text>
      <text x="120" y="136" textAnchor="middle" fontSize="13" fill="#6B5D52">
        {T.outOf[lang]}
      </text>
    </svg>
  );
}

function PersonCard({ role, kundli, lang }: { role: string; kundli: Kundli; lang: Lang }) {
  const moon = kundli.grahas.Moon;
  const b = kundli.birth;
  return (
    <div className="border border-[#E8DDD0] bg-[#FFFDF7] p-4 sm:p-5">
      <div className="eyebrow">{role}</div>
      <div className="mt-1.5 font-serif text-[22px] leading-tight">{b.name || role}</div>
      <div className="mt-1 text-[13px] leading-[1.5] text-[#6B5D52]">
        {formatDate(lang, b)} • {formatHourMinute(b.hour, b.minute)} • {placeLabel(b.place)}
      </div>
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[14.5px]">
        <dt className="text-[#6B5D52]">{T.rashi[lang]}</dt>
        <dd className="font-semibold">{RASHI[lang][moon.rashi]}</dd>
        <dt className="text-[#6B5D52]">{T.nakshatra[lang]}</dt>
        <dd className="font-semibold">
          {`${NAKSHATRA[lang][moon.nakshatra]}, ${T.pada[lang]}\u00A0${moon.pada}`}
        </dd>
        <dt className="text-[#6B5D52]">{T.lagna[lang]}</dt>
        <dd className="font-semibold">{RASHI[lang][kundli.lagna.rashi]}</dd>
      </dl>
    </div>
  );
}

type DoshaState = "absent" | "aside" | "present";

function DoshaRow({ title, state, children, lang }: { title: string; state: DoshaState; children: React.ReactNode; lang: Lang }) {
  const tone = state === "absent" ? { icon: <Check className="w-4 h-4" aria-hidden />, chip: "bg-[#E8F3EC] text-[#1F6B43]", label: T.absent[lang] } : state === "aside" ? { icon: <Info className="w-4 h-4" aria-hidden />, chip: "bg-[#FBF1DC] text-[#8A5A0B]", label: T.setAside[lang] } : { icon: <AlertTriangle className="w-4 h-4" aria-hidden />, chip: "bg-[#FBEAEA] text-[#9B2C2C]", label: T.present[lang] };
  return (
    <div className="py-5 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h3 className="font-serif text-[20px]">{title}</h3>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[12.5px] font-semibold ${tone.chip}`}>
          {tone.icon}
          {tone.label}
        </span>
      </div>
      <div className="mt-2 text-[14.5px] leading-[1.65] text-[#3D2F26] max-w-[760px]">{children}</div>
    </div>
  );
}

function manglikLine(lang: Lang, k: Kundli): string {
  const m = k.manglik;
  if (!m.fromLagna && !m.fromMoon) return T.notManglik[lang];
  const graha = GRAHA.Mars[lang];
  if (m.fromLagna) {
    if (lang === "hi") return `${graha} लग्न से ${ordinal(lang, m.houseFromLagna)} भाव में — मांगलिक`;
    if (lang === "kn") return `${graha} ಲಗ್ನದಿಂದ ${ordinal(lang, m.houseFromLagna)} ಭಾವದಲ್ಲಿ — ಕುಜ ದೋಷ ಇದೆ`;
    return `${graha} in the ${ordinal(lang, m.houseFromLagna)} house from the lagna — Manglik`;
  }
  if (lang === "hi") return `${graha} केवल चंद्र से ${ordinal(lang, m.houseFromMoon)} भाव में — हल्का (चंद्र मांगलिक)`;
  if (lang === "kn") return `${graha} ಚಂದ್ರನಿಂದ ಮಾತ್ರ ${ordinal(lang, m.houseFromMoon)} ಭಾವದಲ್ಲಿ — ಸೌಮ್ಯ (ಚಂದ್ರ ಕುಜ ದೋಷ)`;
  return `${graha} in the ${ordinal(lang, m.houseFromMoon)} house from the Moon only — mild (Chandra Manglik)`;
}

function whatsappMessage(o: Outcome): string {
  const line = (role: string, k: Kundli) => {
    const b = k.birth;
    const moon = k.grahas.Moon;
    return `${role}: ${b.name || "-"}, ${formatDate("en", b)}, ${formatHourMinute(b.hour, b.minute)}, ${placeLabel(b.place)} (${RASHI.en[moon.rashi]} rashi, ${NAKSHATRA.en[moon.nakshatra]} pada ${moon.pada})`;
  };
  return [
    "Namaste Rajeshwari madam, I checked a Kundli match on your website.",
    line("Boy", o.boy),
    line("Girl", o.girl),
    `Guna score: ${formatPoints(o.match.total)} / 36`,
    "I would like a full matching consultation.",
  ].join("\n");
}

export function MatchingTool() {
  const lang = useLang();
  const [boy, setBoy] = useState<BirthInput>(EMPTY_BIRTH);
  const [girl, setGirl] = useState<BirthInput>(EMPTY_BIRTH);
  const [attempted, setAttempted] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const savedBoy = loadBirth("match-boy");
    const savedGirl = loadBirth("match-girl");
    if (savedBoy) setBoy(savedBoy);
    if (savedGirl) setGirl(savedGirl);
  }, []);

  useEffect(() => {
    if (outcome) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      resultRef.current?.focus({ preventScroll: true });
    }
  }, [outcome]);

  // After the first attempt, each message goes away as soon as its field is put right.
  const boyErrors: BirthErrors = attempted ? validateBirth(boy, lang) : {};
  const girlErrors: BirthErrors = attempted ? validateBirth(girl, lang) : {};

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (Object.keys(validateBirth(boy, lang)).length || Object.keys(validateBirth(girl, lang)).length) {
      setOutcome(null);
      showFirstError(e.currentTarget as HTMLElement);
      return;
    }
    saveBirth("match-boy", boy);
    saveBirth("match-girl", girl);
    const boyKundli = computeKundli(toBirthDetails(boy));
    const girlKundli = computeKundli(toBirthDetails(girl));
    setOutcome({ boy: boyKundli, girl: girlKundli, match: ashtakoota(boyKundli.grahas.Moon, girlKundli.grahas.Moon) });
  };

  const hasErrors = Object.keys(boyErrors).length > 0 || Object.keys(girlErrors).length > 0;
  const match = outcome?.match;
  const price = SERVICES.find((s) => s.id === "matching");

  return (
    <>
      <ToolHero eyebrow={T.eyebrow[lang]} title={T.title[lang]} intro={T.intro[lang]} />

      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8 lg:py-12 space-y-8 lg:space-y-10">
        <form ref={formRef} onSubmit={submit} noValidate className="space-y-6">
          <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
            <Panel title={T.boyDetails[lang]}>
              <BirthFields idPrefix="boy" value={boy} onChange={setBoy} errors={boyErrors} lang={lang} showTimeHint={false} />
            </Panel>
            <Panel title={T.girlDetails[lang]}>
              <BirthFields idPrefix="girl" value={girl} onChange={setGirl} errors={girlErrors} lang={lang} showTimeHint={false} />
            </Panel>
          </div>
          <p className="max-w-[820px] text-[13.5px] leading-[1.6] text-[#5A4A3D]">{T.timeNote[lang]}</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <button type="submit" className="btn btn-maroon sm:min-w-[260px] !min-h-[54px] !text-[16px]">
              {T.submit[lang]}
            </button>
            <PrivacyNote lang={lang} className="max-w-[520px]" />
          </div>
          {hasErrors && (
            <p role="alert" className="text-[14px] font-medium text-[#B3261E]">
              {T.fix[lang]}
            </p>
          )}
        </form>

        {outcome && match && (
          <div ref={resultRef} tabIndex={-1} className="space-y-6 lg:space-y-8 outline-none scroll-mt-24 animate-rise">
            <section className="frame bg-white p-5 sm:p-8 lg:p-10">
              <div className="eyebrow">{T.result[lang]}</div>
              <div className="mt-4 grid gap-6 lg:grid-cols-[320px_1fr] lg:items-center lg:gap-10">
                <div className="flex justify-center">
                  <ScoreDial total={match.total} band={match.band} lang={lang} />
                </div>
                <div>
                  <h2 className="font-serif text-[30px] lg:text-[40px]" style={{ color: BAND[match.band].colour }}>
                    {BAND[match.band].label[lang]}
                  </h2>
                  <p className="mt-3 text-[16px] leading-[1.65] text-[#3D2F26] max-w-[560px]">{BAND[match.band].text[lang]}</p>
                  <p className="mt-2 text-[13px] text-[#6B5D52]">{T.threshold[lang]}</p>
                </div>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <PersonCard role={T.boy[lang]} kundli={outcome.boy} lang={lang} />
                <PersonCard role={T.girl[lang]} kundli={outcome.girl} lang={lang} />
              </div>
            </section>

            <Panel title={T.kootas[lang]}>
              <div className="hidden sm:grid grid-cols-[1.5fr_1fr_1fr_150px] gap-4 pb-2 border-b border-[#D4C4B0] text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#8A6A2F]">
                <div>{T.koota[lang]}</div>
                <div>{T.boy[lang]}</div>
                <div>{T.girl[lang]}</div>
                <div className="text-right">{T.points[lang]}</div>
              </div>
              <ul>
                {match.kootas.map((k) => {
                  const ratio = k.points / k.max;
                  const colour = ratio >= 0.75 ? "#2F7D4F" : ratio >= 0.4 ? "#B45309" : "#9B2C2C";
                  return (
                    <li key={k.key} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1.5fr_1fr_1fr_150px] gap-x-4 gap-y-1 py-3.5 border-b border-[#EFE6D8] items-center">
                      <div>
                        <div className="text-[16px] font-semibold text-[#1A0F0A]">{KOOTA[k.key].name[lang]}</div>
                        <div className="text-[13px] text-[#6B5D52]">{KOOTA[k.key].measures[lang]}</div>
                      </div>
                      <div className="sm:hidden row-span-2 text-right self-start">
                        <span className="font-serif text-[24px] tabular" style={{ color: colour }}>
                          {formatPoints(k.points)}
                        </span>
                        <span className="text-[13px] text-[#6B5D52] tabular"> / {k.max}</span>
                      </div>
                      <div className="text-[14px] text-[#3D2F26] sm:text-[15px]">
                        <span className="sm:hidden text-[#6B5D52]">{T.boy[lang]}: </span>
                        {kootaValue(lang, k, "boy")}
                        <span className="sm:hidden text-[#6B5D52]"> • {T.girl[lang]}: </span>
                        <span className="sm:hidden">{kootaValue(lang, k, "girl")}</span>
                      </div>
                      <div className="hidden sm:block text-[15px] text-[#3D2F26]">{kootaValue(lang, k, "girl")}</div>
                      <div className="hidden sm:flex items-center justify-end gap-3">
                        <div className="h-1.5 w-[70px] bg-[#EFE6D8]" aria-hidden>
                          <div className="h-full" style={{ width: `${ratio * 100}%`, background: colour }} />
                        </div>
                        <div className="w-[58px] text-right tabular">
                          <span className="font-serif text-[22px]" style={{ color: colour }}>
                            {formatPoints(k.points)}
                          </span>
                          <span className="text-[13px] text-[#6B5D52]"> / {k.max}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="flex items-baseline justify-between pt-4">
                <div className="text-[16px] font-semibold">{T.total[lang]}</div>
                <div className="tabular">
                  <span className="font-serif text-[30px]">{formatPoints(match.total)}</span>
                  <span className="text-[14px] text-[#6B5D52]"> / 36</span>
                </div>
              </div>
              <p className="mt-4 text-[12.5px] leading-[1.6] text-[#6B5D52] max-w-[760px]">{T.tables[lang]}</p>
            </Panel>

            <Panel title={T.doshas[lang]}>
              <div className="divide-y divide-[#EFE6D8]">
                <DoshaRow title={T.nadiDosha[lang]} state={!match.nadiDosha.present ? "absent" : match.nadiDosha.exception ? "aside" : "present"} lang={lang}>
                  {!match.nadiDosha.present ? (
                    T.noNadi[lang]
                  ) : (
                    <>
                      {lang === "hi" ? `दोनों की नाड़ी ${NADI.hi[match.kootas[7].boy]} है, इसलिए नाड़ी कूट में 8 में से 0 अंक। ` : lang === "kn" ? `ಇಬ್ಬರದೂ ${NADI.kn[match.kootas[7].boy]} ನಾಡಿ, ಆದ್ದರಿಂದ ನಾಡಿ ಕೂಟಕ್ಕೆ 8 ರಲ್ಲಿ 0 ಅಂಕ. ` : `Both Moons are in ${NADI.en[match.kootas[7].boy]} nadi, so Nadi scores 0 of 8. `}
                      {match.nadiDosha.exception ? `${T.exceptionLead[lang]} ${EXCEPTION[match.nadiDosha.exception][lang]}${lang === "hi" ? "।" : "."}` : T.noException[lang]}
                    </>
                  )}
                </DoshaRow>

                <DoshaRow title={T.bhakootDosha[lang]} state={!match.bhakootDosha.present ? "absent" : match.bhakootDosha.exception ? "aside" : "present"} lang={lang}>
                  {!match.bhakootDosha.present || !match.bhakootPattern ? (
                    T.noBhakoot[lang]
                  ) : (
                    <>
                      {lang === "hi" ? `दोनों राशियाँ एक-दूसरे से ${PATTERN[match.bhakootPattern].hi} हैं, इसलिए भकूट में 7 में से 0 अंक। ` : lang === "kn" ? `ಎರಡು ರಾಶಿಗಳು ಪರಸ್ಪರ ${PATTERN[match.bhakootPattern].kn} ಸ್ಥಾನದಲ್ಲಿವೆ, ಆದ್ದರಿಂದ ಭಕೂಟಕ್ಕೆ 7 ರಲ್ಲಿ 0 ಅಂಕ. ` : `The two rashis stand ${PATTERN[match.bhakootPattern].en} from each other, so Bhakoot scores 0 of 7. `}
                      {match.bhakootDosha.exception ? `${T.exceptionLead[lang]} ${EXCEPTION[match.bhakootDosha.exception][lang]}${lang === "hi" ? "।" : "."}` : T.noException[lang]}
                    </>
                  )}
                </DoshaRow>

                <DoshaRow title={T.ganaDosha[lang]} state={!match.ganaDosha.present ? "absent" : match.ganaDosha.exception ? "aside" : "present"} lang={lang}>
                  {!match.ganaDosha.present ? (
                    T.noGana[lang]
                  ) : (
                    <>
                      {lang === "hi"
                        ? `वर का ${GANA.hi[match.kootas[5].boy]} गण और वधू का ${GANA.hi[match.kootas[5].girl]} गण — 6 में से ${formatPoints(match.kootas[5].points)} अंक। `
                        : lang === "kn"
                          ? `ವರನ ${GANA.kn[match.kootas[5].boy]} ಗಣ ಮತ್ತು ವಧುವಿನ ${GANA.kn[match.kootas[5].girl]} ಗಣ — 6 ರಲ್ಲಿ ${formatPoints(match.kootas[5].points)} ಅಂಕ. `
                          : `${GANA.en[match.kootas[5].boy]} gana for the boy and ${GANA.en[match.kootas[5].girl]} for the girl scores ${formatPoints(match.kootas[5].points)} of 6. `}
                      {match.ganaDosha.exception ? `${T.exceptionLead[lang]} ${EXCEPTION[match.ganaDosha.exception][lang]}${lang === "hi" ? "।" : "."}` : T.noException[lang]}
                    </>
                  )}
                </DoshaRow>

                <DoshaRow
                  title={T.mangalDosha[lang]}
                  state={outcome.boy.manglik.fromLagna === outcome.girl.manglik.fromLagna ? (outcome.boy.manglik.fromLagna ? "aside" : "absent") : "present"}
                  lang={lang}
                >
                  <ul className="space-y-1">
                    <li>
                      <span className="font-semibold">{T.boy[lang]}:</span> {manglikLine(lang, outcome.boy)}
                    </li>
                    <li>
                      <span className="font-semibold">{T.girl[lang]}:</span> {manglikLine(lang, outcome.girl)}
                    </li>
                  </ul>
                  <p className="mt-2">{outcome.boy.manglik.fromLagna && outcome.girl.manglik.fromLagna ? T.manglikBoth[lang] : outcome.boy.manglik.fromLagna || outcome.girl.manglik.fromLagna ? T.manglikOne[lang] : T.manglikNone[lang]}</p>
                </DoshaRow>
              </div>
            </Panel>

            <section className="bg-[#FBF5EA] border border-[#E8DDD0] p-5 sm:p-6 lg:p-8">
              <h2 className="font-serif text-[24px] lg:text-[28px]">{T.caveatTitle[lang]}</h2>
              <p className="mt-3 text-[15.5px] leading-[1.7] text-[#3D2F26] max-w-[820px]">{T.caveat[lang]}</p>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-[14px] font-semibold no-print">
                <Link href="/birth-chart" className="text-[#7C2D2D] underline underline-offset-4 decoration-[#C9A86A] hover:decoration-[#7C2D2D]">
                  {T.fullChart[lang]}
                </Link>
                <button type="button" onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })} className="text-[#7C2D2D] underline underline-offset-4 decoration-[#C9A86A] hover:decoration-[#7C2D2D]">
                  {T.edit[lang]}
                </button>
              </div>
            </section>

            <ConsultCTA lang={lang} title={T.ctaTitle[lang]} body={T.ctaBody[lang]} message={whatsappMessage(outcome)} price={price ? `${formatRupees(price.price)} • ${price.minutes} min` : undefined} />
          </div>
        )}
      </div>
    </>
  );
}
