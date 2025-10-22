import React, { useState } from "react";

type Props = {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
};

export function ImageWithFallback({ src, alt = "", className = "", fallbackSrc }: Props) {
  const [imgSrc, setImgSrc] = useState<string | undefined | null>(src);
  const handleError = () => {
    if (fallbackSrc) setImgSrc(fallbackSrc);
    else setImgSrc(undefined);
  };
  if (!imgSrc) {
    return <div className={className} aria-hidden="true" />;
  }
  return <img src={imgSrc} alt={alt} className={className} onError={handleError} />;
}
