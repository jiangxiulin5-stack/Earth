import React, { useEffect, useState, useRef } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import * as d3 from 'd3';
import { GeoJsonFeature } from '../types';

interface WorldGlobeProps {
  countries: GeoJsonFeature[];
  onCountrySelect: (name: string, iso: string) => void;
  selectedISO: string | null;
}

// 预定义的高对比度配色盘（排除红色系）
const PALETTE = [
  "#2563eb", // Blue 600
  "#16a34a", // Green 600
  "#d97706", // Amber 600
  "#9333ea", // Purple 600
  "#0891b2", // Cyan 600
  "#65a30d", // Lime 600
  "#4f46e5", // Indigo 600
  "#0d9488", // Teal 600
  "#c026d3", // Fuchsia 600
  "#ca8a04", // Yellow 600
];

const getStringHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};

// Helper: Check if an ISO code belongs to the "Greater China" sovereignty group
const isChinaGroup = (iso: string) => iso === 'CHN' || iso === 'TWN';

const WorldGlobe: React.FC<WorldGlobeProps> = ({ countries, onCountrySelect, selectedISO }) => {
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

  const getPolygonLabel = (d: object) => {
    const feat = d as GeoJsonFeature;
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

  const getRegionColor = (feat: GeoJsonFeature) => {
      const { ISO_A3, NAME } = feat.properties;

      // 1. 中国及中国台湾 - 红色高亮 (#ef4444 = Red 500)
      if (
          ISO_A3 === 'CHN' || 
          ISO_A3 === 'TWN' || 
          NAME === 'China' || 
          NAME.includes('中国') 
      ) {
          return 'rgba(239, 68, 68, 0.9)'; 
      }

      // 2. 其他国家 - 随机非红配色
      const seed = ISO_A3 || NAME || "";
      const hash = getStringHash(seed);
      const colorHex = PALETTE[Math.abs(hash) % PALETTE.length];
      
      return `${colorHex}E6`; 
  };

  // 统一的高亮判定逻辑：包含 Hover 和 Selected 状态，并处理中国/台湾联动
  const checkHighlight = (d: GeoJsonFeature) => {
      const iso = d.properties.ISO_A3;
      
      // 1. Check Hover State
      if (hoverD) {
          const hoverIso = hoverD.properties.ISO_A3;
          // Direct match
          if (hoverD === d) return true; 
          // China/Taiwan Link: If hovering one, highlight the other
          if (isChinaGroup(iso) && isChinaGroup(hoverIso)) return true;
      }

      // 2. Check Selected State (Click persistence)
      if (selectedISO) {
          // Direct match
          if (iso === selectedISO) return true;
          // China/Taiwan Link: If one is selected, highlight the other
          if (isChinaGroup(iso) && isChinaGroup(selectedISO)) return true;
      }
      
      return false;
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
        
        // 联动高度：如果属于高亮组，统一升起
        polygonAltitude={d => checkHighlight(d as GeoJsonFeature) ? 0.08 : 0.01}
        
        // 联动颜色：如果属于高亮组，统一变白
        polygonCapColor={d => {
            const feat = d as GeoJsonFeature;
            if (checkHighlight(feat)) return '#ffffff'; // Highlight color
            return getRegionColor(feat);
        }}
        
        polygonSideColor={() => 'rgba(255, 255, 255, 0.1)'}
        polygonStrokeColor={() => 'rgba(255, 255, 255, 0.5)'}
        polygonLabel={getPolygonLabel}
        
        onPolygonHover={setHoverD}
        onPolygonClick={(d) => {
            const feat = d as GeoJsonFeature;
            onCountrySelect(feat.properties.NAME, feat.properties.ISO_A3);
        }}
        
        atmosphereColor="#3b82f6"
        atmosphereAltitude={0.15}
      />
    </div>
  );
};

export default WorldGlobe;