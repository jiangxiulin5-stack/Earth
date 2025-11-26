import React, { useEffect, useState, useMemo, useRef } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import * as d3 from 'd3';
import { GeoJsonFeature } from '../types';

interface WorldGlobeProps {
  countries: GeoJsonFeature[];
  onCountrySelect: (name: string, iso: string) => void;
}

const WorldGlobe: React.FC<WorldGlobeProps> = ({ countries, onCountrySelect }) => {
  const globeEl = useRef<GlobeMethods | undefined>(undefined);
  const [hoverD, setHoverD] = useState<GeoJsonFeature | null>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Color scale for population
  const colorScale = useMemo(() => {
    return d3.scaleSequentialSqrt(d3.interpolateInferno)
      .domain([0, 1e9]); // Domain from 0 to 1 Billion+ for contrast
  }, []);

  const getPolygonLabel = (d: object) => {
    const feat = d as GeoJsonFeature;
    // Name is already pre-processed in App.tsx
    const name = feat.properties.NAME;
    const continentMap: Record<string, string> = {
      "Asia": "亚洲",
      "Europe": "欧洲",
      "Africa": "非洲",
      "North America": "北美洲",
      "South America": "南美洲",
      "Oceania": "大洋洲",
      "Antarctica": "南极洲",
      "Seven seas (open ocean)": "公海",
      "Other": "其他"
    };

    const continent = continentMap[feat.properties.CONTINENT || "Other"] || feat.properties.CONTINENT;
    
    return `
      <div class="bg-black/80 text-white px-3 py-2 rounded-lg border border-white/20 text-sm font-sans backdrop-blur-md shadow-xl">
        <strong class="text-blue-400 text-lg">${name}</strong> <br />
        <span class="text-xs text-gray-300">区域: ${continent}</span><br/>
        <span class="text-xs text-gray-300">人口: ${d3.format(".2s")(feat.properties.POP_EST)} (预估)</span>
      </div>
    `;
  };

  return (
    <div className="cursor-move">
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        lineHoverPrecision={0}
        
        polygonsData={countries}
        polygonAltitude={d => d === hoverD ? 0.06 : 0.01}
        polygonCapColor={d => {
            const feat = d as GeoJsonFeature;
            // Highlight hover
            if (d === hoverD) return '#3b82f6';
            
            // Base color on unified population metric (COLOR_POP) if available, else POP_EST
            // This ensures Taiwan is colored the same as China if COLOR_POP is shared
            const pop = feat.properties.COLOR_POP || feat.properties.POP_EST;
            
            // Make boundaries distinct but colors blend nicely with the night theme
            const color = d3.color(colorScale(pop));
            return color ? `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)` : 'rgba(255,255,255,0.1)';
        }}
        polygonSideColor={() => 'rgba(255, 255, 255, 0.05)'}
        polygonStrokeColor={() => '#111'}
        polygonLabel={getPolygonLabel}
        
        onPolygonHover={setHoverD}
        onPolygonClick={(d) => {
            const feat = d as GeoJsonFeature;
            onCountrySelect(feat.properties.NAME, feat.properties.ISO_A3);
        }}
        
        // Atmosphere
        atmosphereColor="#3b82f6"
        atmosphereAltitude={0.15}
      />
    </div>
  );
};

export default WorldGlobe;