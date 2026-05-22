**ТЕХНИЧЕСКОЕ ЗАДАНИЕ**

**Wordzen Web App --- React JS**

Версия 1.4 · API сверен по официальным контрактам бэкенда · 08.05.2026

  ----------------------------------- -------------------------------------
  Проект                              Wordzen --- Telegram Mini App для
                                      изучения английского

  Стек                                React 19, TypeScript, Zustand, Framer
                                      Motion, Tailwind CSS, Vite

  WordZen API                         https://api-wordzen.stnapps.com
                                      (Bearer JWT)

  Account API                         https://account-wordzen.stnapps.com
                                      (Bearer JWT + X-Client-Key)

  Payment API                         https://payment-wordzen.stnapps.com
                                      (Bearer JWT + X-Client-Key)

  Тарифы                              BASIC и PRO --- оплата через UZS
                                      (Payme/Click) или Telegram Stars

  Версия ТЗ                           v1.4 --- убран раздел монет/магазина,
                                      все тела запросов исправлены по
                                      контракту

  Дата                                08.05.2026
  ----------------------------------- -------------------------------------

# **0. Справочник реальных API-эндпоинтов**

  -----------------------------------------------------------------------
  Приоритет у этого раздела. Все пути и тела запросов взяты из
  официальных контрактов бэкенда (account-api.md, payment-api.md,
  wordzen-api.md).
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## **0.1 WordZen API --- Learning (Bearer JWT)**

  -----------------------------------------------------------------------------------------------------------------------------------------------
  **Метод**         **Путь**                                       **Тело / Query**                                  **Ответ (data)**
  ----------------- ---------------------------------------------- ------------------------------------------------- ----------------------------
  POST              /api/v1/auth/telegram/login                    { initData }                                      TokenDto

  POST              /api/v1/auth/login                             { email, password }                               TokenDto

  POST              /api/v1/auth/refresh                           { token }                                         TokenDto

  GET               /api/v1/courses                                ?filter\[\]=A1&filter\[\]=SPEAKING                CoursesView

  GET               /api/v1/courses/{courseId}                     path courseId                                     CourseView

  GET               /api/v1/courses/{courseId}/modules             path courseId                                     ModulesView

  GET               /api/v1/courses/library                        ---                                               CoursesView

  POST              /api/v1/courses/library/{courseId}             path courseId                                     NoContent

  DELETE            /api/v1/courses/library/{courseId}             path courseId                                     NoContent

  GET               /api/v1/modules/{moduleId}                     path moduleId                                     ModuleView

  GET               /api/v1/modules/{moduleId}/cards               path moduleId                                     CardsView

  GET               /api/v1/training/modules/{moduleId}            path moduleId                                     List\<TrainingResponse\>

  POST              /api/v1/training                               { cardId: long, known: boolean }                  NoContent

  DELETE            /api/v1/training/modules/{moduleId}            path moduleId                                     NoContent

  GET               /api/v1/quiz/modules/{moduleId}                path moduleId                                     QuizWrapperResponse

  POST              /api/v1/quiz/modules/{moduleId}                { cardId: long, answerId: long }                  QuizWrapperResponse

  GET               /api/v1/quiz/progress                          ---                                               ProgressQuizResponse

  GET               /api/v1/quiz/modules/{moduleId}/progress       path moduleId                                     ProgressQuizModuleResponse

  DELETE            /api/v1/quiz/modules/{moduleId}/progress       path moduleId                                     NoContent

  GET               /api/v1/favorites/cards                        ---                                               CardsView

  POST              /api/v1/favorites/cards                        { cardId: long }                                  NoContent

  DELETE            /api/v1/favorites/cards/{cardId}               path cardId                                       NoContent

  GET               /api/v1/pomodoro/courses/{courseId}            path courseId                                     PomodoroResponse

  POST              /api/v1/pomodoro/courses/{courseId}            { minutes: number }                               PomodoroResponse

  DELETE            /api/v1/pomodoro/courses/{courseId}            path courseId                                     NoContent

  POST              /api/v1/free-access/modules/{moduleId}/start   path moduleId                                     FreeModuleAccessView

  POST              /api/v1/free-access/cancel                     ---                                               FreeModuleAccessView

  GET               /api/v1/free-access/status                     ---                                               FreeModuleAccessStatusView

  POST              /api/v1/analytics/sessions                     { sessions:\[{startedAtUtc,endedAtUtc,timezone}\] NoContent
                                                                   }                                                 

  GET               /api/v1/report                                 ---                                               ReportResponse

  GET               /api/v1/report/{userUid}                       path userUid                                      ReportResponse
  -----------------------------------------------------------------------------------------------------------------------------------------------

## **0.2 Account API --- Users & Friends (Bearer JWT)**

  --------------------------------------------------------------------------------------------
  **Метод**         **Путь**                    **Тело / Query**  **Ответ (data)**
  ----------------- --------------------------- ----------------- ----------------------------
  GET               /api/v1/users/me            ---               UserResponse

  PATCH             /api/v1/users/me/username   { username:       UserResponse
                                                string }          

  GET               /api/v1/rating              ---               UserResponse

  GET               /api/v1/friends             ---               List\<FriendshipResponse\>

  GET               /api/v1/friends/list        ---               List\<FriendshipResponse\>
                                                                  (только принятые)

  GET               /api/v1/friends/incoming    ---               List\<FriendshipResponse\>

  GET               /api/v1/friends/outgoing    ---               List\<FriendshipResponse\>

  POST              /api/v1/friends/request     { targetUid: UUID FriendshipResponse
                                                }                 

  POST              /api/v1/friends/accept      { requestId: long FriendshipResponse
                                                }                 

  POST              /api/v1/friends/decline     { requestId: long FriendshipResponse
                                                }                 

  DELETE            /api/v1/friends/{id}        path id: long     Void
                                                (это              
                                                friendshipId!)    
  --------------------------------------------------------------------------------------------

## **0.3 Account API --- только X-Client-Key (фронт НЕ вызывает)**

  -----------------------------------------------------------------------
  Эти эндпоинты доступны только сервер→сервер. Фронтенд не должен их
  вызывать напрямую. Начисление XP происходит на бэкенде автоматически.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

  --------------------------------------------------------------------------------------
  **Метод**         **Путь**                         **Тело**          **Описание**
  ----------------- -------------------------------- ----------------- -----------------
  GET               /api/v1/users/{uid}              path uid: UUID    Профиль другого
                                                                       пользователя

  POST              /api/v1/rating/update            { userUid, delta: Изменить рейтинг
                                                     long }            (XP)

  POST              /api/v1/subscriptions/purchase   { userUid,        Активировать
                                                     packageId }       подписку
                                                                       (вызывает Payment
                                                                       API)
  --------------------------------------------------------------------------------------

## **0.4 Payment API (Bearer JWT)**

  ----------------------------------------------------------------------------------------------------
  **Метод**         **Путь**                           **Тело запроса**  **Ответ (data)**
  ----------------- ---------------------------------- ----------------- -----------------------------
  GET               /api/v1/shop/subscriptions         ---               SubscriptionsResponse

  GET               /api/v1/cards                      ---               CardsResponse

  GET               /api/v1/transactions               ---               PaymentTransactionsResponse

  POST              /api/v1/telegram/invoice           { packageId,      { invoiceUrl, transactionUid
                                                       idempotencyKey }  }

  POST              /api/v1/payme/cards/create_token   { cardNumber,     CardResponse
                                                       expireDate }      

  POST              /api/v1/payme/cards/verify         { cardUid: UUID,  CardResponse
                                                       smsCode: string } 

  DELETE            /api/v1/payme/cards                { cardUid: UUID } MessageResponse

  POST              /api/v1/payme/payment              { amount,         PaymentTransactionResponse
                                                       packageId,        
                                                       cardUid: UUID,    
                                                       idempotencyKey }  

  POST              /api/v1/click/cards/create_token   { cardNumber,     CardResponse
                                                       expireDate }      

  POST              /api/v1/click/cards/verify         { cardUid: UUID,  CardResponse
                                                       smsCode: number } 

  DELETE            /api/v1/click/cards                { cardUid: UUID } MessageResponse

  POST              /api/v1/click/payment              { amount,         PaymentTransactionResponse
                                                       packageId,        
                                                       cardUid: UUID,    
                                                       idempotencyKey }  

  POST              /api/v1/click/payment_link         { amount,         { paymentLink, transactionUid
                                                       packageId,        }
                                                       idempotencyKey }  
  ----------------------------------------------------------------------------------------------------

## **0.5 Ключевые модели ответа (для TypeScript-типов)**

**UserResponse (Account API):**

> {\
> uid: string // UUID\
> username: string\
> rating: number // XP --- основа для системы уровней\
> createdAt: string\
> subscription: {\
> updatedAt: string\
> code: \"BASIC\" \| \"PRO\" // нет free-кода, отсутствие = бесплатный
> тариф\
> expirationDate: string \| null\
> } \| null\
> }

**FriendshipResponse (Account API):**

> {\
> id: number // friendshipId --- используется в accept/decline/delete\
> requesterUid: string // UUID\
> addresseeUid: string // UUID\
> status: \"PENDING\" \| \"ACCEPTED\" \| \"DECLINED\"\
> createdAt: string\
> updatedAt: string\
> }

**CardResponse (Payment API):**

> {\
> uid: string\
> number: string // \"8600\*\*\*\*\*\*\*\*1234\" --- маскированный\
> expireDate: string // \"12/30\"\
> provider: \"PAYME\" \| \"CLICK\"\
> status: \"VERIFIED\" \| \...\
> }

## **0.6 Эндпоинты, которых НЕТ на бэкенде (нужно согласовать)**

  -----------------------------------------------------------------------
  Следующие функции ТЗ требуют реализации на бэкенде. Фронт делает UI
  заглушки до появления API.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

  ----------------------------------------------------------------------------------------
  **Функция**       **Нужный эндпоинт**                **Приоритет**     **Статус**
  ----------------- ---------------------------------- ----------------- -----------------
  Глобальный        GET /api/v1/rating/leaderboard     🔴 Высокий        ❌ Не реализован
  рейтинг                                                                
  (топ-список)                                                           

  Поиск             GET /api/v1/users/search?q=        🔴 Высокий        ❌ Не реализован
  пользователей                                                          

  Достижения ---    GET /api/v1/achievements           🟡 Средний        ❌ Не реализован
  список и прогресс                                                      

  Достижения ---    POST                               🟡 Средний        ❌ Не реализован
  получить награду  /api/v1/achievements/:id/claim                       

  Ежедневные задачи GET /api/v1/daily-tasks            🟡 Средний        ❌ Не реализован

  Ежедневные задачи POST                               🟡 Средний        ❌ Не реализован
  --- завершить     /api/v1/daily-tasks/:id/complete                     

  WebSocket ---     wss://api-wordzen.stnapps.com/ws   🟢 Низкий         ❌ Не реализован
  мультиплеер                                                            
  ----------------------------------------------------------------------------------------

# **1. Общие принципы разработки**

-   Все новые экраны используют Framer Motion: AnimatePresence +
    > motion.div.

-   Анимации не блокируют интерактивность (layout prop там, где меняются
    > размеры).

-   Все состояния загрузки --- Skeleton-компоненты, не спиннеры.

-   Все состояния ошибок --- EmptyState с кнопкой «Попробовать снова».

-   TypeScript --- строгий режим, никаких any.

-   Новые Zustand-сторы: persist middleware + partialize.

-   Анимации уважают prefers-reduced-motion.

-   Все интерактивные элементы имеют aria-label; модальные окна ---
    > фокус-trap.

-   Данные берутся с сервера; localStorage --- только краткосрочный кэш,
    > не источник истины.

-   Никакого упоминания монет (coins), магазина ништяков, coin-пакетов
    > --- только подписки.

# **2. Подписки и оплата \[задачи 1--6\]**

  -----------------------------------------------------------------------
  Тарифы: BASIC и PRO. Способы оплаты: Payme UZ (карта), Click UZ (карта
  или ссылка), Telegram Stars. Никаких coin-пакетов.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## **2.1 Страница /subscription --- два таба \[задача 1\]**

**Таб 1 --- Подписка**

-   GET /api/v1/shop/subscriptions → массив subscriptions\[\]

-   Поля каждого пакета: name, month, packageId, priceStars, priceUzs,
    > code (\"BASIC\"\|\"PRO\")

-   Карточки BASIC и PRO; текущий тариф подсвечен (из /api/v1/users/me →
    > subscription.code)

-   Дата окончания: subscription.expirationDate из UserResponse

-   Кнопка «Оформить» или «Продлить» → PaymentMethodModal

-   Кнопка «Отменить» если подписка активна (согласовать эндпоинт с
    > бэкендом)

**Таб 2 --- История транзакций**

-   GET /api/v1/transactions → массив transactions\[\]

-   Каждая строка: дата (createdAt), провайдер (provider), статус
    > (status)

-   Статусы: CREATED / PENDING / SUCCESS / FAILED / REFUNDED / CANCELLED

-   Skeleton при загрузке; EmptyState если пусто

## **2.2 Компонент выбора способа оплаты --- PaymentMethodModal \[задача 2\]**

> ┌─────────────────────────────┐\
> │ Выберите способ оплаты │\
> │ │\
> │ ⭐ Telegram Stars │\
> │ 💳 Payme UZ (карта) │\
> │ 💳 Click UZ (карта/ссылка) │\
> │ │\
> │ \[Продолжить →\] │\
> └─────────────────────────────┘

После выбора метода и нажатия «Продолжить»:

-   Stars → поток 2.3

-   Payme карта → поток 2.4

-   Click карта → поток 2.5A

-   Click ссылка → поток 2.5B

## **2.3 Поток Telegram Stars \[задача 3\]**

**Тело запроса и ответ (из payment-api.md):**

> // Запрос\
> POST /api/v1/telegram/invoice\
> { \"packageId\": \"pro_1m\", \"idempotencyKey\": \"uuid-v4-client\" }\
> \
> // Ответ\
> { \"invoiceUrl\": \"https://t.me/\...\", \"transactionUid\": \"uuid\"
> }

1.  Вызвать POST /api/v1/telegram/invoice → получить invoiceUrl +
    transactionUid

2.  Открыть через window.Telegram.WebApp.openInvoice(invoiceUrl,
    callback)

3.  callback: при успешной оплате Telegram сам вызывает
    /telegram/confirm (X-Client-Key, бэк)

4.  Фронт: поллинг GET /api/v1/transactions/{transactionUid} до status
    === \"SUCCESS\" (макс 30 сек)

5.  При SUCCESS → refreshUserData() → показать успех

## **2.4 Поток Payme (карта) \[задача 4\]**

**Шаг 1 --- токенизация карты:**

> POST /api/v1/payme/cards/create_token\
> { \"cardNumber\": \"8600123412341234\", \"expireDate\": \"12/30\" }\
> // → CardResponse { uid, number (маскированный), status }

**Шаг 2 --- OTP (если статус не VERIFIED):**

> POST /api/v1/payme/cards/verify\
> { \"cardUid\": \"uuid\", \"smsCode\": \"123456\" } // smsCode: string!

**Шаг 3 --- оплата:**

> POST /api/v1/payme/payment\
> {\
> \"amount\": 25000,\
> \"packageId\": \"pro_1m\",\
> \"cardUid\": \"uuid\",\
> \"idempotencyKey\": \"uuid-v4-client\"\
> }

6.  Если карта уже сохранена --- пропустить шаги 1-2, сразу шаг 3

7.  После оплаты → GET /api/v1/transactions/{uid} поллинг → SUCCESS →
    refreshUserData()

**Удаление карты:**

> DELETE /api/v1/payme/cards\
> { \"cardUid\": \"uuid\" }

## **2.5 Поток Click \[задача 4\]**

**Вариант A --- карта (аналогично Payme):**

> POST /api/v1/click/cards/create_token\
> { \"cardNumber\": \"\...\", \"expireDate\": \"12/30\" }\
> \
> POST /api/v1/click/cards/verify\
> { \"cardUid\": \"uuid\", \"smsCode\": 123456 } // smsCode: number (не
> string)!\
> \
> POST /api/v1/click/payment\
> { \"amount\": 25000, \"packageId\": \"pro_1m\", \"cardUid\": \"uuid\",
> \"idempotencyKey\": \"uuid\" }

**Вариант B --- платёжная ссылка (без карты):**

> POST /api/v1/click/payment_link\
> { \"amount\": 25000, \"packageId\": \"pro_1m\", \"idempotencyKey\":
> \"uuid\" }\
> // → { \"paymentLink\": \"https://\...\", \"transactionUid\": \"uuid\"
> }

8.  Открыть paymentLink в браузере через
    window.Telegram.WebApp.openLink()

9.  Поллинг GET /api/v1/transactions/{transactionUid} → SUCCESS →
    refreshUserData()

**Удаление карты Click:**

> DELETE /api/v1/click/cards\
> { \"cardUid\": \"uuid\" }

## **2.6 CardInputForm \[задача 5\]**

-   Маска номера карты: 0000 0000 0000 0000

-   Срок: MM/YY

-   Валидация алгоритмом Луна (Luhn)

-   Определение Visa/Mastercard по BIN (первые цифры)

-   Список сохранённых карт: GET /api/v1/cards → показывать
    > маскированный номер (number поле)

-   Раздельные карты по provider: \"PAYME\" или \"CLICK\"

-   Важно: для Click smsCode передаётся как number, для Payme --- как
    > string

## **2.7 Единые состояния оплаты \[задача 6\]**

  -----------------------------------------------------------------------
  **Состояние**                       **UI**
  ----------------------------------- -----------------------------------
  idle                                Форма / кнопка «Оформить подписку»

  loading                             Spinner на кнопке, форма
                                      заблокирована

  polling                             Анимация ожидания подтверждения
                                      платежа (до 30 сек)

  success                             Анимированный чекмарк + «Подписка
                                      активирована до \[дата\]»

  error                               Текст ошибки из error.message +
                                      кнопка «Попробовать снова»
  -----------------------------------------------------------------------

# **3. Актуализация подписки и лимитов \[задачи 7--9\]**

## **3.1 Актуализация при старте и переходах \[задача 7\]**

  -----------------------------------------------------------------------
  В UserResponse нет поля \"type: free\". Отсутствие subscription или
  subscription === null = бесплатный тариф.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

-   При запуске: GET /api/v1/users/me → обновить subscriptionStore

-   subscriptionStore: хранить { code: \"BASIC\"\|\"PRO\"\|null,
    > expirationDate: string\|null }

-   Кэш считается актуальным не дольше 5 минут

-   При переходе на защищённый роут: middleware перепроверяет статус
    > подписки

**Структура UserResponse (поля, важные для подписки):**

> {\
> uid: string,\
> username: string,\
> rating: number, // XP для системы уровней\
> subscription: {\
> code: \"BASIC\" \| \"PRO\",\
> expirationDate: string \| null\
> } \| null // null = бесплатный тариф\
> }

## **3.2 Синхронизация лимитов \[задача 8\]**

-   usageStore лимиты берутся с сервера при каждом обновлении данных
    > пользователя

-   При расхождении localStorage и сервера --- доверять серверу

## **3.3 Истёкшая подписка \[задача 9\]**

-   Если expirationDate \< now → показывать SubscribeModal с кнопкой
    > продления

-   Перед PaywallBanner --- всегда refreshUserData()

-   Кэш подписки не старше 5 минут

# **4. Рейтинг XP и система уровней \[задачи 10--11\]**

  -----------------------------------------------------------------------
  Монеты (coins) убраны из интерфейса. Показываем только XP (поле rating
  из UserResponse). Начисление XP происходит автоматически на бэкенде ---
  фронт только читает.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## **4.1 Как работает начисление XP \[задача 10\]**

Схема:

> Фронт → POST /api/v1/training { cardId, known } (или quiz, pomodoro и
> т.д.)\
> ↓\
> WordZen API обрабатывает действие → Account API (X-Client-Key)\
> POST /api/v1/rating/update { userUid, delta }\
> ↓\
> Фронт → GET /api/v1/users/me (или GET /api/v1/rating)\
> читает обновлённый rating

Что делает фронт после завершённого действия:

10. Дождаться успешного ответа от WordZen API

11. Вызвать refreshUserData() → GET /api/v1/users/me

12. Сравнить новый rating с предыдущим → вычислить новый уровень через
    getLevelByXp()

13. Если уровень повысился → показать LevelUpModal

Таблица ожидаемых начислений XP (для оптимистичного UI):

  --------------------------------------------------------------------------------
  **Действие              **XP**                  **Триггер на фронте**
  пользователя**                                  
  ----------------------- ----------------------- --------------------------------
  Завершён юнит           +5                      trainingStore --- успешный POST
  (карточки)                                      /training

  Завершён курс полностью +30                     coursesStore --- 100% прогресс

  Тест 50--74%            +4                      quizStore --- POST
                                                  /quiz/modules/{id}

  Тест 75--89%            +7                      quizStore --- POST
                                                  /quiz/modules/{id}

  Тест 90--100%           +12                     quizStore --- POST
                                                  /quiz/modules/{id}

  Игра завершена          +3                      gamesStore при gameOver

  Игра с личным рекордом  +6                      gamesStore при gameOver

  Ежедневное задание      +8                      dailyTasksStore.completeTask()

  Streak 7 дней           +15                     userStore.checkStreak()

  Streak 30 дней          +50                     userStore.checkStreak()

  Помодоро завершён       +4                      pomodoroStore при завершении

  Первый вход в день      +2                      userStore при инициализации
  --------------------------------------------------------------------------------

*\* Точные delta уточнить у бэкенд-команды, значения ориентировочные.*

## **4.2 Отображение XP \[задача 11\]**

-   XP берётся из UserResponse.rating после каждого refreshUserData()

-   Оптимистичный «+N XP»: float-up анимация сразу после действия

-   Финальное значение --- из refreshUserData(), при расхождении ---
    > показать разницу

-   В шапке и профиле: показывать только XP и название уровня, никаких
    > монет

## **4.3 Система уровней (32 уровня --- только фронт)**

  -----------------------------------------------------------------------
  Уровни вычисляются локально из UserResponse.rating. Отдельного
  бэк-эндпоинта нет.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

Создать src/lib/data/levels.ts:

> export interface Level {\
> level: number\
> name: string\
> minXp: number // UserResponse.rating \>= minXp для этого уровня\
> maxXp: number // Infinity у 32-го\
> }\
> export function getLevelByXp(xp: number): Level { \... }\
> // В userStore: computed из rating, не хранить отдельно

  -----------------------------------------------------------------------------------
  **Ур.**     **Название**         **XP**      **Ур.**     **Название**   **XP**
  ----------- -------------------- ----------- ----------- -------------- -----------
  1           Новичок              0           17          Умелый         5 480

  2           Любопытный           50          18          Практик        6 230

  3           Внимательный         120         19          Толковый       7 030

  4           Старательный         220         20          Чёткий         7 880

  5           Усидчивый            350         21          Сильный        8 780

  6           Вдумчивый            520         22          Глубокий       9 780

  7           Нацеленный           730         23          Свободный      10 880

  8           Уверенный            980         24          Беглый         12 080

  9           Продвинутый          1 280       25          Точный         13 380

  10          Настойчивый          1 630       26          Острый         14 780

  11          Дисциплинированный   2 030       27          Широкий        16 380

  12          Методичный           2 480       28          Зрелый         18 080

  13          Грамотный            2 980       29          Системный      19 980

  14          Опытный              3 530       30          Гибкий         22 080

  15          Развитый             4 130       31          Мастер слова   24 480

  16          Прокачанный          4 780       32          WordZen Master 27 180
  -----------------------------------------------------------------------------------

LevelUpModal при повышении уровня:

> ┌──────────────────────────────────┐\
> │ 🎉 Новый уровень! │\
> │ ⬆ Уровень 8 --- «Уверенный» │\
> │ \[░░░░░░░░░░░░░░░░░\] 0% │\
> │ 0 / 300 XP до уровня 9 │\
> │ \[Продолжить\] │\
> └──────────────────────────────────┘

-   Анимация: конфетти + scale-bounce заголовка

-   После закрытия --- badge с номером уровня на аватаре в Header на 5
    > сек

# **5. Достижения (Achievements) \[задачи 12--14\]**

  -----------------------------------------------------------------------
  API достижений не реализован. До появления эндпоинтов --- хранить
  локально в achievementsStore (localStorage persist). Структуру делать
  совместимой с будущим API.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## **5.1 achievementsStore (временно локальный) \[задача 12\]**

> interface AchievementsStore {\
> achievements: Achievement\[\]\
> lastSyncedAt: number \| null\
> // временно локально, после появления API --- заменить на fetch\
> updateProgress: (type: AchievementType, delta: number) =\> void\
> claimAchievement: (id: string) =\> Promise\<void\>\
> }\
> \
> // Будущий API (согласовать с бэкендом):\
> // GET /api/v1/achievements\
> // POST /api/v1/achievements/:id/claim

## **5.2 Триггеры прогресса \[задача 13\]**

  -------------------------------------------------------------------------
  **Событие**             **Тип**                 **Где вызвать**
  ----------------------- ----------------------- -------------------------
  POST /training успешен  vocabulary, courses     trainingStore

  POST /quiz/modules/{id} tests                   quizStore
  успешен                                         

  Игра завершена          games                   gamesStore при gameOver

  Streak достигнут        streaks                 userStore.checkStreak()

  Принята заявка в друзья friends                 friendsStore.accept()

  Помодоро завершён       pomodoro                pomodoroStore

  Уровень повысился       levels                  после LevelUpModal
  -------------------------------------------------------------------------

## **5.3 Toast и сетка ачивок на /profile \[задача 14\]**

-   AchievementToast: иконка + название + «+N XP» (не монеты!) +
    > slide-up

-   Очередь: одновременно показывается только одна, автоудаление через 4
    > сек

-   Сетка на /profile: 3 колонки, 43 ачивки; замок / цветная / золотая
    > рамка (уникальные)

-   Modal: иконка, название, описание, прогресс-бар, кнопка «Получить»
    > (если выполнена)

Полный список ачивок (43 штуки --- 9 групп):

  --------------------------------------------------------------------------
  **\#**            **Группа**        **Название**       **Условие**
  ----------------- ----------------- ------------------ -------------------
  1                 Стартовые         Первый шаг         Завершить первый
                                                         юнит

  2                 Стартовые         Первый курс        Открыть первый юнит
                                                         любого курса

  3                 Стартовые         Первый тест        Пройти любой тест
                                                         до конца

  4                 Стартовые         Первая игра        Завершить любую
                                                         игру

  5                 Стартовые         Первое помодоро    Завершить первую
                                                         помодоро-сессию

  6                 Прогресс          Десять юнитов      10 юнитов суммарно

  7                 Прогресс          Пятьдесят юнитов   50 юнитов суммарно

  8                 Прогресс          Сто юнитов         100 юнитов суммарно

  9                 Прогресс          Первый завершённый Полностью пройти
                                      курс               любой курс

  10                Прогресс          Пять курсов        5 курсов полностью

  11                Тесты             Отличник           Тест 100%

  12                Тесты             Стабильный         5 тестов подряд \>
                                      результат          80%

  13                Тесты             Снайпер            5 тестов подряд \>
                                                         90%

  14                Тесты             Двадцать тестов    20 тестов суммарно

  15                Тесты             Сто тестов         100 тестов суммарно

  16                Игры              Игровой старт      5 игр суммарно

  17                Игры              Постоянный игрок   25 игр суммарно

  18                Игры              Рекордсмен         Побить рекорд 3
                                                         раза подряд

  19                Игры              Все режимы         Сыграть в каждый
                                                         тип игры

  20                Streak            Первое задание     Первое ежедневное
                                                         задание

  21                Streak            Неделя подряд      Streak 7 дней

  22                Streak            Месяц подряд       Streak 30 дней

  23                Streak            Два месяца подряд  Streak 60 дней

  24                Помодоро          Помодоро-практик   10 сессий

  25                Помодоро          Помодоро-фанат     50 сессий

  26                Помодоро          Помодоро-марафон   3 сессии за один
                                                         день

  27                Рейтинг           В рейтинге         Топ-100

  28                Рейтинг           Топ-50             Топ-50

  29                Рейтинг           Топ-10             Топ-10

  30                Рейтинг           Первое место       1-е место хотя бы
                                                         на день

  31                Уровни            Пятый уровень      Уровень 5

  32                Уровни            Пятнадцатый        Уровень 15
                                      уровень            

  33                Уровни            WordZen Master     Уровень 32

  34                ⭐ Уникальные     Тысяча за день     1 000 XP за один
                                                         день

  35                ⭐ Уникальные     3 юнита × 10 дней  3+ юнита в день ---
                                                         10 раз

  36                ⭐ Уникальные     Идеальная неделя   7 дней:
                                                         юнит+тест+задание
                                                         каждый день

  37                ⭐ Уникальные     Восхождение        Один тест 5 раз с
                                                         улучшением

  38                ⭐ Уникальные     Спринтер           10 000 XP за 30
                                                         дней

  39                ⭐ Уникальные     Без ошибок         10 тестов подряд
                                                         100%

  40                ⭐ Уникальные     Двести помодоро    200 помодоро-сессий

  41                ⭐ Уникальные     Полная коллекция   Получить все
                                                         остальные 32 ачивки

  42                ⭐ Уникальные     WordZen Legend     50 000 XP суммарно

  43                ⭐ Уникальные     Непрерывный поток  100 дней подряд
  --------------------------------------------------------------------------

# **6. Ежедневные задачи (Daily Tasks) \[задачи 15--17\]**

  -----------------------------------------------------------------------
  API daily-tasks не реализован. До появления --- задачи генерировать
  локально, сбрасывать в полночь по часовому поясу.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## **6.1 dailyTasksStore (временно локальный) \[задача 15\]**

> interface DailyTask {\
> id: string\
> type: \"training\"\|\"quiz\"\|\"game\"\|\"pomodoro\"\|\"flashcards\"\
> title: string // \"Заверши 10 карточек\"\
> reward: { xp: number } // только XP, не монеты\
> progress: { current: number; target: number }\
> isCompleted: boolean\
> expiresAt: string // следующая полночь\
> }\
> \
> interface DailyTasksStore {\
> tasks: DailyTask\[\]\
> generatedAt: string \| null // дата генерации --- для сброса\
> fetchTasks: () =\> void // локально или с API\
> completeTask: (id: string) =\> void\
> onActionCompleted: (type: DailyTask\[\"type\"\]) =\> void\
> }

## **6.2 Виджет на /home и страница /daily-tasks \[задача 16\]**

> ┌─────────────────────────────────┐\
> │ 📋 Задачи на сегодня 2/5 │\
> │ ▓▓▓▓░░░░░░░░ 40% │\
> │ ✅ Заверши 10 карточек +8 XP │\
> │ ⬜ Пройди тест +8 XP │\
> │ \[Посмотреть все →\] │\
> └─────────────────────────────────┘

-   Страница /daily-tasks: тип, прогресс-бар, XP-награда, таймер до
    > сброса (до полуночи)

-   Кнопка «Перейти» → соответствующий раздел (курсы / quiz / games /
    > pomodoro)

-   Завершённые задачи --- в конце с анимацией зачёркивания

## **6.3 Прокидывание событий \[задача 17\]**

  -----------------------------------------------------------------------
  **Стор / событие**                  **Тип задачи**
  ----------------------------------- -----------------------------------
  POST /training успешен              \"training\"

  POST /quiz/modules успешен          \"quiz\"

  gamesStore при gameOver             \"game\"

  pomodoroStore при завершении        \"pomodoro\"

  flashcardsStore при завершении      \"flashcards\"
  -----------------------------------------------------------------------

# **7. Рейтинги (Rankings) \[задача 18\]**

  -----------------------------------------------------------------------
  GET /api/v1/rating возвращает рейтинг одного пользователя. Эндпоинт
  глобального топа не реализован. До появления /rating/leaderboard ---
  показывать рейтинг среди друзей.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## **7.1 Страница /rankings**

-   3 таба: Глобальный / По стране / Друзья

-   Переключатель периода: Всё время / Неделя / Сегодня
    > (?period=all\|week\|day)

> ┌─────────────────────────────────────────┐\
> │ 🥇 #1 \[Аватар\] Ivan K. 12 450 XP ↑3│\
> │ 🥈 #2 \[Аватар\] Anna M. 11 200 XP ─ │\
> │ 🥉 #3 \[Аватар\] You 10 800 XP ↓1│ ← sticky\
> └─────────────────────────────────────────┘

-   Топ-3: оформление золото/серебро/бронза

-   Текущий пользователь --- sticky внизу с его позицией

-   Рядом с именем --- название уровня (из getLevelByXp(rating))

-   Infinite scroll --- 50 записей за раз

## **7.2 До появления API лидерборда**

-   Вкладки «Глобальный» и «По стране» --- заглушка «Скоро»

-   Вкладка «Друзья» --- GET /api/v1/friends/list + для каждого GET
    > /api/v1/report/{uid} (для XP)

-   Сортировать по rating убыванию

# **8. Друзья (Friends) \[задачи 19--22\]**

  -----------------------------------------------------------------------
  API друзей РЕАЛИЗОВАН. Подключить friendsStore.ts к реальным
  эндпоинтам.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## **8.1 Страница /friends \[задача 19\]**

**Секция «Входящие заявки»:**

-   GET /api/v1/friends/incoming → List\<FriendshipResponse\>

-   Каждая заявка: показать requesterUid --- нужно загрузить профиль
    > через /report/{uid}

-   Принять: POST /api/v1/friends/accept { requestId: friendship.id }

-   Отклонить: POST /api/v1/friends/decline { requestId: friendship.id }

  -----------------------------------------------------------------------
  Тело accept/decline: { requestId: long } --- НЕ friendshipId, поле
  называется requestId!
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

**Секция «Мои друзья»:**

-   GET /api/v1/friends/list → только ACCEPTED

-   Для каждого друга: загрузить профиль через GET /api/v1/report/{uid}

**Секция «Найти»:**

  -----------------------------------------------------------------------
  GET /api/v1/users/search?q= --- НЕ реализован. Показать заглушку «Поиск
  пользователей появится скоро».
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

-   Отправить заявку: POST /api/v1/friends/request { targetUid: UUID }

## **8.2 Страница /friends/:id \[задача 20\]**

-   Данные: GET /api/v1/report/{uid} --- статистика (sessions, cards,
    > training, courses)

-   Уровень: вычислить getLevelByXp(rating) если rating доступен через
    > report

-   Кнопка «Вызвать на игру» → MatchmakingModal (раздел 9)

-   Удалить из друзей: DELETE /api/v1/friends/{id} где id --- это
    > FriendshipResponse.id!

  -----------------------------------------------------------------------
  DELETE /api/v1/friends/{id}: id --- это id дружбы (число), НЕ uid
  пользователя!
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## **8.3 Приглашение в Telegram и deeplink \[задача 21\]**

> window.Telegram.WebApp.openTelegramLink(\
> \`https://t.me/share/url?url=https://t.me/BOT\
> ?start=invite\_\${userUid}&text=Играй со мной в Wordzen!\`\
> )

14. При запуске: парсить Telegram startParam

15. Если начинается с \"invite\_\" → POST /api/v1/friends/request {
    targetUid: uid }

16. Toast: «Заявка в друзья отправлена»

## **8.4 Badge на TabBar \[задача 22\]**

-   GET /api/v1/friends/incoming → если list.length \> 0 → красная точка
    > на табе «Друзья»

-   Обновлять при каждом входе в приложение и при принятии/отклонении
    > заявок

# **9. Мультиплеер (PvP) \[задачи 23--26\]**

  -----------------------------------------------------------------------
  WS-сервер не реализован. Фронт делает инфраструктуру заранее ---
  подключить после появления бэка.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## **9.1 WebSocket-клиент \[задача 23\]**

> websocket/\
> ├── client.ts \# singleton WSClient\
> ├── events.ts \# типизированные события\
> └── hooks/\
> ├── useGameRoom.ts\
> └── useMatchmaking.ts

-   URL (будущий): wss://api-wordzen.stnapps.com/ws?token=JWT

-   Auto-reconnect: exponential backoff 1с → 2с → 4с → ... → max 30с

-   Heartbeat ping каждые 25 секунд

-   Типизированные send(event, payload) и on(event, handler)

## **9.2 UI матчмейкинга \[задача 24\]**

  -----------------------------------------------------------------------
  **Событие WS**          **Направление**         **Payload**
  ----------------------- ----------------------- -----------------------
  matchmaking:join        → сервер                { gameType:
                                                  \"word_rush\" \|
                                                  \"octo_memory\" }

  matchmaking:found       ← сервер                { roomId, opponent:
                                                  UserPreview, startsIn:
                                                  3 }

  matchmaking:cancelled   ← сервер                { reason: string }
  -----------------------------------------------------------------------

## **9.3 Word Rush PvP \[задача 25\]**

  -------------------------------------------------------------------------
  **Событие WS**          **Направление**         **Payload**
  ----------------------- ----------------------- -------------------------
  game:start              ← сервер                { roomId, words,
                                                  duration: 60 }

  game:answer             → сервер                { roomId, wordId, answer,
                                                  timestamp }

  game:score              ← сервер                { userId, score, combo }

  game:end                ← сервер                { winner, scores:
                                                  Record\<string,number\> }
  -------------------------------------------------------------------------

-   Боковая панель: аватар соперника + имя + live-счёт

-   Если соперник отключился → OpponentDisconnectedModal + победа

## **9.4 Кнопки мультиплеера \[задача 26\]**

-   На /games: «🆚 Играть с другом» для Word Rush и Octo Memory

  -----------------------------------------------------------------------
  Daily Challenge в PvP не входит --- ежедневный лимит одна попытка.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

# **10. Анимации (глобально) \[задачи 27--32\]**

  -----------------------------------------------------------------------
  Framer Motion 12 уже установлен. Можно делать параллельно с другими
  блоками.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## **10.1 PageTransition --- все экраны \[задача 27\]**

> const variants = {\
> initial: { opacity: 0, y: 16 },\
> animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease:
> \'easeOut\' } },\
> exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },\
> }

-   Обернуть все экраны в App.tsx через \<PageTransition\>

## **10.2 TabBar \[задача 28\]**

-   layoutId=\"tab-indicator\" --- индикатор активной вкладки (shared
    > layout animation)

-   Иконки: scale(1.15) при активации через motion.div

## **10.3 Карточки и списки \[задача 29\]**

-   Card (pressable): whileHover={{ scale: 1.02 }}, whileTap={{ scale:
    > 0.97 }}

-   Списки курсов / ачивок / рейтинга: stagger с staggerChildren: 0.05

## **10.4 Игры \[задача 30\]**

-   Word Rush: slide-up/fade через AnimatePresence при смене слова

-   Octo Memory: flip-анимация карточки через rotateY

-   Daily Challenge: slide left (правильно) / slide right (неправильно)

-   Результаты: spring-анимация появления score/badge

## **10.5 ProgressBar и счётчики \[задача 31\]**

-   ProgressBar: motion + transition { duration: 0.6, ease: \"easeOut\"
    > }

-   XP в шапке: roll-up эффект через useMotionValue при изменении числа

## **10.6 Toast и модальные окна \[задача 32\]**

-   Toast: AnimatePresence + slide снизу, автоудаление 3с, без сторонних
    > библиотек

-   Типы Toast: ачивка (зелёный), XP (синий), ошибка (красный), нет
    > соединения (серый, persistent)

-   Modal: backdrop fade + контент scale(0.95→1) + opacity

-   SubscribeModal --- та же анимация

# **11. Нефункциональные требования \[задача 33\]**

## **11.1 Производительность**

-   Тяжёлые страницы (Rankings, Friends, Subscription) --- React.lazy +
    > Suspense

-   Изображения --- AppImage с loading=\"lazy\"

-   Zustand: всегда selector, не весь стор

-   GET-запросы: 1 retry через 1 сек при сетевой ошибке

## **11.2 Офлайн и надёжность**

-   При потере соединения --- persistent Toast «Нет соединения»

-   WS: auto-reconnect с backoff (раздел 9.1)

-   Поллинг транзакции: макс 30 сек, 5 попыток с интервалом 5 сек

## **11.3 Доступность**

-   prefers-reduced-motion: отключать Framer Motion анимации

-   Все интерактивные элементы --- aria-label

-   Модальные окна --- фокус-trap

## **11.4 Чеклист приёмки**

  -----------------------------------------------------------------------
  **Пункт**                           **OK?**
  ----------------------------------- -----------------------------------
  Все состояния: loading / success /  ☐
  error / empty                       

  Framer Motion на входе/выходе       ☐
  каждого компонента                  

  TypeScript без any                  ☐

  Toast на всех ключевых событиях     ☐

  Telegram Desktop и Mobile           ☐

  Тёмная тема                         ☐

  RU, UZ, EN                          ☐

  Нет console.log в продакшн          ☐

  Нет упоминаний монет/магазина в UI  ☐

  Все пути API соответствуют разделу  ☐
  0                                   

  friends/accept тело: { requestId }  ☐
  а не { friendshipId }               

  training тело: { cardId, known:bool ☐
  } а не { moduleId, answer }         

  quiz тело: { cardId, answerId } а   ☐
  не { answers:\[\] }                 

  telegram invoice тело: { packageId, ☐
  idempotencyKey }                    

  click/cards/verify smsCode: number  ☐
  (не string)                         
  -----------------------------------------------------------------------

# **12. Сводный бэклог --- 31 задача**

  -----------------------------------------------------------------------
  Задачи 1 (монеты-таб) и 10 (coin API) убраны. Магазин ништяков удалён.
  Оставлены только подписки и XP-рейтинг.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

**Подписки и оплата**

  -------------------------------------------------------------------------------
  **\#**            **Задача**                **Сложность**     **Зависимость**
  ----------------- ------------------------- ----------------- -----------------
  **1**             /subscription: 2 таба --- Высокая           Нет
                    тарифы BASIC/PRO                            
                    (/shop/subscriptions) +                     
                    история (/transactions)                     

  **2**             PaymentMethodModal: Stars Средняя           Нет
                    / Payme / Click (карта                      
                    или ссылка)                                 

  **3**             Stars: /telegram/invoice  Средняя           Нет
                    { packageId,                                
                    idempotencyKey } →                          
                    invoiceUrl → поллинг                        

  **4**             Payme: create_token →     Высокая           Нет
                    verify { smsCode:string }                   
                    → payment { amount,                         
                    packageId, cardUid,                         
                    idempotencyKey }                            

  **4b**            Click: create_token →     Высокая           Нет
                    verify { smsCode:number }                   
                    → payment или                               
                    payment_link { packageId,                   
                    idempotencyKey }                            

  **5**             CardInputForm: маска,     Средняя           Нет
                    Luhn, BIN, GET /cards,                      
                    раздельные Payme/Click                      

  **6**             Состояния: loading /      Низкая            Нет
                    polling / success / error                   
                    с повтором                                  
  -------------------------------------------------------------------------------

**Актуализация подписки**

  ------------------------------------------------------------------------------
  **\#**            **Задача**               **Сложность**     **Зависимость**
  ----------------- ------------------------ ----------------- -----------------
  **7**             GET /users/me при старте Средняя           Нет
                    и переходах;                               
                    subscription.code=null →                   
                    бесплатный                                 

  **8**             usageStore лимиты только Низкая            Нет
                    с сервера                                  

  **9**             expirationDate \< now →  Низкая            Нет
                    SubscribeModal; кэш ≤ 5                    
                    мин                                        
  ------------------------------------------------------------------------------

**Рейтинг XP и уровни**

  -------------------------------------------------------------------------
  **\#**            **Задача**          **Сложность**     **Зависимость**
  ----------------- ------------------- ----------------- -----------------
  **10**            refreshUserData()   Средняя           Нет
                    после каждого                         
                    действия; XP =                        
                    rating из                             
                    /users/me; 32                         
                    уровня локально                       

  **11**            Оптимистичный «+N   Низкая            Нет
                    XP»; LevelUpModal                     
                    при повышении                         
                    уровня                                
  -------------------------------------------------------------------------

**Достижения**

  ---------------------------------------------------------------------------------------------------
  **\#**            **Задача**                                    **Сложность**     **Зависимость**
  ----------------- --------------------------------------------- ----------------- -----------------
  **12**            achievementsStore локально до появления       Средняя           Ждёт бэк
                    /achievements API                                               

  **13**            Триггеры из                                   Средняя           Нет
                    training/quiz/games/streak/friends/pomodoro →                   
                    updateProgress()                                                

  **14**            Toast-очередь; сетка и Modal на /profile      Средняя           Нет
  ---------------------------------------------------------------------------------------------------

**Ежедневные задачи**

  -----------------------------------------------------------------------------------------------
  **\#**            **Задача**                                **Сложность**     **Зависимость**
  ----------------- ----------------------------------------- ----------------- -----------------
  **15**            dailyTasksStore локально до появления     Средняя           Ждёт бэк
                    /daily-tasks; сброс в полночь                               

  **16**            Виджет на /home и страница /daily-tasks с Средняя           Нет
                    таймером                                                    

  **17**            Прокидывание событий из                   Низкая            Нет
                    training/quiz/games/pomodoro/flashcards                     
  -----------------------------------------------------------------------------------------------

**Рейтинги**

  ---------------------------------------------------------------------------
  **\#**            **Задача**            **Сложность**     **Зависимость**
  ----------------- --------------------- ----------------- -----------------
  **18**            /rankings: друзья из  Средняя           Ждёт бэк
                    /friends/list;                          
                    вкладки                                 
                    Глобальный/Страна =                     
                    заглушка до                             
                    /rating/leaderboard                     

  ---------------------------------------------------------------------------

**Друзья**

  --------------------------------------------------------------------------------
  **\#**            **Задача**                 **Сложность**     **Зависимость**
  ----------------- -------------------------- ----------------- -----------------
  **19**            /friends: incoming, list,  Высокая           Частичная
                    запрос { targetUid:UUID },                   
                    поиск-заглушка до                            
                    /users/search                                

  **20**            /friends/:id:              Средняя           Нет
                    /report/{uid}, DELETE                        
                    /friends/{friendshipId},                     
                    «Вызвать на игру»                            

  **21**            Invite TG + startParam     Средняя           Нет
                    invite\_\* →                                 
                    /friends/request {                           
                    targetUid }                                  

  **22**            Badge: /friends/incoming → Низкая            Нет
                    length \> 0                                  
  --------------------------------------------------------------------------------

**Мультиплеер (PvP)**

  -----------------------------------------------------------------------------------
  **\#**            **Задача**                    **Сложность**     **Зависимость**
  ----------------- ----------------------------- ----------------- -----------------
  **23**            WS-клиент: singleton,         Очень высокая     Ждёт WS-бэк
                    backoff, heartbeat, типизация                   

  **24**            UI матчмейкинга:              Высокая           Ждёт WS-бэк
                    join/found/cancelled                            

  **25**            Word Rush PvP:                Очень высокая     Ждёт WS-бэк
                    game:start/answer/score/end                     

  **26**            «Играть с другом» для Word    Средняя           Ждёт WS-бэк
                    Rush и Octo Memory                              
  -----------------------------------------------------------------------------------

**Анимации**

  ---------------------------------------------------------------------------
  **\#**            **Задача**            **Сложность**     **Зависимость**
  ----------------- --------------------- ----------------- -----------------
  **27**            PageTransition ---    Средняя           Нет
                    все экраны в App.tsx                    

  **28**            TabBar:               Низкая            Нет
                    layoutId-индикатор,                     
                    scale иконок                            

  **29**            Карточки hover/tap;   Низкая            Нет
                    stagger в списках                       

  **30**            Игры: slide, flip,    Средняя           Нет
                    spring                                  

  **31**            ProgressBar; roll-up  Низкая            Нет
                    XP-счётчик в шапке                      

  **32**            Toast; модалки        Низкая            Нет
                    backdrop+scale                          
  ---------------------------------------------------------------------------

**Нефункциональное**

  -----------------------------------------------------------------------
  **\#**            **Задача**        **Сложность**     **Зависимость**
  ----------------- ----------------- ----------------- -----------------
  **33**            Lazy+Suspense,    Средняя           Нет
                    retry GET,                          
                    persistent toast                    
                    офлайна, a11y,                      
                    focus trap                          

  -----------------------------------------------------------------------

Wordzen TZ · v1.4 · 08.05.2026 · Монеты/магазин убраны · API сверен с
account-api.md + payment-api.md + wordzen-api.md
