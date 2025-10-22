import React, { useState } from "react";

type Props = {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
};

export function ImageWithFallback({ src, alt = "", className = "", fallbackSrc }: Props) {
  const [imgSrc, setImgSrc] = useState<string | null | undefined>(src ?? fallbackSrc ?? null);

  const handleError = () => {
    if (fallbackSrc && imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
    else setImgSrc(null);
  };

  if (!imgSrc) {
    return <div className={className} aria-hidden="true" />;
  }

  return <img src={imgSrc} alt={alt} className={className} onError={handleError} />;
}
