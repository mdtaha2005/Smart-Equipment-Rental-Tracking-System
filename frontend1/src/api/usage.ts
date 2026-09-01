import { apiClient } from './client';

export interface UsageLogResponse {
  usage_id: string;
  equipment_id: string;
  rental_id?: string | null;
  timestamp: string;
  engine_hours: number | string;
  idle_hours: number | string;
  fuel_used: number | string;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
}

export interface UsageLogCreatePayload {
  equipment_id: string;
  rental_id?: string | null;
  timestamp?: string;
  engine_hours: number | string;
  idle_hours: number | string;
  fuel_used: number | string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UsageFilterParams {
  equipment_id?: string;
  rental_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}

export const fetchUsageLogs = async (params?: UsageFilterParams): Promise<UsageLogResponse[]> => {
  const response = await apiClient.get<UsageLogResponse[]>('/usage', { params });
  return response.data;
};

export const createUsageLog = async (payload: UsageLogCreatePayload): Promise<UsageLogResponse> => {
  const response = await apiClient.post<UsageLogResponse>('/usage', payload);
  return response.data;
};
