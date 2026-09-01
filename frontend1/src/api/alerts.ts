import { apiClient } from './client';

export interface AlertResponse {
  alert_id: string;
  equipment_id: string;
  equipment_type: string | null;
  site_name: string | null;
  alert_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  message: string;
  detected_at: string;
  resolved: boolean;
  resolved_at: string | null;
}

export interface AlertGenerationSummary {
  alerts_created: number;
  alerts_skipped: number;
  total_active_alerts: number;
  alerts: AlertResponse[];
}

export interface AlertFilterParams {
  equipment_id?: string;
  severity?: string;
  alert_type?: string;
  resolved?: boolean;
}

export const fetchAlerts = async (params?: AlertFilterParams): Promise<AlertResponse[]> => {
  const response = await apiClient.get<AlertResponse[]>('/alerts', { params });
  return response.data;
};

export const generateAlerts = async (): Promise<AlertGenerationSummary> => {
  const response = await apiClient.post<AlertGenerationSummary>('/alerts/generate');
  return response.data;
};

export const resolveAlert = async (alertId: string): Promise<AlertResponse> => {
  const response = await apiClient.patch<AlertResponse>(`/alerts/${encodeURIComponent(alertId)}/resolve`);
  return response.data;
};
