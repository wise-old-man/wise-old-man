"use server";

import { PutObjectCommand, S3 } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { BANNER_IMAGE_SIZE, HIGH_DPI_SCALE, PROFILE_IMAGE_SIZE } from "~/utils/images";

const CLOUDFLARE_R2_BUCKET = "wiseoldman";
const CLOUDFLARE_R2_ENDPOINT = "https://13b21f75511ce31dd03fe199ab998062.r2.cloudflarestorage.com";

const COMPRESSION_QUALITY = 90;

async function processImage(file: File, size: { width: number; height: number }) {
  if (!file.type.startsWith("image/")) throw new Error("File type not accepted.");

  const imageBuffer = await file.arrayBuffer();

  // Only store at high-DPI scale if the source can fill it, to avoid upscaling small images
  const metadata = await sharp(imageBuffer).metadata();

  const canFillHighDpi =
    (metadata.width ?? 0) >= size.width * HIGH_DPI_SCALE &&
    (metadata.height ?? 0) >= size.height * HIGH_DPI_SCALE;

  const scale = canFillHighDpi ? HIGH_DPI_SCALE : 1;
  const width = size.width * scale;
  const height = size.height * scale;

  if (file.type === "image/gif" || file.type === "image/webp") {
    return {
      type: "webp",
      buffer: await sharp(imageBuffer, { animated: true })
        .resize(width, height)
        .webp({ quality: COMPRESSION_QUALITY })
        .toBuffer(),
    };
  }

  if (file.type === "image/png") {
    return {
      type: "png",
      buffer: await sharp(imageBuffer)
        .resize(width, height)
        .png({ quality: COMPRESSION_QUALITY })
        .toBuffer(),
    };
  }

  return {
    type: "jpeg",
    buffer: await sharp(imageBuffer)
      .resize(width, height)
      .jpeg({ quality: COMPRESSION_QUALITY })
      .toBuffer(),
  };
}

async function uploadToS3(fileName: string, buffer: Buffer) {
  if (!process.env.APP_CLOUDFLARE_R2_ACCESS_KEY_ID || !process.env.APP_CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
    throw new Error("Missing Cloudflare R2 credentials");
  }

  const s3Client = new S3({
    region: "auto",
    forcePathStyle: false,
    endpoint: CLOUDFLARE_R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.APP_CLOUDFLARE_R2_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.APP_CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? "",
    },
  });

  await s3Client.send(
    new PutObjectCommand({
      Bucket: CLOUDFLARE_R2_BUCKET,
      Key: fileName,
      Body: buffer,
      ACL: "public-read",
    }),
  );

  return `https://img.wiseoldman.net/${fileName}`;
}

export async function uploadProfileImage(formData: FormData) {
  const file = formData.get("profileImage") as File;

  if (!file) throw new Error("No file provided");

  const { type, buffer } = await processImage(file, PROFILE_IMAGE_SIZE);

  return await uploadToS3(`images/${Date.now().toString()}.${type}`, buffer);
}

export async function uploadBannerImage(formData: FormData) {
  const file = formData.get("bannerImage") as File;

  if (!file) throw new Error("No file provided");

  const { type, buffer } = await processImage(file, BANNER_IMAGE_SIZE);

  return await uploadToS3(`images/${Date.now().toString()}.${type}`, buffer);
}
