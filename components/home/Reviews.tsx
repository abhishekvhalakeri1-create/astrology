"use client";
import { Quote, Star } from "lucide-react";
import { REVIEWS } from "@/lib/content";
import { useLang } from "@/lib/useLang";
import { HOME } from "./copy";

/** The opening sentences of a review, word for word, up to about `max` characters and never cut mid-sentence. */
function opening(text: string, max: number): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  let out = "";
  for (const sentence of sentences) {
    if (out && out.length + sentence.length > max) break;
    out += sentence;
  }
  return out.trim();
}

export function Reviews() {
  const lang = useLang();
  // The fourth review is the one quoted in full above the list.
  const shown = REVIEWS.filter((r) => r.id !== "rev-4").slice(0, 3);
  return (
    <section id="reviews" className="max-w-[1280px] mx-auto px-4 lg:px-8 py-12 lg:py-24 scroll-mt-20">
      <div className="eyebrow">{HOME.reviewsEyebrow[lang]}</div>
      <h2 className="mt-3 font-serif text-[32px] lg:text-[46px] text-[#1A0F0A]">{HOME.reviewsHead[lang]}</h2>

      <figure className="mt-8 lg:mt-12 grid gap-5 lg:grid-cols-[auto_1fr] lg:gap-10">
        <Quote className="w-10 h-10 lg:w-16 lg:h-16 text-[#C9A86A] fill-[#C9A86A]/25" strokeWidth={1} aria-hidden />
        <div>
          <blockquote className="font-serif !font-medium text-[25px] sm:text-[30px] lg:text-[40px] !leading-[1.25] !tracking-[-0.015em] text-[#1A0F0A] max-w-[980px]">{HOME.testimonial[lang]}</blockquote>
          <figcaption className="mt-5 lg:mt-7 text-[14.5px] lg:text-[15.5px] text-[#5A4A3D]">{HOME.testimonialBy[lang]}</figcaption>
        </div>
      </figure>

      <ul className="mt-10 lg:mt-16 grid gap-px bg-[#E8DDD0] border border-[#E8DDD0] md:grid-cols-3">
        {shown.map((review) => (
          <li key={review.id} className="bg-white p-5 sm:p-6 lg:p-8 flex flex-col">
            <div className="flex gap-0.5" role="img" aria-label={`${review.rating} / 5`}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-[#C9A86A] text-[#C9A86A]" : "text-[#E8DDD0]"}`} aria-hidden />
              ))}
            </div>
            <blockquote className="mt-4 text-[15.5px] leading-[1.7] text-[#2C1810]" lang="en">
              {opening(review.comment, 230)}
            </blockquote>
            <div className="mt-auto pt-5 text-[14px] font-semibold text-[#1A0F0A]">{review.name}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
