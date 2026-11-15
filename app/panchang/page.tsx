import type { Metadata } from "next";
import { PanchangTool } from "@/components/tools/PanchangTool";

export const metadata: Metadata = {
  title: "Today’s Panchanga — tithi, nakshatra, Rahu Kala",
  description:
    "Daily Panchanga for Bengaluru or any town: tithi, vara, nakshatra, yoga and karana with end times, sunrise, sunset, moonrise, Rahu Kala, Yamaganda, Gulika and Abhijit muhurta.",
};

export default function Page() {
  return <PanchangTool />;
}
