/** Question pictures under `public/img/`, without a leading slash (service-worker cache keys). */
export const QUESTION_IMAGE_PATHS = [
  "img/BB1.png",
  "img/BB8.png",
  "img/G130.png",
  "img/G176.png",
  "img/G181.png",
  "img/G187.png",
  "img/G209.png",
  "img/G21.png",
  "img/G216.png",
  "img/G226.png",
  "img/G235.png",
  "img/G55.png",
  "img/G70.png",
] as const;

/** Workbox globPatterns only (no separate includeAssets list, which would duplicate these files). */
export const PRECACHE_GLOBS = ["**/*.{js,css,html,ico,png,svg,webmanifest,json,woff2}"] as const;
