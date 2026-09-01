import React, { useState } from 'react';
import {
  BarChart3,
  MapPin,
  Gauge,
  Sparkles
} from 'lucide-react';
import { EquipmentUtilization, SiteAnalytics } from '../api/analytics';

interface UtilizationChartsProps {
  utilizationData: EquipmentUtilization[];
  siteData: SiteAnalytics[];
  onSelectEquipment?: (equipmentId: string) => void;
}

export const UtilizationCharts: React.FC<UtilizationChartsProps> = ({
  utilizationData,
  siteData,
  onSelectEquipment
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'utilization' | 'engineVsIdle' | 'sites'>('utilization');

  // Sort equipment by utilization rate descending
  const sortedByUtil = [...utilizationData].sort((a, b) => b.utilization_rate - a.utilization_rate);

  // Compute fleet totals
  const totalEngine = utilizationData.reduce((acc, curr) => acc + Number(curr.engine_hours), 0);
  const totalIdle = utilizationData.reduce((acc, curr) => acc + Number(curr.idle_hours), 0);
  const totalCombined = totalEngine + totalIdle;
  const overallUtilRate = totalCombined > 0 ? (totalEngine / totalCombined) * 100 : 0;
  const overallIdleRate = totalCombined > 0 ? (totalIdle / totalCombined) * 100 : 0;

  // Donut SVG constants
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallUtilRate / 100) * circumference;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-soft space-y-6">
      {/* Chart Top Bar & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-600 text-white font-black rounded-xl shadow-soft">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Customer Rental Utilization &amp; Telematics
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Deterministic operating efficiency calculated from Caterpillar IoT machine feeds
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 text-xs">
          <button
            onClick={() => setActiveChartTab('utilization')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all duration-150 ${
              activeChartTab === 'utilization'
                ? 'bg-white text-slate-900 shadow-soft'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Machine Utilization %
          </button>
          <button
            onClick={() => setActiveChartTab('engineVsIdle')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all duration-150 ${
              activeChartTab === 'engineVsIdle'
                ? 'bg-white text-slate-900 shadow-soft'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Engine vs. Idle Waste
          </button>
          <button
            onClick={() => setActiveChartTab('sites')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all duration-150 ${
              activeChartTab === 'sites'
                ? 'bg-white text-slate-900 shadow-soft'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Job Site Efficiency
          </button>
        </div>
      </div>

      {/* Fleet Overview Highlight Card with SVG Donut Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gradient-to-br from-slate-50 to-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        {/* SVG Donut Chart Meter */}
        <div className="flex items-center space-x-4">
          <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="9"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-amber-400"
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={0}
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-emerald-500 transition-all duration-1000 ease-out"
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-base font-extrabold text-slate-900 font-mono block leading-none">
                {overallUtilRate.toFixed(0)}%
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">UTIL</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-emerald-600" /> Fleet Energy Balance
            </span>
            <div className="text-[11px] space-y-0.5 font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-700 font-bold">{totalEngine.toFixed(1)} hrs</span> Productive Engine
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-slate-700 font-bold">{totalIdle.toFixed(1)} hrs</span> Standby Waste ({overallIdleRate.toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Machine Breakdown Metric */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Telematics Recorded
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 font-mono">{totalCombined.toFixed(0)} hrs</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {utilizationData.length} Rented Units
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Sum of active engine + idle standby</span>
        </div>

        {/* Actionable Insights */}
        <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/70 flex flex-col justify-between shadow-2xs">
          <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Opportunity Cost Target
          </span>
          <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1">
            Reallocating idle machines from low-intensity sites can unlock up to <strong>+24% utilization gain</strong> and prevent contract budget leakage.
          </p>
        </div>
      </div>

      {/* Tab 1: Machine Utilization Rate Bar Chart */}
      {activeChartTab === 'utilization' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-2">
            <span>Rented Machine Asset</span>
            <span>Operating Utilization Ratio [Engine / Total Hours]</span>
          </div>

          <div className="space-y-3">
            {sortedByUtil.map((eq) => {
              const util = eq.utilization_rate;
              let barColor = 'bg-emerald-500';
              let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              if (util < 25.0) {
                barColor = 'bg-rose-500';
                badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
              } else if (util < 50.0) {
                barColor = 'bg-amber-500';
                badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
              } else if (util < 75.0) {
                barColor = 'bg-sky-500';
                badgeColor = 'bg-sky-50 text-sky-700 border-sky-200';
              }

              return (
                <div
                  key={eq.equipment_id}
                  onClick={() => onSelectEquipment && onSelectEquipment(eq.equipment_id)}
                  className="space-y-1.5 group cursor-pointer hover:bg-slate-50 p-3 rounded-xl border border-transparent hover:border-slate-200/80 transition-all duration-150"
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono font-bold text-slate-900 group-hover:text-amber-600 transition">
                        #{eq.equipment_id}
                      </span>
                      <span className="text-slate-500 text-[11px] font-medium">
                        ({eq.equipment_type} &bull; {eq.site_name || 'Unassigned'})
                      </span>
                    </div>
                    <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded-lg border shadow-2xs ${badgeColor}`}>
                      {util.toFixed(1)}% <span className="font-sans font-normal text-[10px] opacity-80">util</span>
                    </span>
                  </div>

                  {/* Horizontal Bar with Soft Track */}
                  <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/70 p-0.5">
                    <div
                      style={{ width: `${Math.max(util, 3)}%` }}
                      className={`${barColor} transition-all duration-700 rounded-full shadow-2xs`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Stacked Engine vs. Idle Waste Chart */}
      {activeChartTab === 'engineVsIdle' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-2">
            <div className="flex items-center space-x-4">
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-slate-700">Productive Engine Load (hrs)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-amber-400" />
                <span className="text-slate-700">Standby Idle Waste (hrs)</span>
              </span>
            </div>
            <span className="text-[11px]">Total Telematics Logged</span>
          </div>

          <div className="space-y-3">
            {utilizationData.map((eq) => {
              const eng = Number(eq.engine_hours);
              const idl = Number(eq.idle_hours);
              const total = eng + idl;
              const engPct = total > 0 ? (eng / total) * 100 : 0;
              const idlPct = total > 0 ? (idl / total) * 100 : 0;

              return (
                <div
                  key={eq.equipment_id}
                  onClick={() => onSelectEquipment && onSelectEquipment(eq.equipment_id)}
                  className="space-y-1.5 group cursor-pointer hover:bg-slate-50 p-3 rounded-xl border border-transparent hover:border-slate-200/80 transition-all duration-150"
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900 group-hover:text-amber-600 transition">
                        #{eq.equipment_id}
                      </span>
                      <span className="text-slate-500 text-[11px] font-medium">
                        ({eq.equipment_type})
                      </span>
                    </div>
                    <div className="font-mono text-xs space-x-2">
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {eng.toFixed(1)}h engine
                      </span>
                      <span className="text-slate-400">|</span>
                      <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {idl.toFixed(1)}h idle ({idlPct.toFixed(0)}%)
                      </span>
                    </div>
                  </div>

                  {/* Stacked Comparative Bar */}
                  <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/70 p-0.5 gap-0.5">
                    <div
                      style={{ width: `${engPct}%` }}
                      className="bg-emerald-500 rounded-l-full transition-all duration-700"
                      title={`Engine: ${eng} hrs`}
                    />
                    <div
                      style={{ width: `${idlPct}%` }}
                      className="bg-amber-400 rounded-r-full transition-all duration-700"
                      title={`Idle: ${idl} hrs`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Site Efficiency Comparison */}
      {activeChartTab === 'sites' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {siteData.map((s) => {
            const util = s.average_utilization;
            let badgeColor = 'text-emerald-700 border-emerald-200 bg-emerald-50';
            if (util < 25) badgeColor = 'text-rose-700 border-rose-200 bg-rose-50';
            else if (util < 60) badgeColor = 'text-amber-800 border-amber-200 bg-amber-50';

            return (
              <div
                key={s.site_id}
                className="bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-5 space-y-3.5 shadow-2xs hover:shadow-soft transition-all duration-150"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{s.site_name}</h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      {s.location}
                    </p>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border shadow-2xs ${badgeColor}`}>
                    {util.toFixed(1)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60 font-medium">
                  <div className="bg-white p-2 rounded-xl border border-slate-200/60 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Machines</span>
                    <span className="font-bold text-slate-900">{s.equipment_count} units</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200/60 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Rentals</span>
                    <span className="font-bold text-sky-700">{s.active_rentals} active</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200/60 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Engine Hrs</span>
                    <span className="font-mono font-bold text-emerald-600">{Number(s.total_engine_hours).toFixed(0)}h</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200/60 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Idle Hrs</span>
                    <span className="font-mono font-bold text-amber-700">{Number(s.total_idle_hours).toFixed(0)}h</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
