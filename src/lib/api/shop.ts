import paymentClient, {
  type PaymentApiResponse,
  type PaymentSubscriptionCode,
} from './paymentClient';
import { paymentErrorMessage } from './paymentEnvelope';

/** Элемент каталога подписок (`payment-api.md` → Shop). */
export interface ShopSubscriptionOffer {
  name: string;
  month: number;
  packageId: string;
  priceCoin: number;
  priceStars: number;
  priceUsd: number;
  priceUzs: number;
  perMoCoins: number;
  perMoStars: number;
  perMoUsd: number;
  perMoUzs: number;
  discount: number;
  savedCoins: number;
  code: PaymentSubscriptionCode;
}

export interface SubscriptionsResponse {
  subscriptions: ShopSubscriptionOffer[];
}

export const getShopSubscriptions = async (): Promise<SubscriptionsResponse> => {
  const response = await paymentClient.get<
    PaymentApiResponse<SubscriptionsResponse>
  >('/api/v1/shop/subscriptions');
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(
    paymentErrorMessage(response.data, 'Failed to fetch subscription offers'),
  );
};
