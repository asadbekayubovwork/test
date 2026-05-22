# WordZen API

Документ описывает внешний контракт `wordzen-api`: аутентификацию, пользовательские endpoints, request/response и основные потоки работы. Устаревшие, admin/manager и внутренние endpoints намеренно не включены.

## Базовые правила

API использует префикс `/api/v1`.

Аутентификация:

- `/api/v1/auth/**` - публичные endpoints.
- Остальные endpoints из этого документа требуют `Authorization: Bearer <accessToken>`.

Успешный ответ:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Ответ с ошибкой:

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

## Аутентификация

### Модели

`TokenDto`:

```json
{
  "token": "access-token",
  "refreshToken": "refresh-token",
  "expireAt": "2026-05-11T12:00:00.000+00:00",
  "createdAt": "2026-05-11T11:00:00.000+00:00",
  "userUid": "00000000-0000-0000-0000-000000000000"
}
```

`UserView`:

```json
{
  "uid": "00000000-0000-0000-0000-000000000000",
  "username": "user@example.com",
  "roles": [
    {
      "name": "User",
      "code": "ROLE_USER"
    }
  ]
}
```

Возможные `roles.code`: `ROLE_USER`, `ROLE_AUTHOR`.

### Auth

| Method | Endpoint | Request | Response |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth` | `TokenRequest` | `ApiResponse<UserView>` |
| `POST` | `/api/v1/auth/login` | `UserLoginRequest` | `ApiResponse<TokenDto>` |
| `POST` | `/api/v1/auth/refresh` | `TokenRequest` | `ApiResponse<TokenDto>` |
| `POST` | `/api/v1/auth/registration` | `UserRegistrationRequest`, query `withoutConfirmation?: boolean` | `ApiResponse<TokenDto>` |
| `POST` | `/api/v1/auth/change_password` | `UserRegistrationRequest` | `ApiResponse<NoContentView>` |
| `POST` | `/api/v1/auth/confirmation` | `EmailConfirmationRequest` | `ApiResponse<NoContentView>` |
| `POST` | `/api/v1/auth/reset` | `TokenRequest` | `ApiResponse<NoContentView>` |

`TokenRequest`:

```json
{
  "token": "access-or-refresh-token"
}
```

`UserLoginRequest`:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

`UserRegistrationRequest`:

```json
{
  "email": "user@example.com",
  "password": "password",
  "confirmationCode": "123456",
  "idempotencyKey": "client-generated-key"
}
```

`EmailConfirmationRequest`:

```json
{
  "email": "user@example.com",
  "idempotencyKey": "client-generated-key",
  "type": "REGISTRATION"
}
```

Возможные `type`: `REGISTRATION`, `CHANGE_PASSWORD`.

### Google

| Method | Endpoint | Request | Response |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/google/login` | `GoogleTokenRequest` | `ApiResponse<TokenDto>` |

```json
{
  "idToken": "google-id-token"
}
```

### Telegram

| Method | Endpoint | Request | Response |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/telegram/login` | `TelegramLoginRequest` | `ApiResponse<TokenDto>` |

```json
{
  "initData": "telegram-mini-app-init-data"
}
```

## Контент

### Общие модели

`CourseView`:

```json
{
  "id": 1,
  "title": "A1 English",
  "category": {
    "name": "A1",
    "code": "A1"
  },
  "tag": "beginner",
  "isPublic": true,
  "inLibrary": true,
  "purchased": true,
  "cover": "/courses/cover.jpg",
  "descriptions": [
    {
      "id": 1,
      "value": "Course description",
      "locale": "EN"
    }
  ],
  "modules": [],
  "accessCode": "FREE"
}
```

`ModuleView`:

```json
{
  "id": 1,
  "title": "Module 1",
  "isPublic": true,
  "cards": [],
  "freeAccess": {
    "available": true,
    "status": "AVAILABLE",
    "lockedReason": null,
    "cooldownUntil": null
  }
}
```

`CardView`:

```json
{
  "id": 1,
  "term": "hello",
  "image": "/cards/hello.jpg",
  "translations": [
    {
      "id": 1,
      "value": "привет",
      "locale": "RU"
    }
  ],
  "samples": [
    {
      "id": 1,
      "value": "Hello, world",
      "translation": "Привет, мир",
      "locale": "EN"
    }
  ]
}
```

Справочники:

- `CourseCategoryCode`: `A1`, `A2`, `B1`, `B2`, `C1`, `C2`, `SPEAKING`, `READING`, `WRITING`
- `CourseAccessCode`: `FREE`, `BASIC`, `PRO`
- `LocaleCode`: `RU`, `UZ`, `EN`
- `FreeModuleAvailabilityCode`: `AVAILABLE`, `ACTIVE`, `COMPLETED`, `LOCKED`
- `FreeModuleAccessStatusCode`: `ACTIVE`, `COMPLETED`, `CANCELLED`

### Courses

| Method | Endpoint | Request | Response |
| --- | --- | --- | --- |
| `GET` | `/api/v1/courses` | query `filter?: List<CourseCategoryFilter>` | `ApiResponse<CoursesView>` |
| `GET` | `/api/v1/courses/{courseId}` | path `courseId: long` | `ApiResponse<CourseView>` |
| `GET` | `/api/v1/courses/{courseId}/modules` | path `courseId: long` | `ApiResponse<ModulesView>` |
| `GET` | `/api/v1/courses/library` | - | `ApiResponse<CoursesView>` |
| `POST` | `/api/v1/courses/library/{courseId}` | path `courseId: long` | `ApiResponse<NoContentView>` |
| `DELETE` | `/api/v1/courses/library/{courseId}` | path `courseId: long` | `ApiResponse<NoContentView>` |

`CoursesView`:

```json
{
  "courses": [
    {
      "id": 1,
      "title": "A1 English",
      "category": {
        "name": "A1",
        "code": "A1"
      },
      "inLibrary": true,
      "purchased": true,
      "accessCode": "FREE"
    }
  ]
}
```

Фильтр курсов передается повторяющимся query-параметром или списком значений:

```text
GET /api/v1/courses?filter=A1&filter=SPEAKING
```

### Modules

| Method | Endpoint | Request | Response |
| --- | --- | --- | --- |
| `GET` | `/api/v1/modules/{moduleId}` | path `moduleId: long` | `ApiResponse<ModuleView>` |
| `GET` | `/api/v1/modules/{moduleId}/cards` | path `moduleId: long` | `ApiResponse<CardsView>` |

`CardsView`:

```json
{
  "cards": [
    {
      "id": 1,
      "term": "hello",
      "image": "/cards/hello.jpg",
      "translations": [],
      "samples": []
    }
  ]
}
```

### Cards

| Method | Endpoint | Request | Response |
| --- | --- | --- | --- |
| `GET` | `/api/v1/cards/{cardId}` | path `cardId: long` | `ApiResponse<CardView>` |

## Favorites

| Method | Endpoint | Request | Response |
| --- | --- | --- | --- |
| `GET` | `/api/v1/favorites/courses/{courseId}/cards` | path `courseId: long` | `ApiResponse<CardsView>` |
| `GET` | `/api/v1/favorites/modules/{moduleId}/cards` | path `moduleId: long` | `ApiResponse<CardsView>` |
| `GET` | `/api/v1/favorites/cards` | - | `ApiResponse<CardsView>` |
| `POST` | `/api/v1/favorites/cards` | `CardFavoritesRequest` | `ApiResponse<NoContentView>` |
| `DELETE` | `/api/v1/favorites/cards/{cardId}` | path `cardId: long` | `ApiResponse<NoContentView>` |

`CardFavoritesRequest`:

```json
{
  "cardId": 1
}
```

## Training

Training используется для swipe-learning по карточкам модуля.

| Method | Endpoint | Request | Response |
| --- | --- | --- | --- |
| `GET` | `/api/v1/training/modules/{moduleId}` | path `moduleId: long` | `ApiResponse<List<TrainingResponse>>` |
| `POST` | `/api/v1/training` | `TrainingRequest` | `ApiResponse<NoContentView>` |
| `DELETE` | `/api/v1/training/modules/{moduleId}` | path `moduleId: long` | `ApiResponse<NoContentView>` |

`TrainingRequest`:

```json
{
  "cardId": 1,
  "known": true
}
```

`TrainingResponse`:

```json
{
  "card": {
    "id": 1,
    "term": "hello",
    "image": "/cards/hello.jpg",
    "translations": [],
    "samples": []
  },
  "progress": {
    "isAnswered": true,
    "isKnown": true,
    "isFavorites": false
  }
}
```

## Quiz

| Method | Endpoint | Request | Response |
| --- | --- | --- | --- |
| `GET` | `/api/v1/quiz/progress` | - | `ApiResponse<ProgressQuizResponse>` |
| `GET` | `/api/v1/quiz/courses/{courseId}/progress` | path `courseId: long` | `ApiResponse<ProgressQuizCourseResponse>` |
| `GET` | `/api/v1/quiz/modules/{moduleId}/progress` | path `moduleId: long` | `ApiResponse<ProgressQuizModuleResponse>` |
| `DELETE` | `/api/v1/quiz/modules/{moduleId}/progress` | path `moduleId: long` | `ApiResponse<NoContentView>` |
| `GET` | `/api/v1/quiz/modules/{moduleId}` | path `moduleId: long` | `ApiResponse<QuizWrapperResponse>` |
| `POST` | `/api/v1/quiz/modules/{moduleId}` | `AnswerQuizRequest` | `ApiResponse<QuizWrapperResponse>` |

`ProgressQuizResponse`:

```json
{
  "percent": 75.0,
  "success": 15,
  "failure": 5,
  "total": 20
}
```

`ProgressQuizCourseResponse`:

```json
{
  "courseId": 1,
  "progress": {
    "percent": 75.0,
    "success": 15,
    "failure": 5,
    "total": 20
  },
  "modules": []
}
```

`QuizWrapperResponse`:

```json
{
  "quizResponse": [
    {
      "card": {
        "id": 1,
        "term": "hello",
        "image": "/cards/hello.jpg",
        "translations": [],
        "samples": []
      },
      "answers": [
        {
          "cardId": 1,
          "term": "hello",
          "image": "/cards/hello.jpg",
          "isCorrectAnswer": true,
          "translationRu": "привет",
          "translationUz": "salom"
        }
      ]
    }
  ]
}
```

`AnswerQuizRequest`:

```json
{
  "cardId": 1,
  "answerId": 2
}
```

## Pomodoro

| Method | Endpoint | Request | Response |
| --- | --- | --- | --- |
| `GET` | `/api/v1/pomodoro/courses/{courseId}` | path `courseId: long` | `ApiResponse<PomodoroResponse>` |
| `POST` | `/api/v1/pomodoro/courses/{courseId}` | `PomodoroRequest` | `ApiResponse<PomodoroResponse>` |
| `DELETE` | `/api/v1/pomodoro/courses/{courseId}` | path `courseId: long` | `ApiResponse<NoContentView>` |

`PomodoroRequest`:

```json
{
  "minutes": 25
}
```

`PomodoroResponse`:

```json
{
  "courseId": 1,
  "minutes": 25
}
```

## Free Module Access

Free access дает ограниченный временный доступ к модулю.

| Method | Endpoint | Request | Response |
| --- | --- | --- | --- |
| `POST` | `/api/v1/free-access/modules/{moduleId}/start` | path `moduleId: long` | `ApiResponse<FreeModuleAccessView>` |
| `POST` | `/api/v1/free-access/cancel` | - | `ApiResponse<FreeModuleAccessView>` |
| `GET` | `/api/v1/free-access/status` | - | `ApiResponse<FreeModuleAccessStatusView>` |

`FreeModuleAccessView`:

```json
{
  "id": 1,
  "courseId": 1,
  "moduleId": 1,
  "status": "ACTIVE",
  "startedAt": "2026-05-11T00:00:00Z",
  "completedAt": null,
  "cancelledAt": null,
  "cooldownUntil": null
}
```

`FreeModuleAccessStatusView`:

```json
{
  "active": {
    "id": 1,
    "courseId": 1,
    "moduleId": 1,
    "status": "ACTIVE"
  },
  "cooldownUntil": null
}
```

## Analytics

| Method | Endpoint | Request | Response |
| --- | --- | --- | --- |
| `POST` | `/api/v1/analytics/sessions` | `SessionsAnalytics` | `ApiResponse<NoContentView>` |

`SessionsAnalytics`:

```json
{
  "sessions": [
    {
      "startedAtUtc": "2026-05-11T08:00:00.000",
      "endedAtUtc": "2026-05-11T08:25:00.000",
      "timezone": "Europe/Samara"
    }
  ]
}
```

## Report

| Method | Endpoint | Request | Response |
| --- | --- | --- | --- |
| `GET` | `/api/v1/report` | - | `ApiResponse<ReportResponse>` |
| `GET` | `/api/v1/report/{userUid}` | path `userUid: UUID` | `ApiResponse<ReportResponse>` |

`ReportResponse`:

```json
{
  "sessions": {
    "minutesToDay": 25,
    "minutesInWeek": 120,
    "minutesAllTime": 1000,
    "visits": [
      {
        "date": "2026-05-11",
        "count": 1
      }
    ]
  },
  "cards": {
    "known": 10,
    "total": 20,
    "progress": 50.0
  },
  "training": {
    "known": 10,
    "total": 20,
    "progress": 50.0
  },
  "courses": {
    "total": 3,
    "active": 2,
    "complete": 1
  }
}
```

## Типовые потоки

### Вход пользователя

1. Клиент выполняет login через email/password, Google или Telegram.
2. API возвращает `TokenDto`.
3. Клиент передает `token` в заголовке `Authorization: Bearer <token>`.
4. При истечении access token клиент вызывает `POST /api/v1/auth/refresh` с refresh token.

### Просмотр и добавление курса

1. Клиент получает каталог: `GET /api/v1/courses`.
2. Клиент открывает курс: `GET /api/v1/courses/{courseId}`.
3. Клиент получает модули: `GET /api/v1/courses/{courseId}/modules`.
4. Клиент добавляет курс в библиотеку: `POST /api/v1/courses/library/{courseId}`.
5. Библиотека пользователя доступна через `GET /api/v1/courses/library`.

### Работа с модулем

1. Клиент открывает модуль: `GET /api/v1/modules/{moduleId}`.
2. Клиент получает карточки модуля: `GET /api/v1/modules/{moduleId}/cards`.
3. Для ограниченного доступа клиент может вызвать `POST /api/v1/free-access/modules/{moduleId}/start`.
4. Статус free access проверяется через `GET /api/v1/free-access/status`.

### Тренировка

1. Клиент получает карточки для тренировки: `GET /api/v1/training/modules/{moduleId}`.
2. После ответа пользователя клиент отправляет `POST /api/v1/training`.
3. Если нужно сбросить прогресс модуля, клиент вызывает `DELETE /api/v1/training/modules/{moduleId}`.

### Quiz

1. Клиент получает quiz для модуля: `GET /api/v1/quiz/modules/{moduleId}`.
2. Ответ отправляется через `POST /api/v1/quiz/modules/{moduleId}`.
3. Прогресс доступен на уровне всего пользователя, курса или модуля.
4. Прогресс модуля сбрасывается через `DELETE /api/v1/quiz/modules/{moduleId}/progress`.

### Favorites

1. Клиент добавляет карточку в избранное через `POST /api/v1/favorites/cards`.
2. Избранные карточки можно получить глобально, по курсу или по модулю.
3. Удаление из избранного выполняется через `DELETE /api/v1/favorites/cards/{cardId}`.

### Pomodoro и аналитика

1. Клиент настраивает длительность pomodoro для курса через `POST /api/v1/pomodoro/courses/{courseId}`.
2. После учебной сессии клиент отправляет analytics через `POST /api/v1/analytics/sessions`.
3. Сводка прогресса доступна через `GET /api/v1/report`.
