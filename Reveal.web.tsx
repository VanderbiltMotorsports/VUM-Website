import React, { useEffect, useRef } from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';

// Fades + slides its children up the first time they scroll into view.
// Driven directly on the host DOM node so it doesn't depend on RN style
// transition support. Respects prefers-reduced-motion.
export function Reveal({
  children,
  delay = 0,
  y = 26,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const ref = useRef<any>(null);

  useEffect(() => {
    const el = ref.current as HTMLElement | null;
    if (!el) return;

    const reveal = () => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    };

    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce || typeof IntersectionObserver === 'undefined') {
      reveal();
      return;
    }

    el.style.opacity = '0';
    el.style.transform = `translateY(${y}px)`;
    el.style.transition = `opacity 640ms cubic-bezier(.2,.7,.2,1) ${delay}ms, transform 640ms cubic-bezier(.2,.7,.2,1) ${delay}ms`;
    el.style.willChange = 'opacity, transform';

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            reveal();
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay, y]);

  return (
    <View ref={ref as any} style={style}>
      {children}
    </View>
  );
}
