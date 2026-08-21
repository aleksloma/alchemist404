/**
 * process-assets.mjs
 * One-time asset pipeline: reads the RAW asset folders at the repo root
 * (read-only inputs, never modified) and writes optimized web assets into
 * site/src/assets/ and site/public/.
 *
 * Folder and file names contain Georgian and accented characters, so inputs
 * are found by listing directories and matching Unicode-normalized (NFC)
 * patterns, never by hard-coded literal paths.
 *
 * Run with: npm run assets
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { unzipSync } from 'fflate';
import pngToIco from 'png-to-ico';
import wawoff2 from 'wawoff2';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SITE = path.resolve(__dirname, '..');
const IMG_OUT = path.join(SITE, 'src', 'assets', 'img');
const FONT_OUT = path.join(SITE, 'src', 'assets', 'fonts');
const PUBLIC_OUT = path.join(SITE, 'public');

const WEBP_QUALITY = 80;

const nfc = (s) => s.normalize('NFC');

/** List entries of a directory, names NFC-normalized, paired with real paths. */
async function listDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.map((e) => ({
    name: nfc(e.name),
    path: path.join(dir, e.name),
    isDir: e.isDirectory(),
  }));
}

/** Find exactly one entry whose normalized name matches the regex. Fail loudly. */
function findOne(entries, regex, what) {
  const matches = entries.filter((e) => regex.test(e.name));
  if (matches.length === 0) {
    throw new Error(`Input not found: ${what} (pattern ${regex}) among: ${entries.map((e) => e.name).join(', ')}`);
  }
  if (matches.length > 1) {
    throw new Error(`Ambiguous input for ${what}: ${matches.map((e) => e.name).join(', ')}`);
  }
  return matches[0];
}

async function outputSize(file) {
  const st = await fs.stat(file);
  return `${(st.size / 1024).toFixed(0)} KB`;
}

async function writeWebp(input, outName, resize, extra = {}) {
  const out = path.join(IMG_OUT, outName);
  await sharp(input).resize(resize).webp({ quality: WEBP_QUALITY, ...extra }).toFile(out);
  console.log(`  ${outName}  ${await outputSize(out)}`);
}

async function writePng(input, outName, resize) {
  const out = path.join(IMG_OUT, outName);
  await sharp(input).resize(resize).png({ compressionLevel: 9, palette: true }).toFile(out);
  console.log(`  ${outName}  ${await outputSize(out)}`);
}

async function main() {
  await fs.mkdir(IMG_OUT, { recursive: true });
  await fs.mkdir(FONT_OUT, { recursive: true });
  await fs.mkdir(PUBLIC_OUT, { recursive: true });

  const rootEntries = await listDir(REPO_ROOT);
  // "საიტის ვიზუალები" = "site visuals"
  const visualsDir = findOne(rootEntries, /ვიზუალები/, 'site visuals folder').path;
  const photosDir = findOne(rootEntries, /photos and bios/i, 'team photos folder').path;

  const visuals = await listDir(visualsDir);
  const subdir = (re, what) => findOne(visuals, re, what).path;

  // --- Background (opaque, hero backdrop) -------------------------------
  console.log('Background:');
  const bgDir = await listDir(subdir(/^background$/i, 'background folder'));
  const bg = findOne(bgDir, /\.png$/i, 'background art');
  await writeWebp(bg.path, 'bg-hero-1920.webp', { width: 1920 });
  await writeWebp(bg.path, 'bg-hero-960.webp', { width: 960 });

  // --- Logo (transparent, hero + footer) --------------------------------
  // "ლოგო სათაურით" = "logo with title"; use the "(1)" version per DESIGN.md
  console.log('Logo:');
  const logoDir = await listDir(subdir(/ლოგო/, 'logo folder'));
  const logo = findOne(logoDir, /\(1\)\.png$/i, 'logo (1).png');
  await writeWebp(logo.path, 'logo-800.webp', { width: 800 });
  await writePng(logo.path, 'logo-800.png', { width: 800 });

  // --- Open Graph image (logo on ink background, 1200x630) --------------
  console.log('Open Graph image:');
  const ogLogo = await sharp(logo.path).resize({ width: 900 }).png().toBuffer();
  const ogOut = path.join(PUBLIC_OUT, 'og-logo.png');
  await sharp({
    create: { width: 1200, height: 630, channels: 4, background: { r: 13, g: 17, b: 21, alpha: 1 } },
  })
    .composite([{ input: ogLogo, gravity: 'center' }])
    .png({ compressionLevel: 9, palette: true })
    .toFile(ogOut);
  console.log(`  og-logo.png  ${await outputSize(ogOut)}`);

  // --- Favicon set -------------------------------------------------------
  console.log('Favicons:');
  const favDir = await listDir(subdir(/^favicon$/i, 'favicon folder'));
  const favSrc = findOne(favDir, /\.png$/i, 'favicon source');
  // The 404 mark is wide (1448x698): pad to square on transparent background.
  const favSquare = await sharp(favSrc.path)
    .trim()
    .resize({ width: 512, height: 512, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  for (const [size, name] of [[512, 'icon-512.png'], [180, 'apple-touch-icon.png'], [32, 'favicon-32.png']]) {
    const out = path.join(PUBLIC_OUT, name);
    await sharp(favSquare).resize(size, size).png().toFile(out);
    console.log(`  ${name}  ${await outputSize(out)}`);
  }
  const ico = await pngToIco([path.join(PUBLIC_OUT, 'favicon-32.png')]);
  await fs.writeFile(path.join(PUBLIC_OUT, 'favicon.ico'), ico);
  console.log(`  favicon.ico  ${await outputSize(path.join(PUBLIC_OUT, 'favicon.ico'))}`);

  // --- Frames and plaque (transparent outsides -> keep PNG fallback) ----
  // "აღწერის ფანჯარა" = "description window" (tutorial window frame)
  console.log('Tutorial window frame:');
  const tutDir = await listDir(subdir(/ფანჯარა/, 'description window folder'));
  const tutorial = findOne(tutDir, /Window \(2\)\.png$/i, 'Turorial_Window (2).png');
  await writeWebp(tutorial.path, 'frame-tutorial.webp', { width: 1600 });
  await writePng(tutorial.path, 'frame-tutorial.png', { width: 1600 });

  // Pressed-state gem sprites for the About pager. The two variants are
  // gem-only 5000x3000 canvases: "butons Left " has the LEFT gem pink,
  // "butonsright" has the RIGHT gem pink. Take the relevant half and trim.
  console.log('Pager pressed gems:');
  const pressedVariants = [
    { match: /butons Left/i, half: 'left', out: 'gem-left-pressed' },
    { match: /butonsright/i, half: 'right', out: 'gem-right-pressed' },
  ];
  for (const v of pressedVariants) {
    const src = findOne(tutDir, v.match, v.out);
    const meta = await sharp(src.path).metadata();
    const halfW = Math.floor(meta.width / 2);
    const region = { left: v.half === 'left' ? 0 : halfW, top: 0, width: halfW, height: meta.height };
    // Two stages: sharp applies trim before extract within a single pipeline,
    // so extract the half first, then trim the resulting buffer.
    const halfBuf = await sharp(src.path).extract(region).png().toBuffer();
    await sharp(halfBuf).trim().resize({ width: 140 }).webp({ quality: WEBP_QUALITY }).toFile(path.join(IMG_OUT, `${v.out}.webp`));
    console.log(`  ${v.out}.webp  ${await outputSize(path.join(IMG_OUT, `${v.out}.webp`))}`);
    await sharp(halfBuf).trim().resize({ width: 140 }).png({ compressionLevel: 9 }).toFile(path.join(IMG_OUT, `${v.out}.png`));
    console.log(`  ${v.out}.png  ${await outputSize(path.join(IMG_OUT, `${v.out}.png`))}`);
  }

  // "ღილაკი" = "button" (dark plaque with gem arrows)
  console.log('Plaque:');
  const btnDir = await listDir(subdir(/ღილაკი/, 'button folder'));
  const plaque = findOne(btnDir, /\.png$/i, 'plaque');
  await writeWebp(plaque.path, 'plaque.webp', { width: 800 });
  await writePng(plaque.path, 'plaque.png', { width: 800 });

  // "ჩარჩო screenshot-ებისთვის" = "frame for screenshots" (landscape)
  console.log('Screenshot frame:');
  const shotFrameDir = await listDir(subdir(/screenshot/i, 'screenshot frame folder'));
  const shotFrame = findOne(shotFrameDir, /\.png$/i, 'screenshot frame');
  await writeWebp(shotFrame.path, 'frame-screenshot.webp', { width: 1200 });
  await writePng(shotFrame.path, 'frame-screenshot.png', { width: 1200 });

  // "ჩარჩო წევრების ფოტოებისთვის" = "frame for member photos" (portrait)
  console.log('Member frame:');
  const memberFrameDir = await listDir(subdir(/წევრების/, 'member frame folder'));
  const memberFrame = findOne(memberFrameDir, /\.png$/i, 'member frame');
  await writeWebp(memberFrame.path, 'frame-member.webp', { width: 720 });
  await writePng(memberFrame.path, 'frame-member.png', { width: 720 });

  // --- Real gameplay screenshots (1920x1080, opaque -> WebP + JPEG) -----
  // From "screnshots + additional info/" (folder name spelled exactly so).
  console.log('Gameplay screenshots:');
  // Remove obsolete placeholder outputs from the earlier milestone.
  for (const old of await fs.readdir(IMG_OUT)) {
    if (/^screenshot-placeholder-/.test(nfc(old))) {
      await fs.unlink(path.join(IMG_OUT, old));
      console.log(`  removed obsolete ${old}`);
    }
  }
  const shotsDir = findOne(rootEntries, /screnshots/i, 'screenshots folder').path;
  const shotFiles = await listDir(shotsDir);
  const shots = [
    { match: /^image\.png$/i, out: 'shot-1' },
    { match: /^image \(1\)\.png$/i, out: 'shot-2' },
    { match: /^image \(2\)\.png$/i, out: 'shot-3' },
    { match: /^image \(3\)\.png$/i, out: 'shot-4' },
    { match: /^image \(4\)\.png$/i, out: 'shot-5' },
  ];
  for (const s of shots) {
    const src = findOne(shotFiles, s.match, s.out);
    for (const width of [1600, 800]) {
      const webpOut = path.join(IMG_OUT, `${s.out}-${width}.webp`);
      await sharp(src.path).resize({ width }).webp({ quality: WEBP_QUALITY }).toFile(webpOut);
      console.log(`  ${s.out}-${width}.webp  ${await outputSize(webpOut)}`);
      const jpgOut = path.join(IMG_OUT, `${s.out}-${width}.jpg`);
      await sharp(src.path).resize({ width }).jpeg({ quality: 78, mozjpeg: true }).toFile(jpgOut);
      console.log(`  ${s.out}-${width}.jpg  ${await outputSize(jpgOut)}`);
    }
  }

  // --- Team photos (square crop 640, WebP only, no transparency) --------
  console.log('Team photos:');
  const photos = await listDir(photosDir);
  const team = [
    { match: /taso gegia\.(jpg|png)$/i, out: 'team-anastasia.webp' },
    { match: /Jamie Mullis\.(jpg|png)$/i, out: 'team-jamie.webp' },
    { match: /Davis Von Randow\.(jpg|png)$/i, out: 'team-davis.webp' },
    { match: /Jacob Williams\.(jpg|png)$/i, out: 'team-jacob.webp' },
    { match: /Dragadin\.(jpg|png)$/i, out: 'team-dragadin.webp' },
    { match: /სიმონიშვილი\.(jpg|png)$/i, out: 'team-mariam.webp' }, // მარიამ სიმონიშვილი.jpg
  ];
  for (const t of team) {
    const src = findOne(photos, t.match, t.out);
    const out = path.join(IMG_OUT, t.out);
    await sharp(src.path)
      .rotate() // respect EXIF orientation
      .resize({ width: 640, height: 640, fit: 'cover', position: sharp.strategy.attention })
      .webp({ quality: WEBP_QUALITY })
      .toFile(out);
    console.log(`  ${t.out}  ${await outputSize(out)}`);
  }

  // --- Fonts: unzip Comic Relief, keep OFL.txt, generate woff2 ----------
  // "ტექსტის ფონტი" = "text font"
  console.log('Fonts:');
  const fontDir = await listDir(subdir(/ფონტი/, 'font folder'));
  const zipEntry = findOne(fontDir, /\.zip$/i, 'Comic_Relief.zip');
  const zipData = await fs.readFile(zipEntry.path);
  const unzipped = unzipSync(new Uint8Array(zipData));
  for (const [entryName, data] of Object.entries(unzipped)) {
    const base = nfc(path.basename(entryName));
    if (!/\.(ttf|txt)$/i.test(base) || data.length === 0) continue;
    const outPath = path.join(FONT_OUT, base);
    await fs.writeFile(outPath, data);
    console.log(`  ${base}  ${await outputSize(outPath)}`);
    if (/\.ttf$/i.test(base)) {
      const woff2 = await wawoff2.compress(data);
      const woffPath = outPath.replace(/\.ttf$/i, '.woff2');
      await fs.writeFile(woffPath, woff2);
      console.log(`  ${path.basename(woffPath)}  ${await outputSize(woffPath)}`);
    }
  }
  const fontFiles = await fs.readdir(FONT_OUT);
  for (const required of ['ComicRelief-Regular.woff2', 'ComicRelief-Bold.woff2', 'OFL.txt']) {
    if (!fontFiles.some((f) => nfc(f).toLowerCase() === required.toLowerCase())) {
      throw new Error(`Font pipeline missing expected output: ${required} (have: ${fontFiles.join(', ')})`);
    }
  }

  console.log('\nAsset processing complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
