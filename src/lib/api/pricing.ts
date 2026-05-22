import paymentClient, {
  type PaymentApiResponse,
  type PaymentProvider,
  type PaymentCurrency,
} from './paymentClient';
import { paymentErrorMessage } from './paymentEnvelope';

export interface PackageResponse {
  name: string;
  packageId: string;
  coin: number;
  priceStars: number;
  priceUsd: number;
  priceUzs: number;
}

export interface RateResponse {
  provider: PaymentProvider;
  currency: PaymentCurrency;
  ratio: number;
  minAmount: number;
  maxAmount: number;
}

export interface PriceResponse {
  rates: RateResponse[];
  packages: PackageResponse[];
}

export interface CalcCoinResponse {
  coin: number;
}

export interface CalcCoinsParams {
  amount: number;
  provider: PaymentProvider;
  currency: PaymentCurrency;
}

/**
 * Returns all available coin packages and provider-specific currency rates.
 */
export const getPrices = async (): Promise<PriceResponse> => {
  const response = await paymentClient.get<PaymentApiResponse<PriceResponse>>(
    '/api/v1/price',
  );
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(paymentErrorMessage(response.data, 'Failed to fetch prices'));
};

/**
 * Calculates how many coins a given fiat/Stars amount converts to,
 * for a specific provider + currency.
 */
export const calcCoins = async (
  params: CalcCoinsParams,
): Promise<CalcCoinResponse> => {
  const response = await paymentClient.get<PaymentApiResponse<CalcCoinResponse>>(
    '/api/v1/price/coins/calc',
    { params },
  );
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(paymentErrorMessage(response.data, 'Failed to calculate coins'));
};
