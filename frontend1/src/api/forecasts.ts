import { apiClient } from './client';

export interface ForecastResponse {
  forecast_id: string;
  site_id: string;
  site_name: string | null;
  equipment_type: string;
  forecast_date: string;
  predicted_demand: number;
  demand_level: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  confidence: number | null;
  created_at: string;
}

export interface SiteForecastSummary {
  site_id: string;
  site_name: string;
  location: string;
  overall_demand_level: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  top_predicted_demand_score: number;
  equipment_type_forecasts: Record<string, string>;
}

export interface ForecastMatrixPoint {
  site_id: string;
  site_name: string;
  equipment_type: string;
  demand_score: number;
  demand_level: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  active_equipment_count: number;
}

export interface ForecastGenerationSummary {
  forecasts_generated: number;
  sites_evaluated: number;
  horizon_days: number;
  model_type: string;
  timestamp: string;
  forecasts: ForecastResponse[];
}

export interface ForecastFilterParams {
  site_id?: string;
  equipment_type?: string;
  demand_level?: string;
}

export const fetchForecasts = async (params?: ForecastFilterParams): Promise<ForecastResponse[]> => {
  const response = await apiClient.get<ForecastResponse[]>('/forecasts', { params });
  return response.data;
};

export const fetchSiteForecastSummaries = async (): Promise<SiteForecastSummary[]> => {
  const response = await apiClient.get<SiteForecastSummary[]>('/forecasts/sites');
  return response.data;
};

export const fetchForecastMatrix = async (): Promise<ForecastMatrixPoint[]> => {
  const response = await apiClient.get<ForecastMatrixPoint[]>('/forecasts/matrix');
  return response.data;
};

export const generateForecasts = async (horizonDays: number = 7): Promise<ForecastGenerationSummary> => {
  const response = await apiClient.post<ForecastGenerationSummary>('/forecasts/generate', null, {
    params: { horizon_days: horizonDays }
  });
  return response.data;
};
