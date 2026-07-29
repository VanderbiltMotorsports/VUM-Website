import React, { useEffect, useRef } from 'react';

// Web-only animated hero. A full-viewport field of particles starts spread across
// the whole screen; MOST of them focus into the VU-83 silhouette positioned over
// the hero panel (element id "hero-stage"), while a minority drift on as ambient
// background dust. The field ripples, repels from the cursor, and fades out as the
// hero scrolls away. Inspired by animejs.com's homepage.

const GOLD = { r: 168, g: 150, b: 105 };
const STAGE_ID = 'hero-stage';

type Props = { maskUri?: string; word?: string; color?: string };

type Particle = {
  x: number; y: number; vx: number; vy: number;
  // car particles: normalized target inside the silhouette box (nx, ny in 0..1)
  // ambient particles: nx<0 flags ambient; hx/hy is the home position it holds
  nx: number; ny: number;
  hx: number; hy: number;
  ambient: boolean;
  delay: number; phase: number; amp: number; wob: number;
  size: number; bright: number;
};

// A sampled silhouette point: normalized position + brightness (from luminance).
type SamplePt = { nx: number; ny: number; bright: number };

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function HeroCanvas({ maskUri, word = 'VUM' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true }) as CanvasRenderingContext2D;
    if (!ctx) return;

    let W = 0, H = 0, dpr = 1, raf = 0;
    let running = true, disposed = false, startedOnce = false;
    let particles: Particle[] = [];
    let silAspect = 2; // silhouette width / height
    let maskImg: HTMLImageElement | null = null;
    let sampled: { pts: SamplePt[]; aspect: number } | null = null; // computed once

    const coarse = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = { x: 0, y: 0, active: false };
    // Gentler cursor/touch distortion on touch devices.
    const repelR = coarse ? 74 : 115;
    const repelF = coarse ? 3.0 : 6;

    // Sample the silhouette into normalized points whose DENSITY follows image
    // detail (edges/contrast) and whose BRIGHTNESS follows luminance — so the
    // livery, numbers, helmet and mechanical detail render denser and lighter
    // while the flat bodywork stays sparser and darker. Adds texture + relief.
    function sampleTargets(): { pts: SamplePt[]; aspect: number } {
      const off = document.createElement('canvas');
      const OH = 380;
      if (maskImg) {
        const OW = Math.max(1, Math.round(OH * (maskImg.width / maskImg.height)));
        off.width = OW; off.height = OH;
        const o = off.getContext('2d', { willReadFrequently: true })!;
        o.drawImage(maskImg, 0, 0, OW, OH);
        const d = o.getImageData(0, 0, OW, OH).data;
        const N = OW * OH;
        const lum = new Float32Array(N);
        const on = new Uint8Array(N);
        for (let i = 0; i < N; i++) {
          if (d[i * 4 + 3] > 130) {
            on[i] = 1;
            lum[i] = (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) / 255;
          }
        }
        // Per-pixel importance = base coverage + local edge strength + tonal
        // extremes. Density is drawn proportional to this.
        const imp = new Float32Array(N);
        let total = 0;
        for (let y = 1; y < OH - 1; y++) {
          for (let x = 1; x < OW - 1; x++) {
            const i = y * OW + x;
            if (!on[i]) continue;
            const edge = Math.min(1, (Math.abs(lum[i + 1] - lum[i - 1]) + Math.abs(lum[i + OW] - lum[i - OW])) * 2.4);
            const I = 0.42 + 1.2 * edge + 0.35 * Math.abs(lum[i] - 0.45);
            imp[i] = I; total += I;
          }
        }
        const target = coarse ? 4200 : 6200;
        const scale = total > 0 ? target / total : 0;
        const pts: SamplePt[] = [];
        for (let i = 0; i < N; i++) {
          if (imp[i] > 0 && Math.random() < imp[i] * scale) {
            pts.push({
              nx: (i % OW) / OW,
              ny: ((i / OW) | 0) / OH,
              bright: Math.max(0.5, Math.min(1.2, 0.5 + 0.72 * lum[i])),
            });
          }
        }
        return { pts, aspect: OW / OH };
      }
      // Text fallback (uniform, no image detail available).
      const OW = Math.round(OH * 2.4);
      off.width = OW; off.height = OH;
      const o = off.getContext('2d', { willReadFrequently: true })!;
      o.fillStyle = '#fff';
      o.textAlign = 'center';
      o.textBaseline = 'middle';
      let fs = OH * 0.8;
      o.font = `900 ${fs}px Arial, sans-serif`;
      while (o.measureText(word).width > OW * 0.9 && fs > 8) {
        fs -= 6; o.font = `900 ${fs}px Arial, sans-serif`;
      }
      o.fillText(word, OW / 2, OH / 2);
      const d = o.getImageData(0, 0, OW, OH).data;
      const pts: SamplePt[] = [];
      for (let y = 0; y < OH; y += 2) {
        for (let x = 0; x < OW; x += 2) {
          if (d[(y * OW + x) * 4 + 3] > 130) pts.push({ nx: x / OW, ny: y / OH, bright: 0.7 + Math.random() * 0.4 });
        }
      }
      return { pts, aspect: OW / OH };
    }

    // Reuse existing particle positions by index so a resize (or an automation
    // viewport change) never re-scatters the assembled car — only targets move.
    function buildParticles() {
      // Sample once (stable point set + count) so resizes only re-map positions,
      // never re-scatter. Density/brightness follow the image.
      if (!sampled) sampled = sampleTargets();
      const car = sampled.pts;
      silAspect = sampled.aspect;
      // Ambient dust: density scaled to the viewport so it reads as an even
      // starfield behind everything. Floor keeps it visible on small phones.
      const ambientCount = Math.min(1200, Math.max(320, Math.round((W * H) / 1900)));
      const prev = particles;
      const total = car.length + ambientCount;
      const next: Particle[] = new Array(total);

      for (let i = 0; i < car.length; i++) {
        const p = car[i];
        const old = prev[i];
        next[i] = {
          x: old ? old.x : Math.random() * W,
          y: old ? old.y : Math.random() * H,
          vx: old ? old.vx : 0,
          vy: old ? old.vy : 0,
          nx: p.nx, ny: p.ny,
          hx: 0, hy: 0,
          ambient: false,
          delay: old ? old.delay : p.nx * 0.55 + Math.random() * 0.22,
          phase: p.nx * 6 + p.ny * 4,
          amp: old ? old.amp : 0.4 + Math.random() * 0.7,
          wob: old ? old.wob : 1.0 + Math.random() * 0.7,
          // brighter (livery/detail) particles are a touch larger, for pop
          size: (coarse ? 1.8 : 1.7) * (0.75 + 0.6 * Math.min(1, p.bright)),
          bright: p.bright,
        };
      }
      for (let i = 0; i < ambientCount; i++) {
        const idx = car.length + i;
        const old = prev[idx];
        const hx = old ? old.hx : Math.random() * W;
        const hy = old ? old.hy : Math.random() * H;
        next[idx] = {
          x: old ? old.x : hx,
          y: old ? old.y : hy,
          vx: old ? old.vx : 0,
          vy: old ? old.vy : 0,
          hx, hy,
          nx: -1, ny: -1,
          ambient: true,
          delay: 0,
          // faint in-place shimmer (small amp, slow) instead of screen drift
          phase: old ? old.phase : Math.random() * Math.PI * 2,
          amp: old ? old.amp : 0.4 + Math.random() * 0.8,
          wob: old ? old.wob : 0.2 + Math.random() * 0.4,
          size: coarse ? 1.9 : 1.6,
          bright: old ? old.bright : 0.34 + Math.random() * 0.34,
        };
      }
      particles = next;
    }

    // Where the car focuses: the on-screen rect of the hero-stage element,
    // recomputed each frame so the car tracks page scroll. Returns null if the
    // hero isn't mounted (e.g. another route).
    function stageBox() {
      const el = document.getElementById(STAGE_ID);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return null;
      const availW = r.width * 0.98;
      const availH = r.height * 0.98;
      let bw = availW, bh = bw / silAspect;
      if (bh > availH) { bh = availH; bw = bh * silAspect; }
      return {
        x: r.left + (r.width - bw) / 2,
        y: r.top + (r.height - bh) / 2,
        w: bw, h: bh,
        // fade the whole field as the hero scrolls up out of view
        vis: Math.max(0, Math.min(1, r.bottom / (r.height * 0.6))),
      };
    }

    let startT = performance.now();
    let lastT = startT;

    function tick(now: number) {
      if (!running || disposed) return;
      let dt = (now - lastT) / 16.67; lastT = now;
      if (dt > 3) dt = 3;
      const t = (now - startT) / 1000;
      const box = stageBox();

      ctx.clearRect(0, 0, W, H);
      if (!box || box.vis <= 0.001) { raf = requestAnimationFrame(tick); return; }
      const globalVis = box.vis;

      for (const p of particles) {
        let ax: number, ay: number;
        if (p.ambient) {
          // Hold near home with only a faint shimmer (minimal drift).
          const gx = p.hx + Math.cos(t * p.wob + p.phase) * p.amp;
          const gy = p.hy + Math.sin(t * p.wob + p.phase) * p.amp;
          ax = (gx - p.x) * 0.05;
          ay = (gy - p.y) * 0.05;
        } else {
          const life = Math.min(1, Math.max(0, (t - p.delay) / 1.2));
          const k = easeOutCubic(life) * 0.17;
          const tx = box.x + p.nx * box.w + Math.cos(t * p.wob + p.phase) * p.amp;
          const ty = box.y + p.ny * box.h + Math.sin(t * p.wob + p.phase) * p.amp;
          ax = (tx - p.x) * k;
          ay = (ty - p.y) * k;
        }
        // Cursor repel — now applies to every particle, car and ambient.
        if (pointer.active) {
          const dx = p.x - pointer.x, dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < repelR * repelR) {
            const d = Math.sqrt(d2) || 1, f = (1 - d / repelR) * repelF;
            ax += (dx / d) * f; ay += (dy / d) * f;
          }
        }
        const damp = p.ambient ? 0.9 : 0.86;
        p.vx = (p.vx + ax * dt) * damp;
        p.vy = (p.vy + ay * dt) * damp;
        p.x += p.vx * dt; p.y += p.vy * dt;

        const spd = Math.min(1, Math.hypot(p.vx, p.vy) / 6);
        const a = (p.ambient
          ? Math.min(1, p.bright + spd * 0.4)
          : Math.min(1, 0.42 + 0.5 * Math.min(1, p.bright) + spd * 0.3)) * globalVis;
        ctx.globalAlpha = a;
        ctx.fillStyle = `rgb(${Math.round(GOLD.r * p.bright)},${Math.round(GOLD.g * p.bright)},${Math.round(GOLD.b * p.bright)})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    }

    function drawStatic() {
      const box = stageBox();
      ctx.clearRect(0, 0, W, H);
      if (!box) return;
      for (const p of particles) {
        if (p.ambient) continue;
        ctx.globalAlpha = box.vis;
        ctx.fillStyle = `rgb(${Math.round(GOLD.r * p.bright)},${Math.round(GOLD.g * p.bright)},${Math.round(GOLD.b * p.bright)})`;
        ctx.fillRect(box.x + p.nx * box.w, box.y + p.ny * box.h, p.size, p.size);
      }
      ctx.globalAlpha = 1;
    }

    function start() {
      cancelAnimationFrame(raf);
      if (reduceMQ.matches) { drawStatic(); return; }
      // Reset the assemble clock only on the first start; later resizes keep it
      // so the car stays assembled instead of re-scattering.
      if (!startedOnce) { startT = performance.now(); startedOnce = true; }
      lastT = performance.now();
      running = true;
      raf = requestAnimationFrame(tick);
    }

    function resize() {
      W = Math.max(1, Math.round(window.innerWidth));
      H = Math.max(1, Math.round(window.innerHeight));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
      start();
    }

    // Cursor drives the repel on desktop; a finger drives it on touch devices.
    // Touch listeners are passive (never preventDefault) so the page still
    // scrolls normally — a drag both scrolls and pushes the particles.
    const onMouse = (e: MouseEvent) => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true; };
    const onMouseLeave = () => { pointer.active = false; };
    const onTouch = (e: TouchEvent) => {
      const t0 = e.touches[0];
      if (t0) { pointer.x = t0.clientX; pointer.y = t0.clientY; pointer.active = true; }
    };
    const onTouchEnd = () => { pointer.active = false; };
    window.addEventListener('mousemove', onMouse);
    document.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('touchstart', onTouch, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);
    const onResize = () => resize();
    window.addEventListener('resize', onResize);

    const onVis = () => {
      if (document.hidden) { running = false; cancelAnimationFrame(raf); }
      else if (!reduceMQ.matches) { lastT = performance.now(); running = true; cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }
    };
    document.addEventListener('visibilitychange', onVis);
    const onReduce = () => start();
    reduceMQ.addEventListener('change', onReduce);

    (async () => {
      try { if (maskUri) maskImg = await loadImage(maskUri); }
      catch { maskImg = null; }
      if (disposed) return;
      resize();
    })();

    return () => {
      disposed = true; running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouse);
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      reduceMQ.removeEventListener('change', onReduce);
    };
  }, [maskUri, word]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 0 }}
    />
  );
}
