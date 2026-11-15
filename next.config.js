// The site is a static website: `npm run build` writes every page as plain HTML, CSS and JavaScript
// into ./out, and that folder can be uploaded to any web host. Nothing runs on a server.

// Set NEXT_PUBLIC_BASE_PATH when the site lives in a folder of its domain rather than at the root,
// e.g. "/astrology" for https://name.github.io/astrology/. See README.md.
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/+$/, '');
if (basePath && !basePath.startsWith('/')) {
  throw new Error(`NEXT_PUBLIC_BASE_PATH must start with "/", for example "/astrology". Got "${basePath}".`);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Each page is written as <name>/index.html, which every static host serves without extra rules.
  trailingSlash: true,
  basePath: basePath || undefined,
  reactStrictMode: true,
  // There is no server to resize pictures; the ones in /public are already the right size.
  images: { unoptimized: true },
  env: {
    // The year of the build, so the built pages and the browser agree on it. See lib/useLang.ts.
    NEXT_PUBLIC_BUILD_YEAR: String(new Date().getFullYear()),
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

module.exports = nextConfig;
