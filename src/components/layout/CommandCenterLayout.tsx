'use client';

import React, { useRef, type ReactNode } from 'react';
import { useCommandCenterAnimation } from '@/hooks/useCommandCenterAnimation';

interface CommandCenterLayoutProps {
  mapSlot: ReactNode;
  leftBottomSlot?: ReactNode; // New: Strategic Feed below the map
  videoSlot: ReactNode;
  feedSlot: ReactNode;
  headerHeight?: string; 
}

/**
 * CommandCenterLayout
 *
 * Refined 2-Column High-Density Layout:
 *
 * Left Column (65%):
 *   - Top: Interactive Map (50% of column height)
 *   - Bottom: Strategic News Feed (50% of column height)
 *
 * Right Column (35%):
 *   - Top: Live Video Stream (fixed aspect)
 *   - Bottom: Live Intelligence Feed (scrollable)
 */
export default function CommandCenterLayout({
  mapSlot,
  leftBottomSlot,
  videoSlot,
  feedSlot,
  headerHeight = '0px',
}: CommandCenterLayoutProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leftFeedRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  useCommandCenterAnimation({ mapRef, leftFeedRef, rightPaneRef, feedRef });

  return (
    <div
      className="command-center-grid overflow-y-auto"
      style={{ minHeight: `calc(100vh - ${headerHeight})` }}
    >
      {/* ── LEFT COLUMN (65%) ────────────────────────────────────── */}
      <div className="command-center-left-column">
        {/* Top: Map */}
        <div ref={mapRef} className="command-center-map-container">
          {mapSlot}
        </div>

        {/* Bottom: Strategic Feed */}
        <div ref={leftFeedRef} className="command-center-left-feed custom-scrollbar">
          {leftBottomSlot}
        </div>
      </div>

      {/* ── RIGHT COLUMN (35%) ───────────────────────────────────── */}
      <div ref={rightPaneRef} className="command-center-sidebar">
        {/* Video — fixed aspect ratio */}
        <div className="command-center-video shrink-0">
          {videoSlot}
        </div>

        {/* Feed — fills remaining space, scrollable */}
        <div
          ref={feedRef}
          className="command-center-feed custom-scrollbar"
        >
          {feedSlot}
        </div>
      </div>
    </div>
  );
}
