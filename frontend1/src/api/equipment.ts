import { apiClient } from './client';
import { SiteSimple } from './sites';
import { OperatorSimple } from './operators';
import { RentalResponse } from './rentals';
import { UsageLogResponse } from './usage';

export interface EquipmentUsageSummary {
  total_engine_hours: string | number;
  total_idle_hours: string | number;
  total_fuel_used: string | number;
  utilization_rate: number | null;
  last_log_timestamp: string | null;
}

export interface EquipmentResponse {
  equipment_id: string;
  equipment_type: string;
  status: 'AVAILABLE' | 'RENTED' | 'OVERDUE' | 'MAINTENANCE' | 'UNASSIGNED' | string;
  current_site_id: string | null;
  current_operator_id: string | null;
  site_name: string | null;
  operator_name: string | null;
  created_at: string;
  updated_at: string;
  usage_summary?: EquipmentUsageSummary;
}

export interface EquipmentDetailResponse extends EquipmentResponse {
  current_site: SiteSimple | null;
  current_operator: OperatorSimple | null;
  active_rental: RentalResponse | null;
  recent_usage_logs: UsageLogResponse[];
  rental_history: RentalResponse[];
}

export interface EquipmentCreatePayload {
  equipment_id: string;
  equipment_type: string;
  status: string;
  current_site_id?: string | null;
  current_operator_id?: string | null;
}

export interface EquipmentFilterParams {
  status?: string;
  equipment_type?: string;
  site_id?: string;
  operator_id?: string;
  search?: string;
}

export const fetchEquipmentList = async (params?: EquipmentFilterParams): Promise<EquipmentResponse[]> => {
  const response = await apiClient.get<EquipmentResponse[]>('/equipment', { params });
  return response.data;
};

export const fetchEquipmentDetail = async (equipmentId: string): Promise<EquipmentDetailResponse> => {
  const response = await apiClient.get<EquipmentDetailResponse>(`/equipment/${encodeURIComponent(equipmentId)}`);
  return response.data;
};

export const scanEquipmentTag = async (tagId: string): Promise<EquipmentDetailResponse> => {
  const response = await apiClient.get<EquipmentDetailResponse>(`/equipment/tag/${encodeURIComponent(tagId)}`);
  return response.data;
};

export const createEquipment = async (payload: EquipmentCreatePayload): Promise<EquipmentResponse> => {
  const response = await apiClient.post<EquipmentResponse>('/equipment', payload);
  return response.data;
};

export const updateEquipment = async (equipmentId: string, payload: Partial<EquipmentCreatePayload>): Promise<EquipmentResponse> => {
  const response = await apiClient.patch<EquipmentResponse>(`/equipment/${encodeURIComponent(equipmentId)}`, payload);
  return response.data;
};
