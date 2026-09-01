import { apiClient } from './client';

export interface HealthResponse {
  status: string;
  database: string;
  timestamp: string;
  environment: string;
  version: string;
  tables?: Record<string, number>;
}

export interface DatabaseHealthResponse {
  status: string;
  database_type: string;
  latency_ms: number;
  timestamp: string;
  tables_count: number;
  table_names: string[];
  row_counts: Record<string, number>;
}

export const fetchAppHealth = async (): Promise<HealthResponse> => {
  const response = await apiClient.get<HealthResponse>('/health');
  return response.data;
};

export const fetchDatabaseHealth = async (): Promise<DatabaseHealthResponse> => {
  const response = await apiClient.get<DatabaseHealthResponse>('/health/db');
  return response.data;
};
