# Account API

Документ описывает внешний контракт `account-api`: авторизацию, формат ответов, основные эндпоинты и типовые потоки работы. Внутренняя сервисная логика намеренно не раскрывается.

## Базовые правила

API использует префикс `/api/v1`.

Поддерживаются два типа авторизации:

- `Authorization: Bearer <jwt>` - пользовательский доступ.
- `X-Client-Key: <key>` - сервисный доступ для внутренних клиентов.

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

## Основные модели ответа

`UserResponse`:

```json
{
  "uid": "00000000-0000-0000-0000-000000000000",
  "username": "user",
  "coins": 100,
  "rating": 10,
  "createdAt": "2026-05-11T00:00:00Z",
  "subscription": {
    "updatedAt": "2026-05-11T00:00:00Z",
    "code": "BASIC",
    "expirationDate": "2026-06-11T00:00:00Z"
  }
}
```

`FriendshipResponse`:

```json
{
  "id": 1,
  "requesterUid": "00000000-0000-0000-0000-000000000000",
  "addresseeUid": "11111111-1111-1111-1111-111111111111",
  "status": "PENDING",
  "createdAt": "2026-05-11T00:00:00Z",
  "updatedAt": "2026-05-11T00:00:00Z"
}
```

Возможные значения:

- `subscription.code`: `BASIC`, `PRO`
- `friendship.status`: `PENDING`, `ACCEPTED`, `DECLINED`

## Users

| Method | Endpoint | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/api/v1/users/me` | Bearer JWT | - | `ApiResponse<UserResponse>` |
| `GET` | `/api/v1/users/{uid}` | `X-Client-Key` | path `uid: UUID` | `ApiResponse<UserResponse>` |
| `PATCH` | `/api/v1/users/me/username` | Bearer JWT | `UpdateUsernameRequest` | `ApiResponse<UserResponse>` |

`UpdateUsernameRequest`:

```json
{
  "username": "new_username"
}
```

## Coins

| Method | Endpoint | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/api/v1/coins` | Bearer JWT или `X-Client-Key` | query `userUid` требуется только с `X-Client-Key` | `ApiResponse<UserResponse>` |
| `POST` | `/api/v1/coins/add` | `X-Client-Key` | `AddCoinsRequest` | `ApiResponse<UserResponse>` |
| `POST` | `/api/v1/coins/subtract` | `X-Client-Key` | `SubtractCoinsRequest` | `ApiResponse<UserResponse>` |

`AddCoinsRequest` и `SubtractCoinsRequest`:

```json
{
  "userUid": "00000000-0000-0000-0000-000000000000",
  "amount": 100
}
```

## Rating

| Method | Endpoint | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/api/v1/rating` | Bearer JWT или `X-Client-Key` | query `userUid` требуется только с `X-Client-Key` | `ApiResponse<UserResponse>` |
| `POST` | `/api/v1/rating/update` | `X-Client-Key` | `UpdateRatingRequest` | `ApiResponse<UserResponse>` |

`UpdateRatingRequest`:

```json
{
  "userUid": "00000000-0000-0000-0000-000000000000",
  "delta": 5
}
```

`delta` может быть положительным или отрицательным.

## Friends

Все endpoints в разделе Friends требуют Bearer JWT и работают с текущим пользователем из токена.

| Method | Endpoint | Request | Response |
| --- | --- | --- | --- |
| `GET` | `/api/v1/friends` | - | `ApiResponse<List<FriendshipResponse>>` |
| `GET` | `/api/v1/friends/incoming` | - | `ApiResponse<List<FriendshipResponse>>` |
| `GET` | `/api/v1/friends/outgoing` | - | `ApiResponse<List<FriendshipResponse>>` |
| `GET` | `/api/v1/friends/list` | - | `ApiResponse<List<FriendshipResponse>>` |
| `POST` | `/api/v1/friends/request` | `SendFriendRequest` | `ApiResponse<FriendshipResponse>` |
| `POST` | `/api/v1/friends/accept` | `AcceptFriendRequest` | `ApiResponse<FriendshipResponse>` |
| `POST` | `/api/v1/friends/decline` | `DeclineFriendRequest` | `ApiResponse<FriendshipResponse>` |
| `DELETE` | `/api/v1/friends/{id}` | path `id: long` | `ApiResponse<Void>` |

`SendFriendRequest`:

```json
{
  "targetUid": "11111111-1111-1111-1111-111111111111"
}
```

`AcceptFriendRequest` и `DeclineFriendRequest`:

```json
{
  "requestId": 1
}
```

## Subscriptions

| Method | Endpoint | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/api/v1/subscriptions/purchase` | `X-Client-Key` | `PurchaseSubscriptionRequest` | `ApiResponse<UserResponse>` |

`PurchaseSubscriptionRequest`:

```json
{
  "userUid": "00000000-0000-0000-0000-000000000000",
  "packageId": "pro_1m"
}
```

## Типовые потоки

### Пользовательский профиль

1. Клиент отправляет запрос с `Authorization: Bearer <jwt>`.
2. `GET /api/v1/users/me` возвращает текущий профиль.
3. Для смены username клиент вызывает `PATCH /api/v1/users/me/username`.

### Баланс и рейтинг

1. Пользователь может читать свои coins/rating через Bearer JWT.
2. Внутренний сервис может читать данные другого пользователя через `X-Client-Key` и query `userUid`.
3. Изменение coins/rating выполняется только внутренним сервисом через `X-Client-Key`.

### Дружба

1. Пользователь отправляет заявку: `POST /api/v1/friends/request`.
2. Второй пользователь смотрит входящие: `GET /api/v1/friends/incoming`.
3. Заявка принимается через `POST /api/v1/friends/accept` или отклоняется через `POST /api/v1/friends/decline`.
4. Принятые друзья доступны через `GET /api/v1/friends/list`.

### Покупка подписки

1. Платежный сервис завершает оплату.
2. Платежный сервис вызывает `POST /api/v1/subscriptions/purchase` с `X-Client-Key`.
3. Account API обновляет подписку пользователя и возвращает актуальный `UserResponse`.
