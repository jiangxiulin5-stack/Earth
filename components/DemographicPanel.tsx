
import React from 'react';
import { DemographicReport } from '../types';
import { Users, TrendingUp, Building2, User, X } from 'lucide-react';
import * as d3 from 'd3';

interface DemographicPanelProps {
  countryName: string;
  data: DemographicReport | null;
  onClose: () => void;
}

const DemographicPanel: React.FC<DemographicPanelProps> = ({ countryName, data, onClose }) => {
  if (!data) return null;

  // Simple Area Chart Component
  const TrendChart = () => {
    const width = 300;
    const height = 100;
    const margin = { top: 10, right: 10, bottom: 20, left: 10 };

    // Scales
    const x = d3.scaleLinear()
      .domain(d3.extent(data.historyData, d => d.year) as [number, number])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain(d3.extent(data.historyData, d => d.value) as [number, number])
      .range([height - margin.bottom, margin.top]);

    // Generators
    const line = d3.line<{year: number, value: number}>()
      .curve(d3.curveMonotoneX)
      .x(d => x(d.year))
      .y(d => y(d.value));

    const area = d3.area<{year: number, value: number}>()
      .curve(d3.curveMonotoneX)
      .x(d => x(d.year))
      .y0(height - margin.bottom)
      .y1(d => y(d.value));

    // Get 2025 point for highlighting
    const point2025 = data.historyData.find(d => d.year === 2025);
    const cx = point2025 ? x(point2025.year) : 0;
    const cy = point2025 ? y(point2025.value) : 0;

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        
        {/* Axis Labels */}
        <text x={margin.left} y={height} fill="#6b7280" fontSize="10" fontWeight="bold">2020</text>
        <text x={width - margin.right} y={height} fill="#6b7280" fontSize="10" textAnchor="end" fontWeight="bold">2030</text>

        {/* Paths */}
        <path d={area(data.historyData) || ""} fill="url(#chartFill)" />
        <path d={line(data.historyData) || ""} fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />

        {/* 2025 Highlight */}
        {point2025 && (
          <g>
            <circle cx={cx} cy={cy} r="4" fill="#000" stroke="#60a5fa" strokeWidth="2" />
            <circle cx={cx} cy={cy} r="2" fill="#fff" />
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className="absolute top-0 right-0 h-full w-full md:w-96 bg-black/90 backdrop-blur-xl border-l border-white/10 p-6 text-white shadow-2xl transition-transform duration-300 overflow-y-auto z-30">
      
      {/* Close Button */}
      <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-20 text-gray-400 hover:text-white">
        <X size={24} />
      </button>

      {/* Header Section: Flag & Names */}
      <div className="flex flex-col space-y-4 mb-8 mt-2">
        <div className="relative w-24 h-16 rounded-md overflow-hidden shadow-lg border border-white/20">
            <img 
              src={data.flagUrl} 
              alt={`${countryName} flag`} 
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
            />
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 leading-tight">
            {countryName}
          </h2>
          <p className="text-sm text-gray-500 font-mono font-medium tracking-wide uppercase mt-1">
            {data.englishName}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all">
            <div className="flex items-center space-x-2 text-blue-400 mb-2">
              <Users size={16} />
              <span className="text-[10px] uppercase tracking-wider font-bold">2025 总人口</span>
            </div>
            <p className="text-xl font-semibold tracking-tight">{data.population2025}</p>
          </div>
          
          <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-green-500/30 transition-all">
            <div className="flex items-center space-x-2 text-green-400 mb-2">
              <TrendingUp size={16} />
              <span className="text-[10px] uppercase tracking-wider font-bold">增长率</span>
            </div>
            <p className="text-xl font-semibold tracking-tight">{data.growthRate}</p>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all">
            <div className="flex items-center space-x-2 text-purple-400 mb-2">
              <User size={16} />
              <span className="text-[10px] uppercase tracking-wider font-bold">中位年龄</span>
            </div>
            <p className="text-xl font-semibold tracking-tight">{data.medianAge}</p>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-orange-500/30 transition-all">
            <div className="flex items-center space-x-2 text-orange-400 mb-2">
              <Building2 size={16} />
              <span className="text-[10px] uppercase tracking-wider font-bold">城市化率</span>
            </div>
            <p className="text-xl font-semibold tracking-tight">{data.urbanizationRate}</p>
          </div>
        </div>

        {/* Chart Container */}
        <div className="bg-gradient-to-b from-white/5 to-transparent p-4 rounded-xl border border-white/10">
           <div className="flex justify-between items-end mb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                人口趋势预测
              </h3>
              <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                2020 - 2030
              </span>
           </div>
           <div className="h-28 w-full">
              <TrendChart />
           </div>
        </div>

        {/* Key Trends */}
        <div className="mt-8">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            区域关键议题
          </h3>
          <ul className="space-y-3">
            {data.keyTrends.map((trend, idx) => (
              <li key={idx} className="flex items-start space-x-3 p-3 rounded-lg border border-transparent bg-white/[0.02] hover:bg-white/5 transition-colors group">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 group-hover:shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-shadow" />
                <span className="text-sm text-gray-300 leading-relaxed group-hover:text-white transition-colors">
                  {trend}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DemographicPanel;
