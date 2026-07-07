"use client";

import { useState } from "react";
import Image from "next/image";

interface MediaProps {
  src: string;
  alt: string;
  type: "image" | "video";
  className?: string;
  priority?: boolean;
}

export function Media({ src, alt, type, className, priority = false }: MediaProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-800 rounded-lg ${className}`}>
        <div className="text-center text-gray-500 p-4">
          <p className="text-sm">Media unavailable</p>
        </div>
      </div>
    );
  }

  if (type === "video") {
    return (
      <video
        autoPlay
        loop
        muted
        playsInline
        className={`object-cover ${className}`}
        onError={() => setHasError(true)}
        onLoadedData={() => setIsLoaded(true)}
      >
        <source src={src} type="video/mp4" />
      </video>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      className={`object-cover ${className}`}
      onError={() => setHasError(true)}
      onLoad={() => setIsLoaded(true)}
      loading={priority ? "eager" : "lazy"}
    />
  );
}
