import accountClient from './accountClient';
import { type WordzenApiResponse, wordzenErrorMessage } from './wordzenEnvelope';

export type SubscriptionStatusCode = 'ACTIVE' | 'INACTIVE' | 'DEACTIVATED';
// `sourceCode` was originally CLICK | GOOGLE on the spec; payment service now
// also returns TELEGRAM and PAYME, so the union is widened defensively.
export type SubscriptionSourceCode =
  | 'CLICK'
  | 'GOOGLE'
  | 'TELEGRAM'
  | 'PAYME';

export interface SubscriptionResponse {
  id: number;
  expiredAt: string;
  statusCode: SubscriptionStatusCode;
  sourceCode: SubscriptionSourceCode;
}

/**
 * Returns the current user's subscription, or null when none exists.
 * Backend returns success=false / 404 when there's no active subscription;
 * caller treats that as "free tier".
 */
export const getSubscription =
  async (): Promise<SubscriptionResponse | null> => {
    try {
      const response = await accountClient.get<
        WordzenApiResponse<SubscriptionResponse>
      >('/api/v1/subscription');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (err: unknown) {
      // 404 => no subscription. Anything else, rethrow.
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 404) return null;
      throw err;
    }
  };

/**
 * Cancels / deactivates the current subscription. The user keeps access
 * through `expiredAt`; auto-renew is turned off.
 */
export const cancelSubscription = async (): Promise<void> => {
  const response = await accountClient.delete<WordzenApiResponse<null>>(
    '/api/v1/subscription',
  );
  if (!response.data.success) {
    throw new Error(
      wordzenErrorMessage(response.data, 'Failed to cancel subscription'),
    );
  }
};
