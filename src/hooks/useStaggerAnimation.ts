import { useEffect, useRef } from 'react';

export function useStaggerAnimation(count: number, delay = 0.08) {
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    refs.current.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${i * delay}s, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${i * delay}s`;

      // Trigger on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (el) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }
        });
      });
    });
  }, [count, delay]);

  const setRef = (index: number) => (el: HTMLElement | null) => {
    refs.current[index] = el;
  };

  return { setRef };
}
