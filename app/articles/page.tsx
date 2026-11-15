import type { Metadata } from "next";
import { JournalIndex } from "@/components/journal/JournalIndex";

export const metadata: Metadata = {
  title: "Astrology Journal",
  description: "Notes by Rajeshwari, written in simple language from fifteen years of consultations: Kundli matching, career, Sade Sati, Vastu for flats and why she does not sell gemstones.",
};

export default function Page() {
  return <JournalIndex />;
}
