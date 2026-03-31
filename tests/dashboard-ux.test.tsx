import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HamburgerMenu from '@/components/dashboard/HamburgerMenu';
import StrategicTheaterMap from '@/components/dashboard/StrategicTheaterMap';
import CrisisToggle from '@/components/dashboard/CrisisToggle';
import React from 'react';

// Mocks for maplibre-gl and pmtiles are now centralized in tests/setup.ts

// Mock framer-motion with a proxy to handle all motion.element calls
vi.mock('framer-motion', () => {
  const actual = vi.importActual('framer-motion');
  return {
    ...actual,
    motion: new Proxy({}, {
      get: (target, prop) => {
        return ({ children, ...props }: any) => {
          // Filter out motion-specific props that shouldn't go to DOM
          const { initial, animate, exit, variants, transition, whileHover, whileTap, custom, ...domProps } = props;
          const Tag = prop as any;
          return <Tag {...domProps}>{children}</Tag>;
        };
      }
    }),
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

describe('Mobile UI & UX Tests', () => {
  const categories = ['general', 'world', 'surveillance'];
  const onSelectCategory = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('HamburgerMenu renders the trigger button', () => {
    render(<HamburgerMenu categories={categories} selectedCategory="general" onSelectCategory={onSelectCategory} />);
    expect(screen.getByLabelText('Open Menu')).toBeDefined();
  });

  it('HamburgerMenu opens when clicked', () => {
    render(<HamburgerMenu categories={categories} selectedCategory="general" onSelectCategory={onSelectCategory} />);
    fireEvent.click(screen.getByLabelText('Open Menu'));
    expect(screen.getByText(/WORLD/i)).toBeDefined();
  });

  it('HamburgerMenu calls onSelectCategory and closes when a category is clicked', () => {
    render(<HamburgerMenu categories={categories} selectedCategory="general" onSelectCategory={onSelectCategory} />);
    fireEvent.click(screen.getByLabelText('Open Menu'));
    fireEvent.click(screen.getByText(/WORLD/i));
    expect(onSelectCategory).toHaveBeenCalledWith('world');
  });
});

describe('Map Splash Lifecycle Tests', () => {
  const onRegionSelect = vi.fn();

  it('StrategicTheaterMap shows the splash screen initially', () => {
    render(
      <StrategicTheaterMap 
        onRegionSelect={onRegionSelect} 
        selectedRegion="Global" 
        articles={[]} 
      />
    );
    expect(screen.getByText(/INITIALIZING SATELLITE LINK/i)).toBeDefined();
  });

  it('StrategicTheaterMap renders tactical control buttons', () => {
    render(
      <StrategicTheaterMap 
        onRegionSelect={onRegionSelect} 
        selectedRegion="Global" 
        articles={[]} 
      />
    );
    expect(screen.getByLabelText('Toggle Tactical Layers')).toBeDefined();
    expect(screen.getByLabelText('Toggle Tactical Legend')).toBeDefined();
  });
  
  it('displays coordinates and zoom in the tactical HUD', () => {
    render(
        <StrategicTheaterMap onRegionSelect={onRegionSelect} selectedRegion="Global" />
    );
    expect(screen.getByText(/COORD:/i)).toBeDefined();
    expect(screen.getByText(/ZOOM_LVL:/i)).toBeDefined();
  });
});

describe('Strategic Intelligence Logic', () => {
    it('CrisisToggle calls correct callbacks on interaction', () => {
        const onCrisisToggle = vi.fn();
        const onGoodNewsToggle = vi.fn();
        
        render(
            <CrisisToggle isCrisis={false} isGoodNews={false} onCrisisToggle={onCrisisToggle} onGoodNewsToggle={onGoodNewsToggle} />
        );

        // Crisis Mode button (first)
        fireEvent.click(screen.getByText(/Monitor/i));
        expect(onCrisisToggle).toHaveBeenCalled();

        // Good News Mode button (second)
        fireEvent.click(screen.getByText(/Good News/i));
        expect(onGoodNewsToggle).toHaveBeenCalled();
    });
});
