import React from 'react';
import { TrendingUp, MapPin, Activity, Calendar, Sparkles, BarChart2 } from 'lucide-react';
import { ForecastMatrixPoint, SiteForecastSummary } from '../api/forecasts';

interface ForecastHeatmapProps {
  matrixData: ForecastMatrixPoint[];
  siteSummaries: SiteForecastSummary[];
  onGenerateForecast: () => void;
  isGenerating?: boolean;
}

export const ForecastHeatmap: React.FC<ForecastHeatmapProps> = ({
  matrixData,
  siteSummaries,
  onGenerateForecast,
  isGenerating
}) => {
  const equipmentTypes = ['Excavator', 'Bulldozer', 'Crane', 'Grader'];

  // Calculate category averages for the Equipment Demand Distribution Graph
  const categoryStats = equipmentTypes.map((eqType) => {
    const points = matrixData.filter((m) => m.equipment_type.toLowerCase() === eqType.toLowerCase());
    const avgScore = points.length > 0
      ? points.reduce((acc, curr) => acc + curr.demand_score, 0) / points.length
      : 0.35;
    const highSites = points.filter((p) => p.demand_level === 'HIGH').length;
    return {
      type: eqType,
      avgScore: Number(avgScore.toFixed(2)),
      pct: Math.round(avgScore * 100),
      highSites,
      level: avgScore >= 0.65 ? 'HIGH' : avgScore >= 0.35 ? 'MEDIUM' : 'LOW'
    };
  });

  const getDemandPill = (score: number, level: string) => {
    switch (level) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center text-xs font-black font-mono px-3 py-1 rounded-xl bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-2xs">
            HIGH ({score.toFixed(2)})
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center text-xs font-black font-mono px-3 py-1 rounded-xl bg-sky-100 text-sky-950 border border-sky-300 shadow-2xs">
            MED ({score.toFixed(2)})
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-xs font-bold font-mono px-3 py-1 rounded-xl bg-slate-200 text-slate-800 border border-slate-300">
            LOW ({score.toFixed(2)})
          </span>
        );
    }
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-soft space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-sky-600 text-white font-black rounded-xl shadow-soft">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h3 className="text-base font-black text-slate-950 tracking-tight">
                Predictive Demand Forecast Matrix
              </h3>
              <span className="bg-sky-100 text-sky-950 border border-sky-300 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                7&ndash;30 Day Horizon
              </span>
            </div>
            <p className="text-xs text-slate-600 font-semibold">
              Random Forest projected equipment demand intensity across Texas construction job sites
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onGenerateForecast}
            disabled={isGenerating}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-sky-700 hover:bg-sky-600 text-white rounded-xl text-xs font-black transition shadow-soft disabled:opacity-50"
          >
            <Activity className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Computing ML Pipeline...' : 'Generate Forecast'}</span>
          </button>
        </div>
      </div>

      {/* Equipment Demand Category Distribution Graph */}
      <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-sky-700" />
            Machine Type Demand Intensity Distribution
          </span>
          <span className="text-[11px] text-slate-600 font-bold">
            Aggregated across 6 Texas deployment sites
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {categoryStats.map((cat) => {
            let barColor = 'bg-slate-500';
            let badgeStyle = 'bg-slate-200 text-slate-900 border-slate-300';
            if (cat.level === 'HIGH') {
              barColor = 'bg-emerald-600';
              badgeStyle = 'bg-emerald-100 text-emerald-950 border-emerald-300';
            } else if (cat.level === 'MEDIUM') {
              barColor = 'bg-sky-600';
              badgeStyle = 'bg-sky-100 text-sky-950 border-sky-300';
            }

            return (
              <div key={cat.type} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-950">{cat.type}</span>
                  <span className={`text-[11px] font-black font-mono px-2 py-0.5 rounded-md border ${badgeStyle}`}>
                    Score: {cat.avgScore}
                  </span>
                </div>

                {/* Progress Bar Meter */}
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                  <div
                    style={{ width: `${Math.max(cat.pct, 6)}%` }}
                    className={`${barColor} rounded-full transition-all duration-700`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 font-bold">
                  <span>Intensity: {cat.level}</span>
                  <span>{cat.highSites} peak site{cat.highSites === 1 ? '' : 's'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Metadata */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-700 gap-3 pb-1 font-semibold">
        <div className="flex items-center space-x-4">
          <span className="font-bold text-slate-900">Demand Intensity:</span>
          <span className="flex items-center gap-1.5 font-bold">
            <div className="w-3 h-3 rounded-full bg-emerald-600" /> HIGH (&ge;0.65)
          </span>
          <span className="flex items-center gap-1.5 font-bold">
            <div className="w-3 h-3 rounded-full bg-sky-600" /> MEDIUM (0.35&ndash;0.64)
          </span>
          <span className="flex items-center gap-1.5 font-bold">
            <div className="w-3 h-3 rounded-full bg-slate-500" /> LOW (&lt;0.35)
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 px-3 py-1 rounded-xl border border-slate-300 font-bold">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Model: Deterministic Random Forest (50 Estimators)</span>
        </div>
      </div>

      {/* Heatmap Matrix Table */}
      <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 shadow-2xs">
        <table className="w-full text-left text-xs text-slate-800 font-medium">
          <thead className="bg-slate-100 text-slate-900 font-black border-b-2 border-slate-200 uppercase text-[11px] tracking-wider">
            <tr>
              <th className="py-4 px-5">Job Site &amp; Location</th>
              <th className="py-4 px-4">Overall Site Demand</th>
              {equipmentTypes.map((t) => (
                <th key={t} className="py-4 px-4 text-center">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {siteSummaries.map((site) => {
              return (
                <tr key={site.site_id} className="hover:bg-slate-50 transition">
                  <td className="py-4 px-5">
                    <span className="font-black text-slate-950 block text-sm">{site.site_name}</span>
                    <span className="text-slate-600 text-xs flex items-center gap-1 mt-0.5 font-bold">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      {site.location}
                    </span>
                  </td>

                  <td className="py-4 px-4 font-mono font-black">
                    <span className={`px-3 py-1 rounded-xl text-xs border shadow-2xs ${
                      site.overall_demand_level === 'HIGH'
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                        : site.overall_demand_level === 'MEDIUM'
                        ? 'bg-sky-100 text-sky-950 border-sky-300'
                        : 'bg-slate-200 text-slate-900 border-slate-300'
                    }`}>
                      {site.overall_demand_level} ({site.top_predicted_demand_score.toFixed(2)})
                    </span>
                  </td>

                  {equipmentTypes.map((eqType) => {
                    const point = matrixData.find(
                      (m) => m.site_id === site.site_id && m.equipment_type.toLowerCase() === eqType.toLowerCase()
                    );
                    const score = point ? point.demand_score : 0.25;
                    const level = point ? point.demand_level : 'LOW';

                    return (
                      <td key={eqType} className="py-4 px-4 text-center">
                        {getDemandPill(score, level)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
