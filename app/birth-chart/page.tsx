import type { Metadata } from "next";
import { KundliTool } from "@/components/tools/KundliTool";

export const metadata: Metadata = {
  title: "Free Kundli — birth chart, navamsa and dasha",
  description:
    "Make your Janma Kundli free: rashi chart and navamsa in North or South Indian style, graha positions, nakshatra, the panchanga of your birth and Vimshottari dasha. Lahiri ayanamsa.",
};

export default function Page() {
  return <KundliTool />;
}
