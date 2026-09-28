/**
 * Generates PWA icons (192/512 + 512 maskable) from a hand-authored vector
 * mark — no fonts required. Run: `node scripts/generate-pwa-icons.mjs`
 * Output: public/icons/icon-*.png (committed).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "icons");
mkdirSync(outDir, { recursive: true });

const BLUE = "#2563eb";
const WHITE = "#ffffff";

// Shield + check mark (lucide-style paths), drawn on a 512 canvas.
function svgMark(pad) {
  const s = 512 - pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="116" fill="${BLUE}"/>
  <g transform="translate(${pad},${pad}) scale(${s / 24})" fill="none" stroke="${WHITE}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
    <path d="m9 12 2 2 4-4"/>
  </g>
</svg>`;
}

const targets = [
  { file: "icon-192.png", size: 192, pad: 64 },
  { file: "icon-512.png", size: 512, pad: 64 },
  // Maskable: full-bleed background with the mark at ~66% (safe zone).
  { file: "maskable-512.png", size: 512, pad: 86 },
];

for (const t of targets) {
  const png = await sharp(Buffer.from(svgMark(t.pad)))
    .resize(t.size, t.size)
    .png()
    .toBuffer();
  writeFileSync(join(outDir, t.file), png);
  console.log(`wrote public/icons/${t.file} (${png.length} bytes)`);
}
