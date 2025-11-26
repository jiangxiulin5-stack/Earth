export interface CountryData {
  name: string;
  isoCode: string;
  population: number;
  description?: string;
}

export interface GeoJsonFeature {
  type: string;
  properties: {
    ISO_A3: string;
    ISO_A2?: string; // Added for Intl.DisplayNames compatibility
    NAME: string;
    POP_EST: number;
    CONTINENT?: string;
    COLOR_POP?: number; // Used for coloring logic (e.g. unifying sovereign territories)
    [key: string]: any;
  };
  geometry: any;
}

export interface DemographicReport {
  population2025: string;
  growthRate: string;
  medianAge: string;
  keyTrends: string[];
  urbanizationRate: string;
}

export enum ViewMode {
  POPULATION = 'POPULATION',
  GDP = 'GDP', // Placeholder for future
}