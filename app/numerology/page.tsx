import type { Metadata } from "next";
import { NumerologyTool } from "@/components/tools/NumerologyTool";

export const metadata: Metadata = {
  title: "Numerology — Mulank, Bhagyank and name number",
  description:
    "Free numerology calculator: Mulank (birth number), Bhagyank (destiny number) and Namank (Chaldean name number), with the ruling graha and the full working shown.",
};

export default function Page() {
  return <NumerologyTool />;
}
