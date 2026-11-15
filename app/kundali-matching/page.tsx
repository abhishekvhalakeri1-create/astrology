import type { Metadata } from "next";
import { MatchingTool } from "@/components/tools/MatchingTool";

export const metadata: Metadata = {
  title: "Kundli Matching — free Guna Milan out of 36",
  description:
    "Free Kundli matching for marriage: Ashtakoota guna milan out of 36 with all eight kootas explained, plus Nadi, Bhakoot, Gana and Mangal dosha checks. Lahiri ayanamsa. Calculated on your own device.",
};

export default function Page() {
  return <MatchingTool />;
}
