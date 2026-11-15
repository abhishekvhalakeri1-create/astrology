import type { Metadata } from "next";
import { RashiTool } from "@/components/tools/RashiTool";

export const metadata: Metadata = {
  title: "Rashi Phala — today’s Chandra bala for your rashi",
  description:
    "Rashi phala from the real sky: where the Moon stands from your rashi today and this week (Chandra bala, Chandrashtama), and the transits of Shani, Guru, Rahu and Ketu.",
};

export default function Page() {
  return <RashiTool />;
}
