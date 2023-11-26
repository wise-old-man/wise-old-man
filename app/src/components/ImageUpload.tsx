"use client";

import Image from "next/image";
import { useRef } from "react";
// @ts-ignore
import { useFormStatus } from "react-dom";
import { uploadBannerImage, uploadProfileImage } from "~/actions/image-upload";

import ImageIcon from "~/assets/image.svg";
import LoadingIcon from "~/assets/loading.svg";
import { cn } from "~/utils/styling";

interface ProfileImageUploadProps {
  profileImage?: string;
  onImageUploaded: (newImageURL: string) => void;
}

export function ProfileImageUpload(props: ProfileImageUploadProps) {
  const { profileImage, onImageUploaded } = props;

  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUploadProfileImage(formData: FormData) {
    const url = await uploadProfileImage(formData);
    onImageUploaded(url);
  }

  return (
    <form action={handleUploadProfileImage} ref={formRef}>
      <input
        ref={fileInputRef}
        type="file"
        name="profileImage"
        accept=".png, .jpg, .jpeg, .gif, .webp"
        className="hidden"
        onChange={(e) => {
          if (!formRef.current) return;
          if (!("files" in e.target) || (e.target.files as FileList).length === 0) return;

          formRef.current.requestSubmit();
        }}
      />
      <ProfileImageUploadTrigger
        onClick={() => {
          if (!fileInputRef.current) return;
          fileInputRef.current.click();
        }}
        previewImageURL={profileImage}
      />
    </form>
  );
}

interface ProfileImageUploadTriggerProps {
  onClick: () => void;
  previewImageURL?: string;
}

function ProfileImageUploadTrigger(props: ProfileImageUploadTriggerProps) {
  const { onClick, previewImageURL } = props;
  const { pending } = useFormStatus();

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative h-[7.5rem] w-[7.5rem] overflow-hidden rounded-full border border-gray-400 bg-gray-950 hover:border-gray-400"
    >
      {previewImageURL && (
        <Image width={120} height={120} src={previewImageURL} alt="Preview profile image" />
      )}
      {!pending ? (
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center bg-black/80",
            previewImageURL && "invisible group-hover:visible"
          )}
        >
          <ImageIcon className="h-5 w-5 text-white" />
          <span className="mt-1 text-xs font-medium text-white">
            Click to upload image <br />
            (120x120)
          </span>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center  justify-center bg-black/80">
          <LoadingIcon className="h-5 w-5 animate-spin text-white" />
        </div>
      )}
    </button>
  );
}

interface BannerImageUploadProps {
  bannerImage?: string;
  onImageUploaded: (newImageURL: string) => void;
}

export function BannerImageUpload(props: BannerImageUploadProps) {
  const { bannerImage, onImageUploaded } = props;

  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUploadBannerImage(formData: FormData) {
    const url = await uploadBannerImage(formData);
    onImageUploaded(url);
  }

  return (
    <form action={handleUploadBannerImage} ref={formRef}>
      <input
        ref={fileInputRef}
        type="file"
        name="bannerImage"
        accept=".png, .jpg, .jpeg, .gif, .webp"
        className="hidden"
        onChange={(e) => {
          if (!formRef.current) return;
          if (!("files" in e.target) || (e.target.files as FileList).length === 0) return;

          formRef.current.requestSubmit();
        }}
      />
      <BannerImageUploadTrigger
        onClick={() => {
          if (!fileInputRef.current) return;
          fileInputRef.current.click();
        }}
        previewImageURL={bannerImage}
      />
    </form>
  );
}

interface BannerImageUploadTriggerProps {
  onClick: () => void;
  previewImageURL?: string;
}

function BannerImageUploadTrigger(props: BannerImageUploadTriggerProps) {
  const { onClick, previewImageURL } = props;
  const { pending } = useFormStatus();

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded border border-gray-500 bg-gray-950 hover:border-gray-400"
      style={{ aspectRatio: 1184 / 144 }}
    >
      {previewImageURL && (
        <Image width={1184} height={144} src={previewImageURL} alt="Preview banner image" />
      )}
      {!pending ? (
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center bg-black/80",
            previewImageURL && "invisible group-hover:visible"
          )}
        >
          <ImageIcon className="h-5 w-5 text-white" />
          <span className="mt-1 text-xs font-medium text-white">Upload image (1184x144)</span>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center  justify-center bg-black/80">
          <LoadingIcon className="h-5 w-5 animate-spin text-white" />
        </div>
      )}
    </button>
  );
}
