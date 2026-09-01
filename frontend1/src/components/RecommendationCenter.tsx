import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowUpRight,
  Zap,
  MapPin,
  Clock,
  ShieldCheck
} from 'lucide-react';
import {
  RecommendationResponse,
  updateRecommendationStatus,
  generateRecommendations
} from '../api/recommendations';

interface RecommendationCenterProps {
  recommendations: RecommendationResponse[];
  onRecommendationUpdated: () => void;
  onNavigateToEquipment: (equipmentId: string) => void;
}

export const RecommendationCenter: React.FC<RecommendationCenterProps> = ({
  recommendations,
  onRecommendationUpdated,
  onNavigateToEquipment
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Sorting: 1. Priority (HIGH -> MEDIUM -> LOW), 2. Action Type (REDEPLOY -> ASSIGN -> RETURN -> MONITOR -> RETAIN)
  const priorityOrder: Record<string, number> = { HIGH: 1, MEDIUM: 2, LOW: 3 };
  const typeOrder: Record<string, number> = {
    REDEPLOY: 1,
    ASSIGN: 2,
    RETURN_OR_DOWNSIZE: 3,
    MONITOR: 4,
    RETAIN: 5
  };

  const sortedRecs = [...recommendations].sort((a, b) => {
    const pA = priorityOrder[a.priority] || 99;
    const pB = priorityOrder[b.priority] || 99;
    if (pA !== pB) return pA - pB;

    const tA = typeOrder[a.recommendation_type] || 99;
    const tB = typeOrder[b.recommendation_type] || 99;
    return tA - tB;
  });

  const filteredRecs = sortedRecs.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  const handleStatusChange = async (recId: string, newStatus: 'ACCEPTED' | 'DISMISSED') => {
    setUpdatingId(recId);
    try {
      await updateRecommendationStatus(recId, newStatus);
      onRecommendationUpdated();
    } catch (err) {
      console.error('Failed to update recommendation status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateRecommendations();
      onRecommendationUpdated();
    } catch (err) {
      console.error('Failed to generate recommendations:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'REDEPLOY':
        return (
          <span className="text-xs font-black px-3 py-1 rounded-xl bg-amber-100 text-amber-950 border border-amber-400 shadow-2xs flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-amber-800" />
            REDEPLOY ASSET
          </span>
        );
      case 'RETURN_OR_DOWNSIZE':
        return (
          <span className="text-xs font-black px-3 py-1 rounded-xl bg-rose-100 text-rose-950 border border-rose-300 shadow-2xs flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-rose-700" />
            RETURN / DOWNSIZE
          </span>
        );
      case 'ASSIGN':
        return (
          <span className="text-xs font-black px-3 py-1 rounded-xl bg-sky-100 text-sky-950 border border-sky-300 shadow-2xs flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-sky-700" />
            ALLOCATE TO SITE
          </span>
        );
      case 'RETAIN':
        return (
          <span className="text-xs font-black px-3 py-1 rounded-xl bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-2xs flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            RETAIN DEPLOYMENT
          </span>
        );
      default:
        return (
          <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-200 text-slate-900 border border-slate-300">
            MONITOR
          </span>
        );
    }
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-soft space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cat-yellow text-slate-950 font-black rounded-xl shadow-soft border border-slate-900">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h3 className="text-base font-black text-slate-950 tracking-tight">
                Smart Equipment Recommendations
              </h3>
              <span className="bg-amber-200 text-amber-950 border border-amber-400 text-[11px] font-black px-3 py-0.5 rounded-full">
                Decision Support
              </span>
            </div>
            <p className="text-xs text-slate-600 font-semibold">
              Explainable actions to eliminate idle rental waste and redeploy machinery to high-demand Texas job sites
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-cat-yellow hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-soft disabled:opacity-50 border border-slate-900"
          >
            <Zap className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Evaluating Pipeline...' : 'Generate Recommendations'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 text-xs">
        {['PENDING', 'ACCEPTED', 'DISMISSED', 'ALL'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-1.5 rounded-xl font-black transition-all duration-150 ${
              filterStatus === st
                ? 'bg-slate-950 text-white shadow-soft'
                : 'text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            {st} ({recommendations.filter(r => st === 'ALL' || r.status === st).length})
          </button>
        ))}
      </div>

      {/* Recommendations Cards Grid */}
      {filteredRecs.length === 0 ? (
        <div className="py-12 text-center text-slate-600 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-slate-500" />
          <p className="text-sm font-black text-slate-900">No {filterStatus.toLowerCase()} recommendations</p>
          <p className="text-xs text-slate-600 font-medium">Click &quot;Generate Recommendations&quot; to evaluate current telematics and site forecasts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecs.map((rec) => {
            const isPending = rec.status === 'PENDING';
            const isAccepted = rec.status === 'ACCEPTED';
            const isDismissed = rec.status === 'DISMISSED';

            return (
              <div
                key={rec.recommendation_id}
                className="p-5 bg-slate-50 border-2 border-slate-200 hover:border-amber-400 hover:bg-white rounded-2xl flex flex-col justify-between space-y-4 transition duration-150 shadow-soft group"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeBadge(rec.recommendation_type)}
                      <button
                        onClick={() => onNavigateToEquipment(rec.equipment_id)}
                        className="font-mono font-black text-sm text-slate-950 hover:text-amber-800 flex items-center gap-1 transition"
                      >
                        <span>#{rec.equipment_id}</span>
                        <span className="text-slate-600 font-sans font-medium text-xs">({rec.equipment_type || 'Machine'})</span>
                      </button>
                    </div>

                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      rec.priority === 'HIGH'
                        ? 'bg-amber-200 text-amber-950 border border-amber-400'
                        : rec.priority === 'MEDIUM'
                        ? 'bg-sky-200 text-sky-950 border border-sky-400'
                        : 'bg-slate-200 text-slate-900'
                    }`}>
                      {rec.priority} Strength
                    </span>
                  </div>

                  {/* Visual 2-Column State Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-4 rounded-xl border border-slate-300 shadow-2xs font-medium">
                    <div>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 uppercase tracking-wider font-bold">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" /> Current Deployment
                      </span>
                      <span className="text-slate-950 font-black text-sm block mt-1">
                        {rec.current_site_name || 'Unassigned (In Yard)'}
                      </span>
                    </div>

                    {rec.recommended_site_name ? (
                      <div className="sm:border-l-2 sm:border-slate-200 sm:pl-3">
                        <span className="text-[10px] text-emerald-800 flex items-center gap-1 uppercase tracking-wider font-bold">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-700" /> High Demand Target
                        </span>
                        <span className="text-emerald-950 font-black text-sm block mt-1">
                          {rec.recommended_site_name}
                        </span>
                      </div>
                    ) : (
                      <div className="sm:border-l-2 sm:border-slate-200 sm:pl-3">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 uppercase tracking-wider font-bold">
                          <Clock className="w-3.5 h-3.5 text-amber-600" /> Action Category
                        </span>
                        <span className="text-amber-950 font-black text-sm block mt-1">
                          Contract Downsize
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Explainable Reasoning */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-950">
                      Explainable Operational Rationale (Why?):
                    </span>
                    <p className="text-xs text-slate-950 leading-relaxed bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 font-bold">
                      {rec.reason}
                    </p>
                  </div>
                </div>

                {/* Card Actions & Human Decision Support */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
                  {rec.expected_utilization_gain ? (
                    <span className="text-xs font-black text-emerald-950 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-xl shadow-2xs">
                      +{rec.expected_utilization_gain}% Est. Util Gain
                    </span>
                  ) : (
                    <span className="text-xs text-slate-700 flex items-center gap-1 font-bold">
                      <ShieldCheck className="w-4 h-4 text-sky-700" />
                      Decision Support Only
                    </span>
                  )}

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onNavigateToEquipment(rec.equipment_id)}
                      className="text-xs text-slate-900 hover:text-slate-950 font-bold px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 shadow-2xs flex items-center gap-1 transition"
                    >
                      <span>View Asset</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-600" />
                    </button>

                    {isPending && (
                      <>
                        <button
                          onClick={() => handleStatusChange(rec.recommendation_id, 'ACCEPTED')}
                          disabled={updatingId === rec.recommendation_id}
                          className="text-xs text-white font-black px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 flex items-center gap-1 shadow-soft transition disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(rec.recommendation_id, 'DISMISSED')}
                          disabled={updatingId === rec.recommendation_id}
                          className="text-xs text-slate-700 hover:text-rose-800 font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-300 transition disabled:opacity-50"
                        >
                          Dismiss
                        </button>
                      </>
                    )}

                    {isAccepted && (
                      <span className="text-xs font-black text-emerald-950 bg-emerald-100 border border-emerald-400 px-3 py-1 rounded-xl flex items-center gap-1 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        Accepted Decision
                      </span>
                    )}

                    {isDismissed && (
                      <span className="text-xs font-bold text-slate-700 bg-slate-200 px-3 py-1 rounded-xl border border-slate-300">
                        Dismissed
                      </span>
                    )}
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
