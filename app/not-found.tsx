import type { Metadata } from "next";
import { NotFoundView } from "@/components/layout/NotFoundView";

export const metadata: Metadata = { title: "Page not found" };

// Built as 404.html, which static hosts show for any address that has no page.
export default function NotFound() {
  return <NotFoundView />;
}
