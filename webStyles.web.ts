// Web-only: load the display font and a few global niceties that RN's
// StyleSheet can't express (smooth scroll, selection color, sticky/blur header,
// hover cursors). Called once from App on web.
let injected = false;

export function injectWebStyles() {
  if (injected || typeof document === 'undefined') return;
  injected = true;

  const preconnect1 = document.createElement('link');
  preconnect1.rel = 'preconnect';
  preconnect1.href = 'https://fonts.googleapis.com';

  const preconnect2 = document.createElement('link');
  preconnect2.rel = 'preconnect';
  preconnect2.href = 'https://fonts.gstatic.com';
  preconnect2.crossOrigin = 'anonymous';

  const font = document.createElement('link');
  font.rel = 'stylesheet';
  font.href =
    'https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@500;600;700;800&family=Saira:wght@400;500;600;700&display=swap';

  const style = document.createElement('style');
  style.textContent = `
    html { scroll-behavior: smooth; background: #000; }
    /* No rubber-band overscroll and no accidental horizontal scroll on mobile */
    html, body { overscroll-behavior: none; overflow-x: hidden; max-width: 100%; }
    body { background: #000; }
    ::selection { background: #a89669; color: #000; }
    * { -webkit-tap-highlight-color: transparent; }
    a, [role="button"], button { cursor: pointer; }
    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: #000; }
    ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 8px; }
    ::-webkit-scrollbar-thumb:hover { background: #a89669; }
  `;

  document.head.append(preconnect1, preconnect2, font, style);
}
