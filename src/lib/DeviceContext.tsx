'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'ssr';

interface DeviceContextType {
  deviceType: DeviceType;
}

const DeviceContext = createContext<DeviceContextType>({ deviceType: 'ssr' });

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const [deviceType, setDeviceType] = useState<DeviceType>('ssr');

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      const isTablet = window.matchMedia('(min-width: 769px) and (max-width: 1024px)').matches;

      if (width <= 768 || isMobile) {
        setDeviceType('mobile');
      } else if ((width > 768 && width <= 1024) || isTablet) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return (
    <DeviceContext.Provider value={{ deviceType }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  return useContext(DeviceContext);
}
