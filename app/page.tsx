"use client";
import { reviews } from "@/lib/seedData";
import { Star, Phone, MessageCircle, Instagram, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";

export default function HomePage() {
  const store = useAppStore();
  const language = store?.language || "en";
  const phone = "7892758565";
  const phoneWithCountry = `+91${phone}`;
  const whatsappNumber = `91${phone}`;
  const instagramUrl = "https://www.instagram.com/shivohamastro66";
  const [activeRashi, setActiveRashi] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(()=>setMounted(true), []);

  const whatsappMsg = (custom?: string) => encodeURIComponent(custom || "Namaste Rajeshwari madam, I want to book consultation for Kundli reading.");

  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const t = {
    en: {
      vedic: "Vedic Astrology",
      bangalore: "Bangalore • Since 2009",
      headline1: "Read the patterns",
      headline2: "written in",
      headline3: "your stars.",
      intro1: "Fifteen years studying charts by hand in Jayanagar. No computer predictions. Direct consultation with me, not a call center.",
      intro2: "Marriage compatibility, career guidance, Kundli reading. In Kannada, Hindi, English, Telugu. Pay after consultation.",
      book: "Book Consultation",
      explore: "Explore Astrology",
      years: "Years",
      charts: "Charts Studied",
      reviewsLabel: "847 Reviews",
      available: "Available Today",
      direct: "9AM-9PM • Direct",
      approach: "Approach",
      ancient1: "Ancient wisdom.",
      ancient2: "Personal insight.",
      approachP1: "I do not use software to generate predictions. Every chart I study by hand, make notes, and explain in the language you understand. No computer printed pages.",
      approachP2: "Most apps charge fifty rupees per minute and pay astrologers ten rupees. I work directly. You call my personal number. You save money, I get full fees. Simple and honest.",
      approachP3: "No expensive poojas. No gemstone shop. No fear creation. If compatibility is not good, I tell clearly. If Shani is causing delay, I tell you to wait and give simple remedies at home.",
      featured: "Featured Astrologer",
      bangalore15: "Bangalore • 15 Years",
      specialitiesLabel: "Specialities",
      specialities: "Marriage Compatibility • Career Guidance • Kundli Reading • Relationship • Vastu • Numerology",
      langAvail: "Languages • Availability",
      langAvailValue: "Kannada • Hindi • English • Telugu",
      bio: "I started learning astrology after my family was misguided by an astrologer who charged fifteen thousand rupees for a pooja that was not needed. Five years in Kashi, living simply with my Guru. Now fifteen years in Jayanagar. I study every chart by hand.",
      services: "Services",
      directNoMid: "Direct • No Middleman",
      kundliTitle: "A chart drawn by hand, not by software",
      kundliDesc1: "North Indian style, with fine lines and restrained colors. Planetary positions, houses, rashis, nakshatras, dasha.",
      kundliDesc2: "I make notes by hand before consultation. Every chart is different. I explain what each planet means in simple language.",
      dailyRashi: "Daily Rashi",
      writtenDaily: "Written daily by me, based on Chandra transit • Not computer generated",
      reviewsHead: "Reviews • Real People",
      testimonial: "I was cheated by one astrologer who asked fifteen thousand for pooja. Then my friend gave Rajeshwari number 7892758565. She told me no need for any expensive pooja, just do simple things at home. My business started improving after two months.",
      journal: "Astrology Journal",
      writtenByMe: "Written by me, not AI • Simple language",
      bookCTA: "Book Consultation",
      bookCTATitle1: "Call or WhatsApp directly.",
      bookCTATitle2: "No middleman. Pay after.",
      bookCTADesc: "My number 7892758565 is personal. You talk to me directly. Available 9AM-9PM all days. Instagram shivohamastro66 for daily panchanga.",
      call: "Call",
      whatsapp: "WhatsApp",
    },
    hi: {
      vedic: "वैदिक ज्योतिष",
      bangalore: "बैंगलोर • 2009 से",
      headline1: "आपके सितारों में",
      headline2: "लिखे पैटर्न",
      headline3: "पढ़ें।",
      intro1: "जयनगर में पंद्रह साल से हाथ से कुंडली देख रही हूँ। कोई कंप्यूटर भविष्यवाणी नहीं। सीधे मुझसे बात, कॉल सेंटर नहीं।",
      intro2: "विवाह मिलान, करियर मार्गदर्शन, कुंडली वाचन। कन्नड़, हिंदी, अंग्रेजी, तेलुगु में। परामर्श के बाद भुगतान।",
      book: "परामर्श बुक करें",
      explore: "ज्योतिष देखें",
      years: "साल",
      charts: "कुंडली अध्ययन",
      reviewsLabel: "847 समीक्षा",
      available: "आज उपलब्ध",
      direct: "9AM-9PM • सीधे",
      approach: "दृष्टिकोण",
      ancient1: "प्राचीन ज्ञान।",
      ancient2: "व्यक्तिगत अंतर्दृष्टि।",
      approachP1: "मैं भविष्यवाणी के लिए सॉफ्टवेयर नहीं use करती। हर कुंडली हाथ से पढ़ती हूँ, नोट्स बनाती हूँ, आपकी भाषा में समझाती हूँ।",
      approachP2: "ज्यादातर ऐप 50 रुपये प्रति मिनट लेते हैं और ज्योतिषी को 10 रुपये देते हैं। मैं सीधे काम करती हूँ। आप मेरे निजी नंबर पर कॉल करते हैं।",
      approachP3: "कोई महंगी पूजा नहीं। कोई रत्न की दुकान नहीं। डर नहीं बनाती। अगर मिलान अच्छा नहीं है तो स्पष्ट बताती हूँ।",
      featured: "मुख्य ज्योतिषी",
      bangalore15: "बैंगलोर • 15 साल",
      specialitiesLabel: "विशेषज्ञता",
      specialities: "विवाह मिलान • करियर मार्गदर्शन • कुंडली वाचन • रिश्ते • वास्तु • अंक ज्योतिष",
      langAvail: "भाषाएँ • उपलब्धता",
      langAvailValue: "कन्नड़ • हिंदी • अंग्रेजी • तेलुगु",
      bio: "मेरे परिवार को एक ज्योतिषी ने गुमराह किया जिसने 15 हजार पूजा के लिए लिए। उसके बाद मैंने काशी में 5 साल गुरु के साथ सीखा। अब 15 साल जयनगर में। हर कुंडली हाथ से देखती हूँ।",
      services: "सेवाएं",
      directNoMid: "सीधे • कोई बिचौलिया नहीं",
      kundliTitle: "हाथ से बनाई कुंडली, सॉफ्टवेयर से नहीं",
      kundliDesc1: "उत्तर भारतीय शैली, बारीक लाइनों और संयमित रंगों के साथ। ग्रह स्थिति, भाव, राशि, नक्षत्र, दशा।",
      kundliDesc2: "परामर्श से पहले हाथ से नोट्स बनाती हूँ। हर कुंडली अलग है। सरल भाषा में समझाती हूँ।",
      dailyRashi: "दैनिक राशि",
      writtenDaily: "रोज मेरे द्वारा लिखा, चंद्र गोचर पर आधारित • कंप्यूटर नहीं",
      reviewsHead: "समीक्षाएं • असली लोग",
      testimonial: "एक ज्योतिषी ने 15 हजार पूजा के लिए लिए और धोखा दिया। फिर दोस्त ने राजेश्वरी नंबर दिया। उन्होंने कहा महंगी पूजा की जरूरत नहीं, घर पर सरल उपाय करो। दो महीने में बिजनेस सुधर गया।",
      journal: "ज्योतिष पत्रिका",
      writtenByMe: "मेरे द्वारा लिखा, AI नहीं • सरल भाषा",
      bookCTA: "परामर्श बुक करें",
      bookCTATitle1: "सीधे कॉल या व्हाट्सएप करें।",
      bookCTATitle2: "कोई बिचौलिया नहीं। बाद में भुगतान।",
      bookCTADesc: "मेरा नंबर 7892758565 निजी है। आप सीधे मुझसे बात करते हैं। रोज 9AM-9PM उपलब्ध। दैनिक पंचांग के लिए Instagram shivohamastro66।",
      call: "कॉल",
      whatsapp: "व्हाट्सएप",
    },
    kn: {
      vedic: "ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ",
      bangalore: "ಬೆಂಗಳೂರು • 2009 ರಿಂದ",
      headline1: "ನಿಮ್ಮ ನಕ್ಷತ್ರಗಳಲ್ಲಿ",
      headline2: "ಬರೆದ ಮಾದರಿಗಳನ್ನು",
      headline3: "ಓದಿ.",
      intro1: "ಜಯನಗರದಲ್ಲಿ ಹದಿನೈದು ವರ್ಷಗಳಿಂದ ಕೈಯಿಂದ ಜಾತಕ ನೋಡುತ್ತಿದ್ದೇನೆ. ಕಂಪ್ಯೂಟರ್ ಭವಿಷ್ಯವಿಲ್ಲ. ನೇರ ಸಮಾಲೋಚನೆ, ಕಾಲ್ ಸೆಂಟರ್ ಅಲ್ಲ.",
      intro2: "ವಿವಾಹ ಹೊಂದಾಣಿಕೆ, ವೃತ್ತಿ ಮಾರ್ಗದರ್ಶನ, ಕುಂಡಲಿ ವಾಚನ. ಕನ್ನಡ, ಹಿಂದಿ, ಇಂಗ್ಲಿಷ್, ತೆಲುಗು. ಸಮಾಲೋಚನೆ ನಂತರ ಪಾವತಿ.",
      book: "ಸಮಾಲೋಚನೆ ಬುಕ್ ಮಾಡಿ",
      explore: "ಜ್ಯೋತಿಷ್ಯ ಅನ್ವೇಷಿಸಿ",
      years: "ವರ್ಷ",
      charts: "ಜಾತಕ ಅಧ್ಯಯನ",
      reviewsLabel: "847 ವಿಮರ್ಶೆ",
      available: "ಇಂದು ಲಭ್ಯ",
      direct: "9AM-9PM • ನೇರ",
      approach: "ದೃಷ್ಟಿಕೋನ",
      ancient1: "ಪ್ರಾಚೀನ ಜ್ಞಾನ.",
      ancient2: "ವೈಯಕ್ತಿಕ ಒಳನೋಟ.",
      approachP1: "ನಾನು ಭವಿಷ್ಯಕ್ಕಾಗಿ ಸಾಫ್ಟ್‌ವೇರ್ ಬಳಸುವುದಿಲ್ಲ. ಪ್ರತಿ ಜಾತಕವನ್ನು ಕೈಯಿಂದ ಅಧ್ಯಯನ ಮಾಡಿ, ಟಿಪ್ಪಣಿ ಮಾಡಿ, ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ವಿವರಿಸುತ್ತೇನೆ.",
      approachP2: "ಹೆಚ್ಚಿನ ಆ್ಯಪ್‌ಗಳು ನಿಮಿಷಕ್ಕೆ 50 ರೂಪಾಯಿ ತೆಗೆದುಕೊಂಡು ಜ್ಯೋತಿಷಿಗೆ 10 ರೂಪಾಯಿ ಕೊಡುತ್ತವೆ. ನಾನು ನೇರವಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತೇನೆ.",
      approachP3: "ದುಬಾರಿ ಪೂಜೆ ಇಲ್ಲ. ರತ್ನದ ಅಂಗಡಿ ಇಲ್ಲ. ಭಯ ಹುಟ್ಟಿಸುವುದಿಲ್ಲ. ಹೊಂದಾಣಿಕೆ ಚೆನ್ನಾಗಿಲ್ಲದಿದ್ದರೆ ಸ್ಪಷ್ಟವಾಗಿ ಹೇಳುತ್ತೇನೆ.",
      featured: "ಮುಖ್ಯ ಜ್ಯೋತಿಷಿ",
      bangalore15: "ಬೆಂಗಳೂರು • 15 ವರ್ಷ",
      specialitiesLabel: "ಪರಿಣತಿ",
      specialities: "ವಿವಾಹ ಹೊಂದಾಣಿಕೆ • ವೃತ್ತಿ ಮಾರ್ಗದರ್ಶನ • ಕುಂಡಲಿ ವಾಚನ • ಸಂಬಂಧ • ವಾಸ್ತು • ಸಂಖ್ಯಾಶಾಸ್ತ್ರ",
      langAvail: "ಭಾಷೆಗಳು • ಲಭ್ಯತೆ",
      langAvailValue: "ಕನ್ನಡ • ಹಿಂದಿ • ಇಂಗ್ಲಿಷ್ • ತೆಲುಗು",
      bio: "ನನ್ನ ಕುಟುಂಬವನ್ನು ಒಬ್ಬ ಜ್ಯೋತಿಷಿ ದಾರಿ ತಪ್ಪಿಸಿದರು, 15 ಸಾವಿರ ಪೂಜೆಗೆ ಕೇಳಿದರು. ನಂತರ 5 ವರ್ಷ ಕಾಶಿಯಲ್ಲಿ ಗುರುಗಳೊಂದಿಗೆ ಕಲಿತೆ. ಈಗ 15 ವರ್ಷ ಜಯನಗರದಲ್ಲಿ. ಪ್ರತಿ ಜಾತಕ ಕೈಯಿಂದ ನೋಡುತ್ತೇನೆ.",
      services: "ಸೇವೆಗಳು",
      directNoMid: "ನೇರ • ಮಧ್ಯವರ್ತಿ ಇಲ್ಲ",
      kundliTitle: "ಕೈಯಿಂದ ಬರೆದ ಜಾತಕ, ಸಾಫ್ಟ್‌ವೇರ್ ಅಲ್ಲ",
      kundliDesc1: "ಉತ್ತರ ಭಾರತೀಯ ಶೈಲಿ, ಸೂಕ್ಷ್ಮ ರೇಖೆಗಳು ಮತ್ತು ಸಂಯಮದ ಬಣ್ಣಗಳು. ಗ್ರಹ ಸ್ಥಾನ, ಭಾವ, ರಾಶಿ, ನಕ್ಷತ್ರ, ದಶಾ.",
      kundliDesc2: "ಸಮಾಲೋಚನೆ ಮೊದಲು ಕೈಯಿಂದ ಟಿಪ್ಪಣಿ ಮಾಡುತ್ತೇನೆ. ಪ್ರತಿ ಜಾತಕ ವಿಭಿನ್ನ. ಸರಳ ಭಾಷೆಯಲ್ಲಿ ವಿವರಿಸುತ್ತೇನೆ.",
      dailyRashi: "ದೈನಂದಿನ ರಾಶಿ",
      writtenDaily: "ದಿನವೂ ನನ್ನಿಂದ ಬರೆದ, ಚಂದ್ರ ಸಂಚಾರ ಆಧಾರಿತ • ಕಂಪ್ಯೂಟರ್ ಅಲ್ಲ",
      reviewsHead: "ವಿಮರ್ಶೆಗಳು • ನಿಜವಾದ ಜನರು",
      testimonial: "ಒಬ್ಬ ಜ್ಯೋತಿಷಿ 15 ಸಾವಿರ ಪೂಜೆಗೆ ತೆಗೆದುಕೊಂಡು ಮೋಸ ಮಾಡಿದರು. ನಂತರ ಸ್ನೇಹಿತರು ರಾಜೇಶ್ವರಿ ನಂಬರ್ ಕೊಟ್ಟರು. ದುಬಾರಿ ಪೂಜೆ ಬೇಡ, ಮನೆಯಲ್ಲಿ ಸರಳ ಪರಿಹಾರ ಮಾಡಿ ಎಂದರು. ಎರಡು ತಿಂಗಳಲ್ಲಿ ಬಿಸಿನೆಸ್ ಸುಧಾರಿಸಿತು.",
      journal: "ಜ್ಯೋತಿಷ್ಯ ಪತ್ರಿಕೆ",
      writtenByMe: "ನನ್ನಿಂದ ಬರೆದ, AI ಅಲ್ಲ • ಸರಳ ಭಾಷೆ",
      bookCTA: "ಸಮಾಲೋಚನೆ ಬುಕ್ ಮಾಡಿ",
      bookCTATitle1: "ನೇರವಾಗಿ ಕರೆ ಅಥವಾ ವಾಟ್ಸಾಪ್ ಮಾಡಿ.",
      bookCTATitle2: "ಮಧ್ಯವರ್ತಿ ಇಲ್ಲ. ನಂತರ ಪಾವತಿ.",
      bookCTADesc: "ನನ್ನ ನಂಬರ್ 7892758565 ವೈಯಕ್ತಿಕ. ನೀವು ನೇರವಾಗಿ ನನ್ನೊಂದಿಗೆ ಮಾತನಾಡುತ್ತೀರಿ. ಪ್ರತಿದಿನ 9AM-9PM ಲಭ್ಯ. ದೈನಂದಿನ ಪಂಚಾಂಗಕ್ಕೆ Instagram shivohamastro66.",
      call: "ಕರೆ",
      whatsapp: "ವಾಟ್ಸಾಪ್",
    }
  }[language as "en" | "hi" | "kn"] || {
    vedic: "Vedic Astrology",
    bangalore: "Bangalore • Since 2009",
    headline1: "Read the patterns",
    headline2: "written in",
    headline3: "your stars.",
    intro1: "Fifteen years studying charts by hand in Jayanagar. No computer predictions. Direct consultation with me, not a call center.",
    intro2: "Marriage compatibility, career guidance, Kundli reading. In Kannada, Hindi, English, Telugu. Pay after consultation.",
    book: "Book Consultation",
    explore: "Explore Astrology",
    years: "Years",
    charts: "Charts Studied",
    reviewsLabel: "847 Reviews",
    available: "Available Today",
    direct: "9AM-9PM • Direct",
    approach: "Approach",
    ancient1: "Ancient wisdom.",
    ancient2: "Personal insight.",
    approachP1: "I do not use software to generate predictions. Every chart I study by hand, make notes, and explain in the language you understand. No computer printed pages.",
    approachP2: "Most apps charge fifty rupees per minute and pay astrologers ten rupees. I work directly. You call my personal number. You save money, I get full fees. Simple and honest.",
    approachP3: "No expensive poojas. No gemstone shop. No fear creation. If compatibility is not good, I tell clearly. If Shani is causing delay, I tell you to wait and give simple remedies at home.",
    featured: "Featured Astrologer",
    bangalore15: "Bangalore • 15 Years",
    specialitiesLabel: "Specialities",
    specialities: "Marriage Compatibility • Career Guidance • Kundli Reading • Relationship • Vastu • Numerology",
    langAvail: "Languages • Availability",
    langAvailValue: "Kannada • Hindi • English • Telugu",
    bio: "I started learning astrology after my family was misguided by an astrologer who charged fifteen thousand rupees for a pooja that was not needed. Five years in Kashi, living simply with my Guru. Now fifteen years in Jayanagar. I study every chart by hand.",
    services: "Services",
    directNoMid: "Direct • No Middleman",
    kundliTitle: "A chart drawn by hand, not by software",
    kundliDesc1: "North Indian style, with fine lines and restrained colors. Planetary positions, houses, rashis, nakshatras, dasha.",
    kundliDesc2: "I make notes by hand before consultation. Every chart is different. I explain what each planet means in simple language.",
    dailyRashi: "Daily Rashi",
    writtenDaily: "Written daily by me, based on Chandra transit • Not computer generated",
    reviewsHead: "Reviews • Real People",
    testimonial: "I was cheated by one astrologer who asked fifteen thousand for pooja. Then my friend gave Rajeshwari number 7892758565. She told me no need for any expensive pooja, just do simple things at home. My business started improving after two months.",
    journal: "Astrology Journal",
    writtenByMe: "Written by me, not AI • Simple language",
    bookCTA: "Book Consultation",
    bookCTATitle1: "Call or WhatsApp directly.",
    bookCTATitle2: "No middleman. Pay after.",
    bookCTADesc: "My number 7892758565 is personal. You talk to me directly. Available 9AM-9PM all days. Instagram shivohamastro66 for daily panchanga.",
    call: "Call",
    whatsapp: "WhatsApp",
  };

  const rashis = [
    { name: "Mesha", en: "Aries", glyph: "♈", lord: "Mangal", element: "Agni", dates: "Mar 21 - Apr 19", reading: "This month, Mangal gives you courage to complete pending work. Avoid arguments with family. Shani teaches patience." },
    { name: "Vrishabha", en: "Taurus", glyph: "♉", lord: "Shukra", element: "Prithvi", dates: "Apr 20 - May 20", reading: "Shukra brings harmony in relationships. Good time to discuss marriage matters. Keep expenses in control." },
    { name: "Mithuna", en: "Gemini", glyph: "♊", lord: "Budha", element: "Vayu", dates: "May 21 - Jun 20", reading: "Budha supports learning and communication. Good for students and writers. Avoid overthinking." },
    { name: "Karka", en: "Cancer", glyph: "♋", lord: "Chandra", element: "Jal", dates: "Jun 21 - Jul 22", reading: "Chandra makes you emotional. Spend time with mother and family. Water-related remedies help." },
    { name: "Simha", en: "Leo", glyph: "♌", lord: "Surya", element: "Agni", dates: "Jul 23 - Aug 22", reading: "Surya gives leadership. Your work will be recognized. Respect father and elders." },
    { name: "Kanya", en: "Virgo", glyph: "♍", lord: "Budha", element: "Prithvi", dates: "Aug 23 - Sep 22", reading: "Budha makes you analytical. Good for accounts and detailed work. Health needs attention." },
  ];

  return (
    <div className="bg-[#FFFEFB] text-[#1A0F0A] overflow-x-hidden">
      {/* HERO */}
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-16 py-8 lg:py-20">
          <div className="order-2 lg:order-1">
            <div className="flex items-center gap-3">
              <span className="text-[10px] lg:text-[11px] tracking-[0.18em] uppercase font-medium text-[#8B7355]">{t.vedic}</span>
              <div className="h-px w-12 lg:w-16 bg-[#C9A86A]/30" />
              <span className="text-[10px] lg:text-[11px] tracking-[0.08em] text-[#8B7355]/60">{t.bangalore}</span>
            </div>

            <h1 className="mt-6 lg:mt-10 font-serif text-[36px] lg:text-[60px] leading-[0.92] tracking-[-0.04em] font-[600]">
              <span className="block">{t.headline1}</span>
              <span className="block">{t.headline2}</span>
              <span className="block font-[400] italic">{t.headline3}</span>
            </h1>

            <div className="mt-6 lg:mt-8 max-w-[420px] border-l-2 lg:border-l border-[#E8DDD0] pl-4 lg:pl-6">
              <p className="text-[14px] lg:text-[15px] leading-[1.65] text-[#3D2F26]">{t.intro1}</p>
              <p className="mt-3 text-[12px] lg:text-[13px] leading-[1.6] text-[#6B5D52]">{t.intro2}</p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a href={`tel:${phoneWithCountry}`} className="group inline-flex items-center justify-center gap-2 h-[48px] px-6 bg-[#1A0F0A] text-[#FFFEFB] text-[13px] tracking-[0.06em] uppercase font-medium hover:bg-black active:bg-black cursor-pointer">
                {t.book}
                <ArrowUpRight className="w-4 h-4 opacity-60 group-hover:opacity-100" />
              </a>
              <button type="button" onClick={()=>handleScroll("journal")} className="h-[48px] px-6 inline-flex items-center justify-center border border-[#E8DDD0] bg-white text-[13px] tracking-[0.06em] uppercase text-[#6B5D52] hover:text-[#1A0F0A] hover:border-[#1A0F0A] cursor-pointer">
                {t.explore}
              </button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 max-w-[320px] pt-6 border-t border-[#E8DDD0]">
              <div><div className="font-serif text-[20px] lg:text-[24px] leading-none">15+</div><div className="text-[9px] lg:text-[10px] tracking-[0.1em] uppercase text-[#8B7355] mt-1.5">{t.years}</div></div>
              <div><div className="font-serif text-[20px] lg:text-[24px] leading-none">5234</div><div className="text-[9px] lg:text-[10px] tracking-[0.1em] uppercase text-[#8B7355] mt-1.5">{t.charts}</div></div>
              <div><div className="font-serif text-[20px] lg:text-[24px] leading-none">4.9★</div><div className="text-[9px] lg:text-[10px] tracking-[0.1em] uppercase text-[#8B7355] mt-1.5">{t.reviewsLabel}</div></div>
            </div>
          </div>

          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="w-full max-w-[300px] sm:max-w-[340px] lg:max-w-[400px]">
              <div className="relative bg-[#FDF8F0] border border-[#E8DDD0] p-1.5">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#1A0F0A]">
                  <img src="/rajeshwari-real.jpg" alt="Rajeshwari - Vedic Astrologer" width={400} height={530} className="w-full h-full object-cover object-top" loading="eager" />
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-2.5 border border-[#C9A86A]/10" />
                    <div className="absolute top-4 left-4 w-5 h-5 border-l border-t border-[#C9A86A]/20" />
                    <div className="absolute top-4 right-4 w-5 h-5 border-r border-t border-[#C9A86A]/20" />
                    <div className="absolute bottom-4 left-4 w-5 h-5 border-l border-b border-[#C9A86A]/20" />
                    <div className="absolute bottom-4 right-4 w-5 h-5 border-r border-b border-[#C9A86A]/20" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1A0F0A]/85 via-[#1A0F0A]/30 to-transparent p-4 pt-12 pointer-events-none">
                    <div className="flex justify-between items-end">
                      <div><div className="font-serif text-[14px] text-[#FFFEFB]">Rajeshwari</div><div className="text-[10px] text-[#E8DDD0]/70 mt-0.5">Jyotish Acharya • Jayanagar</div></div>
                      <div className="text-right"><div className="text-[9px] tracking-[0.12em] uppercase text-[#C9A86A]">{t.available}</div><div className="text-[10px] text-[#E8DDD0]/80 mt-0.5">{t.direct}</div></div>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center text-[9px] tracking-[0.08em] text-[#8B7355]/50 font-serif px-1 pointer-events-none">
                  <span>☉ ☽ ♂ ☿ ♃ ♀ ♄</span><span>ॐ • Shubhamastu</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] text-[#8B7355] px-1">
                <a href={`tel:${phoneWithCountry}`} className="hover:text-[#1A0F0A] font-medium cursor-pointer">+91 {phone} • Direct</a>
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#1A0F0A] cursor-pointer">Instagram • shivohamastro66</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INTRODUCTION */}
      <div className="border-t border-[#E8DDD0] bg-white">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-12 lg:py-24">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-20">
            <div><div className="text-[10px] lg:text-[11px] tracking-[0.14em] uppercase font-medium text-[#8B7355]">{t.approach}</div><h2 className="mt-4 lg:mt-6 font-serif text-[26px] lg:text-[38px] leading-[1.1] tracking-[-0.02em]">{t.ancient1}<br />{t.ancient2}</h2><div className="mt-6 lg:mt-8 w-12 h-px bg-[#C9A86A]/40" /></div>
            <div className="space-y-4 lg:space-y-6 text-[14px] lg:text-[15px] leading-[1.7] text-[#3D2F26] max-w-[560px]"><p>{t.approachP1}</p><p>{t.approachP2}</p><p className="text-[13px] lg:text-[14px] text-[#6B5D52] leading-[1.7]">{t.approachP3}</p></div>
          </div>
        </div>
      </div>

      {/* FEATURED */}
      <div id="astrologer" className="max-w-[1280px] mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <div className="flex items-baseline gap-4 lg:gap-6 mb-8 lg:mb-12"><h2 className="font-serif text-[20px] lg:text-[22px] tracking-[-0.01em]">{t.featured}</h2><div className="h-px flex-1 bg-[#E8DDD0] hidden md:block" /><div className="text-[10px] lg:text-[11px] tracking-[0.08em] uppercase text-[#8B7355]">{t.bangalore15}</div></div>
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6 lg:gap-16 items-start border border-[#E8DDD0] p-4 lg:p-8 bg-white">
          <div className="relative aspect-[3/4] max-w-[360px] mx-auto lg:max-w-none bg-[#FDF8F0] border border-[#E8DDD0] overflow-hidden"><img src="/rajeshwari-real.jpg" alt="Rajeshwari" width={400} height={530} className="w-full h-full object-cover object-top" loading="lazy" /><div className="absolute inset-2 border border-[#C9A86A]/15 pointer-events-none" /></div>
          <div>
            <div className="flex items-start justify-between gap-4"><div><h3 className="font-serif text-[24px] lg:text-[28px] leading-[1.1] tracking-[-0.02em]">Rajeshwari</h3><div className="mt-2 text-[12px] lg:text-[13px] tracking-wide text-[#6B5D52]">Vedic Astrologer • Jyotish Acharya, Kashi • 15 Years Experience</div><div className="mt-3 flex items-center gap-2"><div className="flex gap-0.5">{Array.from({length:5}).map((_,i)=><Star key={i} className="w-3.5 h-3.5 lg:w-4 lg:h-4 fill-[#8B4513] text-[#8B4513]" />)}</div><span className="text-[13px] font-medium">4.9</span><span className="text-[11px] lg:text-[12px] text-[#8B7355]">• 847 reviews • 5234 consultations</span></div></div><div className="hidden md:block text-right"><div className="font-serif text-[18px] lg:text-[20px]">₹500</div><div className="text-[10px] tracking-wide uppercase text-[#8B7355]">onwards • 30 min</div></div></div>
            <div className="mt-6 lg:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 py-5 lg:py-6 border-y border-[#E8DDD0]"><div><div className="text-[9px] lg:text-[10px] tracking-[0.12em] uppercase text-[#8B7355]">{t.specialitiesLabel}</div><div className="mt-2 text-[12px] lg:text-[13px] leading-[1.6] text-[#2D1F16]">{t.specialities}</div></div><div><div className="text-[9px] lg:text-[10px] tracking-[0.12em] uppercase text-[#8B7355]">{t.langAvail}</div><div className="mt-2 text-[12px] lg:text-[13px] leading-[1.6] text-[#2D1F16]">{t.langAvailValue}<br />Available Today 9AM-9PM • Direct: {phone}<br /><a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-[#8B4513] hover:underline cursor-pointer">Instagram shivohamastro66</a></div></div></div>
            <div className="mt-5 lg:mt-6 text-[13px] lg:text-[14px] leading-[1.7] text-[#3D2F26]">{t.bio}</div>
            <div className="mt-6 lg:mt-8 flex gap-3">
              <a href={`tel:${phoneWithCountry}`} className="h-11 px-6 inline-flex items-center justify-center bg-[#1A0F0A] text-white text-[12px] tracking-[0.06em] uppercase font-medium hover:bg-black cursor-pointer">{t.book}</a>
              <a href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg()}`} target="_blank" rel="noopener noreferrer" className="h-11 px-6 inline-flex items-center justify-center border border-[#E8DDD0] bg-white text-[12px] tracking-[0.06em] uppercase font-medium hover:border-[#1A0F0A] cursor-pointer">{t.whatsapp}</a>
            </div>
          </div>
        </div>
      </div>

      {/* SERVICES */}
      <div id="services" className="border-t border-[#E8DDD0] bg-[#FDF8F0]">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-12 lg:py-20">
          <div className="flex items-baseline gap-4 lg:gap-6"><h2 className="font-serif text-[20px] lg:text-[22px] tracking-[-0.01em]">{t.services}</h2><div className="h-px flex-1 bg-[#E8DDD0] hidden md:block" /><div className="text-[10px] lg:text-[11px] tracking-[0.08em] uppercase text-[#8B7355]">{t.directNoMid}</div></div>
          <div className="mt-8 lg:mt-12 space-y-px bg-[#E8DDD0] border border-[#E8DDD0]">
            {[
              { num: "01", title: "Birth Chart", sanskrit: "Janma Kundli", desc: "Understand the planetary structure of your birth. Positions, houses, nakshatra, dasha. Explained in simple language, not Sanskrit shlokas.", price: "₹500" },
              { num: "02", title: "Kundli Matching", sanskrit: "Vivaha Milan", desc: "Explore compatibility through traditional Jyotish. Not only gun score. Mangal, Shani, 7th lord strength, family psychology.", price: "₹700" },
              { num: "03", title: "Career", sanskrit: "Karma Sthana", desc: "Read planetary influences around professional life. 10th house lord, current Dasha, transit. When to change job, which field suits.", price: "₹500" },
              { num: "04", title: "Relationships", sanskrit: "Saptama Bhava", desc: "Explore relationship patterns through your chart. Love, marriage, family harmony. Practical approach, not only astrology.", price: "₹500" },
              { num: "05", title: "Vastu", sanskrit: "Vastu Shastra", desc: "For flats in Bangalore. No demolition. Simple corrections - bed direction, colors, almirah placement. Practical for 2BHK.", price: "₹700" },
              { num: "06", title: "Yearly Guidance", sanskrit: "Varsha Phala", desc: "Full year ahead - career, marriage, health, family. Month-wise timeline with simple remedies at home.", price: "₹1000" },
            ].map(service=>(
              <div key={service.num} className="grid lg:grid-cols-[80px_1fr_120px] gap-4 lg:gap-6 bg-[#FFFEFB] p-5 lg:p-7 group hover:bg-white">
                <div className="font-serif text-[28px] lg:text-[32px] leading-none tracking-[-0.03em] text-[#E8DDD0] group-hover:text-[#C9A86A]">{service.num}</div>
                <div><div className="flex items-baseline gap-3"><div className="font-serif text-[16px] lg:text-[18px] tracking-[-0.01em]">{service.title}</div><div className="text-[10px] lg:text-[11px] tracking-[0.08em] uppercase text-[#8B7355]">{service.sanskrit}</div></div><div className="text-[12px] lg:text-[13px] leading-[1.6] text-[#6B5D52] mt-2 max-w-[480px]">{service.desc}</div></div>
                <div className="flex lg:justify-end items-start gap-3"><div className="text-right"><div className="font-serif text-[15px] lg:text-[16px]">{service.price}</div><div className="text-[9px] lg:text-[10px] tracking-wide uppercase text-[#8B7355] mt-1">30 min</div></div><a href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg(`I want ${service.title} consultation`)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-[#E8DDD0] flex items-center justify-center hover:border-[#1A0F0A] hover:bg-[#1A0F0A] hover:text-white cursor-pointer shrink-0"><ArrowUpRight className="w-4 h-4" /></a></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KUNDLI */}
      <div className="bg-[#1A0F0A] text-[#E8DDD0] py-12 lg:py-24">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-16">
            <div><div className="text-[10px] lg:text-[11px] tracking-[0.14em] uppercase text-[#C9A86A]">Kundli • Birth Chart</div><h2 className="mt-4 lg:mt-6 font-serif text-[24px] lg:text-[36px] leading-[1.1] tracking-[-0.02em] text-[#FFFEFB]">{t.kundliTitle}</h2><div className="mt-6 lg:mt-8 w-12 h-px bg-[#C9A86A]/30" /><div className="mt-6 lg:mt-8 space-y-4 text-[13px] lg:text-[14px] leading-[1.7] text-[#E8DDD0]/70 max-w-[400px]"><p>{t.kundliDesc1}</p><p>{t.kundliDesc2}</p></div><div className="mt-6 lg:mt-8 text-[10px] lg:text-[11px] tracking-wide text-[#C9A86A]/60">☉ Surya • ☽ Chandra • ♂ Mangal • ☿ Budha • ♃ Guru • ♀ Shukra • ♄ Shani • ☊ Rahu • ☋ Ketu</div><div className="mt-6"><a href="/birth-chart" className="inline-flex h-11 px-6 items-center justify-center border border-[#C9A86A]/30 text-[#C9A86A] text-[12px] tracking-[0.06em] uppercase font-medium hover:bg-[#C9A86A] hover:text-[#1A0F0A] cursor-pointer">View Kundli Tool</a></div></div>
            <div className="bg-[#FFFEFB] p-4 lg:p-8"><div className="flex justify-between items-center mb-4 lg:mb-6"><div className="text-[9px] lg:text-[10px] tracking-[0.12em] uppercase text-[#8B7355]">North Indian Chart • Example • Hand Drawn Style</div><div className="text-[9px] lg:text-[10px] text-[#8B7355] hidden sm:block">Rashi • Nakshatra • Dasha</div></div><div className="aspect-square max-w-[320px] lg:max-w-[360px] mx-auto bg-[#FDF8F0] border border-[#E8DDD0] p-3"><div className="w-full h-full grid grid-cols-4 grid-rows-4 gap-px bg-[#E8DDD0]">{Array.from({length:16}).map((_,i)=>{ const houses = [12,1,2,3,11,0,0,4,10,0,0,5,9,8,7,6]; const h = houses[i]; if (h===0) return <div key={i} className="bg-[#FDF8F0] flex items-center justify-center"><div className="w-px h-8 bg-[#E8DDD0]/50 rotate-45" /></div>; return (<div key={i} className="bg-[#FFFEFB] p-2"><div className="text-[9px] font-medium text-[#8B4513]">{h}</div><div className="text-[10px] text-[#1A0F0A] mt-1 font-serif">Su Mo</div><div className="text-[8px] text-[#8B7355] mt-1">Me Ve Ma</div></div>); })}</div></div><div className="mt-4 lg:mt-6 grid grid-cols-3 gap-2 lg:gap-3 text-[10px] lg:text-[11px]"><div className="p-2.5 lg:p-3 bg-[#F5F1EB] border border-[#E8DDD0]"><div className="text-[8px] lg:text-[9px] tracking-[0.08em] uppercase text-[#8B7355]">Surya • Sun</div><div className="font-medium mt-1.5 text-[11px] lg:text-[12px]">Simha • 12° • Magha • House 5</div></div><div className="p-2.5 lg:p-3 bg-[#F5F1EB] border border-[#E8DDD0]"><div className="text-[8px] lg:text-[9px] tracking-[0.08em] uppercase text-[#8B7355]">Chandra • Moon</div><div className="font-medium mt-1.5 text-[11px] lg:text-[12px]">Karka • 8° • Pushya • House 4</div></div><div className="p-2.5 lg:p-3 bg-[#F5F1EB] border border-[#E8DDD0]"><div className="text-[8px] lg:text-[9px] tracking-[0.08em] uppercase text-[#8B7355]">Lagna • Ascendant</div><div className="font-medium mt-1.5 text-[11px] lg:text-[12px]">Mesha • Ashwini • 1st House</div></div></div></div>
          </div>
        </div>
      </div>

      {/* HOROSCOPE */}
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="flex items-baseline gap-4 lg:gap-6"><h2 className="font-serif text-[20px] lg:text-[22px] tracking-[-0.01em]">{t.dailyRashi}</h2><div className="h-px flex-1 bg-[#E8DDD0] hidden md:block" /><div className="text-[10px] lg:text-[11px] tracking-wide text-[#8B7355] hidden lg:block">{t.writtenDaily}</div></div>
        <div className="mt-6 lg:mt-8 border border-[#E8DDD0] rounded-[4px] overflow-hidden">
          <div className="grid lg:grid-cols-[280px_1fr]">
            <div className="bg-[#FDF8F0] border-b lg:border-b-0 lg:border-r border-[#E8DDD0] p-2 max-h-[240px] lg:max-h-[320px] overflow-y-auto">
              {rashis.map((r,i)=>(<button key={r.name} type="button" onClick={()=>setActiveRashi(i)} className={`w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-white cursor-pointer ${activeRashi===i ? "bg-white border border-[#E8DDD0] shadow-sm" : "border border-transparent"}`}><span className="text-[18px] w-6 text-center">{r.glyph}</span><div className="flex-1 min-w-0"><div className="text-[13px] font-medium">{r.name}</div><div className="text-[11px] text-[#8B7355]">{r.en} • {r.dates}</div></div><div className="text-[10px] text-[#8B7355]">{r.lord}</div></button>))}
            </div>
            <div className="p-5 lg:p-8 bg-white">
              <div className="flex gap-4 lg:gap-5">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-[#1A0F0A] text-[#C9A86A] flex items-center justify-center font-serif text-[20px] lg:text-[24px] shrink-0">{rashis[activeRashi].glyph}</div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-2 lg:gap-3"><div className="font-serif text-[18px] lg:text-[20px]">{rashis[activeRashi].name}</div><div className="text-[12px] lg:text-[13px] text-[#6B5D52]">{rashis[activeRashi].en} • {rashis[activeRashi].dates}</div><div className="text-[10px] lg:text-[11px] px-2 py-0.5 rounded-full bg-[#F5F1EB] border border-[#E8DDD0]">Lord {rashis[activeRashi].lord} • {rashis[activeRashi].element}</div></div>
                  <div className="mt-3 lg:mt-4 text-[13px] lg:text-[14px] leading-[1.7] text-[#3D2F26] max-w-[560px]">{rashis[activeRashi].reading} Today is good for completing pending work. Avoid lending money. Chant your Ishta mantra eleven times in morning. Be patient with family.</div>
                  <div className="mt-4 lg:mt-6 flex flex-wrap gap-2"><span className="text-[10px] lg:text-[11px] px-3 py-1 rounded-full bg-[#F5F1EB] border border-[#E8DDD0]">Lucky: 3 • White • North-East</span><span className="text-[10px] lg:text-[11px] px-3 py-1 rounded-full bg-[#F5F1EB] border border-[#E8DDD0]">Avoid: Arguments • Outside food</span></div>
                  <div className="mt-4"><a href="/horoscope" className="text-[11px] tracking-[0.06em] uppercase text-[#8B4513] hover:text-[#1A0F0A] border-b border-[#C9A86A]/30 pb-0.5 cursor-pointer">View Full Horoscope →</a></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TESTIMONIAL */}
      <div id="reviews" className="border-t border-[#E8DDD0] bg-[#FDF8F0] py-12 lg:py-20">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="max-w-[720px]">
            <div className="text-[10px] lg:text-[11px] tracking-[0.14em] uppercase text-[#8B7355]">{t.reviewsHead} • Direct: {phone}</div>
            <div className="mt-8 lg:mt-10"><div className="font-serif text-[22px] lg:text-[38px] leading-[1.2] lg:leading-[1.15] tracking-[-0.02em]">"{t.testimonial}"</div><div className="mt-6 lg:mt-8 flex items-center gap-4"><img src="/rajeshwari-thumb.webp" alt="Suresh Babu" width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-[#E8DDD0]" loading="lazy" /><div><div className="text-[13px] lg:text-[14px] font-medium">Suresh Babu • Rajajinagar, Bangalore</div><div className="text-[11px] lg:text-[12px] text-[#6B5D52] mt-0.5">Business consultation • Verified • March 2024 • Direct client on {phone}</div></div><div className="ml-auto hidden md:flex gap-0.5">{Array.from({length:5}).map((_,i)=><Star key={i} className="w-4 h-4 fill-[#8B4513] text-[#8B4513]" />)}</div></div></div>
            <div className="mt-12 lg:mt-16 grid md:grid-cols-2 gap-8 lg:gap-10 pt-8 lg:pt-10 border-t border-[#E8DDD0]">
              {reviews.slice(0,4).map(r=>(<div key={r.id} className="space-y-3"><div className="flex gap-0.5">{Array.from({length:5}).map((_,i)=><Star key={i} className={`w-3 h-3 ${i<r.rating ? "fill-[#8B4513] text-[#8B4513]" : "text-[#E8DDD0]"}`} />)}</div><div className="text-[13px] lg:text-[14px] leading-[1.6] text-[#2D1F16]">"{r.comment.slice(0,160)}..."</div><div className="text-[10px] lg:text-[11px] tracking-wide text-[#8B7355]">{r.userName} • {new Date(r.createdAt).toLocaleDateString('en-IN', {month:'short', year:'numeric'})} • Verified • Bangalore • Direct on {phone}</div></div>))}
            </div>
          </div>
        </div>
      </div>

      {/* JOURNAL */}
      <div id="journal" className="max-w-[1280px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="flex items-baseline gap-4 lg:gap-6 mb-8 lg:mb-10"><h2 className="font-serif text-[20px] lg:text-[22px] tracking-[-0.01em]">{t.journal}</h2><div className="h-px flex-1 bg-[#E8DDD0] hidden md:block" /><div className="text-[10px] lg:text-[11px] tracking-wide text-[#8B7355]">{t.writtenByMe}</div></div>
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4 lg:gap-6">
          <a href="/articles" className="border border-[#E8DDD0] bg-white p-0 overflow-hidden group block cursor-pointer">
            <div className="aspect-[16/9] bg-[#F5F1EB] overflow-hidden"><img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=450&fit=crop&q=60" alt="Kundli Matching" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" loading="lazy" /></div>
            <div className="p-5 lg:p-6"><div className="flex items-center gap-3 text-[9px] lg:text-[10px] tracking-[0.08em] uppercase text-[#8B7355]"><span>Marriage • 6 min read</span><span>•</span><span>Mar 15, 2024</span><span>•</span><span>3421 views</span></div><h3 className="mt-3 font-serif text-[18px] lg:text-[22px] leading-[1.2] tracking-[-0.01em] group-hover:text-[#8B4513]">Why Kundli matching still matters in 2024 - Real experience from 500+ marriages</h3><p className="mt-3 text-[12px] lg:text-[13px] leading-[1.6] text-[#6B5D52]">In my fifteen years, I have seen many cases where only gun matching was done and marriage faced issues. Gun is only one part. We must see Mangal, Shani, 7th lord strength, Dasha...</p><div className="mt-4 text-[11px] text-[#8B7355]">By Rajeshwari • Jyotish Acharya</div></div>
          </a>
          <div className="space-y-4 lg:space-y-6">
            {[
              { cat: "Career • 5 min", title: "Career confusion after degree? What your 10th house says", excerpt: "Engineering done but not interested? How to choose right field as per your chart. One boy from Mandya, father wanted government job, but Mercury strong..." },
              { cat: "Vastu • 5 min", title: "Vastu for small houses - Bangalore flats, no need to break walls", excerpt: "In Bangalore, most live in flats, not independent houses. You cannot change toilet position. So I give practical Vastu - where to keep bed, which color..." },
            ].map(art=>(<a key={art.title} href="/articles" className="border border-[#E8DDD0] bg-white p-4 lg:p-5 block hover:border-[#C9A86A]/50 cursor-pointer"><div className="text-[9px] lg:text-[10px] tracking-[0.08em] uppercase text-[#8B7355]">{art.cat}</div><h3 className="mt-2 font-serif text-[15px] lg:text-[16px] leading-[1.25] tracking-[-0.01em]">{art.title}</h3><p className="mt-2 text-[11px] lg:text-[12px] leading-[1.6] text-[#6B5D52]">{art.excerpt}</p></a>))}
          </div>
        </div>
      </div>

      {/* BOOKING CTA - Direct Links to 7892758565 */}
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 pb-[100px] lg:pb-16">
        <div className="bg-[#1A0F0A] p-6 lg:p-10 flex flex-col lg:flex-row justify-between gap-6 lg:gap-8">
          <div><div className="text-[10px] lg:text-[11px] tracking-[0.14em] uppercase text-[#C9A86A]">{t.bookCTA}</div><h2 className="mt-3 lg:mt-4 font-serif text-[22px] lg:text-[30px] leading-[1.1] tracking-[-0.02em] text-[#FFFEFB]"><span className="block">{t.bookCTATitle1}</span><span className="block">{t.bookCTATitle2}</span></h2><div className="mt-3 lg:mt-4 text-[12px] lg:text-[13px] leading-[1.6] text-[#E8DDD0]/60 max-w-[380px]">{t.bookCTADesc}</div></div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0 lg:items-start">
            <a href={`tel:${phoneWithCountry}`} className="h-12 px-6 inline-flex items-center justify-center gap-2 bg-[#C9A86A] text-[#1A0F0A] text-[13px] tracking-[0.06em] uppercase font-medium hover:bg-[#B8965A] cursor-pointer"><Phone className="w-4 h-4" /> {t.call} {phone}</a>
            <a href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg()}`} target="_blank" rel="noopener noreferrer" className="h-12 px-6 inline-flex items-center justify-center gap-2 bg-white text-[#1A0F0A] text-[13px] tracking-[0.06em] uppercase font-medium hover:bg-[#FFFEFB] cursor-pointer"><MessageCircle className="w-4 h-4" /> {t.whatsapp}</a>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="h-12 px-6 inline-flex items-center justify-center gap-2 border border-[#C9A86A]/30 text-[#C9A86A] text-[13px] tracking-[0.06em] uppercase font-medium hover:bg-[#C9A86A] hover:text-[#1A0F0A] cursor-pointer"><Instagram className="w-4 h-4" /> Instagram</a>
          </div>
        </div>
      </div>

      {/* Footer - All Connected to 7892758565 */}
      <div className="border-t border-[#E8DDD0] bg-[#FFFEFB] py-8 lg:py-10">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between gap-6 lg:gap-8">
            <div className="flex gap-4"><img src="/logo-icon-small.webp" alt="AstroConnect" width={44} height={44} className="w-11 h-11 rounded-full border border-[#E8DDD0] object-cover" loading="lazy" /><div><div className="font-serif font-bold text-[16px] tracking-[-0.01em]">AstroConnect</div><div className="text-[11px] lg:text-[12px] text-[#6B5D52] mt-1 leading-[1.5] max-w-[340px]">Rajeshwari • Jyotish Acharya, Kashi • 15 years • Jayanagar, Bangalore • Direct: {phone} • Every chart studied by hand • No AI • Instagram shivohamastro66</div></div></div>
            <div className="text-[11px] lg:text-[12px] leading-[1.6] text-[#6B5D52]"><div>Call & WhatsApp: +91 {phone} • Direct personal number</div><div>9AM-9PM All Days • Jayanagar • Pay after via UPI</div><div className="mt-4 flex flex-wrap gap-2"><a href={`tel:${phoneWithCountry}`} className="px-4 py-2 rounded-full bg-[#1A0F0A] text-white text-[11px] font-medium cursor-pointer">Call {phone}</a><a href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg()}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full bg-[#25D366] text-white text-[11px] font-medium cursor-pointer">WhatsApp</a><a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full border border-[#E8DDD0] text-[11px] font-medium cursor-pointer hover:border-[#1A0F0A]">Instagram shivohamastro66</a></div></div>
          </div>
          <div className="mt-8 lg:mt-10 pt-6 border-t border-[#E8DDD0] flex flex-col md:flex-row justify-between gap-2 text-[10px] lg:text-[11px] text-[#8B7355]"><div>© 2024 AstroConnect • Rajeshwari Astrology • Bangalore • Direct {phone} • All links connected</div><div className="hidden md:block">No AI predictions • Every chart by hand • Honest guidance • Original photo as is</div></div>
        </div>
      </div>
    </div>
  );
}
