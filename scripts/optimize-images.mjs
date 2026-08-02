import sharp from "sharp";
import { mkdir, readdir } from "node:fs/promises";
import { extname, join, parse } from "node:path";

const sourceDir = new URL("../public/images/source-document/", import.meta.url);
const outputDir = new URL("../public/images/site/", import.meta.url);
const allowed = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const referenceOnly = new Set(["VA Poster 8.png"]);

await mkdir(outputDir, { recursive: true });
const files = (await readdir(sourceDir)).filter((file) => allowed.has(extname(file).toLowerCase()) && !referenceOnly.has(file));

for (const file of files) {
  const input = join(sourceDir.pathname, file);
  const stem = parse(file).name;
  const metadata = await sharp(input).metadata();
  const sourceWidth = metadata.width ?? 1600;
  const widths = [...new Set([Math.min(800, sourceWidth), Math.min(1600, sourceWidth)])];
  for (const targetWidth of widths) {
    await sharp(input)
      .rotate()
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(join(outputDir.pathname, `${stem}-${targetWidth}.webp`));
  }
}

console.log(`Optimized ${files.length} source images into ${outputDir.pathname}`);
