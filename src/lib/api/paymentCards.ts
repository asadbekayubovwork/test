/**
 * Карты и оплата картой (`payment-api.md`: Cards, Payme, Click).
 *
 * - Чтение: `GET /api/v1/cards`, `GET /api/v1/cards/{uid}`
 * - Токен / верификация / удаление: `/api/v1/{payme|click}/cards/...`
 * - Оплата: `POST /api/v1/{payme|click}/payment`, Click payment link
 */
import paymentClient, {
  type PaymentApiResponse,
  type CardResponse,
  type CardsResponse,
  type PaymentTransactionResponse,
} from './paymentClient';
import { paymentErrorMessage } from './paymentEnvelope';

export type { CardResponse, CardsResponse } from './paymentClient';

// --- DTO (`payment-api.md`) ---

/** Ответ на `DELETE .../cards` (тело не зафиксировано в доке явно). */
export interface MessageResponse {
  message?: string;
}

export interface CreateCardRequest {
  cardNumber: string;
  expireDate: string;
}

export interface VerifyCardRequest {
  cardUid: string;
  /** В примере Click — число, в Payme — строка; отправляем как JSON-поле. */
  smsCode: string | number;
}

export interface DeleteCardRequest {
  cardUid: string;
}

export interface CreatePaymentLinkRequest {
  amount: number;
  packageId?: string;
  idempotencyKey?: string;
}

export interface CreatePaymentLinkResponse {
  paymentLink: string;
  transactionUid: string;
}

/** `PaymentRequest` для `POST .../payme/payment` и `POST .../click/payment`. */
export interface PaymentRequest {
  amount: number;
  packageId: string;
  cardUid: string;
  idempotencyKey?: string;
}

/** @deprecated Используйте `PaymentRequest` — то же тело запроса. */
export type DirectPaymentRequest = PaymentRequest;

export type CardProvider = 'click' | 'payme';

// --- Cards: чтение (`payment-api.md` § Cards) ---

export const listCards = async (): Promise<CardResponse[]> => {
  const response = await paymentClient.get<PaymentApiResponse<CardsResponse>>(
    '/api/v1/cards',
  );
  if (response.data.success && response.data.data) {
    return response.data.data.cards || [];
  }
  throw new Error(paymentErrorMessage(response.data, 'Failed to fetch cards'));
};

export const getCardByUid = async (uid: string): Promise<CardResponse> => {
  const response = await paymentClient.get<PaymentApiResponse<CardResponse>>(
    `/api/v1/cards/${uid}`,
  );
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(paymentErrorMessage(response.data, 'Failed to fetch card'));
};

// --- Карты Payme / Click ---

export const createCardToken = async (
  provider: CardProvider,
  body: CreateCardRequest,
): Promise<CardResponse> => {
  const response = await paymentClient.post<PaymentApiResponse<CardResponse>>(
    `/api/v1/${provider}/cards/create_token`,
    body,
  );
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(
    paymentErrorMessage(response.data, 'Failed to create card token'),
  );
};

export const verifyCardToken = async (
  provider: CardProvider,
  body: VerifyCardRequest,
): Promise<CardResponse> => {
  const response = await paymentClient.post<PaymentApiResponse<CardResponse>>(
    `/api/v1/${provider}/cards/verify`,
    body,
  );
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(paymentErrorMessage(response.data, 'Failed to verify card'));
};

export const deleteCardToken = async (
  provider: CardProvider,
  body: DeleteCardRequest,
): Promise<MessageResponse> => {
  const response = await paymentClient.delete<
    PaymentApiResponse<MessageResponse | null>
  >(`/api/v1/${provider}/cards`, { data: body });
  if (response.data.success) {
    return response.data.data ?? {};
  }
  throw new Error(paymentErrorMessage(response.data, 'Failed to delete card'));
};

// --- Click: ссылка на оплату ---

export const createClickPaymentLink = async (
  body: CreatePaymentLinkRequest,
): Promise<CreatePaymentLinkResponse> => {
  const response = await paymentClient.post<
    PaymentApiResponse<CreatePaymentLinkResponse>
  >('/api/v1/click/payment_link', body);
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(
    paymentErrorMessage(response.data, 'Failed to create payment link'),
  );
};

/** `POST /api/v1/click/payment` → `PaymentTransactionResponse` (не payment link). */
export const directClickPayment = async (
  body: PaymentRequest,
): Promise<PaymentTransactionResponse> => {
  const response = await paymentClient.post<
    PaymentApiResponse<PaymentTransactionResponse>
  >('/api/v1/click/payment', body);
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(paymentErrorMessage(response.data, 'Payment failed'));
};

/** `POST /api/v1/payme/payment` */
export const createPaymePayment = async (
  body: PaymentRequest,
): Promise<PaymentTransactionResponse> => {
  const response = await paymentClient.post<
    PaymentApiResponse<PaymentTransactionResponse>
  >('/api/v1/payme/payment', body);
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(paymentErrorMessage(response.data, 'Payme payment failed'));
};
