import { apiClient } from './client';

export interface RecommendationResponse {
  recommendation_id: string;
  equipment_id: string;
  equipment_type: string | null;
  current_site_id: string | null;
  current_site_name: string | null;
  recommended_site_id: string | null;
  recommended_site_name: string | null;
  recommendation_type: 'REDEPLOY' | 'RETURN_OR_DOWNSIZE' | 'ASSIGN' | 'RETAIN' | 'MONITOR' | string;
  reason: string;
  expected_utilization_gain: number | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  status: 'PENDING' | 'ACCEPTED' | 'DISMISSED' | string;
  created_at: string;
}

export interface RecommendationGenerationSummary {
  recommendations_created: number;
  recommendations_updated: number;
  total_active_recommendations: number;
  recommendations: RecommendationResponse[];
}

export interface RecommendationFilterParams {
  equipment_id?: string;
  status?: string;
  priority?: string;
}

export const fetchRecommendations = async (params?: RecommendationFilterParams): Promise<RecommendationResponse[]> => {
  const response = await apiClient.get<RecommendationResponse[]>('/recommendations', { params });
  return response.data;
};

export const generateRecommendations = async (): Promise<RecommendationGenerationSummary> => {
  const response = await apiClient.post<RecommendationGenerationSummary>('/recommendations/generate');
  return response.data;
};

export const updateRecommendationStatus = async (
  recommendationId: string,
  status: 'ACCEPTED' | 'DISMISSED' | 'PENDING'
): Promise<RecommendationResponse> => {
  const response = await apiClient.patch<RecommendationResponse>(
    `/recommendations/${encodeURIComponent(recommendationId)}`,
    { status }
  );
  return response.data;
};
