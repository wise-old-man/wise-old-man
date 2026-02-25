"use server";

import sharp from "sharp";
import { S3, PutObjectCommand } from "@aws-sdk/client-s3";

const PROFILE_IMAGE_WIDTH = 120;
const PROFILE_IMAGE_HEIGHT = 120;

const BANNER_IMAGE_WIDTH = 1184;
const BANNER_IMAGE_HEIGHT = 144;

const CLOUDFLARE_R2_BUCKET = "wiseoldman";
const CLOUDFLARE_R2_ENDPOINT = "https://13b21f75511ce31dd03fe199ab998062.r2.cloudflarestorage.com";

const COMPRESSION_QUALITY = 80;

async function processImage(file: File, width: number, height: number) {
  if (!file.type.startsWith("image/")) throw new Error("File type not accepted.");

  const imageBuffer = await file.arrayBuffer();

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
  if (!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || !process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
    throw new Error("Missing Cloudflare R2 credentials");
  }

  const s3Client = new S3({
    region: "auto",
    forcePathStyle: false,
    endpoint: CLOUDFLARE_R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? "",
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

  const { type, buffer } = await processImage(file, PROFILE_IMAGE_WIDTH, PROFILE_IMAGE_HEIGHT);

  return await uploadToS3(`images/${Date.now().toString()}.${type}`, buffer);
}

export async function uploadBannerImage(formData: FormData) {
  const file = formData.get("bannerImage") as File;

  if (!file) throw new Error("No file provided");

  const { type, buffer } = await processImage(file, BANNER_IMAGE_WIDTH, BANNER_IMAGE_HEIGHT);

  return await uploadToS3(`images/${Date.now().toString()}.${type}`, buffer);
}
