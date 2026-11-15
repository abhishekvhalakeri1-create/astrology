import type { Tri } from "@/lib/astro/names";

/** Interface text of the journal pages. The notes themselves are in lib/content.ts and are written in English. */
export const JOURNAL = {
  eyebrow: { en: "Journal • Written by Rajeshwari", hi: "लेख • राजेश्वरी द्वारा लिखित", kn: "ಲೇಖನಗಳು • ರಾಜೇಶ್ವರಿ ಬರೆದದ್ದು" },
  title: { en: "Astrology Journal", hi: "ज्योतिष लेख", kn: "ಜ್ಯೋತಿಷ್ಯ ಲೇಖನಗಳು" },
  intro: {
    en: "Written by me, in simple language, from fifteen years of consultations.",
    hi: "मेरे द्वारा सरल भाषा में लिखे गए, पंद्रह वर्षों के परामर्श के अनुभव से। लेख अंग्रेज़ी में हैं।",
    kn: "ನಾನೇ ಸರಳ ಭಾಷೆಯಲ್ಲಿ ಬರೆದದ್ದು, ಹದಿನೈದು ವರ್ಷಗಳ ಸಮಾಲೋಚನೆಯ ಅನುಭವದಿಂದ. ಲೇಖನಗಳು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿವೆ.",
  },
  read: { en: "Read the note", hi: "लेख पढ़ें", kn: "ಲೇಖನ ಓದಿ" },
  all: { en: "All notes", hi: "सभी लेख", kn: "ಎಲ್ಲಾ ಲೇಖನಗಳು" },
  more: { en: "More from the journal", hi: "और लेख", kn: "ಇನ್ನಷ್ಟು ಲೇಖನಗಳು" },
  toolEyebrow: { en: "Free tool on this site", hi: "इस साइट का निःशुल्क साधन", kn: "ಈ ತಾಣದ ಉಚಿತ ಸಾಧನ" },
  openTool: { en: "Open the tool", hi: "साधन खोलें", kn: "ಸಾಧನ ತೆರೆಯಿರಿ" },
  credentials: {
    en: "Jyotish Acharya (Kashi) • Jayanagar, Bangalore",
    hi: "ज्योतिष आचार्य (काशी) • जयनगर, बैंगलोर",
    kn: "ಜ್ಯೋತಿಷ ಆಚಾರ್ಯ (ಕಾಶಿ) • ಜಯನಗರ, ಬೆಂಗಳೂರು",
  },
  name: { en: "Rajeshwari", hi: "राजेश्वरी", kn: "ರಾಜೇಶ್ವರಿ" },
  disclaimer: {
    en: "Astrology is guidance. It does not replace medical, legal or financial advice.",
    hi: "ज्योतिष मार्गदर्शन है। यह चिकित्सा, क़ानूनी या आर्थिक सलाह का स्थान नहीं लेता।",
    kn: "ಜ್ಯೋತಿಷ್ಯ ಮಾರ್ಗದರ್ಶನ ಮಾತ್ರ. ಇದು ವೈದ್ಯಕೀಯ, ಕಾನೂನು ಅಥವಾ ಆರ್ಥಿಕ ಸಲಹೆಗೆ ಬದಲಿಯಲ್ಲ.",
  },
  ctaTitle: { en: "A question about your own chart?", hi: "अपनी कुंडली के बारे में कोई प्रश्न?", kn: "ನಿಮ್ಮ ಜಾತಕದ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಇದೆಯೇ?" },
  ctaBody: {
    en: "These notes speak in general. What holds for your chart is a personal reading. Send me your birth details and I will study the chart by hand before we speak.",
    hi: "ये लेख सामान्य बात कहते हैं। आपकी कुंडली पर क्या लागू होता है, यह व्यक्तिगत वाचन से पता चलता है। अपना जन्म विवरण भेजिए, बात करने से पहले मैं कुंडली हाथ से देखूँगी।",
    kn: "ಈ ಲೇಖನಗಳು ಸಾಮಾನ್ಯ ವಿಷಯ ಹೇಳುತ್ತವೆ. ನಿಮ್ಮ ಜಾತಕಕ್ಕೆ ಏನು ಅನ್ವಯಿಸುತ್ತದೆ ಎಂಬುದು ವೈಯಕ್ತಿಕ ವಾಚನದಿಂದ ತಿಳಿಯುತ್ತದೆ. ನಿಮ್ಮ ಜನ್ಮ ವಿವರ ಕಳುಹಿಸಿ, ಮಾತನಾಡುವ ಮೊದಲು ಜಾತಕವನ್ನು ಕೈಯಿಂದ ಪರಿಶೀಲಿಸುತ್ತೇನೆ.",
  },
} satisfies Record<string, Tri>;
