'use client';

import { useDevice } from '@/lib/DeviceContext';
import { ReactNode } from 'react';

export function MobileLayout({ children }: { children: ReactNode }) {
  const { deviceType } = useDevice();
  if (deviceType === 'ssr' || deviceType !== 'mobile') return null;
  return <div className="layout-mobile">{children}</div>;
}

export function TabletLayout({ children }: { children: ReactNode }) {
  const { deviceType } = useDevice();
  if (deviceType === 'ssr' || deviceType !== 'tablet') return null;
  return <div className="layout-tablet">{children}</div>;
}

export function DesktopLayout({ children }: { children: ReactNode }) {
  const { deviceType } = useDevice();
  // To avoid layout shift during SSR, we might want to default to desktop or hide initially.
  // Returning null blocks initial content, but guarantees no cross-rendering conflicts.
  if (deviceType === 'ssr' || deviceType !== 'desktop') return null;
  return <div className="layout-desktop">{children}</div>;
}
