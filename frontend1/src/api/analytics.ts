import { apiClient } from './client';
import { UsageLogResponse } from './usage';

export interface EquipmentUtilization {
  equipment_id: string;
  equipment_type: string;
  site_id: string | null;
  site_name: string | null;
  operator_id: string | null;
  operator_name: string | null;
  rental_status: string;
  engine_hours: number | string;
  idle_hours: number | string;
  total_usage_hours: number | string;
  fuel_used: number | string;
  utilization_rate: number;
  idle_percentage: number;
  insight_summary: string;
}

export interface SiteAnalytics {
  site_id: string;
  site_name: string;
  location: string;
  equipment_count: number;
  active_rentals: number;
  total_engine_hours: number | string;
  total_idle_hours: number | string;
  total_fuel_used: number | string;
  average_utilization: number;
}

export interface DailyUsagePoint {
  date: string;
  engine_hours: number;
  idle_hours: number;
  fuel_used: number;
  utilization_rate: number;
}

export interface EquipmentPerformance {
  equipment_id: string;
  equipment_type: string;
  status: string;
  site_id: string | null;
  site_name: string | null;
  operator_id: string | null;
  operator_name: string | null;
  rental_id: string | null;
  checkout_date: string | null;
  expected_return: string | null;
  total_engine_hours: number | string;
  total_idle_hours: number | string;
  total_fuel_used: number | string;
  utilization_rate: number;
  idle_percentage: number;
  avg_engine_hours_day: number;
  avg_idle_hours_day: number;
  highest_engine_day: DailyUsagePoint | null;
  highest_idle_day: DailyUsagePoint | null;
  business_insight: string;
  active_anomalies: string[];
  daily_trend: DailyUsagePoint[];
  recent_logs: UsageLogResponse[];
}

export interface UtilizationFilterParams {
  equipment_id?: string;
  equipment_type?: string;
  site_id?: string;
  rental_id?: string;
}

export const fetchFleetUtilization = async (params?: UtilizationFilterParams): Promise<EquipmentUtilization[]> => {
  const response = await apiClient.get<EquipmentUtilization[]>('/analytics/utilization', { params });
  return response.data;
};

export const fetchEquipmentUtilization = async (equipmentId: string): Promise<EquipmentUtilization> => {
  const response = await apiClient.get<EquipmentUtilization>(`/analytics/utilization/${encodeURIComponent(equipmentId)}`);
  return response.data;
};

export const fetchSiteAnalytics = async (): Promise<SiteAnalytics[]> => {
  const response = await apiClient.get<SiteAnalytics[]>('/analytics/sites');
  return response.data;
};

export const fetchEquipmentPerformance = async (equipmentId: string): Promise<EquipmentPerformance> => {
  const response = await apiClient.get<EquipmentPerformance>(`/analytics/equipment/${encodeURIComponent(equipmentId)}/performance`);
  return response.data;
};

export const fetchDailyUsageTrend = async (equipmentId: string): Promise<DailyUsagePoint[]> => {
  const response = await apiClient.get<DailyUsagePoint[]>(`/analytics/equipment/${encodeURIComponent(equipmentId)}/daily`);
  return response.data;
};
