import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
  const response = await axios.get<HealthResponse>(`${API_BASE_URL}/api/health`, {
    timeout: 5000
  });
  return response.data;
};

export const fetchDatabaseHealth = async (): Promise<DatabaseHealthResponse> => {
  const response = await axios.get<DatabaseHealthResponse>(`${API_BASE_URL}/api/health/db`, {
    timeout: 5000
  });
  return response.data;
};
