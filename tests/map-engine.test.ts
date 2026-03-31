import { describe, it, expect, vi } from 'vitest';
import { MapEngine } from '../src/lib/map-sync-engine';

describe('MapSyncEngine', () => {
  const mockMap = {
    isStyleLoaded: vi.fn(() => true),
    getLayer: vi.fn(() => ({})),
    getSource: vi.fn(() => ({ setData: vi.fn() })),
    setLayoutProperty: vi.fn(),
  } as any;

  it('should sync layer visibility correctly', () => {
    const engine = new MapEngine(mockMap);
    engine.setReady(true);
    
    engine.syncLayerVisibility(['layer1', 'layer2'], true);
    
    expect(mockMap.setLayoutProperty).toHaveBeenCalledWith('layer1', 'visibility', 'visible');
    expect(mockMap.setLayoutProperty).toHaveBeenCalledWith('layer2', 'visibility', 'visible');
    
    engine.syncLayerVisibility(['layer1'], false);
    expect(mockMap.setLayoutProperty).toHaveBeenCalledWith('layer1', 'visibility', 'none');
  });

  it('should sync source data correctly', () => {
    const engine = new MapEngine(mockMap);
    engine.setReady(true);
    
    const mockSource = { setData: vi.fn() };
    mockMap.getSource.mockReturnValue(mockSource);
    
    const testData = { type: 'FeatureCollection', features: [] };
    engine.syncSourceData('test-source', testData);
    
    expect(mockMap.getSource).toHaveBeenCalledWith('test-source');
    expect(mockSource.setData).toHaveBeenCalledWith(testData);
  });

  it('should batch sync layers and data', () => {
    const engine = new MapEngine(mockMap);
    engine.setReady(true);
    
    const layerMap = { category1: ['l1', 'l2'] };
    const activeStates = { category1: true };
    const sourceData = { 's1': { data: 1 } };
    
    const mockSource = { setData: vi.fn() };
    mockMap.getSource.mockReturnValue(mockSource);

    engine.batchSync(layerMap, activeStates, sourceData);
    
    expect(mockMap.setLayoutProperty).toHaveBeenCalledWith('l1', 'visibility', 'visible');
    expect(mockSource.setData).toHaveBeenCalledWith({ data: 1 });
  });

  it('should not sync if map or style is not ready', () => {
    const engine = new MapEngine(mockMap);
    engine.setReady(false);
    
    mockMap.setLayoutProperty.mockClear();
    engine.syncLayerVisibility(['l1'], true);
    expect(mockMap.setLayoutProperty).not.toHaveBeenCalled();
  });
});
