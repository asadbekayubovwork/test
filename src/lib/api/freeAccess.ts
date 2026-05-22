import apiClient from './client';
import { type WordzenApiResponse, wordzenErrorMessage } from './wordzenEnvelope';

/**
 * Сущность временного доступа к модулю (`wordzen-api.md` — Free Module Access).
 * Не путать с `FreeModuleAccessView` в `courses.ts` (встраиваемый снимок в `ModuleView`).
 */
export type FreeAccessGrantStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface FreeAccessGrant {
  id: number;
  courseId: number;
  moduleId: number;
  status: FreeAccessGrantStatus;
  startedAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  cooldownUntil: string | null;
}

export interface FreeAccessActiveSummary {
  id: number;
  courseId: number;
  moduleId: number;
  status: FreeAccessGrantStatus;
}

export interface FreeAccessStatusView {
  active: FreeAccessActiveSummary | null;
  cooldownUntil: string | null;
}

const err = (body: WordzenApiResponse<unknown>, fallback: string) =>
  wordzenErrorMessage(body, fallback);

/** `POST /api/v1/free-access/modules/{moduleId}/start` */
export const startFreeModuleAccess = async (moduleId: number): Promise<FreeAccessGrant> => {
  const response = await apiClient.post<WordzenApiResponse<FreeAccessGrant>>(
    `/api/v1/free-access/modules/${moduleId}/start`
  );

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(err(response.data, 'Failed to start free module access'));
};

/** `POST /api/v1/free-access/cancel` */
export const cancelFreeModuleAccess = async (): Promise<FreeAccessGrant> => {
  const response = await apiClient.post<WordzenApiResponse<FreeAccessGrant>>(
    '/api/v1/free-access/cancel'
  );

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(err(response.data, 'Failed to cancel free module access'));
};

/** `GET /api/v1/free-access/status` */
export const getFreeAccessStatus = async (): Promise<FreeAccessStatusView> => {
  const response = await apiClient.get<WordzenApiResponse<FreeAccessStatusView>>(
    '/api/v1/free-access/status'
  );

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(err(response.data, 'Failed to fetch free access status'));
};
