import React from 'react';
import { resolveUri } from './assetUri';

// A real <img> rather than react-native-web's <Image> so the whole sponsor wall
// lazy-loads: it sits well below the fold on the Sponsorship page.
export function SponsorLogo({ source, alt }: { source: any; alt: string }) {
  return React.createElement('img', {
    src: resolveUri(source),
    alt,
    loading: 'lazy',
    decoding: 'async',
    style: { display: 'block', maxWidth: '100%', maxHeight: 100, objectFit: 'contain' },
  });
}
