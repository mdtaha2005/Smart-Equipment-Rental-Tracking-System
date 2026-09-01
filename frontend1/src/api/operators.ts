import { apiClient } from './client';

export interface OperatorSimple {
  operator_id: string;
  operator_name: string;
  status: string;
}

export interface OperatorResponse extends OperatorSimple {
  created_at: string;
  assigned_equipment_id: string | null;
}

export const fetchOperators = async (): Promise<OperatorResponse[]> => {
  const response = await apiClient.get<OperatorResponse[]>('/operators');
  return response.data;
};

export const fetchOperatorDetail = async (operatorId: string): Promise<OperatorResponse> => {
  const response = await apiClient.get<OperatorResponse>(`/operators/${encodeURIComponent(operatorId)}`);
  return response.data;
};
