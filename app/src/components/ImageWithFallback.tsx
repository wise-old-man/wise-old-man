"use client";

import { useEffect, useState } from "react";
import Image, { ImageProps } from "next/image";

type ImageWithFallbackProps = ImageProps & {
  fallbackSrc?: string;
};

export default function ImageWithFallback({ src, fallbackSrc, alt, ...rest }: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <Image
      {...rest}
      src={imgSrc}
      alt={alt}
      style={{
        opacity: String(imgSrc) === "" ? 0 : 1,
      }}
      onError={() => {
        setImgSrc(fallbackSrc ?? "");
      }}
    />
  );
}
