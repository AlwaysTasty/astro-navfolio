// Regenerates every favicon, app icon and the default social image from public/logo.svg.
// Run with: node scripts/build-brand-assets.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const logo = readFileSync('public/logo.svg');
const WHITE = '#ffffff';
const PAPER = '#fdfdf9';

// Logo centred on a square or banner, `pad` being the margin as a fraction of the shorter side.
async function render(width, height, { pad, bg = WHITE }) {
  const mark = await sharp(logo, { density: 400 })
    .resize({ height: Math.round(Math.min(width, height) * (1 - 2 * pad)) })
    .png()
    .toBuffer();
  return sharp({ create: { width, height, channels: 4, background: bg } })
    .composite([{ input: mark, gravity: 'centre' }])
    .png()
    .toBuffer();
}

const save = async (path, width, height, opts) =>
  writeFileSync(path, await render(width, height, opts));

const squares = {
  'favicon-16x16': [16, 0.06],
  'favicon-32x32': [32, 0.08],
  'favicon-96x96': [96, 0.1],
  'apple-touch-icon': [180, 0.14],
  'apple-icon': [180, 0.14],
  'apple-icon-precomposed': [180, 0.14],
  'ms-icon-70x70': [70, 0.12],
  'ms-icon-144x144': [144, 0.12],
  'ms-icon-150x150': [150, 0.12],
  'ms-icon-310x310': [310, 0.12],
  // Maskable icons keep the mark inside the central safe zone.
  'web-app-manifest-192x192': [192, 0.22],
  'web-app-manifest-512x512': [512, 0.22],
};
for (const size of [57, 60, 72, 76, 114, 120, 144, 152, 180])
  squares[`apple-icon-${size}x${size}`] = [size, 0.14];
for (const size of [36, 48, 72, 96, 144, 192])
  squares[`android-icon-${size}x${size}`] = [size, 0.12];

for (const [name, [size, pad]] of Object.entries(squares))
  await save(`public/${name}.png`, size, size, { pad });

// favicon.ico: an ICO container holding PNG images (supported by every current browser).
const icoSizes = [16, 32, 48];
const images = await Promise.all(icoSizes.map((size) => render(size, size, { pad: 0.08 })));
const header = Buffer.alloc(6 + 16 * images.length);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = header.length;
images.forEach((png, i) => {
  const at = 6 + 16 * i;
  header.writeUInt8(icoSizes[i], at);
  header.writeUInt8(icoSizes[i], at + 1);
  header.writeUInt16LE(1, at + 4);
  header.writeUInt16LE(32, at + 6);
  header.writeUInt32LE(png.length, at + 8);
  header.writeUInt32LE(offset, at + 12);
  offset += png.length;
});
writeFileSync('public/favicon.ico', Buffer.concat([header, ...images]));

// Default Open Graph / Twitter image, used by pages that don't set their own.
mkdirSync('src/assets/brand', { recursive: true });
await save('src/assets/brand/og-image.png', 1200, 630, { pad: 0.12, bg: PAPER });
console.log('Brand assets written.');
