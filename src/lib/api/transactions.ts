/**
 * Транзакции платёжного сервиса (`payment-api.md` § Transactions).
 *
 * - `GET /api/v1/transactions`
 * - `GET /api/v1/transactions/{uid}`
 */
import paymentClient, {
  type PaymentApiResponse,
  type PaymentTransactionResponse,
  type PaymentTransactionsResponse,
} from './paymentClient';
import { paymentErrorMessage } from './paymentEnvelope';

export type {
  PaymentTransactionResponse,
  PaymentTransactionsResponse,
} from './paymentClient';

export const listTransactions = async (): Promise<
  PaymentTransactionResponse[]
> => {
  const response = await paymentClient.get<
    PaymentApiResponse<PaymentTransactionsResponse>
  >('/api/v1/transactions');
  if (response.data.success && response.data.data) {
    return response.data.data.transactions || [];
  }
  throw new Error(
    paymentErrorMessage(response.data, 'Failed to fetch transactions'),
  );
};

export const getTransactionByUid = async (
  uid: string,
): Promise<PaymentTransactionResponse> => {
  const response = await paymentClient.get<
    PaymentApiResponse<PaymentTransactionResponse>
  >(`/api/v1/transactions/${uid}`);
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(
    paymentErrorMessage(response.data, 'Failed to fetch transaction'),
  );
};
