import { readdir, mkdir, writeFile } from 'fs/promises';
import { join, parse } from 'path';
import sharp from 'sharp';

const FULL_DIR  = 'public/photos/full';
const THUMB_DIR = 'public/photos/thumb';
const MANIFEST  = 'public/photos/manifest.json';

const THUMB_WIDTH = 200;
const THUMB_QUALITY = 75;

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

async function run() {
  await mkdir(THUMB_DIR, { recursive: true });

  const files = (await readdir(FULL_DIR))
    .filter(f => IMAGE_EXTS.has(parse(f).ext.toLowerCase()))
    .sort();

  console.log(`Found ${files.length} images in ${FULL_DIR}`);

  const manifest = [];
  let created = 0;
  let skipped = 0;

  for (const file of files) {
    const { name } = parse(file);
    const thumbName = `${name}.webp`;
    const srcPath = join(FULL_DIR, file);
    const outPath = join(THUMB_DIR, thumbName);

    try {
      await sharp(srcPath)
        .resize({ width: THUMB_WIDTH })
        .webp({ quality: THUMB_QUALITY })
        .toFile(outPath);
      created++;
    } catch (err) {
      console.warn(`  skip ${file}: ${err.message}`);
      skipped++;
      continue;
    }

    manifest.push({
      id: name,
      thumb: `photos/thumb/${thumbName}`,
      full: `photos/full/${file}`,
    });

    if (created % 50 === 0) console.log(`  ${created}/${files.length}...`);
  }

  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
  console.log(`Done — ${created} thumbnails, ${skipped} skipped, manifest written.`);
}

run().catch(err => { console.error(err); process.exit(1); });
