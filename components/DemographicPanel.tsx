import React from 'react';
import { DemographicReport } from '../types';
import { Users, TrendingUp, Building2, User, X, Loader2 } from 'lucide-react';

interface DemographicPanelProps {
  countryName: string;
  data: DemographicReport | null;
  isLoading: boolean;
  onClose: () => void;
}

const DemographicPanel: React.FC<DemographicPanelProps> = ({ countryName, data, isLoading, onClose }) => {
  return (
    <div className="absolute top-0 right-0 h-full w-full md:w-96 bg-black/80 backdrop-blur-xl border-l border-white/10 p-6 text-white shadow-2xl transition-transform duration-300 overflow-y-auto z-20">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          {countryName}
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 className="animate-spin text-blue-500" size={40} />
          <p className="text-gray-400 text-sm animate-pulse">正在分析 2025 预测数据...</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="flex items-center space-x-2 text-blue-400 mb-2">
                <Users size={16} />
                <span className="text-xs uppercase tracking-wider">人口总数</span>
              </div>
              <p className="text-xl font-semibold">{data.population2025}</p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="flex items-center space-x-2 text-green-400 mb-2">
                <TrendingUp size={16} />
                <span className="text-xs uppercase tracking-wider">增长率</span>
              </div>
              <p className="text-xl font-semibold">{data.growthRate}</p>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="flex items-center space-x-2 text-purple-400 mb-2">
                <User size={16} />
                <span className="text-xs uppercase tracking-wider">中位年龄</span>
              </div>
              <p className="text-xl font-semibold">{data.medianAge}</p>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="flex items-center space-x-2 text-orange-400 mb-2">
                <Building2 size={16} />
                <span className="text-xs uppercase tracking-wider">城市化</span>
              </div>
              <p className="text-xl font-semibold">{data.urbanizationRate}</p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">关键趋势 (2025展望)</h3>
            <ul className="space-y-3">
              {data.keyTrends.map((trend, idx) => (
                <li key={idx} className="flex items-start space-x-3 bg-white/5 p-3 rounded-lg border border-white/5 hover:border-blue-500/30 transition-colors">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                  <span className="text-sm text-gray-300 leading-relaxed">{trend}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-10">
          <p>请选择一个区域以查看详细分析。</p>
        </div>
      )}
    </div>
  );
};

export default DemographicPanel;