import { put, del } from '@vercel/blob';
import sharp from 'sharp';
import { pieceHash, generateSerial } from '@/lib/utils';

export async function processUpload(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const checksum = pieceHash(bytes);
  const pieceId = checksum;
  const serial = generateSerial();

  const watermark = (text: string) =>
    `<svg width="2048" height="2048"><style>text{font-family:monospace;fill:rgba(220,240,240,.45);font-size:24px;}</style><text x="40" y="2000">${text}</text></svg>`;

  const image = sharp(bytes).rotate();
  const metadata = await image.metadata();

  const viewerBuffer = await image
    .clone()
    .resize({ width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true })
    .composite([{ input: Buffer.from(watermark(`gleetching // ${pieceId.slice(0, 12)} // ${serial}`)), gravity: 'southwest' }])
    .webp({ quality: 92 })
    .toBuffer();

  const pngBuffer = await image
    .clone()
    .resize({ width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const thumbBuffer = await image.clone().resize({ width: 384, height: 384, fit: 'cover' }).webp({ quality: 88 }).toBuffer();

  const base = `archive/${pieceId.slice(0, 10)}`;
  const viewer = await put(`${base}-viewer.webp`, viewerBuffer, { access: 'public' });
  const png = await put(`${base}-viewer.png`, pngBuffer, { access: 'public' });
  const thumb = await put(`${base}-thumb.webp`, thumbBuffer, { access: 'public' });

  return {
    pieceId,
    serial,
    checksum,
    viewerUrl: viewer.url,
    pngUrl: png.url,
    thumbUrl: thumb.url,
    width: metadata.width ?? 0,
    height: metadata.height ?? 0
  };
}

export async function deleteBlobAssets(urls: string[]) {
  await Promise.all(urls.map((url) => del(url).catch(() => null)));
}
