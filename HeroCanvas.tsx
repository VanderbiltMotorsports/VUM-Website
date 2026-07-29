// Native stub. The particle hero is web-only (it needs an HTML <canvas>), so on
// iOS/Android this renders nothing and the page falls back to the cover photo.
export function HeroCanvas(_props: { maskUri?: string; word?: string; color?: string }) {
  return null;
}
