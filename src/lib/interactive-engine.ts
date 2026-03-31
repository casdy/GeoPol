import { CountryIntelligence } from './intelligence-engine';
import { Article } from './types';

export interface InteractiveState {
    activeTarget: string | null; // ISO Code
    isConflictZone: boolean;
    zoomLevel: number;
    detailLevel: 'COUNTRY' | 'REGION' | 'CITY';
}

export interface TacticalReadout {
    target: string;
    headline: string;
    intel: string;
    riskScore: number;
    status: string;
    coordinates?: [number, number];
    isCritical: boolean;
}

/**
 * Interactive Engine V1
 * Manages the transition between raw map events and tactical intelligence.
 * Works alongside the Geopolitical Intelligence Engine to optimize load and accuracy.
 */
export class InteractiveEngine {
    private state: InteractiveState = {
        activeTarget: null,
        isConflictZone: false,
        zoomLevel: 2,
        detailLevel: 'COUNTRY'
    };

    /**
     * Determines if a hover/target should be acquired based on conflict status.
     * Gated to only allow 'CRITICAL' or 'VOLATILE' zones if strict mode is on.
     */
    public shouldAcquireTarget(countryIntel: CountryIntelligence): boolean {
        return countryIntel.status === 'CRITICAL' || countryIntel.status === 'VOLATILE' || countryIntel.kineticCount > 0;
    }

    /**
     * Translates zoom level into tactical detail depth.
     */
    public getDetailLevel(zoom: number): 'COUNTRY' | 'REGION' | 'CITY' {
        if (zoom > 10) return 'CITY';
        if (zoom > 5) return 'REGION';
        return 'COUNTRY';
    }

    /**
     * Generates a concise tactical readout for the map's "Target Acquired" box.
     * Shares load with the intelligence engine by formatting raw data for high-speed UI.
     */
    public generateTacticalReadout(intel: CountryIntelligence, zoom: number): TacticalReadout {
        const detail = this.getDetailLevel(zoom);
        
        let headline = intel.topHeadline;
        let brief = intel.intelBrief;

        // Hierarchical filtering: At high zoom, we look for more specific location data in the brief
        if (detail === 'CITY' || detail === 'REGION') {
            const hasLocationDetail = brief.match(/city|sector|district|province|area/i);
            if (!hasLocationDetail) {
                headline = `[${detail} PERSPECTIVE] ${headline}`;
            }
        }

        return {
            target: intel.name,
            headline: headline,
            intel: brief,
            riskScore: intel.riskScore,
            status: intel.status,
            isCritical: intel.status === 'CRITICAL' || intel.status === 'VOLATILE'
        };
    }

    public updateState(zoom: number, target: string | null, isConflict: boolean) {
        this.state = {
            ...this.state,
            zoomLevel: zoom,
            activeTarget: target,
            isConflictZone: isConflict,
            detailLevel: this.getDetailLevel(zoom)
        };
    }

    public getCurrentState() {
        return this.state;
    }
}

export const interactiveEngine = new InteractiveEngine();
