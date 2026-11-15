"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { BirthFields, EMPTY_BIRTH, loadBirth, saveBirth, showFirstError, validateBirth, type BirthErrors, type BirthInput } from "@/components/astro/BirthForm";
import { ConsultCTA, FormWithAside, Panel, PrivacyNote, ToolHero } from "@/components/astro/ui";
import { formatDate } from "@/lib/astro/format";
import { GRAHA, type Lang, type Tri } from "@/lib/astro/names";
import { NUMBER_LORD, bhagyank, letterValues, mulank, namank, reductionSteps, type NumberResult } from "@/lib/astro/numerology";
import { useLang } from "@/lib/useLang";

const T = {
  eyebrow: { en: "Free tool • Anka Jyotish", hi: "निःशुल्क साधन • अंक ज्योतिष", kn: "ಉಚಿತ ಸಾಧನ • ಅಂಕ ಜ್ಯೋತಿಷ್ಯ" },
  title: { en: "Numerology", hi: "अंक ज्योतिष", kn: "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ" },
  intro: {
    en: "Three numbers from your date of birth and your name — Mulank, Bhagyank and Namank — each with the graha that rules it and the working shown, so you can check it yourself.",
    hi: "आपकी जन्म तिथि और नाम से तीन अंक — मूलांक, भाग्यांक और नामांक — हर एक के स्वामी ग्रह और पूरी गणना सहित, ताकि आप स्वयं जाँच सकें।",
    kn: "ನಿಮ್ಮ ಹುಟ್ಟಿದ ದಿನಾಂಕ ಮತ್ತು ಹೆಸರಿನಿಂದ ಮೂರು ಅಂಕಗಳು — ಮೂಲಾಂಕ, ಭಾಗ್ಯಾಂಕ ಮತ್ತು ನಾಮಾಂಕ — ಪ್ರತಿಯೊಂದರ ಅಧಿಪತಿ ಗ್ರಹ ಮತ್ತು ಪೂರ್ಣ ಲೆಕ್ಕದೊಂದಿಗೆ; ನೀವೇ ಪರಿಶೀಲಿಸಬಹುದು.",
  },
  formTitle: { en: "Your details", hi: "आपका विवरण", kn: "ನಿಮ್ಮ ವಿವರ" },
  asideTitle: { en: "The three numbers", hi: "तीन अंक", kn: "ಮೂರು ಅಂಕಗಳು" },
  mulankHow: {
    en: "From the day of the month you were born. It speaks of your nature.",
    hi: "जन्म की तारीख़ के दिन से। यह आपका स्वभाव बताता है।",
    kn: "ನೀವು ಹುಟ್ಟಿದ ತಿಂಗಳ ದಿನದಿಂದ. ಇದು ನಿಮ್ಮ ಸ್ವಭಾವವನ್ನು ತಿಳಿಸುತ್ತದೆ.",
  },
  bhagyankHow: {
    en: "From every digit of the full date of birth. It speaks of the road your life takes.",
    hi: "पूरी जन्म तिथि के हर अंक से। यह जीवन की दिशा बताता है।",
    kn: "ಪೂರ್ಣ ಹುಟ್ಟಿದ ದಿನಾಂಕದ ಪ್ರತಿ ಅಂಕಿಯಿಂದ. ಇದು ಜೀವನದ ದಾರಿಯನ್ನು ತಿಳಿಸುತ್ತದೆ.",
  },
  namankHow: {
    en: "From the letters of your name on the Chaldean scale. It speaks of how the world meets you.",
    hi: "आपके नाम के अक्षरों से, कैल्डियन पद्धति के मानों पर। यह बताता है कि संसार आपको कैसे देखता है।",
    kn: "ನಿಮ್ಮ ಹೆಸರಿನ ಅಕ್ಷರಗಳಿಂದ, ಕ್ಯಾಲ್ಡಿಯನ್ ಪದ್ಧತಿಯ ಮೌಲ್ಯಗಳಂತೆ. ಜಗತ್ತು ನಿಮ್ಮನ್ನು ಕಾಣುವ ರೀತಿಯನ್ನು ಇದು ತಿಳಿಸುತ್ತದೆ.",
  },
  nameHint: {
    en: "Write the name in English letters, as you sign it. The name number counts each letter.",
    hi: "नाम अंग्रेज़ी अक्षरों में लिखें, जैसा आप हस्ताक्षर करते हैं। नामांक हर अक्षर को गिनता है।",
    kn: "ಹೆಸರನ್ನು ಇಂಗ್ಲಿಷ್ ಅಕ್ಷರಗಳಲ್ಲಿ, ನೀವು ಸಹಿ ಮಾಡುವಂತೆ ಬರೆಯಿರಿ. ನಾಮಾಂಕ ಪ್ರತಿ ಅಕ್ಷರವನ್ನು ಎಣಿಸುತ್ತದೆ.",
  },
  submit: { en: "Find my numbers", hi: "मेरे अंक बताएँ", kn: "ನನ್ನ ಅಂಕಗಳನ್ನು ತಿಳಿಸಿ" },
  mulank: { en: "Mulank", hi: "मूलांक", kn: "ಮೂಲಾಂಕ" },
  mulankSub: { en: "Birth number — your nature", hi: "जन्मांक — आपका स्वभाव", kn: "ಜನ್ಮಾಂಕ — ನಿಮ್ಮ ಸ್ವಭಾವ" },
  bhagyank: { en: "Bhagyank", hi: "भाग्यांक", kn: "ಭಾಗ್ಯಾಂಕ" },
  bhagyankSub: { en: "Destiny number — the road your life takes", hi: "भाग्य का अंक — जीवन की दिशा", kn: "ಭಾಗ್ಯದ ಅಂಕ — ಜೀವನದ ದಾರಿ" },
  namank: { en: "Namank", hi: "नामांक", kn: "ನಾಮಾಂಕ" },
  namankSub: { en: "Name number — how the world meets you", hi: "नाम का अंक — संसार आपको कैसे देखता है", kn: "ಹೆಸರಿನ ಅಂಕ — ಜಗತ್ತು ನಿಮ್ಮನ್ನು ಕಾಣುವ ರೀತಿ" },
  ruledBy: { en: "Ruled by", hi: "स्वामी", kn: "ಅಧಿಪತಿ" },
  working: { en: "Working", hi: "गणना", kn: "ಲೆಕ್ಕ" },
  dayOfBirth: { en: "Day of birth", hi: "जन्म का दिन", kn: "ಹುಟ್ಟಿದ ದಿನ" },
  noName: {
    en: "Add your name in English letters above to see the name number.",
    hi: "नामांक देखने के लिए ऊपर अपना नाम अंग्रेज़ी अक्षरों में लिखें।",
    kn: "ನಾಮಾಂಕ ನೋಡಲು ಮೇಲೆ ನಿಮ್ಮ ಹೆಸರನ್ನು ಇಂಗ್ಲಿಷ್ ಅಕ್ಷರಗಳಲ್ಲಿ ಬರೆಯಿರಿ.",
  },
  chaldean: {
    en: "Letter values follow the Chaldean scale used in Indian numerology. It has no 9.",
    hi: "अक्षरों के मान भारतीय अंक ज्योतिष में प्रचलित कैल्डियन पद्धति से हैं। इसमें 9 नहीं होता।",
    kn: "ಅಕ್ಷರಗಳ ಮೌಲ್ಯ ಭಾರತೀಯ ಸಂಖ್ಯಾಶಾಸ್ತ್ರದಲ್ಲಿ ಬಳಸುವ ಕ್ಯಾಲ್ಡಿಯನ್ ಪದ್ಧತಿಯಂತೆ. ಇದರಲ್ಲಿ 9 ಇಲ್ಲ.",
  },
  resultFor: { en: "Numbers for", hi: "अंक:", kn: "ಅಂಕಗಳು:" },
  honest: {
    en: "Numerology is a small window. It describes a temperament in broad strokes; it does not time events. For that, the birth chart and its dashas are needed.",
    hi: "अंक ज्योतिष एक छोटी खिड़की है। यह स्वभाव को मोटे तौर पर बताता है; घटनाओं का समय नहीं। उसके लिए जन्म कुंडली और उसकी दशाएँ चाहिए।",
    kn: "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಒಂದು ಚಿಕ್ಕ ಕಿಟಕಿ. ಇದು ಸ್ವಭಾವವನ್ನು ಸ್ಥೂಲವಾಗಿ ತಿಳಿಸುತ್ತದೆ; ಘಟನೆಗಳ ಸಮಯವನ್ನಲ್ಲ. ಅದಕ್ಕೆ ಜನ್ಮ ಕುಂಡಲಿ ಮತ್ತು ಅದರ ದಶೆಗಳು ಬೇಕು.",
  },
  ctaTitle: { en: "Numbers open the door. The chart is the house.", hi: "अंक द्वार खोलते हैं। कुंडली पूरा घर है।", kn: "ಅಂಕಗಳು ಬಾಗಿಲು ತೆರೆಯುತ್ತವೆ. ಕುಂಡಲಿಯೇ ಪೂರ್ಣ ಮನೆ." },
  ctaBody: {
    en: "If a number here made you curious, bring your birth time and place as well. I will read the whole chart with you.",
    hi: "यदि यहाँ का कोई अंक आपको जिज्ञासु बनाता है, तो अपना जन्म समय और स्थान भी लाइए। मैं आपके साथ पूरी कुंडली पढ़ूँगी।",
    kn: "ಇಲ್ಲಿನ ಯಾವುದಾದರೂ ಅಂಕ ನಿಮ್ಮಲ್ಲಿ ಕುತೂಹಲ ಮೂಡಿಸಿದ್ದರೆ, ನಿಮ್ಮ ಹುಟ್ಟಿದ ಸಮಯ ಮತ್ತು ಸ್ಥಳವನ್ನೂ ತನ್ನಿ. ನಿಮ್ಮೊಂದಿಗೆ ಪೂರ್ಣ ಜಾತಕ ಓದುತ್ತೇನೆ.",
  },
} satisfies Record<string, Tri>;

/** What each number is held to bring, index 1–9. */
const TRAITS: readonly (Tri | null)[] = [
  null,
  { en: "Leadership, independence, a need to stand on your own feet.", hi: "नेतृत्व, स्वतंत्रता, अपने पैरों पर खड़े होने की ज़रूरत।", kn: "ನಾಯಕತ್ವ, ಸ್ವಾತಂತ್ರ್ಯ, ಸ್ವಂತ ಕಾಲ ಮೇಲೆ ನಿಲ್ಲುವ ಹಂಬಲ." },
  { en: "Sensitivity, imagination, care for home and people; moods that rise and fall.", hi: "संवेदनशीलता, कल्पना, घर और लोगों की परवाह; मन के उतार-चढ़ाव।", kn: "ಸೂಕ್ಷ್ಮತೆ, ಕಲ್ಪನಾಶಕ್ತಿ, ಮನೆ ಮತ್ತು ಜನರ ಕಾಳಜಿ; ಏರಿಳಿಯುವ ಮನಸ್ಥಿತಿ." },
  { en: "Learning, teaching, discipline and good counsel; respect for tradition.", hi: "अध्ययन, अध्यापन, अनुशासन और अच्छी सलाह; परंपरा का आदर।", kn: "ಅಧ್ಯಯನ, ಬೋಧನೆ, ಶಿಸ್ತು ಮತ್ತು ಒಳ್ಳೆಯ ಸಲಹೆ; ಸಂಪ್ರದಾಯದ ಗೌರವ." },
  { en: "An unconventional mind, sudden turns, the strength to rebuild from nothing.", hi: "लीक से हटकर सोच, अचानक मोड़, शून्य से फिर खड़ा करने की शक्ति।", kn: "ಸಂಪ್ರದಾಯ ಮೀರಿದ ಚಿಂತನೆ, ಹಠಾತ್ ತಿರುವುಗಳು, ಶೂನ್ಯದಿಂದ ಮತ್ತೆ ಕಟ್ಟುವ ಶಕ್ತಿ." },
  { en: "Quick wit, trade, communication and a love of change.", hi: "तेज़ बुद्धि, व्यापार, संवाद और बदलाव से लगाव।", kn: "ಚುರುಕು ಬುದ್ಧಿ, ವ್ಯಾಪಾರ, ಸಂವಹನ ಮತ್ತು ಬದಲಾವಣೆಯ ಒಲವು." },
  { en: "Harmony, beauty, comfort and devotion to family.", hi: "सामंजस्य, सौंदर्य, सुख-सुविधा और परिवार के प्रति समर्पण।", kn: "ಸಾಮರಸ್ಯ, ಸೌಂದರ್ಯ, ಸುಖ-ಸೌಕರ್ಯ ಮತ್ತು ಕುಟುಂಬದ ಮೇಲಿನ ನಿಷ್ಠೆ." },
  { en: "Inwardness, research, intuition and a pull towards the spiritual.", hi: "अंतर्मुखता, शोध, अंतर्ज्ञान और अध्यात्म की ओर खिंचाव।", kn: "ಅಂತರ್ಮುಖತೆ, ಸಂಶೋಧನೆ, ಅಂತಃಪ್ರಜ್ಞೆ ಮತ್ತು ಆಧ್ಯಾತ್ಮದ ಸೆಳೆತ." },
  { en: "Patience, hard work and justice; success that comes late but stays.", hi: "धैर्य, कठिन परिश्रम और न्याय; सफलता देर से आती है पर टिकती है।", kn: "ತಾಳ್ಮೆ, ಕಠಿಣ ಪರಿಶ್ರಮ ಮತ್ತು ನ್ಯಾಯ; ತಡವಾಗಿ ಬಂದರೂ ಉಳಿಯುವ ಯಶಸ್ಸು." },
  { en: "Courage, energy and a protective nature; a temper to keep in hand.", hi: "साहस, ऊर्जा और रक्षा करने का स्वभाव; क्रोध पर नियंत्रण आवश्यक।", kn: "ಧೈರ್ಯ, ಶಕ್ತಿ ಮತ್ತು ರಕ್ಷಿಸುವ ಸ್ವಭಾವ; ಕೋಪವನ್ನು ಹತೋಟಿಯಲ್ಲಿಡಬೇಕು." },
];

/** Numerology needs neither the time nor the place of birth. */
const DATE_ONLY = { time: false, place: false };

interface Outcome {
  name: string;
  date: { year: number; month: number; day: number };
  mulank: NumberResult;
  bhagyank: NumberResult;
  namank: NumberResult | null;
}

function NumberCard({ title, sub, result, working, lang }: { title: string; sub: string; result: NumberResult; working: React.ReactNode; lang: Lang }) {
  const lord = NUMBER_LORD[result.value];
  const trait = TRAITS[result.value];
  return (
    <article className="card p-5 sm:p-6 flex flex-col">
      <div className="eyebrow">{title}</div>
      <div className="mt-1 text-[13.5px] text-[#5A4A3D]">{sub}</div>
      <div className="mt-4 flex items-center gap-4">
        <div className="w-[84px] h-[84px] shrink-0 rounded-full border border-[#C9A86A] bg-[#FBF1DC] flex items-center justify-center font-serif text-[52px] leading-none text-[#7C2D2D] tabular">{result.value}</div>
        <div>
          <div className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#8A6A2F]">{T.ruledBy[lang]}</div>
          <div className="font-serif text-[24px] leading-tight">{lord ? GRAHA[lord][lang] : "—"}</div>
        </div>
      </div>
      {trait && <p className="mt-4 text-[15.5px] leading-[1.65] text-[#1A0F0A]">{trait[lang]}</p>}
      <div className="mt-auto pt-5">
        <div className="border-t border-[#EFE6D8] pt-3 text-[13px] leading-[1.7] text-[#5A4A3D] tabular">
          <span className="font-semibold text-[#3D2F26]">{T.working[lang]}: </span>
          {working}
        </div>
      </div>
    </article>
  );
}

/**
 * The additions that bring a number down to one digit, each led by a small arrow.
 * The arrow is drawn, not typed: the page's fonts have no arrow character.
 */
function Steps({ of: n }: { of: number }) {
  if (n <= 9) return null;
  return (
    <>
      {reductionSteps(n).map((step) => (
        <span key={step} className="whitespace-nowrap">
          <span className="sr-only">, </span>
          <ArrowRight className="inline w-3.5 h-3.5 mx-1.5 -mt-0.5 text-[#8A6A2F]" aria-hidden />
          {step}
        </span>
      ))}
    </>
  );
}

export function NumerologyTool() {
  const lang = useLang();
  const [input, setInput] = useState<BirthInput>(EMPTY_BIRTH);
  const [attempted, setAttempted] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = loadBirth("self");
    if (saved) setInput(saved);
  }, []);

  useEffect(() => {
    if (outcome) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      resultRef.current?.focus({ preventScroll: true });
    }
  }, [outcome]);

  // After the first attempt, the message goes away as soon as the date is put right.
  const errors: BirthErrors = attempted ? validateBirth(input, lang, DATE_ONLY) : {};

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (Object.keys(validateBirth(input, lang, DATE_ONLY)).length) {
      setOutcome(null);
      showFirstError(e.currentTarget as HTMLElement);
      return;
    }
    saveBirth("self", input);
    const year = Number(input.year);
    const month = Number(input.month);
    const day = Number(input.day);
    setOutcome({ name: input.name.trim(), date: { year, month, day }, mulank: mulank(day), bhagyank: bhagyank(year, month, day), namank: namank(input.name) });
  };

  const digits = (n: number) => String(n).split("").join(" + ");
  const letters = outcome ? letterValues(outcome.name) : [];

  return (
    <>
      <ToolHero eyebrow={T.eyebrow[lang]} title={T.title[lang]} intro={T.intro[lang]} />

      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8 lg:py-12 space-y-8 lg:space-y-10">
        <FormWithAside
          title={T.asideTitle[lang]}
          items={[
            { title: T.mulank[lang], text: T.mulankHow[lang] },
            { title: T.bhagyank[lang], text: T.bhagyankHow[lang] },
            { title: T.namank[lang], text: T.namankHow[lang] },
          ]}
        >
          <form onSubmit={submit} noValidate>
            <Panel title={T.formTitle[lang]}>
              <BirthFields idPrefix="num" value={input} onChange={setInput} errors={errors} lang={lang} showTime={false} showPlace={false} />
              <p className="mt-3 text-[12.5px] leading-[1.5] text-[#6B5D52]">{T.nameHint[lang]}</p>
              <button type="submit" className="btn btn-maroon w-full sm:w-auto sm:min-w-[260px] !min-h-[54px] !text-[16px] mt-6">
                {T.submit[lang]}
              </button>
              <PrivacyNote lang={lang} className="mt-4" />
            </Panel>
          </form>
        </FormWithAside>

        {outcome && (
          <div ref={resultRef} tabIndex={-1} className="space-y-6 lg:space-y-8 outline-none scroll-mt-24 animate-rise">
            <div>
              <div className="eyebrow">{T.resultFor[lang].replace(":", "")}</div>
              <h2 className="mt-2 font-serif text-[28px] lg:text-[36px]">{outcome.name || formatDate(lang, outcome.date)}</h2>
              {outcome.name && <p className="mt-1 text-[14.5px] text-[#5A4A3D]">{formatDate(lang, outcome.date)}</p>}
            </div>

            <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
              <NumberCard
                title={T.mulank[lang]}
                sub={T.mulankSub[lang]}
                result={outcome.mulank}
                lang={lang}
                working={
                  <>
                    {T.dayOfBirth[lang]} {outcome.date.day}
                    <Steps of={outcome.date.day} />
                  </>
                }
              />
              <NumberCard
                title={T.bhagyank[lang]}
                sub={T.bhagyankSub[lang]}
                result={outcome.bhagyank}
                lang={lang}
                working={
                  <>
                    {digits(outcome.date.day)} + {digits(outcome.date.month)} + {digits(outcome.date.year)} = {outcome.bhagyank.compound}
                    <Steps of={outcome.bhagyank.compound} />
                  </>
                }
              />
              {outcome.namank ? (
                <NumberCard
                  title={T.namank[lang]}
                  sub={T.namankSub[lang]}
                  result={outcome.namank}
                  lang={lang}
                  working={
                    <>
                      <span className="flex flex-wrap gap-1 my-1.5" aria-label={letters.map((l) => `${l.letter} ${l.value}`).join(", ")}>
                        {letters.map((l, i) => (
                          <span key={i} aria-hidden className="inline-flex flex-col items-center w-[26px] py-1 border border-[#E8DDD0] bg-[#FFFDF7] leading-none">
                            <span className="text-[13px] font-semibold text-[#1A0F0A]">{l.letter}</span>
                            <span className="mt-1 text-[11.5px] text-[#8A6A2F]">{l.value}</span>
                          </span>
                        ))}
                      </span>
                      = {outcome.namank.compound}
                      <Steps of={outcome.namank.compound} />
                    </>
                  }
                />
              ) : (
                <div className="border border-dashed border-[#D4C4B0] bg-[#FFFDF7] p-5 sm:p-6 flex flex-col justify-center">
                  <div className="eyebrow">{T.namank[lang]}</div>
                  <p className="mt-2 text-[15px] leading-[1.65] text-[#3D2F26]">{T.noName[lang]}</p>
                </div>
              )}
            </div>

            <p className="text-[14px] leading-[1.65] text-[#5A4A3D] max-w-[820px]">
              {T.honest[lang]} {outcome.namank ? T.chaldean[lang] : ""}
            </p>

            <ConsultCTA
              lang={lang}
              title={T.ctaTitle[lang]}
              body={T.ctaBody[lang]}
              message={`Namaste Rajeshwari madam, I checked my numbers on your website${outcome.name ? ` (${outcome.name})` : ""}: Mulank ${outcome.mulank.value}, Bhagyank ${outcome.bhagyank.value}${outcome.namank ? `, Namank ${outcome.namank.value}` : ""}. Born ${formatDate("en", outcome.date)}. I would like a consultation.`}
            />
          </div>
        )}
      </div>
    </>
  );
}
