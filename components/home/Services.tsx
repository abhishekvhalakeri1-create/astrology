"use client";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { SERVICES, formatRupees, whatsappHref } from "@/lib/site";
import { useLang } from "@/lib/useLang";
import { HOME } from "./copy";

export function Services() {
  const lang = useLang();
  return (
    <section id="services" className="wash-warm border-y border-[#E8DDD0] scroll-mt-20">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <div className="max-w-[720px]">
          <div className="eyebrow">{HOME.servicesEyebrow[lang]}</div>
          <h2 className="mt-3 font-serif text-[32px] lg:text-[46px] text-[#1A0F0A]">{HOME.services[lang]}</h2>
          <p className="mt-4 text-[16px] lg:text-[17px] leading-[1.65] text-[#3D2F26]">{HOME.servicesIntro[lang]}</p>
        </div>

        <ul className="mt-8 lg:mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {SERVICES.map((service, i) => (
            <li key={service.id} className="card flex flex-col p-5 sm:p-6 lg:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8A6A2F]">
                    <span className="tabular">{String(i + 1).padStart(2, "0")}</span> • {service.sanskrit}
                  </div>
                  <h3 className="mt-2 font-serif text-[25px] lg:text-[28px] text-[#1A0F0A]">{service.title[lang]}</h3>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-serif text-[30px] lg:text-[34px] !leading-none text-[#7C2D2D] tabular">{formatRupees(service.price)}</div>
                  <div className="mt-1 text-[12.5px] text-[#5A4A3D] tabular">
                    {service.minutes} {HOME.minutes[lang]}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-[15px] leading-[1.65] text-[#3D2F26]">{service.description[lang]}</p>
              <div className="mt-auto pt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                <a
                  href={whatsappHref(`Namaste Rajeshwari madam, I would like to book: ${service.title.en} (${formatRupees(service.price)}, ${service.minutes} min).`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ink !min-h-[46px] !px-5 !text-[14px]"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden /> {HOME.bookOnWhatsApp[lang]}
                </a>
                {service.tool && (
                  <Link href={service.tool.href} className="inline-flex items-center gap-1.5 min-h-[44px] text-[14px] font-semibold text-[#7C2D2D] underline underline-offset-4 decoration-[#C9A86A] hover:decoration-[#7C2D2D]">
                    {service.tool.label[lang]} <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
