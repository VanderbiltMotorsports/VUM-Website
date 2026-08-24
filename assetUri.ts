import { Image } from 'react-native';

// react-native-web returns a string/object from require(); native exposes
// Image.resolveAssetSource. Handle all shapes without crashing on web.
export function resolveUri(src: any): string | undefined {
  if (!src) return undefined;
  if (typeof src === 'string') return src;
  if (typeof src === 'object' && src.uri) return src.uri as string;
  const img = Image as any;
  if (typeof img.resolveAssetSource === 'function') {
    try { return img.resolveAssetSource(src)?.uri as string; } catch { /* ignore */ }
  }
  return undefined;
}
