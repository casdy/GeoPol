import { vi } from 'vitest';
import React from 'react';
import '@testing-library/jest-dom';

// Global Browser API Mocks
let resizeCallback: any;
class ResizeObserverMock {
  constructor(cb: any) {
    resizeCallback = cb;
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
(window as any).getResizeCallback = () => resizeCallback;

// Mock Framer Motion to bypass animations
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => React.createElement('div', props, children),
    button: ({ children, ...props }: any) => React.createElement('button', props, children),
    span: ({ children, ...props }: any) => React.createElement('span', props, children),
  },
  AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, {}, children),
}));

// Mock Lucide React with explicit exports
vi.mock('lucide-react', () => {
  const icons = [
    'Menu', 'X', 'Newspaper', 'Briefcase', 'Cpu', 'Trophy', 'Activity', 
    'Globe', 'Scale', 'Film', 'FlaskRound', 'Zap', 'Layers', 'ShieldAlert', 
    'Server', 'Flame', 'Plane', 'Info', 'Shield', 'Plus', 'AlertTriangle',
    'Globe2', 'Radio', 'ExternalLink', 'Maximize2', 'Camera'
  ];
  const mock: any = { __esModule: true };
  icons.forEach(icon => {
    mock[icon] = (props: any) => React.createElement('div', { ...props, 'data-testid': `${icon.toLowerCase()}-icon` });
  });
  return mock;
});

class IntersectionObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

window.ResizeObserver = ResizeObserverMock as any;
window.IntersectionObserver = IntersectionObserverMock as any;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock URL.createObjectURL
if (!window.URL.createObjectURL) {
  window.URL.createObjectURL = vi.fn(() => 'blob:mock');
  window.URL.revokeObjectURL = vi.fn();
}

// Mock MapLibre GL
vi.mock('maplibre-gl', () => {
  const MockMap = vi.fn().mockImplementation(function(this: any) {
    this.on = vi.fn();
    this.remove = vi.fn();
    this.resize = vi.fn();
    this.addControl = vi.fn();
    this.flyTo = vi.fn();
    this.setCenter = vi.fn();
    this.setZoom = vi.fn();
    this.getCenter = vi.fn(() => ({ lng: 20, lat: 20, toArray: () => [20, 20] }));
    this.getZoom = vi.fn(() => 1.8);
    this.getCanvas = vi.fn(() => ({ style: { cursor: '' } }));
    this.addSource = vi.fn();
    this.addLayer = vi.fn();
    this.getSource = vi.fn();
    this.getLayer = vi.fn();
    this.removeLayer = vi.fn();
    this.removeSource = vi.fn();
    this.isStyleLoaded = vi.fn(() => true);
    this.project = vi.fn(() => ({ x: 0, y: 0 }));
    this.unproject = vi.fn(() => ({ lng: 0, lat: 0 }));
  });

  const Marker = vi.fn().mockImplementation(function(this: any) {
    this.setLngLat = vi.fn().mockReturnValue(this);
    this.addTo = vi.fn().mockReturnValue(this);
    this.remove = vi.fn().mockReturnValue(this);
    this.getElement = vi.fn(() => document.createElement('div'));
  });

  const NavigationControl = vi.fn();
  const addProtocol = vi.fn();
  const Popup = vi.fn().mockImplementation(function(this: any) {
    this.setLngLat = vi.fn().mockReturnThis();
    this.setHTML = vi.fn().mockReturnThis();
    this.addTo = vi.fn().mockReturnThis();
    this.remove = vi.fn().mockReturnThis();
  });

  const mock = {
    Map: MockMap,
    Marker,
    NavigationControl,
    addProtocol,
    Popup,
  };

  return {
    ...mock,
    default: mock,
    __esModule: true,
  };
});

// Mock PMTiles
vi.mock('pmtiles', () => {
  class Protocol {
    tile = vi.fn();
  }
  return {
    default: { Protocol },
    Protocol,
    __esModule: true,
  };
});
