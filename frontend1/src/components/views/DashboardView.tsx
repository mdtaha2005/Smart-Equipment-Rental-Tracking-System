import React, { useState, useEffect } from 'react';
import {
  Truck,
  Clock,
  RefreshCw,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  UserCheck,
  ShieldAlert,
  Activity,
  Flame,
  Plus,
  QrCode
} from 'lucide-react';
import { DashboardSummary, fetchDashboardSummary } from '../../api/dashboard';
import { EquipmentResponse } from '../../api/equipment';
import { EquipmentUtilization, SiteAnalytics, fetchFleetUtilization, fetchSiteAnalytics } from '../../api/analytics';
import { AlertResponse, fetchAlerts, generateAlerts } from '../../api/alerts';
import {
  SiteForecastSummary,
  ForecastMatrixPoint,
  fetchSiteForecastSummaries,
  fetchForecastMatrix,
  generateForecasts
} from '../../api/forecasts';
import {
  RecommendationResponse,
  fetchRecommendations,
  generateRecommendations
} from '../../api/recommendations';
import { ExecutiveSummaryResponse, fetchExecutiveSummary } from '../../api/demo';
import { StatusBadge } from '../StatusBadge';
import { ExecutiveSummary } from '../ExecutiveSummary';
import { AttentionCenter } from '../AttentionCenter';
import { UtilizationCharts } from '../UtilizationCharts';
import { ForecastHeatmap } from '../ForecastHeatmap';
import { RecommendationCenter } from '../RecommendationCenter';
import { ModelExplainability } from '../ModelExplainability';

interface DashboardViewProps {
  onNavigateToEquipment: (equipmentId: string) => void;
  onOpenCheckout: (equipment?: EquipmentResponse) => void;
  onOpenScanner: () => void;
  onOpenLogUsage: (equipment?: EquipmentResponse) => void;
  onOpenCreateEquipment: () => void;
  refreshTrigger: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToEquipment,
  onOpenCheckout,
  onOpenScanner,
  onOpenLogUsage,
  onOpenCreateEquipment,
  refreshTrigger
}) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [execSummary, setExecSummary] = useState<ExecutiveSummaryResponse | null>(null);
  const [utilizationList, setUtilizationList] = useState<EquipmentUtilization[]>([]);
  const [siteAnalyticsList, setSiteAnalyticsList] = useState<SiteAnalytics[]>([]);
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [siteForecasts, setSiteForecasts] = useState<SiteForecastSummary[]>([]);
  const [forecastMatrix, setForecastMatrix] = useState<ForecastMatrixPoint[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationResponse[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [isForecasting, setIsForecasting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        generateAlerts(),
        generateForecasts(7),
        generateRecommendations()
      ]);

      const [sumData, execData, utilData, siteData, alertsData, sfData, matrixData, recData] = await Promise.all([
        fetchDashboardSummary(),
        fetchExecutiveSummary(),
        fetchFleetUtilization(),
        fetchSiteAnalytics(),
        fetchAlerts({ resolved: false }),
        fetchSiteForecastSummaries(),
        fetchForecastMatrix(),
        fetchRecommendations()
      ]);

      setSummary(sumData);
      setExecSummary(execData);
      setUtilizationList(utilData);
      setSiteAnalyticsList(siteData);
      setAlerts(alertsData);
      setSiteForecasts(sfData);
      setForecastMatrix(matrixData);
      setRecommendations(recData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load customer rental operations data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const handleRunForecastDemo = async () => {
    setIsForecasting(true);
    try {
      await generateForecasts(7);
      await generateRecommendations();
      const [sfData, matrixData, recData, execData] = await Promise.all([
        fetchSiteForecastSummaries(),
        fetchForecastMatrix(),
        fetchRecommendations(),
        fetchExecutiveSummary()
      ]);
      setSiteForecasts(sfData);
      setForecastMatrix(matrixData);
      setRecommendations(recData);
      setExecSummary(execData);
    } catch (err) {
      console.error('Forecast demo run failed:', err);
    } finally {
      setIsForecasting(false);
    }
  };

  const highDemandSitesCount = siteForecasts.filter((s) => s.overall_demand_level === 'HIGH').length;

  if (loading && !summary) {
    return (
      <div className="p-16 text-center text-slate-600 flex flex-col items-center justify-center space-y-4 bg-white rounded-3xl border-2 border-slate-200 shadow-soft">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-slate-950 shadow-soft">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-700" />
        </div>
        <div>
          <h4 className="text-base font-black text-slate-950">Aggregating Machine Telematics</h4>
          <p className="text-xs text-slate-600 font-semibold mt-1">
            Training Random Forest forecasting model &amp; evaluating cross-site recommendations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Customer Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b-2 border-slate-200">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-cat-yellow text-slate-950 font-black rounded-xl border border-slate-900 shadow-2xs">
              <Truck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-950 tracking-tight">
              Customer Rental Operations &amp; Predictive Intelligence
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1 font-semibold">
            Decision support portal for equipment your organization has rented &bull; Track utilization, forecast demand &amp; optimize rental budget
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenScanner()}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
          >
            <QrCode className="w-4 h-4 text-slate-700" />
            <span>Scan Tag</span>
          </button>

          <button
            onClick={handleRunForecastDemo}
            disabled={isForecasting}
            className="px-4 py-2 bg-sky-700 hover:bg-sky-600 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-soft transition disabled:opacity-50"
          >
            <Activity className={`w-4 h-4 ${isForecasting ? 'animate-spin' : ''}`} />
            <span>{isForecasting ? 'Evaluating ML...' : 'Generate Forecast'}</span>
          </button>

          <button
            onClick={() => onOpenCheckout()}
            className="px-4 py-2 bg-cat-yellow hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-soft transition border-2 border-slate-900"
          >
            <Plus className="w-4 h-4" />
            <span>Check Out Asset</span>
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 bg-white hover:bg-slate-100 border-2 border-slate-300 rounded-xl text-slate-800 shadow-2xs transition"
            title="Refresh Intelligence"
          >
            <RefreshCw className={`w-4 h-4 text-amber-700 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-950 text-xs flex items-center space-x-3 shadow-2xs">
          <ShieldAlert className="w-5 h-5 text-rose-700 flex-shrink-0" />
          <span className="font-black">{error}</span>
        </div>
      )}

      {/* 1. Dynamic Executive Summary Banner */}
      <ExecutiveSummary summary={execSummary} loading={loading} />

      {/* 2. Top KPI Row with Embedded Graphs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Rented Machinery */}
        <div className="bg-white border-2 border-slate-200 p-5 rounded-2xl shadow-soft hover:shadow-soft-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-700">Rented Machinery</span>
            <div className="p-2 bg-amber-100 rounded-xl text-amber-900 border border-amber-300">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-black text-slate-950 font-mono tracking-tight">
              {summary?.total_equipment || 0}
            </span>
            <span className="text-xs text-slate-700 font-bold block mt-0.5">
              <strong className="text-emerald-800 font-black">{summary?.rented || 0} Active</strong> on Sites
            </span>
          </div>
          {/* Mini Status Progress Bar */}
          <div className="mt-3 pt-2 border-t border-slate-200">
            <div className="flex justify-between text-[10px] text-slate-600 font-bold mb-1">
              <span>Deployment Ratio</span>
              <span className="font-mono font-black text-slate-950">
                {summary?.total_equipment ? Math.round(((summary?.rented || 0) / summary.total_equipment) * 100) : 0}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
              <div
                style={{ width: `${summary?.total_equipment ? ((summary?.rented || 0) / summary.total_equipment) * 100 : 0}%` }}
                className="bg-amber-400 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* KPI 2: Avg Utilization WITH TOTAL UTILIZATION GRAPH */}
        <div className="bg-white border-2 border-emerald-300 p-5 rounded-2xl shadow-soft hover:shadow-soft-md transition flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-slate-900">Avg Utilization</span>
              <span className="text-[10px] text-emerald-950 bg-emerald-100 border border-emerald-300 font-black px-2 py-0.5 rounded-full ml-1.5 inline-flex items-center gap-0.5">
                <TrendingUp className="w-2.5 h-2.5" /> +4.2%
              </span>
            </div>
            <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl border border-emerald-300">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2">
            <span className="text-3xl font-black text-emerald-800 font-mono tracking-tight">
              {summary?.average_utilization_pct || 0}%
            </span>
            <span className="text-xs text-slate-600 font-bold block mt-0.5">
              Engine / Operating Ratio
            </span>
          </div>

          {/* SVG Sparkline Area Graph of Total Fleet Utilization */}
          <div className="mt-2.5 pt-2 border-t border-emerald-200">
            <div className="flex items-center justify-between text-[10px] text-slate-600 font-bold mb-0.5">
              <span>Fleet Trend Curve</span>
              <span className="font-mono font-black text-emerald-800">Peak Load</span>
            </div>
            <div className="w-full h-8">
              <svg viewBox="0 0 100 28" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="utilGradKPI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,22 Q 15,18 30,14 T 60,16 T 85,6 T 100,10 L 100,28 L 0,28 Z"
                  fill="url(#utilGradKPI)"
                />
                <path
                  d="M 0,22 Q 15,18 30,14 T 60,16 T 85,6 T 100,10"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="100" cy="10" r="3" fill="#059669" className="animate-pulse" />
              </svg>
            </div>
          </div>
        </div>

        {/* KPI 3: Idle Waste WITH MINI HISTOGRAM GRAPH */}
        <div className="bg-white border-2 border-amber-300 p-5 rounded-2xl shadow-soft hover:shadow-soft-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-950">Idle Waste</span>
            <div className="p-2 bg-amber-100 text-amber-950 rounded-xl border border-amber-300">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-black text-amber-800 font-mono tracking-tight">
              {summary?.high_idle_count || 0}
            </span>
            <span className="text-xs text-amber-950 font-bold block mt-0.5">
              Machines &gt;70% Idle
            </span>
          </div>

          {/* Mini Histogram Bars of Machine Idle Levels */}
          <div className="mt-2.5 pt-2 border-t border-amber-200">
            <div className="flex items-center justify-between text-[10px] text-slate-600 font-bold mb-1">
              <span>Idle Ratio Spread</span>
              <span className="font-mono font-black text-amber-900">High Risk</span>
            </div>
            <div className="h-6 flex items-end gap-1.5">
              <div className="w-1/5 bg-slate-300 rounded-t h-[40%]" title="EQX1007: Low Idle" />
              <div className="w-1/5 bg-slate-300 rounded-t h-[30%]" title="EQX1005: Low Idle" />
              <div className="w-1/5 bg-amber-400 rounded-t h-[65%]" title="EQX1004: Med Idle" />
              <div className="w-1/5 bg-amber-500 rounded-t h-[80%]" title="EQX1002: High Idle" />
              <div className="w-1/5 bg-amber-600 rounded-t h-[100%]" title="EQX1001: 87% Idle Waste" />
            </div>
          </div>
        </div>

        {/* KPI 4: Attention Required */}
        <div className="bg-white border-2 border-rose-300 p-5 rounded-2xl shadow-soft hover:shadow-soft-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-rose-950">Attention Required</span>
            <div className="p-2 bg-rose-100 text-rose-950 rounded-xl border border-rose-300">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-black text-rose-800 font-mono tracking-tight">
              {alerts.length}
            </span>
            <span className="text-xs text-rose-950 font-bold block mt-0.5">
              Unresolved Anomalies
            </span>
          </div>

          <div className="mt-3 pt-2 border-t border-rose-200">
            <div className="flex justify-between text-[10px] text-slate-600 font-bold mb-1">
              <span>Severity Status</span>
              <span className="font-black text-rose-800">Action Needed</span>
            </div>
            <div className="h-2 w-full bg-rose-100 rounded-full overflow-hidden flex border border-rose-200">
              <div className="w-full bg-rose-600 rounded-full" />
            </div>
          </div>
        </div>

        {/* KPI 5: High Demand Sites WITH MINI PULSE WAVE */}
        <div className="bg-white border-2 border-sky-300 p-5 rounded-2xl shadow-soft hover:shadow-soft-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-sky-950">High Demand Sites</span>
            <div className="p-2 bg-sky-100 text-sky-950 rounded-xl border border-sky-300">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-black text-sky-800 font-mono tracking-tight">
              {highDemandSitesCount}
            </span>
            <span className="text-xs text-sky-950 font-bold block mt-0.5">
              Predicted High Load
            </span>
          </div>

          {/* Mini Pulse Sparkline */}
          <div className="mt-2.5 pt-2 border-t border-sky-200">
            <div className="flex items-center justify-between text-[10px] text-slate-600 font-bold mb-0.5">
              <span>Demand Surge Index</span>
              <span className="font-mono font-black text-sky-800">0.82 Peak</span>
            </div>
            <div className="w-full h-8">
              <svg viewBox="0 0 100 28" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="skyGradKPI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284C7" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,20 Q 20,24 40,12 T 70,8 T 100,4 L 100,28 L 0,28 Z"
                  fill="url(#skyGradKPI)"
                />
                <path
                  d="M 0,20 Q 20,24 40,12 T 70,8 T 100,4"
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="100" cy="4" r="3" fill="#0284C7" className="animate-pulse" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Attention Required Center */}
      <AttentionCenter
        alerts={alerts}
        onAlertResolved={loadData}
        onNavigateToEquipment={onNavigateToEquipment}
      />

      {/* 4. Predictive Rental Intelligence & Demand Heatmap */}
      <ForecastHeatmap
        matrixData={forecastMatrix}
        siteSummaries={siteForecasts}
        onGenerateForecast={handleRunForecastDemo}
        isGenerating={isForecasting}
      />

      {/* 5. Smart Equipment Recommendations */}
      <RecommendationCenter
        recommendations={recommendations}
        onRecommendationUpdated={loadData}
        onNavigateToEquipment={onNavigateToEquipment}
      />

      {/* 6. Model Explainability Box */}
      <ModelExplainability />

      {/* 7. Current Equipment Utilization Overview & Charts */}
      <UtilizationCharts
        utilizationData={utilizationList}
        siteData={siteAnalyticsList}
        onSelectEquipment={onNavigateToEquipment}
      />

      {/* 8. Current Rented Equipment Table */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-soft overflow-hidden">
        <div className="px-6 py-5 border-b-2 border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-black text-slate-950 flex items-center gap-2 tracking-tight">
              <Truck className="w-5 h-5 text-amber-600" />
              Current Rented Equipment Inventory
            </h3>
            <p className="text-xs text-slate-600 font-semibold">
              Click any machine to inspect daily utilization charts, contracts, and telemetry feeds
            </p>
          </div>
          <button
            onClick={onOpenCreateEquipment}
            className="text-xs bg-slate-950 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-black transition shadow-soft flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800 font-medium">
            <thead className="bg-slate-100 text-slate-900 font-black border-b-2 border-slate-200 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-4 px-5">Equipment ID</th>
                <th className="py-4 px-4">Machine Type</th>
                <th className="py-4 px-4">Rental Status</th>
                <th className="py-4 px-4">Current Job Site</th>
                <th className="py-4 px-4">Assigned Operator</th>
                <th className="py-4 px-4">Utilization</th>
                <th className="py-4 px-4">Idle Waste %</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {utilizationList.map((eq) => (
                <tr key={eq.equipment_id} className="hover:bg-slate-50 transition group">
                  <td className="py-4 px-5 font-mono font-black text-slate-950 flex items-center space-x-1.5 text-sm">
                    <span className="text-amber-600 font-black">#</span>
                    <span>{eq.equipment_id}</span>
                  </td>
                  <td className="py-4 px-4 font-extrabold text-slate-950">{eq.equipment_type}</td>
                  <td className="py-4 px-4">
                    <StatusBadge status={eq.rental_status} />
                  </td>
                  <td className="py-4 px-4">
                    {eq.site_name ? (
                      <span className="text-slate-950 font-bold flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        {eq.site_name}
                      </span>
                    ) : (
                      <span className="text-amber-950 font-black bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-md text-[11px]">
                        Unassigned (In Yard)
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {eq.operator_name ? (
                      <span className="text-slate-900 font-bold flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                        {eq.operator_name}
                      </span>
                    ) : (
                      <span className="text-slate-500 font-semibold italic">None</span>
                    )}
                  </td>
                  <td className="py-4 px-4 font-mono">
                    <span className="text-emerald-950 font-black bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
                      {eq.utilization_rate}%
                    </span>
                    <span className="text-slate-600 text-xs ml-1.5 font-bold">({Number(eq.engine_hours).toFixed(1)}h)</span>
                  </td>
                  <td className="py-4 px-4 font-mono">
                    <span className={eq.idle_percentage >= 70 ? 'text-amber-950 font-black bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-400' : 'text-slate-800 font-bold'}>
                      {eq.idle_percentage}%
                    </span>
                    <span className="text-slate-600 text-xs ml-1.5 font-bold">({Number(eq.idle_hours).toFixed(1)}h)</span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onOpenLogUsage({ equipment_id: eq.equipment_id, equipment_type: eq.equipment_type, status: eq.rental_status } as any)}
                        className="text-xs text-slate-800 hover:text-slate-950 bg-white hover:bg-slate-100 font-bold px-3 py-1 rounded-lg border border-slate-300 shadow-2xs transition"
                        title="Log Telemetry"
                      >
                        Log
                      </button>
                      <button
                        onClick={() => onNavigateToEquipment(eq.equipment_id)}
                        className="text-xs text-slate-950 hover:text-black font-black bg-cat-yellow hover:bg-amber-400 px-3.5 py-1 rounded-lg border border-slate-900 flex items-center gap-1 shadow-2xs transition"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
