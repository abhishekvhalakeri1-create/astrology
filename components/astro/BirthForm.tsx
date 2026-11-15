"use client";
import type { BirthDetails, Place } from "@/lib/astro/kundli";
import { MONTH, type Lang, type Tri } from "@/lib/astro/names";
import { daysInMonth } from "@/lib/astro/time";
import { useThisYear } from "@/lib/useLang";
import { PlacePicker } from "./PlacePicker";

/** What the birth form holds while it is being filled in. Empty strings mean "not chosen yet". */
export interface BirthInput {
  name: string;
  day: string;
  month: string;
  year: string;
  /** 1–12 */
  hour: string;
  minute: string;
  ampm: "AM" | "PM";
  place: Place | null;
}

export const EMPTY_BIRTH: BirthInput = { name: "", day: "", month: "", year: "", hour: "", minute: "", ampm: "AM", place: null };

export type BirthErrors = Partial<Record<"date" | "time" | "place", string>>;

const T = {
  name: { en: "Name", hi: "नाम", kn: "ಹೆಸರು" },
  optional: { en: "optional", hi: "वैकल्पिक", kn: "ಐಚ್ಛಿಕ" },
  dob: { en: "Date of birth", hi: "जन्म तिथि", kn: "ಹುಟ್ಟಿದ ದಿನಾಂಕ" },
  tob: { en: "Time of birth", hi: "जन्म समय", kn: "ಹುಟ್ಟಿದ ಸಮಯ" },
  pob: { en: "Place of birth", hi: "जन्म स्थान", kn: "ಹುಟ್ಟಿದ ಸ್ಥಳ" },
  day: { en: "Day", hi: "दिन", kn: "ದಿನ" },
  month: { en: "Month", hi: "महीना", kn: "ತಿಂಗಳು" },
  year: { en: "Year", hi: "वर्ष", kn: "ವರ್ಷ" },
  hour: { en: "Hour", hi: "घंटा", kn: "ಗಂಟೆ" },
  minute: { en: "Min", hi: "मिनट", kn: "ನಿಮಿಷ" },
  timeHint: {
    en: "As written on the birth certificate or family record. If the time is not known, use 12:00 PM — the rashi is usually still right, the lagna is not.",
    hi: "जैसा जन्म प्रमाणपत्र या पारिवारिक अभिलेख में लिखा है। समय न पता हो तो 12:00 PM चुनें — राशि प्रायः सही रहती है, लग्न नहीं।",
    kn: "ಜನನ ಪ್ರಮಾಣಪತ್ರ ಅಥವಾ ಮನೆಯ ದಾಖಲೆಯಲ್ಲಿ ಇರುವಂತೆ. ಸಮಯ ಗೊತ್ತಿಲ್ಲದಿದ್ದರೆ 12:00 PM ಆಯ್ಕೆ ಮಾಡಿ — ರಾಶಿ ಸಾಮಾನ್ಯವಾಗಿ ಸರಿಯಾಗಿರುತ್ತದೆ, ಲಗ್ನ ಅಲ್ಲ.",
  },
  errDate: { en: "Choose the full date of birth.", hi: "पूरी जन्म तिथि चुनें।", kn: "ಪೂರ್ಣ ಹುಟ್ಟಿದ ದಿನಾಂಕ ಆಯ್ಕೆ ಮಾಡಿ." },
  errDateInvalid: { en: "That month does not have this many days.", hi: "इस महीने में इतने दिन नहीं होते।", kn: "ಈ ತಿಂಗಳಲ್ಲಿ ಇಷ್ಟು ದಿನಗಳಿಲ್ಲ." },
  errDateFuture: { en: "The date of birth cannot be in the future.", hi: "जन्म तिथि भविष्य की नहीं हो सकती।", kn: "ಹುಟ್ಟಿದ ದಿನಾಂಕ ಭವಿಷ್ಯದ್ದಾಗಿರಲು ಸಾಧ್ಯವಿಲ್ಲ." },
  errTime: { en: "Choose the hour and minute of birth.", hi: "जन्म का घंटा और मिनट चुनें।", kn: "ಹುಟ್ಟಿದ ಗಂಟೆ ಮತ್ತು ನಿಮಿಷ ಆಯ್ಕೆ ಮಾಡಿ." },
  errPlace: { en: "Choose the place of birth from the list.", hi: "सूची में से जन्म स्थान चुनें।", kn: "ಪಟ್ಟಿಯಿಂದ ಹುಟ್ಟಿದ ಸ್ಥಳ ಆಯ್ಕೆ ಮಾಡಿ." },
} satisfies Record<string, Tri>;

const FIRST_YEAR = 1920;

export function validateBirth(input: BirthInput, lang: Lang, needs: { time?: boolean; place?: boolean } = { time: true, place: true }): BirthErrors {
  const errors: BirthErrors = {};
  const day = Number(input.day);
  const month = Number(input.month);
  const year = Number(input.year);
  if (!input.day || !input.month || !input.year) errors.date = T.errDate[lang];
  else if (day > daysInMonth(year, month)) errors.date = T.errDateInvalid[lang];
  else if (Date.UTC(year, month - 1, day) > Date.now() + 14 * 3600000) errors.date = T.errDateFuture[lang];
  if (needs.time !== false && (!input.hour || input.minute === "")) errors.time = T.errTime[lang];
  if (needs.place !== false && !input.place) errors.place = T.errPlace[lang];
  return errors;
}

/**
 * After a submit that failed validation: brings the first message into view and puts the cursor in the field
 * it belongs to. On a phone the submit button sits a screen or two below the first field.
 */
export function showFirstError(form: HTMLElement): void {
  window.requestAnimationFrame(() => {
    const message = form.querySelector<HTMLElement>('[role="alert"]');
    if (!message) return;
    const fields = Array.from(message.parentElement?.querySelectorAll<HTMLSelectElement | HTMLInputElement>("select, input") ?? []);
    const field = fields.find((f) => f.value === "") ?? fields[0];
    message.scrollIntoView({ behavior: "smooth", block: "center" });
    field?.focus({ preventScroll: true });
  });
}

/** The form's 12-hour reading as a 24-hour clock. */
export function hour24(input: BirthInput): number {
  const h = Number(input.hour) % 12;
  return input.ampm === "PM" ? h + 12 : h;
}

/** Call only after validateBirth has returned no errors. */
export function toBirthDetails(input: BirthInput): BirthDetails {
  return {
    name: input.name.trim(),
    year: Number(input.year),
    month: Number(input.month),
    day: Number(input.day),
    hour: hour24(input),
    minute: Number(input.minute),
    place: input.place as Place,
  };
}

/* ---------- remembering what was typed, in this browser only ---------- */

const STORAGE_PREFIX = "astroconnect-birth:";

export function loadBirth(key: string): BirthInput | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Partial<BirthInput>;
    if (typeof saved !== "object" || saved === null) return null;
    const place = saved.place && typeof saved.place.lat === "number" && typeof saved.place.lon === "number" && typeof saved.place.tz === "string" && typeof saved.place.name === "string" ? saved.place : null;
    const text = (v: unknown) => (typeof v === "string" ? v : "");
    return { name: text(saved.name), day: text(saved.day), month: text(saved.month), year: text(saved.year), hour: text(saved.hour), minute: text(saved.minute), ampm: saved.ampm === "PM" ? "PM" : "AM", place };
  } catch {
    return null;
  }
}

export function saveBirth(key: string, input: BirthInput): void {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(input));
  } catch {
    /* private browsing or a full disk: the form simply will not be remembered */
  }
}

/* ---------- the fields ---------- */

interface Props {
  /** Makes the field ids unique when two people are entered on one page. */
  idPrefix: string;
  value: BirthInput;
  onChange: (next: BirthInput) => void;
  errors: BirthErrors;
  lang: Lang;
  showName?: boolean;
  showTime?: boolean;
  showPlace?: boolean;
  showTimeHint?: boolean;
}

export function BirthFields({ idPrefix, value, onChange, errors, lang, showName = true, showTime = true, showPlace = true, showTimeHint = true }: Props) {
  const set = (patch: Partial<BirthInput>) => onChange({ ...value, ...patch });
  const thisYear = useThisYear();
  const years: number[] = [];
  for (let y = thisYear; y >= FIRST_YEAR; y--) years.push(y);
  const months = MONTH[lang];
  const errorClass = "mt-1.5 text-[13px] font-medium text-[#B3261E]";

  return (
    <div className="space-y-5">
      {showName && (
        <div>
          <label htmlFor={`${idPrefix}-name`} className="field-label">
            {T.name[lang]} <span className="font-normal text-[#8A7256]">({T.optional[lang]})</span>
          </label>
          <input id={`${idPrefix}-name`} type="text" autoComplete="off" maxLength={60} className="field" value={value.name} onChange={(e) => set({ name: e.target.value })} />
        </div>
      )}

      <fieldset aria-describedby={errors.date ? `${idPrefix}-date-error` : undefined}>
        <legend className="field-label">{T.dob[lang]}</legend>
        <div className="grid grid-cols-[1fr_1.7fr_1.2fr] gap-2">
          <select aria-label={T.day[lang]} className={`field tabular ${errors.date && !value.day ? "border-[#B3261E]" : ""}`} value={value.day} onChange={(e) => set({ day: e.target.value })}>
            <option value="">{T.day[lang]}</option>
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i} value={String(i + 1)}>
                {i + 1}
              </option>
            ))}
          </select>
          <select aria-label={T.month[lang]} className={`field ${errors.date && !value.month ? "border-[#B3261E]" : ""}`} value={value.month} onChange={(e) => set({ month: e.target.value })}>
            <option value="">{T.month[lang]}</option>
            {months.map((m, i) => (
              <option key={m} value={String(i + 1)}>
                {m}
              </option>
            ))}
          </select>
          <select aria-label={T.year[lang]} className={`field tabular ${errors.date && !value.year ? "border-[#B3261E]" : ""}`} value={value.year} onChange={(e) => set({ year: e.target.value })}>
            <option value="">{T.year[lang]}</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>
        {errors.date && (
          <p id={`${idPrefix}-date-error`} role="alert" className={errorClass}>
            {errors.date}
          </p>
        )}
      </fieldset>

      {showTime && (
        <fieldset aria-describedby={errors.time ? `${idPrefix}-time-error` : undefined}>
          <legend className="field-label">{T.tob[lang]}</legend>
          <div className="grid grid-cols-3 gap-2">
            <select aria-label={T.hour[lang]} className={`field tabular ${errors.time && !value.hour ? "border-[#B3261E]" : ""}`} value={value.hour} onChange={(e) => set({ hour: e.target.value })}>
              <option value="">{T.hour[lang]}</option>
              {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => (
                <option key={h} value={String(h)}>
                  {h}
                </option>
              ))}
            </select>
            <select aria-label={T.minute[lang]} className={`field tabular ${errors.time && value.minute === "" ? "border-[#B3261E]" : ""}`} value={value.minute} onChange={(e) => set({ minute: e.target.value })}>
              <option value="">{T.minute[lang]}</option>
              {Array.from({ length: 60 }, (_, i) => (
                <option key={i} value={String(i)}>
                  {String(i).padStart(2, "0")}
                </option>
              ))}
            </select>
            <select aria-label="AM / PM" className="field" value={value.ampm} onChange={(e) => set({ ampm: e.target.value === "PM" ? "PM" : "AM" })}>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
          {errors.time && (
            <p id={`${idPrefix}-time-error`} role="alert" className={errorClass}>
              {errors.time}
            </p>
          )}
          {showTimeHint && !errors.time && <p className="mt-1.5 text-[12.5px] leading-[1.5] text-[#6B5D52]">{T.timeHint[lang]}</p>}
        </fieldset>
      )}

      {showPlace && (
        <div>
          <label htmlFor={`${idPrefix}-place`} className="field-label">
            {T.pob[lang]}
          </label>
          <PlacePicker id={`${idPrefix}-place`} value={value.place} onChange={(place) => set({ place })} lang={lang} invalid={Boolean(errors.place)} describedBy={errors.place ? `${idPrefix}-place-error` : undefined} />
          {errors.place && (
            <p id={`${idPrefix}-place-error`} role="alert" className={errorClass}>
              {errors.place}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
