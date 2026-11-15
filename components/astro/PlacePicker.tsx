"use client";
import { useEffect, useId, useRef, useState } from "react";
import { MapPin, X } from "lucide-react";
import type { Place } from "@/lib/astro/kundli";
import type { Lang, Tri } from "@/lib/astro/names";
import { placeLabel, preloadPlaces, searchPlaces } from "@/lib/astro/places";

const T = {
  placeholder: { en: "Start typing a town or city", hi: "शहर या कस्बे का नाम लिखें", kn: "ಊರು ಅಥವಾ ನಗರದ ಹೆಸರು ಬರೆಯಿರಿ" },
  none: {
    en: "No place found. Try the nearest larger town.",
    hi: "कोई स्थान नहीं मिला। पास के बड़े शहर का नाम लिखकर देखें।",
    kn: "ಸ್ಥಳ ಸಿಗಲಿಲ್ಲ. ಹತ್ತಿರದ ದೊಡ್ಡ ಊರಿನ ಹೆಸರು ಪ್ರಯತ್ನಿಸಿ.",
  },
  clear: { en: "Clear the place", hi: "स्थान हटाएँ", kn: "ಸ್ಥಳ ಅಳಿಸಿ" },
  failed: {
    en: "The place list could not be loaded. Check your connection and type again.",
    hi: "स्थानों की सूची नहीं खुल सकी। इंटरनेट जाँचकर फिर लिखें।",
    kn: "ಸ್ಥಳಗಳ ಪಟ್ಟಿ ತೆರೆಯಲಾಗಲಿಲ್ಲ. ಇಂಟರ್ನೆಟ್ ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಬರೆಯಿರಿ.",
  },
} satisfies Record<string, Tri>;

interface Props {
  id: string;
  value: Place | null;
  onChange: (place: Place | null) => void;
  lang: Lang;
  invalid?: boolean;
  describedBy?: string;
}

/** Type-ahead for the birthplace. Picking from the list is what supplies the latitude, longitude and time zone. */
export function PlacePicker({ id, value, onChange, lang, invalid, describedBy }: Props) {
  const listId = useId();
  const [text, setText] = useState(value ? placeLabel(value) : "");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Place[]>([]);
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState(false);
  const request = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Set when this component itself withdrew the value because the person went on typing.
  const typing = useRef(false);

  // Follow a value set from outside (restored from storage, or cleared), but never wipe text that is being typed.
  useEffect(() => {
    if (value) setText(placeLabel(value));
    else if (!typing.current) setText("");
    typing.current = false;
  }, [value]);

  const search = (query: string) => {
    const ticket = ++request.current;
    searchPlaces(query, 8)
      .then((found) => {
        if (ticket !== request.current) return; // a newer keystroke has already asked again
        setResults(found);
        setActive(0);
        setFailed(false);
      })
      .catch(() => {
        if (ticket === request.current) {
          setResults([]);
          setFailed(true);
        }
      });
  };

  const choose = (place: Place) => {
    onChange(place);
    setText(placeLabel(place));
    setOpen(false);
  };

  const showList = open && (results.length > 0 || text.trim().length >= 2 || failed);

  return (
    <div className="relative">
      <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A68B5B]" aria-hidden />
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && results[active] ? `${listId}-${active}` : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="search"
        className={`field pl-9 ${text ? "pr-11" : ""} ${invalid ? "border-[#B3261E]" : ""}`}
        placeholder={T.placeholder[lang]}
        value={text}
        onFocus={(e) => {
          preloadPlaces();
          setOpen(true);
          search(value ? "" : text);
          const input = e.currentTarget;
          // A place that is already chosen is replaced, not edited: select it so the first letter typed starts afresh.
          if (value) window.requestAnimationFrame(() => input.setSelectionRange(0, input.value.length));
          // On a phone the keyboard covers the lower half of the screen. Once it is up, bring the field
          // to just under the header so the suggestions below it can be seen.
          if (window.matchMedia("(pointer: coarse)").matches) {
            window.setTimeout(() => {
              if (document.activeElement !== input) return;
              const top = input.getBoundingClientRect().top;
              if (top > 150) window.scrollBy({ top: top - 112, behavior: "smooth" });
            }, 300);
          }
        }}
        onChange={(e) => {
          const next = e.target.value;
          setText(next);
          setOpen(true);
          if (value) {
            typing.current = true;
            onChange(null); // the typed text no longer names the chosen place
          }
          search(next);
        }}
        onBlur={() => {
          setOpen(false);
          // Typing a name in full and tabbing away counts as choosing it.
          if (!value && results[0] && results[0].name.toLowerCase() === text.trim().toLowerCase()) choose(results[0]);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter") {
            if (showList && results[active]) {
              e.preventDefault();
              choose(results[active]);
            }
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {text && (
        <button
          type="button"
          aria-label={T.clear[lang]}
          // Keep the keyboard up on a phone: the field stays focused while it is emptied.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setText("");
            if (value) {
              typing.current = true;
              onChange(null);
            }
            search("");
            setOpen(true);
            inputRef.current?.focus();
          }}
          className="absolute right-0 top-0 w-11 h-12 flex items-center justify-center text-[#7A6548] hover:text-[#1A0F0A]"
        >
          <X className="w-4 h-4" aria-hidden />
        </button>
      )}
      {showList && (
        <ul id={listId} role="listbox" className="absolute left-0 right-0 top-full z-30 mt-1 max-h-[296px] overflow-y-auto bg-white border border-[#D4C4B0] shadow-[0_12px_32px_rgba(26,15,10,0.14)]">
          {results.map((place, i) => (
            <li
              key={`${place.name}-${place.lat}-${place.lon}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              // Keep the input focused so the blur handler does not close the list before the click lands.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(place)}
              onMouseEnter={() => setActive(i)}
              className={`flex items-baseline gap-2 px-3 py-3 cursor-pointer border-b border-[#F5F1EB] last:border-b-0 ${i === active ? "bg-[#FBF1DC]" : "bg-white"}`}
            >
              <span className="text-[15px] font-semibold text-[#1A0F0A]">{place.name}</span>
              {place.region && <span className="text-[13px] text-[#6B5D52]">{place.region}</span>}
            </li>
          ))}
          {results.length === 0 && (
            <li role="option" aria-selected={false} aria-disabled className="px-3 py-3 text-[14px] text-[#6B5D52]">
              {failed ? T.failed[lang] : T.none[lang]}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
