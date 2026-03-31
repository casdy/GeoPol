'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { animate, stagger, createTimeline } from 'animejs';

interface AnimationTargets {
  mapRef: RefObject<HTMLDivElement | null>;
  leftFeedRef: RefObject<HTMLDivElement | null>; // New: Left bottom feed
  rightPaneRef: RefObject<HTMLDivElement | null>;
  feedRef: RefObject<HTMLDivElement | null>;
}

/**
 * Orchestrates the Command Center load-in animation sequence.
 *
 * Sequence:
 *   1. Map fades in (0 → 1 opacity) over 800ms
 *   2. Left bottom feed fades in and slides up
 *   3. Right pane slides in from the right (translateX 60px → 0) over 600ms
 *   4. Feed cards cascade downward via stagger(60)
 *
 * React Strict Mode safety:
 *   - `hasAnimated` ref prevents double-fire in dev mode
 *   - Cleanup resets inline styles so HMR re-mounts can replay
 */
export function useCommandCenterAnimation({ mapRef, leftFeedRef, rightPaneRef, feedRef }: AnimationTargets) {
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Strict Mode guard — skip the second invocation in dev
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    // Small delay to ensure DOM is painted
    const timer = setTimeout(() => {
      const tl = createTimeline({
        defaults: {
          ease: 'outExpo',
        },
      });

      // Step 1: Map fade-in
      if (mapRef.current) {
        tl.add(mapRef.current, {
          opacity: [0, 1],
          duration: 800,
        }, 0);
      }

      // Step 2: Left bottom feed fade-in
      if (leftFeedRef.current) {
        tl.add(leftFeedRef.current, {
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 600,
        }, 300);
      }

      // Step 3: Right pane slide-in
      if (rightPaneRef.current) {
        tl.add(rightPaneRef.current, {
          opacity: [0, 1],
          translateX: [60, 0],
          duration: 600,
          ease: 'outCubic',
        }, 500);
      }

      // Step 4: Feed items stagger
      const allFeedItems: HTMLElement[] = [];
      if (leftFeedRef.current) {
         allFeedItems.push(...Array.from(leftFeedRef.current.querySelectorAll('.item-card-anim')) as HTMLElement[]);
      }
      if (feedRef.current) {
         allFeedItems.push(...Array.from(feedRef.current.children) as HTMLElement[]);
      }

      if (allFeedItems.length > 0) {
        tl.add(allFeedItems, {
          opacity: [0, 1],
          translateY: [15, 0],
          duration: 400,
          ease: 'outCubic',
          delay: stagger(40),
        }, 700);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
