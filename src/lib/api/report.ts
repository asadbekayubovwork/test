import apiClient from './client';
import { type WordzenApiResponse, wordzenErrorMessage } from './wordzenEnvelope';

export interface VisitReportResponse {
  date: string;
  count: number;
}

export interface SessionReportResponse {
  minutesToDay: number;
  minutesInWeek: number;
  minutesAllTime: number;
  visits: VisitReportResponse[];
}

export interface CardsReportResponse {
  known: number;
  total: number;
  /** Доля или процент — как отдаёт бэкенд (в md пример 50.0) */
  progress: number;
}

export interface ReportTrainingStats {
  known: number;
  total: number;
  progress: number;
}

export interface CoursesReportResponse {
  total: number;
  active: number;
  complete: number;
}

export interface ReportResponse {
  sessions: SessionReportResponse;
  cards: CardsReportResponse;
  training: ReportTrainingStats;
  courses: CoursesReportResponse;
}

const repErr = (body: WordzenApiResponse<unknown>, fallback: string) =>
  wordzenErrorMessage(body, fallback);

/** `GET /api/v1/report` */
export const getReport = async (): Promise<ReportResponse> => {
  const response = await apiClient.get<WordzenApiResponse<ReportResponse>>('/api/v1/report');

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(repErr(response.data, 'Failed to fetch report'));
};

/** `GET /api/v1/report/{userUid}` */
export const getReportByUserUid = async (userUid: string): Promise<ReportResponse> => {
  const response = await apiClient.get<WordzenApiResponse<ReportResponse>>(
    `/api/v1/report/${userUid}`
  );

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(repErr(response.data, 'Failed to fetch user report'));
};
