import { apiClient } from './client';

export interface DemoResetResponse {
  status: string;
  message: string;
  timestamp: string;
  entities_restored: Record<string, number>;
  challenge_records_verified: boolean;
}

export interface ExecutiveSummaryResponse {
  total_rented_equipment: number;
  deployed_sites_count: number;
  average_utilization_pct: number;
  high_idle_count: number;
  attention_required_count: number;
  redeploy_candidate_count: number;
  summary_narrative: string;
}

export const fetchExecutiveSummary = async (): Promise<ExecutiveSummaryResponse> => {
  const response = await apiClient.get<ExecutiveSummaryResponse>('/demo/summary');
  return response.data;
};

export const resetDemoData = async (): Promise<DemoResetResponse> => {
  const response = await apiClient.post<DemoResetResponse>('/demo/reset');
  return response.data;
};
