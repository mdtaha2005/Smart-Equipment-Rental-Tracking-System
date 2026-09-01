import { apiClient } from './client';
import { SiteSimple } from './sites';
import { OperatorSimple } from './operators';

export interface RentalResponse {
  rental_id: string;
  equipment_id: string;
  equipment_type?: string | null;
  site_id?: string | null;
  site_name?: string | null;
  operator_id?: string | null;
  operator_name?: string | null;
  checkout_date: string;
  expected_checkin_date: string;
  actual_checkin_date?: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED' | string;
  created_at: string;
  updated_at: string;
}

export interface RentalDetailResponse extends RentalResponse {
  site?: SiteSimple | null;
  operator?: OperatorSimple | null;
}

export interface CheckoutPayload {
  equipment_id: string;
  site_id: string;
  operator_id?: string | null;
  checkout_date?: string;
  expected_checkin_date: string;
}

export interface CheckinPayload {
  actual_checkin_date?: string;
  engine_hours?: number | string;
  idle_hours?: number | string;
  fuel_used?: number | string;
}

export interface RentalFilterParams {
  status?: string;
  equipment_id?: string;
  site_id?: string;
  operator_id?: string;
}

export const fetchRentals = async (params?: RentalFilterParams): Promise<RentalResponse[]> => {
  const response = await apiClient.get<RentalResponse[]>('/rentals', { params });
  return response.data;
};

export const fetchRentalDetail = async (rentalId: string): Promise<RentalDetailResponse> => {
  const response = await apiClient.get<RentalDetailResponse>(`/rentals/${encodeURIComponent(rentalId)}`);
  return response.data;
};

export const checkoutRental = async (payload: CheckoutPayload): Promise<RentalResponse> => {
  const response = await apiClient.post<RentalResponse>('/rentals/checkout', payload);
  return response.data;
};

export const checkinRental = async (rentalId: string, payload: CheckinPayload): Promise<RentalResponse> => {
  const response = await apiClient.post<RentalResponse>(`/rentals/${encodeURIComponent(rentalId)}/check-in`, payload);
  return response.data;
};
