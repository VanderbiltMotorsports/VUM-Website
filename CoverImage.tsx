import React from 'react';
import { Image } from 'react-native';

// Native: a plain RN Image. The web build (CoverImage.web.tsx) uses a real
// <img> instead so it can lazy-load and decode off the main thread.
export function CoverImage({ source, height, alt }: { source: any; height: number; alt: string }) {
  return (
    <Image
      source={source}
      style={{ width: '100%', height, resizeMode: 'cover' }}
      accessible={true}
      accessibilityLabel={alt}
    />
  );
}
