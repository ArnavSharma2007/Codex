import { useState, useEffect, useRef } from 'react';

/**
 * Scroll-triggered reveal animation hook using IntersectionObserver.
 *
 * @param {Object} options
 * @param {number} options.threshold - 0–1, portion visible before triggering
 * @param {string} options.rootMargin - IntersectionObserver root margin
 * @returns {{ ref, isVisible }}
 */
export function useScrollAnimation({
  threshold = 0.15,
  rootMargin = '0px 0px -60px 0px',
} = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el); // Only trigger once
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, isVisible };
}
