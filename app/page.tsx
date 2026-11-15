import { About } from "@/components/home/About";
import { Approach } from "@/components/home/Approach";
import { BookingCTA } from "@/components/home/BookingCTA";
import { Hero } from "@/components/home/Hero";
import { Journal } from "@/components/home/Journal";
import { RashiToday } from "@/components/home/RashiToday";
import { Reviews } from "@/components/home/Reviews";
import { Services } from "@/components/home/Services";
import { SkyNow } from "@/components/home/SkyNow";
import { TodayPanchang } from "@/components/home/TodayPanchang";
import { ToolsGrid } from "@/components/home/ToolsGrid";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TodayPanchang />
      <ToolsGrid />
      <Approach />
      <Services />
      <About />
      <SkyNow />
      <RashiToday />
      <Reviews />
      <Journal />
      <BookingCTA />
    </>
  );
}
