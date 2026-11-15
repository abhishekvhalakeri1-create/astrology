import type { MetadataRoute } from "next";
import { BASE_PATH, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    // The sitemap needs full addresses, so it is announced only when the site's address was given at build time.
    ...(SITE_URL ? { sitemap: `${SITE_URL}${BASE_PATH}/sitemap.xml` } : {}),
  };
}
