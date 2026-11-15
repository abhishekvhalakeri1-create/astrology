import type { MetadataRoute } from "next";
import { ARTICLES, articleHref } from "@/lib/content";
import { JOURNAL_LINK, TOOLS } from "@/lib/nav";
import { BASE_PATH, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/**
 * Every page of the site, for search engines. A sitemap must carry full addresses, so the list is empty
 * unless NEXT_PUBLIC_SITE_URL was set when the site was built.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!SITE_URL) return [];
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${BASE_PATH}${path === "/" ? "" : path}/`,
    priority,
  });
  return [
    page("/", 1),
    ...TOOLS.map((tool) => page(tool.href, 0.8)),
    page(JOURNAL_LINK.href, 0.6),
    ...ARTICLES.map((article) => page(articleHref(article), 0.5)),
  ];
}
