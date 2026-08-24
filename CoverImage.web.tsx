import React from 'react';
import { resolveUri } from './assetUri';

// react-native-web's <Image> renders a div with a background-image, which the
// browser always fetches eagerly. A real <img> lets us defer offscreen photos
// (loading="lazy") and keep decoding off the main thread (decoding="async").
export function CoverImage({ source, height, alt }: { source: any; height: number; alt: string }) {
  return React.createElement('img', {
    src: resolveUri(source),
    alt,
    loading: 'lazy',
    decoding: 'async',
    style: { display: 'block', width: '100%', height, objectFit: 'cover' },
  });
}
