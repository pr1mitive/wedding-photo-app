import sharp from 'sharp';

export async function createImageVariants(fileBuffer: Buffer) {
  const original = fileBuffer;

  const display = await sharp(fileBuffer)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toBuffer();

  const thumb = await sharp(fileBuffer)
    .rotate()
    .resize({ width: 320, height: 320, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 75 })
    .toBuffer();

  const meta = await sharp(fileBuffer).metadata();

  return {
    original,
    display,
    thumb,
    meta,
  };
}
