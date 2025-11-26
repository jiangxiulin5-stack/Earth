
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import WorldGlobe from './components/WorldGlobe';
import DemographicPanel from './components/DemographicPanel';
// Switched from AI service to local data service
import { generateCountryData } from './services/dataService';
import { DemographicReport, GeoJsonFeature } from './types';
import { Globe2, Info, Search, Filter, SortAsc, SortDesc, List } from 'lucide-react';
import * as d3 from 'd3';

const continentMap: Record<string, string> = {
  "All Regions": "所有区域",
  "Asia": "亚洲",
  "Europe": "欧洲",
  "Africa": "非洲",
  "North America": "北美洲",
  "South America": "南美洲",
  "Oceania": "大洋洲",
  "Antarctica": "南极洲",
  "Other": "其他"
};

const App: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedISO, setSelectedISO] = useState<string | null>(null);
  const [demographicData, setDemographicData] = useState<DemographicReport | null>(null);
  
  // Data State
  const [allCountries, setAllCountries] = useState<GeoJsonFeature[]>([]);
  
  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContinent, setSelectedContinent] = useState("All Regions");
  const [sortMode, setSortMode] = useState<"pop_desc" | "pop_asc" | "name">("pop_desc");
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  // Fetch and Process Data
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(data => {
        const translator = new Intl.DisplayNames(['zh-Hans'], { type: 'region' });

        // 1. Identify China's population first to use for unification
        let chinaPop = 1400000000; 
        const chinaFeature = data.features.find((f: any) => f.properties.ISO_A3 === 'CHN' || f.properties.NAME === 'China');
        if (chinaFeature) {
          chinaPop = chinaFeature.properties.POP_EST;
        }

        // 2. Process all features
        const processedFeatures = data.features
          .filter((f: any) => f.properties.ISO_A3 !== '-99') 
          .map((f: GeoJsonFeature) => {
             // 2.1 PRESERVE ENGLISH NAME before translating
             f.properties.NAME_EN = f.properties.NAME;

             f.properties.COLOR_POP = f.properties.POP_EST;

             if (!f.properties.CONTINENT) {
                 f.properties.CONTINENT = "Other";
             }

             // 2.2 Translate Name
             let zhName = f.properties.NAME;
             try {
                if (f.properties.ISO_A2) {
                   zhName = translator.of(f.properties.ISO_A2) || f.properties.NAME;
                } 
             } catch (e) { }
             f.properties.NAME = zhName;

             // 2.3 Strict override for Taiwan
             if (f.properties.ISO_A3 === 'TWN' || f.properties.NAME_EN === 'Taiwan' || f.properties.NAME.includes('台湾')) {
               f.properties.NAME = '中国台湾';
               f.properties.NAME_EN = 'Taiwan, Province of China'; // Override English Name
               f.properties.ADMIN = '中国台湾';
               f.properties.SOVEREIGNT = 'China';
               f.properties.CONTINENT = 'Asia'; 
               f.properties.COLOR_POP = chinaPop; // Color Unification
             }
             
             // 2.4 Visual adjustment for India
             if (f.properties.ISO_A3 === 'IND') {
                f.properties.COLOR_POP = 200000000; 
             }
             
             return f;
        });
        setAllCountries(processedFeatures);
      })
      .catch(err => console.error("Failed to load map data", err));
  }, []);

  const availableContinents = useMemo(() => {
    const continents = new Set(allCountries.map(c => c.properties.CONTINENT).filter(Boolean));
    const sorted = Array.from(continents).sort();
    return ["All Regions", ...sorted];
  }, [allCountries]);

  const filteredCountries = useMemo(() => {
    let result = [...allCountries];

    if (selectedContinent !== "All Regions") {
      result = result.filter(c => c.properties.CONTINENT === selectedContinent);
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(c => 
        (c.properties.NAME && c.properties.NAME.toLowerCase().includes(lowerTerm)) || 
        (c.properties.ISO_A3 && c.properties.ISO_A3.toLowerCase().includes(lowerTerm))
      );
    }

    result.sort((a, b) => {
      if (sortMode === 'pop_desc') return b.properties.POP_EST - a.properties.POP_EST;
      if (sortMode === 'pop_asc') return a.properties.POP_EST - b.properties.POP_EST;
      return a.properties.NAME.localeCompare(b.properties.NAME, 'zh-CN');
    });

    return result;
  }, [allCountries, selectedContinent, searchTerm, sortMode]);

  const handleCountrySelect = useCallback((name: string, iso: string) => {
    setSelectedCountry(name);
    setSelectedISO(iso);
    
    // Find the feature to pass to the data generator
    const feature = allCountries.find(c => c.properties.ISO_A3 === iso);
    
    if (feature) {
        // INSTANTLY generate data locally, no loading state needed
        const data = generateCountryData(feature);
        setDemographicData(data);
    }
  }, [allCountries]);

  const closePanel = () => {
    setSelectedCountry(null);
    setSelectedISO(null);
    setDemographicData(null);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans">
      
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-4 z-10 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl max-w-md">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tighter flex items-center gap-3">
              <Globe2 className="text-blue-500 animate-pulse" size={32} />
              <span>全球人口展望 <span className="text-blue-500">2025</span></span>
            </h1>
            <p className="text-gray-400 mt-2 text-xs md:text-sm">
              2025年交互式人口预测。基于 NE 模拟数据。
            </p>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`absolute top-40 left-4 z-20 transition-all duration-300 ${isFilterOpen ? 'w-80' : 'w-14'}`}>
        <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[calc(100vh-200px)]">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="p-3 w-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white transition-colors border-b border-white/10"
          >
            {isFilterOpen ? (
               <div className="flex items-center w-full justify-between px-2">
                 <span className="text-sm font-semibold tracking-wider uppercase text-blue-400">控制面板</span>
                 <Filter size={16} />
               </div>
            ) : (
               <List size={20} />
            )}
          </button>

          {isFilterOpen && (
            <div className="p-4 space-y-5 flex flex-col flex-grow overflow-hidden">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                <input 
                  type="text" 
                  placeholder="搜索..." 
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-gray-600 transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase text-gray-500 font-bold tracking-widest flex items-center gap-2">
                    区域筛选
                </label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
                  value={selectedContinent}
                  onChange={(e) => setSelectedContinent(e.target.value)}
                >
                  {availableContinents.map(c => (
                      <option key={c} value={c} className="bg-zinc-900 text-gray-200">
                        {continentMap[c] || c}
                      </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">排序方式</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSortMode('pop_desc')}
                    className={`flex-1 flex items-center justify-center p-2 rounded-lg border transition-all ${sortMode === 'pop_desc' ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-400'}`}
                  >
                    <SortDesc size={18} />
                  </button>
                  <button 
                    onClick={() => setSortMode('pop_asc')}
                    className={`flex-1 flex items-center justify-center p-2 rounded-lg border transition-all ${sortMode === 'pop_asc' ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-400'}`}
                  >
                    <SortAsc size={18} />
                  </button>
                  <button 
                    onClick={() => setSortMode('name')}
                    className={`flex-1 text-xs font-bold uppercase tracking-wider p-2 rounded-lg border transition-all ${sortMode === 'name' ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-400'}`}
                  >
                    A-Z
                  </button>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto space-y-1 pr-1 mt-2 custom-scrollbar">
                <div className="text-[10px] text-gray-500 mb-2 flex justify-between items-center">
                    <span>{filteredCountries.length} 个地区</span>
                    <span className="text-[9px] opacity-50">数据: NE Admin 0</span>
                </div>
                {filteredCountries.map((c) => (
                  <button
                    key={c.properties.ISO_A3}
                    onClick={() => handleCountrySelect(c.properties.NAME, c.properties.ISO_A3)}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-white/10 transition-colors flex justify-between items-center group border border-transparent hover:border-white/5"
                  >
                    <div className="flex flex-col">
                        <span className={`text-sm ${selectedCountry === c.properties.NAME ? 'text-blue-400 font-bold' : 'text-gray-300'}`}>
                        {c.properties.NAME}
                        </span>
                        {c.properties.NAME === '中国台湾' && (
                            <span className="text-[10px] text-gray-500 font-medium tracking-wide">中国台湾省</span>
                        )}
                    </div>
                    <span className="text-xs text-gray-600 group-hover:text-gray-400 font-mono">
                      {d3.format(".2s")(c.properties.POP_EST)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <WorldGlobe 
        countries={filteredCountries} 
        onCountrySelect={handleCountrySelect}
        selectedISO={selectedISO}
      />

      {selectedCountry && (
        <DemographicPanel 
          countryName={selectedCountry}
          data={demographicData}
          onClose={closePanel}
        />
      )}

      <div className="absolute bottom-4 right-6 z-10 text-gray-500 text-xs pointer-events-none flex flex-col items-end gap-1">
         <div className="flex items-center gap-2">
            <Info size={12} />
            <span>Visualization: React Globe.GL / D3.js</span>
         </div>
      </div>
    </div>
  );
};

export default App;
