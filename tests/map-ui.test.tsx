import { it, expect, vi, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StrategicTheaterMap from '../src/components/dashboard/StrategicTheaterMap';
import React from 'react';

import * as pmtiles from 'pmtiles';

// Mocks for maplibre-gl and pmtiles are now centralized in tests/setup.ts

describe('StrategicTheaterMap Component', () => {
  const mockProps = {
    onRegionSelect: vi.fn(),
    onCountrySelect: vi.fn(),
    onTimeRangeChange: vi.fn(),
    selectedRegion: 'Global' as any,
    articles: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the map HUD with buttons', () => {
    render(<StrategicTheaterMap {...mockProps} />);
    expect(screen.getByText('Tactical Layers')).toBeInTheDocument();
    expect(screen.getByText('Tactical Legend')).toBeInTheDocument();
  });

  it('toggles the Tactical Layers dropdown when clicked', () => {
    render(<StrategicTheaterMap {...mockProps} />);
    const layersBtn = screen.getByText('Tactical Layers');
    
    // Initially closed
    expect(screen.queryByText('Layer Configuration')).not.toBeInTheDocument();
    
    // Click to open
    fireEvent.click(layersBtn);
    expect(screen.getByText('Layer Configuration')).toBeInTheDocument();
    
    // Click to close
    fireEvent.click(layersBtn);
    expect(screen.queryByText('Layer Configuration')).not.toBeInTheDocument();
  });

  it('opens the Tactical Legend when clicked', () => {
    render(<StrategicTheaterMap {...mockProps} />);
    const legendBtn = screen.getByText('Tactical Legend');
    
    expect(screen.queryByText('Tactical Registry v3.2')).not.toBeInTheDocument();
    fireEvent.click(legendBtn);
    expect(screen.getByText('Tactical Registry v3.2')).toBeInTheDocument();
  });

  it('calls onRegionSelect when a region button is clicked', () => {
    render(<StrategicTheaterMap {...mockProps} />);
    const regionBtn = screen.getByText('Middle East');
    fireEvent.click(regionBtn);
    expect(mockProps.onRegionSelect).toHaveBeenCalledWith('Middle East');
  });
});
