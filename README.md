# AstroConnect — Rajeshwari, Vedic astrologer in Jayanagar, Bangalore

A static website for Rajeshwari's astrology practice. It introduces her and her consultations, and gives
visitors six free Jyotish calculators that hand over to a personal reading by phone or WhatsApp.

"Static" means the whole site is plain HTML, CSS and JavaScript files. There is no server, database or
login behind it, so it can be hosted for free on GitHub Pages, Netlify, Cloudflare Pages or any ordinary
web host. The calculators run in the visitor's own browser; birth details are never sent anywhere.

The site is in English, Hindi and Kannada. The language button in the header switches between them.

## Pages

| Address | Page |
| --- | --- |
| `/` | Home: today's panchanga, the free tools, services and fees, about Rajeshwari, reviews, journal |
| `/birth-chart/` | Kundli: rashi chart and navamsa (North or South Indian style), graha positions, panchanga of birth, Vimshottari dasha |
| `/kundali-matching/` | Ashtakoota guna milan out of 36, with Nadi, Bhakoot, Gana and Mangal dosha checks |
| `/panchang/` | Daily panchanga for any date and place: tithi, nakshatra, yoga, karana, sunrise, Rahu Kala |
| `/horoscope/` | Rashi Phala: Chandra bala for the week and the transits of the slow grahas |
| `/dosha-check/` | Manglik, Kaal Sarp and Sade Sati, with dates |
| `/numerology/` | Mulank, Bhagyank and Namank, with the working shown |
| `/articles/` | The journal, with one page for each note |

## Run it

Node 18.17 or newer is needed.

```bash
npm ci               # install
npm run dev          # work on the site at http://localhost:3000, with live reload
npm run build        # write the finished website to ./out
npm start            # serve ./out at http://localhost:3000, the way a static host would
npm run test:astro   # check the astronomy against Swiss Ephemeris reference data
npm run lint
```

## Put it online

`npm run build` writes the complete website into the `out` folder. Putting the site online means
putting that folder on a web host.

**Netlify.** The repository carries a `netlify.toml`, so Netlify needs no settings typed in.

1. Sign in at [app.netlify.com](https://app.netlify.com) with your GitHub account.
2. Choose **Add new project → Import an existing project → GitHub** and allow Netlify to see this repository.
3. Pick the repository and the branch to publish (normally `main`), leave the build settings as Netlify
   shows them, and deploy.

Netlify gives the site an address ending in `netlify.app` and publishes again on every push to that
branch. A domain of your own is added under Domain management → Production domains. The sitemap and
the link-preview picture use the site's address without any setting; after renaming the site or adding
a domain, run one more deploy (Deploys → Trigger deploy) so they follow.

**Cloudflare Pages and similar hosts.** Connect the repository and set the build command to
`npm run build` and the output directory to `out`.

**Any other web host.** Run `npm run build` on your computer and upload everything inside `out`.

**GitHub Pages.** In the repository on GitHub, open Settings → Pages and set Source to "GitHub Actions".
Then add this file as `.github/workflows/pages.yml`. Every push to `main` rebuilds and publishes the site.

```yaml
name: Publish the website
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 22
          cache: npm
      - id: pages
        uses: actions/configure-pages@v6
      - run: npm ci
      - run: npm run build
        env:
          NEXT_PUBLIC_BASE_PATH: ${{ steps.pages.outputs.base_path }}
          NEXT_PUBLIC_SITE_URL: ${{ steps.pages.outputs.origin }}
      - uses: actions/upload-pages-artifact@v5
        with:
          path: out
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

The two `NEXT_PUBLIC_…` lines let the workflow work both for an address like
`https://name.github.io/astrology/` and for a custom domain, without further changes.

### Two optional settings

Both are read when the site is built. Set them in the host's build settings, or copy `.env.example` to
`.env.production` and fill them in.

| Setting | When it is needed | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_BASE_PATH` | The site lives in a folder of its domain instead of at the root. Without it, pictures and links break. | `/astrology` |
| `NEXT_PUBLIC_SITE_URL` | Optional. Gives the sitemap its addresses and lets WhatsApp and other apps show a picture when a link to the site is shared. | `https://www.example.com` |

To try a folder address locally: `NEXT_PUBLIC_BASE_PATH=/astrology npm run build`, then `npm start`.
The local server reads the folder from the build and serves the site at `http://localhost:3000/astrology/`.

## Change the content

| To change | Edit |
| --- | --- |
| Phone number, WhatsApp, Instagram, the consultations and their fees | `lib/site.ts` |
| Journal notes and client reviews | `lib/content.ts` |
| Text of the home page, in all three languages | `components/home/copy.ts` |
| Menu entries and the one-line descriptions of the tools | `lib/nav.ts` |
| Text of a tool page | the `T` list at the top of its file in `components/tools/` |
| Photograph, logo, link-preview picture | `public/` |

A new journal note needs only a new entry in `lib/content.ts`; the next build makes its page.

## How the calculators work

Everything is computed in the browser by the code in `lib/astro/`, on top of the
[astronomy-engine](https://github.com/cosinekitty/astronomy) library.

- Sidereal positions with the Lahiri ayanamsa, the mean lunar node and whole-sign houses.
- Birth times are read in the time zone of the birthplace, including its historical changes.
- The panchanga day runs from sunrise to the next sunrise; lunar months are named in the amanta reckoning.
- Planet positions agree with the Swiss Ephemeris to within 13 arc-seconds (the Moon within 5), and
  sunrise and sunset to within 4 seconds. `npm run test:astro` re-checks this, together with the
  dasha, matching, panchanga and numerology rules: 3,948 checks in all.
- Ashtakoota tables differ slightly between printed panchangas (a few cells of Vashya, Yoni and Gana),
  so another website can show a point or two more or less. The matching page says so.
- The place search uses 6,700 towns and cities (3,745 in India) from GeoNames, stored in
  `lib/astro/data/cities.json`. `scripts/build-cities.py` rebuilds the list.

A visitor's birth details, chosen language and chosen place are kept only in that browser's local
storage, so they do not have to be typed again.

## Layout of the project

```
app/                 one folder per page; layout.tsx is the frame around every page
components/home/     sections of the home page
components/tools/    the six calculators
components/astro/    shared parts: birth form, place search, chart drawing
components/journal/  journal list and note page
components/layout/   header, footer, "page not found"
lib/astro/           the astronomy and Jyotish calculations
lib/site.ts          contact details, services and fees
lib/content.ts       journal notes and reviews
public/              pictures, copied into the site as they are
scripts/serve.mjs    the small local server behind `npm start`
netlify.toml         how Netlify builds and serves the site
scripts/verify-astro.ts and scripts/fixtures/   the calculation checks
```

Built with Next.js (static export), React, TypeScript and Tailwind CSS. The fonts are bundled with the
site, and no page loads anything from another website.

## Credits

- Astronomy: [astronomy-engine](https://github.com/cosinekitty/astronomy) by Don Cross, MIT licence.
- Place names and coordinates: © [GeoNames](https://www.geonames.org/), CC BY 4.0.
- Typefaces: Cormorant Garamond, Source Sans 3, Noto Serif and Noto Sans (Devanagari and Kannada),
  SIL Open Font Licence, packaged by Fontsource.
