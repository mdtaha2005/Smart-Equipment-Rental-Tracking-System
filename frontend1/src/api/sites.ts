import { apiClient } from './client';

export interface SiteSimple {
  site_id: string;
  site_name: string;
  location: string;
}

export interface SiteResponse extends SiteSimple {
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  active_equipment_count: number;
}

export const fetchSites = async (): Promise<SiteResponse[]> => {
  const response = await apiClient.get<SiteResponse[]>('/sites');
  return response.data;
};

export const fetchSiteDetail = async (siteId: string): Promise<SiteResponse> => {
  const response = await apiClient.get<SiteResponse>(`/sites/${encodeURIComponent(siteId)}`);
  return response.data;
};
