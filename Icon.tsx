// Native stub. The web build draws icons as inline SVG (Icon.web.tsx) so it
// doesn't have to ship ~350 KB of icon-font TTFs for seven glyphs. On native
// there's no cheap equivalent, so buttons render their label only.
export type IconName = 'linkedin' | 'instagram' | 'tiktok' | 'anchor' | 'mail' | 'edit' | 'heart';

export function Icon(_props: { name: IconName; size?: number; color?: string }) {
  return null;
}
