# Customization Guide - AstroConnect

## Branding

Change brand name, logo, tagline in:
- `lib/i18n.ts` - appName, tagline translations
- `components/layout/Header.tsx` - logo symbol ✦ and colors
- `tailwind.config.js` - cosmic colors
- `app/layout.tsx` - metadata title

Example:
```ts
// lib/i18n.ts
appName: "YourBrand",
tagline: "Your Tagline"
```

## Colors

Edit `tailwind.config.js`:
```js
colors: {
  midnight: { ... },
  cosmic: { purple: "#your", gold: "#your" }
}
```
And `app/globals.css` cosmic-bg gradient.

## Languages

Add new language:
1. Add to `Language` type in `lib/types.ts`
2. Add translation object in `lib/i18n.ts`
3. Add button in `Header.tsx` and `Sidebar.tsx`

Current: en, hi, kn. Example for Tamil:
```ts
ta: { appName: "...", ... }
```

## Low-end Device Mode

Toggle stored in Zustand `lowDataMode`. When ON:
- Disable framer-motion animations (check `lowDataMode` in components)
- Reduce image quality (add `?q=50` to Unsplash URLs)
- Disable blur effects (conditional class)
- Lazy load articles, astrologers

Implementation in `Sidebar.tsx` ToggleLowData. Use:
```ts
const { lowDataMode } = useAppStore();
if (lowDataMode) { /* simplified UI */ }
```

## Astrologers / Data

Edit `lib/seedData.ts` to add astrologers, articles, etc. For production, replace with API calls to `/api/astrologers`.

## Features Toggle

In `.env`:
```
ENABLE_AI_CHAT=true
ENABLE_VIDEO_CALL=true
ENABLE_WALLET=true
```

Check in components:
```ts
if (process.env.NEXT_PUBLIC_ENABLE_AI_CHAT) { ... }
```

## Adding New Category

1. Add to `specializations` list in seed
2. Add icon in home page Explore by Category
3. Add filter option in `app/astrologers/page.tsx`

## PWA / Installable

Add `public/manifest.json` and `next-pwa` plugin.

## Deployment

- Vercel: `vercel --prod`
- Docker: `docker build -t astroconnect .`
- Low-end VPS: `npm run build && npm start` uses ~100MB RAM

## Theming

The app uses glassmorphism: `bg-white/[0.06] backdrop-blur-xl border-white/10`. Change to solid for low-end:
```css
.low-data .glass { backdrop-filter: none; background: #15154f; }
```
