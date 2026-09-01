import { apiClient } from './client';

export interface DashboardSummary {
  total_equipment: number;
  rented: number;
  available: number;
  unassigned: number;
  overdue: number;
  maintenance: number;
  active_rentals: number;
  total_sites: number;
  total_operators: number;
  total_engine_hours: number | string;
  total_idle_hours: number | string;
  total_fuel_used: number | string;
  average_utilization_pct: number;
  high_idle_count: number;
  attention_required_count: number;
  equipment_by_type: Record<string, number>;
  equipment_by_status: Record<string, number>;
}

export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await apiClient.get<DashboardSummary>('/dashboard/summary');
  return response.data;
};
