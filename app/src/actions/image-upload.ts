"use server";

import sharp from "sharp";
import { S3, PutObjectCommand } from "@aws-sdk/client-s3";

const PROFILE_IMAGE_WIDTH = 120;
const PROFILE_IMAGE_HEIGHT = 120;

const BANNER_IMAGE_WIDTH = 1184;
const BANNER_IMAGE_HEIGHT = 144;

const DO_SPACES_REGION = "ams3";
const DO_SPACES_BUCKET = "wiseoldman";
const DO_SPACES_ENDPOINT = "https://ams3.digitaloceanspaces.com";

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
  if (!process.env.DO_SPACES_ACCESS_KEY_ID || !process.env.DO_SPACES_SECRET_ACCESS_KEY) {
    throw new Error("Missing Digital Ocean Spaces credentials");
  }

  const s3Client = new S3({
    forcePathStyle: false,
    endpoint: DO_SPACES_ENDPOINT,
    region: DO_SPACES_REGION,
    credentials: {
      accessKeyId: process.env.DO_SPACES_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.DO_SPACES_SECRET_ACCESS_KEY ?? "",
    },
  });

  await s3Client.send(
    new PutObjectCommand({ Bucket: DO_SPACES_BUCKET, Key: fileName, Body: buffer, ACL: "public-read" })
  );

  return `https://${DO_SPACES_BUCKET}.${DO_SPACES_REGION}.cdn.digitaloceanspaces.com/${fileName}`;
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
