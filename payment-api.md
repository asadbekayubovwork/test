# Payment API

Документ описывает внешний контракт `payment-api`: авторизацию, формат ответов, основные эндпоинты и типовые потоки оплаты. Внутренняя сервисная логика намеренно не раскрывается.

## Базовые правила

API использует префикс `/api/v1`.

Публичные endpoints:

- `GET /api/v1/price/**`
- `GET /api/v1/shop/**`

Остальные endpoints требуют авторизацию:

- `Authorization: Bearer <jwt>` - пользовательский доступ.
- `X-Client-Key: <key>` - клиентский доступ. По ключу определяется клиент: `ANDROID`, `IOS`, `TELEGRAM`.

Успешные ответы оборачиваются в единый формат:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Ошибки возвращаются в таком формате:

```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Error message",
    "detail": "Error detail",
    "code": 400,
    "uid": "uuid-of-error"
  }
}
```

## Справочники

`ProviderCode`:

- `GOOGLE`
- `TELEGRAM`
- `PAYME`
- `CLICK`

`CurrencyCode`:

- `TG_STARS`
- `UZS`
- `USD`

`TransactionStatusCode`:

- `CREATED`
- `PENDING`
- `SUCCESS`
- `FAILED`
- `REFUNDED`
- `CANCELLED`

`SubscriptionCode`:

- `BASIC`
- `PRO`

## Основные модели ответа

`CardResponse`:

```json
{
  "uid": "00000000-0000-0000-0000-000000000000",
  "userUid": "11111111-1111-1111-1111-111111111111",
  "createdAt": "2026-05-11T00:00:00Z",
  "updatedAt": "2026-05-11T00:00:00Z",
  "number": "8600********1234",
  "expireDate": "12/30",
  "provider": "PAYME",
  "status": "VERIFIED"
}
```

`PaymentTransactionResponse`:

```json
{
  "uid": "00000000-0000-0000-0000-000000000000",
  "userUid": "11111111-1111-1111-1111-111111111111",
  "createdAt": "2026-05-11T00:00:00Z",
  "updatedAt": "2026-05-11T00:00:00Z",
  "completedAt": "2026-05-11T00:05:00Z",
  "provider": "CLICK",
  "status": "SUCCESS",
  "coins": 100
}
```

## Price

Публичные endpoints для получения цен, пакетов и расчета coins.

| Method | Endpoint | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/api/v1/price` | не требуется | - | `ApiResponse<PriceResponse>` |
| `GET` | `/api/v1/price/coins/calc` | не требуется | query `amount`, `provider`, `currency` | `ApiResponse<CalcCoinResponse>` |

`PriceResponse`:

```json
{
  "rates": [
    {
      "provider": "CLICK",
      "currency": "UZS",
      "ratio": 100.0,
      "minAmount": 1000,
      "maxAmount": 1000000
    }
  ],
  "packages": [
    {
      "name": "Coins 100",
      "packageId": "coins_100",
      "coin": 100,
      "priceStars": 100,
      "priceUsd": 1.99,
      "priceUzs": 25000
    }
  ]
}
```

`CalcCoinResponse`:

```json
{
  "coin": 100
}
```

## Shop

| Method | Endpoint | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/api/v1/shop/subscriptions` | не требуется | - | `ApiResponse<SubscriptionsResponse>` |

`SubscriptionsResponse`:

```json
{
  "subscriptions": [
    {
      "name": "PRO 1 month",
      "month": 1,
      "packageId": "pro_1m",
      "priceCoin": 100,
      "priceStars": 100,
      "priceUsd": 1.99,
      "priceUzs": 25000,
      "perMoCoins": 100,
      "perMoStars": 100,
      "perMoUsd": 1.99,
      "perMoUzs": 25000,
      "discount": 0,
      "savedCoins": 0,
      "code": "PRO"
    }
  ]
}
```

## Cards

Общие endpoints для чтения сохраненных карт текущего пользователя.

| Method | Endpoint | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/api/v1/cards` | Bearer JWT или `X-Client-Key` | - | `ApiResponse<CardsResponse>` |
| `GET` | `/api/v1/cards/{uid}` | Bearer JWT или `X-Client-Key` | path `uid: UUID` | `ApiResponse<CardResponse>` |

`CardsResponse`:

```json
{
  "cards": [
    {
      "uid": "00000000-0000-0000-0000-000000000000",
      "userUid": "11111111-1111-1111-1111-111111111111",
      "number": "8600********1234",
      "expireDate": "12/30",
      "provider": "CLICK",
      "status": "VERIFIED"
    }
  ]
}
```

## Transactions

| Method | Endpoint | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/api/v1/transactions` | Bearer JWT или `X-Client-Key` | - | `ApiResponse<PaymentTransactionsResponse>` |
| `GET` | `/api/v1/transactions/{uid}` | Bearer JWT или `X-Client-Key` | path `uid: UUID` | `ApiResponse<PaymentTransactionResponse>` |

`PaymentTransactionsResponse`:

```json
{
  "transactions": [
    {
      "uid": "00000000-0000-0000-0000-000000000000",
      "userUid": "11111111-1111-1111-1111-111111111111",
      "provider": "PAYME",
      "status": "SUCCESS",
      "coins": 100
    }
  ]
}
```

## Payme

Endpoints Payme доступны только при разрешенном Payme-доступе для текущего клиента.

| Method | Endpoint | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/api/v1/payme/cards/create_token` | Bearer JWT или `X-Client-Key` | `CreateCardRequest` | `ApiResponse<CardResponse>` |
| `POST` | `/api/v1/payme/cards/verify` | `X-Client-Key` | `VerifyCardRequest` | `ApiResponse<CardResponse>` |
| `DELETE` | `/api/v1/payme/cards` | Bearer JWT или `X-Client-Key` | `DeleteCardRequest` | `ApiResponse<MessageResponse>` |
| `POST` | `/api/v1/payme/payment` | Bearer JWT или `X-Client-Key` | `PaymentRequest` | `ApiResponse<PaymentTransactionResponse>` |

`CreateCardRequest`:

```json
{
  "cardNumber": "8600123412341234",
  "expireDate": "12/30"
}
```

`VerifyCardRequest`:

```json
{
  "cardUid": "00000000-0000-0000-0000-000000000000",
  "smsCode": "123456"
}
```

`DeleteCardRequest`:

```json
{
  "cardUid": "00000000-0000-0000-0000-000000000000"
}
```

`PaymentRequest`:

```json
{
  "amount": 25000,
  "packageId": "coins_100",
  "cardUid": "00000000-0000-0000-0000-000000000000",
  "idempotencyKey": "client-generated-key"
}
```

## Click

Endpoints Click доступны только при разрешенном Click-доступе для текущего клиента. Callback endpoints вызываются платежным провайдером и принимают form-urlencoded параметры.

| Method | Endpoint | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/api/v1/click/payment_link` | Bearer JWT или `X-Client-Key` | `CreatePaymentLinkRequest` | `ApiResponse<CreatePaymentLinkResponse>` |
| `POST` | `/api/v1/click/cards/create_token` | Bearer JWT или `X-Client-Key` | `CreateCardRequest` | `ApiResponse<CardResponse>` |
| `POST` | `/api/v1/click/cards/verify` | `X-Client-Key` | `VerifyCardRequest` | `ApiResponse<CardResponse>` |
| `DELETE` | `/api/v1/click/cards` | Bearer JWT или `X-Client-Key` | `DeleteCardRequest` | `ApiResponse<MessageResponse>` |
| `POST` | `/api/v1/click/payment` | Bearer JWT или `X-Client-Key` | `PaymentRequest` | `ApiResponse<PaymentTransactionResponse>` |
| `POST` | `/api/v1/click/callback/prepare` | не требуется | form-urlencoded provider params | `ClickPrepareResponse` |
| `POST` | `/api/v1/click/callback/complete` | не требуется | form-urlencoded provider params | `ClickCompleteResponse` |

`CreatePaymentLinkRequest`:

```json
{
  "amount": 25000,
  "packageId": "coins_100",
  "idempotencyKey": "client-generated-key"
}
```

`CreatePaymentLinkResponse`:

```json
{
  "paymentLink": "https://...",
  "transactionUid": "00000000-0000-0000-0000-000000000000"
}
```

`CreateCardRequest`:

```json
{
  "cardNumber": "8600123412341234",
  "expireDate": "12/30"
}
```

`VerifyCardRequest`:

```json
{
  "cardUid": "00000000-0000-0000-0000-000000000000",
  "smsCode": 123456
}
```

`DeleteCardRequest`:

```json
{
  "cardUid": "00000000-0000-0000-0000-000000000000"
}
```

`PaymentRequest`:

```json
{
  "amount": 25000,
  "packageId": "coins_100",
  "cardUid": "00000000-0000-0000-0000-000000000000",
  "idempotencyKey": "client-generated-key"
}
```

`ClickPrepareResponse` и `ClickCompleteResponse`:

```json
{
  "click_trans_id": "click-id",
  "merchant_trans_id": "merchant-id",
  "merchant_prepare_id": "prepare-id",
  "error": 0,
  "error_note": "Success"
}
```

## Telegram

Endpoints Telegram доступны только при разрешенном Telegram-доступе для текущего клиента.

| Method | Endpoint | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/api/v1/telegram/invoice` | Bearer JWT или `X-Client-Key` | `TelegramInvoiceRequest` | `ApiResponse<TelegramInvoiceResponse>` |
| `POST` | `/api/v1/telegram/confirm` | `X-Client-Key` | `TelegramConfirmRequest` | `ApiResponse<TelegramConfirmResponse>` |

`TelegramInvoiceRequest`:

```json
{
  "packageId": "coins_100",
  "idempotencyKey": "client-generated-key"
}
```

`TelegramInvoiceResponse`:

```json
{
  "invoiceUrl": "https://t.me/...",
  "transactionUid": "00000000-0000-0000-0000-000000000000"
}
```

`TelegramConfirmRequest`:

```json
{
  "transactionUid": "00000000-0000-0000-0000-000000000000"
}
```

`TelegramConfirmResponse`:

```json
{
  "coinsAdded": 100
}
```

## Типовые потоки

### Просмотр магазина

1. Клиент получает цены и курсы через `GET /api/v1/price`.
2. Для подписок клиент получает предложения через `GET /api/v1/shop/subscriptions`.
3. При необходимости клиент рассчитывает coins через `GET /api/v1/price/coins/calc`.

### Оплата сохраненной картой Payme или Click

1. Клиент создает токен карты: `POST /payme/cards/create_token` или `POST /click/cards/create_token`.
2. Клиент подтверждает токен кодом: `POST /payme/cards/verify` или `POST /click/cards/verify`.
3. Клиент запускает оплату: `POST /payme/payment` или `POST /click/payment`.
4. Клиент проверяет статус через `GET /api/v1/transactions/{uid}` или список через `GET /api/v1/transactions`.

### Оплата по ссылке Click

1. Клиент создает ссылку: `POST /api/v1/click/payment_link`.
2. Пользователь переходит по `paymentLink` и оплачивает у провайдера.
3. Click вызывает `callback/prepare`, затем `callback/complete`.
4. Клиент проверяет финальный статус транзакции через Transactions API.

### Оплата через Telegram

1. Клиент создает invoice: `POST /api/v1/telegram/invoice`.
2. Пользователь оплачивает invoice в Telegram.
3. Клиент или Telegram-интеграция подтверждает транзакцию через `POST /api/v1/telegram/confirm`.
4. Payment API возвращает количество добавленных coins.

### Обновление Account API после покупки

После успешной покупки Payment API обращается во внутренний Account API, чтобы добавить coins или оформить подписку. Для клиента итог можно проверить через Account API (`/api/v1/users/me`, `/api/v1/coins`) или через Transactions API.
