import type { Metadata } from "next";
import { DoshaTool } from "@/components/tools/DoshaTool";

export const metadata: Metadata = {
  title: "Manglik, Kaal Sarp and Sade Sati check",
  description:
    "Check Mangal dosha (Manglik), Kaal Sarp yoga and Sade Sati in your chart, free. Plain answers with the classical cancellations and the dates of every Sade Sati period in your life.",
};

export default function Page() {
  return <DoshaTool />;
}
