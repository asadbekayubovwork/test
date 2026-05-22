/**
 * Telegram Stars / invoice (`payment-api.md` § Telegram).
 */
import paymentClient, { type PaymentApiResponse } from './paymentClient';
import { paymentErrorMessage } from './paymentEnvelope';

export interface TelegramInvoiceRequest {
  packageId: string;
  idempotencyKey?: string;
}

export interface TelegramInvoiceResponse {
  invoiceUrl: string;
  transactionUid: string;
}

export interface TelegramConfirmRequest {
  transactionUid: string;
}

export interface TelegramConfirmResponse {
  coinsAdded: number;
}

export const createTelegramInvoice = async (
  body: TelegramInvoiceRequest,
): Promise<TelegramInvoiceResponse> => {
  const response = await paymentClient.post<
    PaymentApiResponse<TelegramInvoiceResponse>
  >('/api/v1/telegram/invoice', body);
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(
    paymentErrorMessage(response.data, 'Failed to create invoice'),
  );
};

export const confirmTelegramPayment = async (
  body: TelegramConfirmRequest,
): Promise<TelegramConfirmResponse> => {
  const response = await paymentClient.post<
    PaymentApiResponse<TelegramConfirmResponse>
  >('/api/v1/telegram/confirm', body);
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(
    paymentErrorMessage(response.data, 'Failed to confirm payment'),
  );
};
