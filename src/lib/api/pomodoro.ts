import apiClient from './client';
import type { NoContentView } from './auth';
import { type WordzenApiResponse, wordzenErrorMessage } from './wordzenEnvelope';

export interface PomodoroResponse {
  courseId: number;
  minutes: number;
}

export interface PomodoroRequest {
  minutes: number;
}

const pomErr = (body: WordzenApiResponse<unknown>, fallback: string) =>
  wordzenErrorMessage(body, fallback);

/**
 * `GET /api/v1/pomodoro/courses/{courseId}`
 */
export const getPomodoroByCourse = async (courseId: number): Promise<PomodoroResponse> => {
  const response = await apiClient.get<WordzenApiResponse<PomodoroResponse>>(
    `/api/v1/pomodoro/courses/${courseId}`
  );

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(pomErr(response.data, 'Failed to fetch pomodoro data'));
};

/**
 * `POST /api/v1/pomodoro/courses/{courseId}`
 */
export const savePomodoroSession = async (
  courseId: number,
  minutes: number
): Promise<PomodoroResponse> => {
  const body: PomodoroRequest = { minutes };
  const response = await apiClient.post<WordzenApiResponse<PomodoroResponse>>(
    `/api/v1/pomodoro/courses/${courseId}`,
    body
  );

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(pomErr(response.data, 'Failed to save pomodoro session'));
};

/**
 * `DELETE /api/v1/pomodoro/courses/{courseId}`
 */
export const deletePomodoroForCourse = async (courseId: number): Promise<void> => {
  const response = await apiClient.delete<WordzenApiResponse<NoContentView | null>>(
    `/api/v1/pomodoro/courses/${courseId}`
  );

  if (!response.data.success) {
    throw new Error(pomErr(response.data, 'Failed to delete pomodoro data for course'));
  }
};
