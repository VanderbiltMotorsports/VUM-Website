import React from 'react';
import { Image } from 'react-native';

// Native: contain-fit the logo inside the tile. The web build
// (SponsorLogo.web.tsx) uses a real <img> so the wall can lazy-load.
export function SponsorLogo({ source, alt }: { source: any; alt: string }) {
  return (
    <Image
      source={source}
      style={{ width: '100%', height: 100, resizeMode: 'contain' }}
      accessible={true}
      accessibilityLabel={alt}
    />
  );
}
