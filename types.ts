
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
    ISO_A2?: string; // Added for Intl.DisplayNames compatibility and Flags
    NAME: string;    // Chinese Name (after translation)
    NAME_EN?: string; // Original English Name
    POP_EST: number;
    CONTINENT?: string;
    COLOR_POP?: number; // Used for coloring logic
    [key: string]: any;
  };
  geometry: any;
}

export interface PopulationTrend {
  year: number;
  value: number;
}

export interface DemographicReport {
  englishName: string;
  flagUrl: string;
  population2025: string;
  growthRate: string;
  medianAge: string;
  keyTrends: string[];
  urbanizationRate: string;
  historyData: PopulationTrend[];
}

export enum ViewMode {
  POPULATION = 'POPULATION',
  GDP = 'GDP',
}
