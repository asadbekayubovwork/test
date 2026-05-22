**TEXNIK VAZIFALARI**

**Wordzen Web App --- React JS**

Versiyasi 1.4 · API rasmiy backend shartnomalarida tekshirilgan · 08.05.2026

  ----------------------------------- -------------------------------------
  Loyiha                              Wordzen --- Telegram Mini App uchun
                                      ingliz tilini o'rganish

  Texnologiya steki                   React 19, TypeScript, Zustand, Framer
                                      Motion, Tailwind CSS, Vite

  WordZen API                         https://api-wordzen.stnapps.com
                                      (Bearer JWT)

  Hisob API                           https://account-wordzen.stnapps.com
                                      (Bearer JWT + X-Client-Key)

  To'lov API                          https://payment-wordzen.stnapps.com
                                      (Bearer JWT + X-Client-Key)

  Tariflar                            ASOSIY va PREMIUM --- UZS orqali
                                      to'lov (Payme/Click) yoki Telegram Stars

  TZ versiyasi                        v1.4 --- tangalar/dukan bo'limi o'chirildi,
                                      barcha so'rov tanlari shartnomaga
                                      mos ravishda tuzatildi

  Sana                                08.05.2026
  ----------------------------------- -------------------------------------

# **0. Haqiqiy API-tugatish nuqtalari reference**

  -----------------------------------------------------------------------
  Bu bo'limning ustunligi bor. Barcha yo'llar va so'rov tanlari rasmiy
  backend shartnomalaridan olingan (account-api.md, payment-api.md,
  wordzen-api.md).
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## **0.1 WordZen API --- O'rganish (Bearer JWT)**

  -----------------------------------------------------------------------------------------------------------------------------------------------
  **Metod**         **Yo'li**                                          **Tana / So'rov**                           **Javob (data)**
  ----------------- ---------------------------------------------- ------------------------------------------------- ----------------------------
  POST              /api/v1/auth/telegram/login                    { initData }                                      TokenDto

  POST              /api/v1/auth/login                             { email, password }                               TokenDto

  POST              /api/v1/auth/refresh                           { token }                                         TokenDto

  GET               /api/v1/courses                                ?filter\[\]=A1&filter\[\]=SPEAKING                CoursesView

  GET               /api/v1/courses/{courseId}                     yo'l courseId                                     CourseView

  GET               /api/v1/courses/{courseId}/modules             yo'l courseId                                     ModulesView

  GET               /api/v1/courses/library                        ---                                               CoursesView

  POST              /api/v1/courses/library/{courseId}             yo'l courseId                                     NoContent

  DELETE            /api/v1/courses/library/{courseId}             yo'l courseId                                     NoContent

  GET               /api/v1/modules/{moduleId}                     yo'l moduleId                                     ModuleView

  GET               /api/v1/modules/{moduleId}/cards               yo'l moduleId                                     CardsView

  GET               /api/v1/training/modules/{moduleId}            yo'l moduleId                                     List\<TrainingResponse\>

  POST              /api/v1/training                               { cardId: long, known: boolean }                  NoContent

  DELETE            /api/v1/training/modules/{moduleId}            yo'l moduleId                                     NoContent

  GET               /api/v1/quiz/modules/{moduleId}                yo'l moduleId                                     QuizWrapperResponse

  POST              /api/v1/quiz/modules/{moduleId}                { cardId: long, answerId: long }                  QuizWrapperResponse

  GET               /api/v1/quiz/progress                          ---                                               ProgressQuizResponse

  GET               /api/v1/quiz/modules/{moduleId}/progress       yo'l moduleId                                     ProgressQuizModuleResponse

  DELETE            /api/v1/quiz/modules/{moduleId}/progress       yo'l moduleId                                     NoContent

  GET               /api/v1/favorites/cards                        ---                                               CardsView

  POST              /api/v1/favorites/cards                        { cardId: long }                                  NoContent

  DELETE            /api/v1/favorites/cards/{cardId}               yo'l cardId                                       NoContent

  GET               /api/v1/pomodoro/courses/{courseId}            yo'l courseId                                     PomodoroResponse

  POST              /api/v1/pomodoro/courses/{courseId}            { minutes: number }                               PomodoroResponse

  DELETE            /api/v1/pomodoro/courses/{courseId}            yo'l courseId                                     NoContent

  POST              /api/v1/free-access/modules/{moduleId}/start   yo'l moduleId                                     FreeModuleAccessView

  POST              /api/v1/free-access/cancel                     ---                                               FreeModuleAccessView

  GET               /api/v1/free-access/status                     ---                                               FreeModuleAccessStatusView

  POST              /api/v1/analytics/sessions                     { sessions:\[{startedAtUtc,endedAtUtc,timezone}\] NoContent
                                                                   }                                                 

  GET               /api/v1/report                                 ---                                               ReportResponse

  GET               /api/v1/report/{userUid}                       yo'l userUid                                      ReportResponse
  -----------------------------------------------------------------------------------------------------------------------------------------------

## **0.2 Hisob API --- Foydalanuvchilar va Dostlar (Bearer JWT)**

  --------------------------------------------------------------------------------------------
  **Metod**         **Yo'li**                        **Tana / So'rov**  **Javob (data)**
  ----------------- --------------------------------- ------------------- ----------------------------
  GET               /api/v1/users/me                ---               UserResponse

  PATCH             /api/v1/users/me/username       { username:       UserResponse
                                                    string }          

  GET               /api/v1/rating                  ---               UserResponse

  GET               /api/v1/friends                 ---               List\<FriendshipResponse\>

  GET               /api/v1/friends/list            ---               List\<FriendshipResponse\>
                                                                      (faqat qabul qilinganlar)

  GET               /api/v1/friends/incoming        ---               List\<FriendshipResponse\>

  GET               /api/v1/friends/outgoing        ---               List\<FriendshipResponse\>

  POST              /api/v1/friends/request         { targetUid: UUID FriendshipResponse
                                                    }                 

  POST              /api/v1/friends/accept          { requestId: long FriendshipResponse
                                                    }                 

  POST              /api/v1/friends/decline         { requestId: long FriendshipResponse
                                                    }                 

  DELETE            /api/v1/friends/{id}            yo'l id: long     Void
                                                    (bu friendshipId!)    
  --------------------------------------------------------------------------------------------

## **0.3 Hisob API --- faqat X-Client-Key (frontend CHAQIRMAYDI)**

  -----------------------------------------------------------------------
  Bu tugatish nuqtalari faqat server→server orqali mavjud. Frontend
  ularni bevosita chaqirmasligi kerak. XP avtomatik ravishda backend'da
  hisoblanadi.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

  --------------------------------------------------------------------------------------
  **Metod**         **Yo'li**                            **Tana**          **Tavsifi**
  ----------------- ------------------------------------ ------------------- -----------------
  GET               /api/v1/users/{uid}                  yo'l uid: UUID    Boshqa foydalanuvchi
                                                                           profili

  POST              /api/v1/rating/update                { userUid, delta: Reyting o'zgartirish
                                                         long }            (XP)

  POST              /api/v1/subscriptions/purchase       { userUid,        Obunani faollashtirish
                                                         packageId }       (To'lov API'ni chaqiradi)
  --------------------------------------------------------------------------------------

## **0.4 To'lov API (Bearer JWT)**

  ----------------------------------------------------------------------------------------------------
  **Metod**         **Yo'li**                              **So'rov tani**    **Javob (data)**
  ----------------- ---------------------------------- ------------------- -----------------------------
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

## **0.5 Kalit javob modellari (TypeScript turlari uchun)**

**UserResponse (Hisob API):**

> {\
> uid: string // UUID\
> username: string\
> rating: number // XP --- darajalar tizimining asosi\
> createdAt: string\
> subscription: {\
> updatedAt: string\
> code: \"ASOSIY\" \| \"PREMIUM\" // bepul kodi yo'q, yo'qligi = bepul\
> tarifar\
> expirationDate: string \| null\
> } \| null\
> }

**FriendshipResponse (Hisob API):**

> {\
> id: number // friendshipId --- accept/decline/delete'da ishlatiladi\
> requesterUid: string // UUID\
> addresseeUid: string // UUID\
> status: \"KUTILAYOTGAN\" \| \"QABUL QILINGAN\" \| \"RAD QILINGAN\"\
> createdAt: string\
> updatedAt: string\
> }

**CardResponse (To'lov API):**

> {\
> uid: string\
> number: string // \"8600\*\*\*\*\*\*\*\*1234\" --- niqoblanmish\
> expireDate: string // \"12/30\"\
> provider: \"PAYME\" \| \"CLICK\"\
> status: \"TEKSHIRILGAN\" \| \...\
> }

## **0.6 Backend'da bo'lmagan tugatish nuqtalari (backend bilan kelishilishi kerak)**

  -----------------------------------------------------------------------
  Quyidagi vazifalar backend'da realizatsiyani talab qiladi. Frontend
  API paydo bo'lgunicha UI stub'larni yaratadi.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

  ----------------------------------------------------------------------------------------
  **Vazifa**        **Kerakli tugatish nuqtasi**        **Ustuvorlik**     **Holati**
  ----------------- ---------------------------------- ------------------- -----------------
  Global reyting    GET /api/v1/rating/leaderboard     🔴 Yuqori           ❌ Realizatsiyalangan emas
  (top ro'yxati)                                                            

  Foydalanuvchini   GET /api/v1/users/search?q=        🔴 Yuqori           ❌ Realizatsiyalangan emas
  qidirish                                                                   

  Yutuq ---         GET /api/v1/achievements           🟡 O'rtacha          ❌ Realizatsiyalangan emas
  ro'yxat va taraqqiyot                                                      

  Yutuq ---         POST                               🟡 O'rtacha          ❌ Realizatsiyalangan emas
  mukofotni olish   /api/v1/achievements/:id/claim                          

  Kunlik topshiriqlar GET /api/v1/daily-tasks          🟡 O'rtacha          ❌ Realizatsiyalangan emas

  Kunlik topshiriqlar POST                             🟡 O'rtacha          ❌ Realizatsiyalangan emas
  --- tugatish      /api/v1/daily-tasks/:id/complete                       

  WebSocket ---     wss://api-wordzen.stnapps.com/ws   🟢 Pastki           ❌ Realizatsiyalangan emas
  ko'p o'yinchi                                                             
  ----------------------------------------------------------------------------------------

# **1. Umumiy rivojlantirish tamoyillari**

-   Barcha yangi ekranlar Framer Motion ishlatadilar: AnimatePresence +
    > motion.div.

-   Animatsiyalar interaktivlikni blokirovka qilmaydi (layout prop
    > o'lchamlar o'zgartirilsa).

-   Barcha yuklanish holatlari --- Skeleton-komponentlar, spinnerlar emas.

-   Barcha xato holatlari --- EmptyState va "Qayta urinib ko'ring" tugmasi.

-   TypeScript --- qat'iy rejim, hech qanday any.

-   Yangi Zustand-store'lar: persist middleware + partialize.

-   Animatsiyalar prefers-reduced-motion ga hurmat qiladilar.

-   Barcha interaktiv elementlar aria-label'ga ega; modal oynalar ---
    > fokus-trap.

-   Ma'lumotlar server'dan olinadi; localStorage --- faqat qisqa muddatli
    > cache, istina manba emas.

-   Tanglarga (coins), dukan nishtyaklariga, coin-paketlariga oid hech
    > bir talvino yo'q --- faqat obunalar.

# **2. Obunalar va to'lov \[vazifalar 1--6\]**

  -----------------------------------------------------------------------
  Tariflar: ASOSIY va PREMIUM. To'lov usullari: Payme UZ (karta), Click UZ
  (karta yoki havola), Telegram Stars. Hech qanday tangalar paketi yo'q.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## **2.1 /subscription sahifasi --- ikkita tab \[vazifa 1\]**

**Tab 1 --- Obuna**

-   GET /api/v1/shop/subscriptions → subscriptions\[\] massivi

-   Har bir paket maydonlari: name, month, packageId, priceStars, priceUzs,
    > code (\"ASOSIY\"|\"PREMIUM\")

-   ASOSIY va PREMIUM kartochkalar; joriy tarif belgilangan (
    > /api/v1/users/me → subscription.code'dan)

-   Tugatilish sanasi: subscription.expirationDate dan UserResponse'dan

-   \"Oformlash\" yoki \"Qayta yangilash\" tugmasi → PaymentMethodModal

-   \"Bekor qilish\" tugmasi agar obuna faol bo'lsa (backend bilan kelishilishi kerak)

**Tab 2 --- Tranzaksiya tarixi**

-   GET /api/v1/transactions → transactions\[\] massivi

-   Har bir qator: sana (createdAt), provaydir (provider), holati
    > (status)

-   Holatlar: YARATILGAN / KUTILAYOTGAN / MUVAFFAQIYAT / MUVAFFAQIYATSIZ / QAYTARILGAN / BEKOR QILINGAN

-   Skeleton yuklanish vaqtida; EmptyState bo'sh bo'lsa

## **2.2 To'lov usuli tanlash komponenti --- PaymentMethodModal \[vazifa 2\]**

> ┌─────────────────────────────┐\
> │ To'lov usulini tanlang      │\
> │                             │\
> │ ⭐ Telegram Stars           │\
> │ 💳 Payme UZ (karta)         │\
> │ 💳 Click UZ (karta/havola)  │\
> │                             │\
> │ \[Davom et →\]              │\
> └─────────────────────────────┘

Usul tanlagandan va "Davom et" tugmasini bosgandan keyin:

-   Stars → oqim 2.3

-   Payme karta → oqim 2.4

-   Click karta → oqim 2.5A

-   Click havola → oqim 2.5B

## **2.3 Telegram Stars oqimi \[vazifa 3\]**

**So'rov tani va javob (payment-api.md'dan):**

> // So'rov\
> POST /api/v1/telegram/invoice\
> { \"packageId\": \"pro_1m\", \"idempotencyKey\": \"uuid-v4-client\" }\
> \
> // Javob\
> { \"invoiceUrl\": \"https://t.me/\...\", \"transactionUid\": \"uuid\"\
> }

1.  POST /api/v1/telegram/invoice chaqirish → invoiceUrl +
    transactionUid olish

2.  window.Telegram.WebApp.openInvoice(invoiceUrl, callback) orqali ochish

3.  callback: muvaffaqiyatli to'lovdan so'ng Telegram o'zi
    /telegram/confirm chaqiradi (X-Client-Key, backend)

4.  Frontend: status === \"MUVAFFAQIYAT\" bo'lgunicha GET
    /api/v1/transactions/{transactionUid} polling'i (maksimal 30 s)

5.  MUVAFFAQIYAT'da → refreshUserData() → muvaffaqiyatni ko'rsatish

## **2.4 Payme oqimi (karta) \[vazifa 4\]**

**1-qadam --- karta tokenizatsiyasi:**

> POST /api/v1/payme/cards/create_token\
> { \"cardNumber\": \"8600123412341234\", \"expireDate\": \"12/30\" }\
> // → CardResponse { uid, number (niqoblanmish), status }

**2-qadam --- OTP (agar holati TEKSHIRILGAN bo'lmasa):**

> POST /api/v1/payme/cards/verify\
> { \"cardUid\": \"uuid\", \"smsCode\": \"123456\" } // smsCode: string!

**3-qadam --- to'lov:**

> POST /api/v1/payme/payment\
> {\
> \"amount\": 25000,\
> \"packageId\": \"pro_1m\",\
> \"cardUid\": \"uuid\",\
> \"idempotencyKey\": \"uuid-v4-client\"\
> }

6.  Agar karta allaqachon saqlangan bo'lsa --- 1-2-qadamlarni o'tkazib, to'g'ridan-to'g'ri 3-qadamga o'tish

7.  To'lovdan keyin → GET /api/v1/transactions/{uid} polling'i → MUVAFFAQIYAT →
    refreshUserData()

**Kartani o'chirish:**

> DELETE /api/v1/payme/cards\
> { \"cardUid\": \"uuid\" }

## **2.5 Click oqimi \[vazifa 4\]**

**Variant A --- karta (Payme'ga o'xshash):**

> POST /api/v1/click/cards/create_token\
> { \"cardNumber\": \"\...\", \"expireDate\": \"12/30\" }\
> \
> POST /api/v1/click/cards/verify\
> { \"cardUid\": \"uuid\", \"smsCode\": 123456 } // smsCode: number (string emas)!\
> \
> POST /api/v1/click/payment\
> { \"amount\": 25000, \"packageId\": \"pro_1m\", \"cardUid\": \"uuid\",\
> \"idempotencyKey\": \"uuid\" }

**Variant B --- to'lov havolasi (kartasiz):**

> POST /api/v1/click/payment_link\
> { \"amount\": 25000, \"packageId\": \"pro_1m\", \"idempotencyKey\":\
> \"uuid\" }\
> // → { \"paymentLink\": \"https://\...\", \"transactionUid\": \"uuid\"\
> }

8.  window.Telegram.WebApp.openLink() orqali brauzerda paymentLink'ni ochish

9.  GET /api/v1/transactions/{transactionUid} polling'i → MUVAFFAQIYAT →
    refreshUserData()

**Click kartasini o'chirish:**

> DELETE /api/v1/click/cards\
> { \"cardUid\": \"uuid\" }

## **2.6 CardInputForm \[vazifa 5\]**

-   Karta raqami niqobi: 0000 0000 0000 0000

-   Muddati: MM/YY

-   Luhn algoritmi orqali tekshirish

-   Visa/Mastercard'ni BIN (birinchi raqamlar)'dan aniqlash

-   Saqlangan kartallar ro'yxati: GET /api/v1/cards → niqoblanmish raqamni
    > (number maydon) ko'rsatish

-   Provaydir bo'yicha alohida kartalar: \"PAYME\" yoki \"CLICK\"

-   Muhim: Click uchun smsCode number sifatida yuboriladi, Payme uchun ---
    > string sifatida

## **2.7 Birlashtirilgan to'lov holatlar \[vazifa 6\]**

  -----------------------------------------------------------------------
  **Holati**                          **UI**
  ----------------------------------- -----------------------------------
  bo'sh                               Forma / \"Obunani oformlash\" tugmasi

  yuklanmoqda                         Tugma'da spinner, forma
                                      blokirovkalangan

  polling'i                           To'lov tasdiqlashini kutish animatsiyasi
                                      (30 s gacha)

  muvaffaqiyat                        Animatsiyalangan checkmark +
                                      \"Obuna faolashtirildi [sana]gacha\"

  xato                                error.message dan xato matni +
                                      \"Qayta urinib ko'ring\" tugmasi
  -----------------------------------------------------------------------

# **3. Obunani yangilash va chegaralar \[vazifalar 7--9\]**

## **3.1 Boshlash va o'tish vaqtida yangilash \[vazifa 7\]**

  -----------------------------------------------------------------------
  UserResponse'da \"type: free\" maydoni yo'q. subscription yo'qligi yoki
  subscription === null = bepul tarifar.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

-   Boshlashda: GET /api/v1/users/me → subscriptionStore'ni yangilash

-   subscriptionStore: { code: \"ASOSIY\"\|\"PREMIUM\"\|null,
    > expirationDate: string\|null } saqlash

-   Cache 5 minutdan ko'p bo'lmasa yangilangan deb hisoblanadi

-   Protected routega o'tishda: middleware obuna statusini qayta tekshiradi

**UserResponse tuzilishi (obuna uchun muhim maydonlar):**

> {\
> uid: string,\
> username: string,\
> rating: number, // XP darajalar tizimi uchun\
> subscription: {\
> code: \"ASOSIY\" \| \"PREMIUM\",\
> expirationDate: string \| null\
> } \| null // null = bepul tarifar\
> }

## **3.2 Chegaralarni sinxronizatsiya qilish \[vazifa 8\]**

-   usageStore chegaralari foydalanuvchi ma'lumotlari yangilangan har safar server'dan olinadi

-   localStorage va server'dan farq bo'lsa --- server'ga ishonish kerak

## **3.3 Muddati tugagan obuna \[vazifa 9\]**

-   Agar expirationDate \< hozir → SubscribeModal ko'rsatish obunani qayta
    yangilash tugmasi bilan

-   PaywallBanner'dan oldin --- har doim refreshUserData() chaqirish

-   Obuna cache'i 5 minutdan ko'p bo'lmasa

# **4. XP reyting va darajalar tizimi \[vazifalar 10--11\]**

  -----------------------------------------------------------------------
  Tangalar (coins) interfacedan o'chirildi. Faqat XP ko'rsatamiz (UserResponse
  dan rating maydoni). XP avtomatik ravishda backend'da hisoblanadi ---
  frontend faqat o'qiydi.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## **4.1 XP hisobi qanday ishlaydi \[vazifa 10\]**

Sxemasi:

> Frontend → POST /api/v1/training { cardId, known } (yoki quiz, pomodoro va
> t.x.)\
> ↓\
> WordZen API harakatni qayta ishlaydi → Hisob API (X-Client-Key)\
> POST /api/v1/rating/update { userUid, delta }\
> ↓\
> Frontend → GET /api/v1/users/me (yoki GET /api/v1/rating)\
> yangilangan rating o'qiydi

Frontend tugallangan harakatdan keyin nima qiladi:

10. WordZen API'dan muvaffaqiyatli javobni kutish

11. refreshUserData() chaqirish → GET /api/v1/users/me

12. Yangi rating'ni oldingi bilan solishtirib → getLevelByXp() orqali yangi darajani hisoblash

13. Agar daraja ko'tarilgan bo'lsa → LevelUpModal ko'rsatish

Kutilgan XP hisobi jadvali (optimistik UI uchun):

  --------------------------------------------------------------------------------
  **Foydalanuvchi harakati**     **XP**                **Frontend trigger**
  ----------------------- ----------------------- --------------------------------
  Modul tugallandi           +5                      trainingStore --- muvaffaqiyatli POST
  (kartochkalar)                                     /training

  Kurs to'liq tugallandi     +30                     coursesStore --- 100% taraqqiyot

  Test 50--74%               +4                      quizStore --- POST
                                                  /quiz/modules/{id}

  Test 75--89%               +7                      quizStore --- POST
                                                  /quiz/modules/{id}

  Test 90--100%              +12                     quizStore --- POST
                                                  /quiz/modules/{id}

  O'yin tugallandi           +3                      gamesStore gameOver'da

  O'yin shaxsiy rekord bilan +6                      gamesStore gameOver'da

  Kunlik topshiriq           +8                      dailyTasksStore.completeTask()

  Streak 7 kun               +15                     userStore.checkStreak()

  Streak 30 kun              +50                     userStore.checkStreak()

  Pomodoro tugallandi        +4                      pomodoroStore tugallash'da

  Kunning birinchi kirish     +2                      userStore ishga tushirilganda
  --------------------------------------------------------------------------------

*\* Aniq delta backend-jamoa bilan kelishilishi kerak, qiymatlar orientirlangan.*

## **4.2 XP ko'rsatish \[vazifa 11\]**

-   XP har bir refreshUserData()'dan keyin UserResponse.rating'dan olinadi

-   Optimistik \"+N XP\": harakatdan so'ng to'rt-up animatsiyasi

-   Yakuniy qiymat --- refreshUserData()'dan, farq bo'lsa --- farqni ko'rsatish

-   Sarlavha va profilida: faqat XP va daraja nomini ko'rsatish, hech qanday tangalar yo'q

## **4.3 Darajalar tizimi (32 daraja --- faqat frontend)**

  -----------------------------------------------------------------------
  Darajalar UserResponse.rating'dan mahalliy ravishda hisoblanadi.
  Alohida backend tugatish nuqtasi yo'q.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

src/lib/data/levels.ts yaratish:

> export interface Level {\
> level: number\
> name: string\
> minXp: number // UserResponse.rating \>= minXp bu daraja uchun\
> maxXp: number // 32-chi'da Infinity\
> }\
> export function getLevelByXp(xp: number): Level { \... }\
> // userStore'da: rating'dan hisoblangan, alohida saqlash yo'q

  -----------------------------------------------------------------------------------
  **Daraja**  **Nomi**                **XP**      **Daraja**  **Nomi**       **XP**
  ----------- -------------------- ----------- ----------- -------------- -----------
  1           Yangi boshlagan      0           17          Malakali        5 480

  2           Qiziqargan           50          18          Amaliyotchi     6 230

  3           E'tiborlash          120         19          Bilimdonli      7 030

  4           Mehnatli             220         20          Aniq            7 880

  5           Sabur                350         21          Kuchli          8 780

  6           O'ylagan             520         22          Chuqur          9 780

  7           Maqsadga yoʻnalgan   730         23          Erkin           10 880

  8           Ishonchli            980         24          Tez             12 080

  9           Takomil             1 280       25          Duzuk           13 380

  10          Tayyor              1 630       26          Oʻtkan          14 780

  11          Intizomchi          2 030       27          Keng            16 380

  12          Metodli             2 480       28          Voyaga          18 080

  13          Gramotali           2 980       29          Tizimli         19 980

  14          Tajribali           3 530       30          Moslashuvchan    22 080

  15          Rivojlangan         4 130       31          Soʻz ustasi     24 480

  16          Tuzatilgan          4 780       32          WordZen Master  27 180
  -----------------------------------------------------------------------------------

Daraja ko'tarilganda LevelUpModal:

> ┌──────────────────────────────────┐\
> │ 🎉 Yangi daraja!                 │\
> │ ⬆ Daraja 8 --- \"Ishonchli\"     │\
> │ \[░░░░░░░░░░░░░░░░░\] 0%         │\
> │ 0 / 300 XP 9-darajagacha         │\
> │ \[Davom et\]                     │\
> └──────────────────────────────────┘

-   Animatsiya: konfetti + sarlavha scale-bounce

-   Yopilgandan keyin --- Header'da avatar'da 5 s uchun daraja badge

# **5. Yutuqlar (Achievements) \[vazifalar 12--14\]**

  -----------------------------------------------------------------------
  API yutuqlari realizatsiyalangan emas. Tugatish nuqtalari paydo bo'lgunicha
  --- achievementsStore'da mahalliy saqlash (localStorage persist).
  Tuzilmani kelajakdagi API bilan mos ravishda qilish.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## **5.1 achievementsStore (vaqtinji mahalliy) \[vazifa 12\]**

> interface AchievementsStore {\
> achievements: Achievement\[\]\
> lastSyncedAt: number \| null\
> // vaqtinji mahalliy, API paydo bo'lgandan keyin --- fetch'ga almashtirish\
> updateProgress: (type: AchievementType, delta: number) =\> void\
> claimAchievement: (id: string) =\> Promise\<void\>\
> }\
> \
> // Kelajakdagi API (backend bilan kelishilishi kerak):\
> // GET /api/v1/achievements\
> // POST /api/v1/achievements/:id/claim

## **5.2 Taraqqiyot triggerlar \[vazifa 13\]**

  -------------------------------------------------------------------------
  **Hodisa**             **Turi**                 **Qayerda chaqirish**
  ----------------------- ----------------------- -------------------------
  POST /training muvaffaq vocabulary, courses     trainingStore

  POST /quiz/modules/{id} tests                   quizStore
  muvaffaq                                        

  O'yin tugallandi      games                    gamesStore gameOver'da

  Streak erishildi      streaks                 userStore.checkStreak()

  Do'stlik so'rovi       friends                 friendsStore.accept()
  qabul qilindi                                  

  Pomodoro tugallandi   pomodoro                pomodoroStore

  Daraja ko'tarildi     levels                  LevelUpModal'dan keyin
  -------------------------------------------------------------------------

## **5.3 Toast va /profile'da yutuq to'ri \[vazifa 14\]**

-   AchievementToast: icon + nomi + \"+N XP\" (tangalar emas!) +
    > slide-up

-   Navbat: bir vaqtning o'zida faqat bittasi ko'rsatiladi, 4 s'dan keyin o'chiriladi

-   /profile'dagi to'r: 3 ustun, 43 yutuq; qulfli / rangli / oltin kenga (noyob)

-   Modal: icon, nomi, tavsifi, taraqqiyot-bar, \"Olish\" tugmasi
    > (agar tugallangan bo'lsa)

Barcha yutuqlar ro'yxati (43 ta --- 9 guruh):

  --------------------------------------------------------------------------
  **\#**            **Guruh**        **Nomi**            **Shart**
  ----------------- -------------------- --------------- -------------------
  1                 Boshlash         Birinchi qadam     Birinchi modul tugat

  2                 Boshlash         Birinchi kurs      Har qanday kurs ochish

  3                 Boshlash         Birinchi test      Har qanday testni tugallash

  4                 Boshlash         Birinchi o'yin    Har qanday o'yni tugallash

  5                 Boshlash         Birinchi Pomodoro  Birinchi Pomodoro sessiyasini tugallash

  6                 Taraqqiyot       O'n modullar       10 modul jami

  7                 Taraqqiyot       50 modul           50 modul jami

  8                 Taraqqiyot       100 modul          100 modul jami

  9                 Taraqqiyot       Birinchi tugallandi Har qanday kurs to'liq tugallash
                                     kurs               

  10                Taraqqiyot       Besh kurs          5 kurs to'liq

  11                Testlar          Yuqori baholangan  Test 100%

  12                Testlar          Barqaror natija    5 test ketma-ket > 80%

  13                Testlar          Snayper            5 test ketma-ket > 90%

  14                Testlar          Yigirma test       20 test jami

  15                Testlar          100 test           100 test jami

  16                O'yinlar         O'yin boshlanishi  5 o'yin jami

  17                O'yinlar         Doimiy o'yinchi    25 o'yin jami

  18                O'yinlar         Rekord to'tuvchi   Rekord 3 marta ketma-ket

  19                O'yinlar         Barcha rejimlar    Har bir o'yin turiga o'ynash

  20                Streak           Birinchi vazifa    Birinchi kunlik vazifa

  21                Streak           Hafta ketma-ket    Streak 7 kun

  22                Streak           Oy ketma-ket       Streak 30 kun

  23                Streak           Ikkioy ketma-ket   Streak 60 kun

  24                Pomodoro         Pomodoro amaliyotchi 10 sessiya

  25                Pomodoro         Pomodoro fanat     50 sessiya

  26                Pomodoro         Pomodoro maraton   3 sessiya bir kunning ichida

  27                Reyting          Reyting'da         Top-100

  28                Reyting          Top-50             Top-50

  29                Reyting          Top-10             Top-10

  30                Reyting          Birinchi o'rin     1-o'rin hech bo'lmaganda bir kun

  31                Darajalar        Beshinchi daraja   Daraja 5

  32                Darajalar        O'n beshinchi       Daraja 15
                                     daraja             

  33                Darajalar        WordZen Master     Daraja 32

  34                ⭐ Noyob          Kun uchun mingta   1 000 XP bir kunning ichida

  35                ⭐ Noyob          3 modul × 10 kun   3+ modul har kun --- 10 marta

  36                ⭐ Noyob          Mukammal hafta    7 kun: modul+test+vazifa har kun

  37                ⭐ Noyob          Cho'qqini bosish   Bir test 5 marta yaxshilanish bilan

  38                ⭐ Noyob          Sprinter           10 000 XP 30 kunning ichida

  39                ⭐ Noyob          Xatosiz            10 test ketma-ket 100%

  40                ⭐ Noyob          200 Pomodoro      200 Pomodoro sessiyasi

  41                ⭐ Noyob          To'liq koleksiya   Boshqa 32 ta yutuqni olish

  42                ⭐ Noyob          WordZen Legend     50 000 XP jami

  43                ⭐ Noyob          Uzluksiz oqim     100 kun ketma-ket
  --------------------------------------------------------------------------

# **6. Kunlik topshiriqlar (Daily Tasks) \[vazifalar 15--17\]**

  -----------------------------------------------------------------------
  Daily-tasks API realizatsiyalangan emas. Paydo bo'lgunicha --- vazifalarni
  mahalliy ravishda yaratish, yarim tun vaqt kamani shunga shunga qaytarish.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## **6.1 dailyTasksStore (vaqtinji mahalliy) \[vazifa 15\]**

> interface DailyTask {\
> id: string\
> type: \"training\"\|\"quiz\"\|\"game\"\|\"pomodoro\"\|\"flashcards\"\
> title: string // \"10 ta kartochkani tugallash\"\
> reward: { xp: number } // faqat XP, tangalar yo'q\
> progress: { current: number; target: number }\
> isCompleted: boolean\
> expiresAt: string // keyingi yarim tun\
> }\
> \
> interface DailyTasksStore {\
> tasks: DailyTask\[\]\
> generatedAt: string \| null // yaratilish sanasi --- shunga shunga shunga uchun\
> fetchTasks: () =\> void // mahalliy yoki API'dan\
> completeTask: (id: string) =\> void\
> onActionCompleted: (type: DailyTask\[\"type\"\]) =\> void\
> }

## **6.2 /home'dagi widget va /daily-tasks sahifasi \[vazifa 16\]**

> ┌─────────────────────────────────┐\
> │ 📋 Bugungi vazifalar 2/5        │\
> │ ▓▓▓▓░░░░░░░░ 40%                │\
> │ ✅ 10 ta kartochkani tugat +8 XP │\
> │ ⬜ Testni o'tish +8 XP            │\
> │ \[Barchasini ko'rish →\]          │\
> └─────────────────────────────────┘

-   /daily-tasks sahifasi: turi, taraqqiyot-bar, XP-mukofot, yarim tun taymeri

-   \"O'tish\" tugmasi → mos bo'lim (kurslar / quiz / games /
    > pomodoro)

-   Tugallangan topshiriqlar --- oxirida chiziq bilan

## **6.3 Hodisalarni yuborish \[vazifa 17\]**

  -----------------------------------------------------------------------
  **Store / hodisa**                  **Vazifa turi**
  ----------------------------------- -----------------------------------
  POST /training muvaffaq             \"training\"

  POST /quiz/modules muvaffaq         \"quiz\"

  gamesStore gameOver'da              \"game\"

  pomodoroStore tugallash'da          \"pomodoro\"

  flashcardsStore tugallash'da        \"flashcards\"
  -----------------------------------------------------------------------

# **7. Reyting (Rankings) \[vazifa 18\]**

  -----------------------------------------------------------------------
  GET /api/v1/rating bir foydalanuvchi reyting'ini qaytaradi. Global
  top endpointi realizatsiyalangan emas. /rating/leaderboard paydo bo'lgunicha
  --- dostlar orasidagi reyting ko'rsatish.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## **7.1 /rankings sahifasi**

-   3 tab: Global / Mamlakatboʻyicha / Dostlar

-   Davr o'tkazgich: Hamma vaqt / Hafta / Bugun
    > (?period=all\|week\|day)

> ┌─────────────────────────────────────────┐\
> │ 🥇 #1 \[Avatar\] Ivan K. 12 450 XP ↑3│\
> │ 🥈 #2 \[Avatar\] Anna M. 11 200 XP ─ │\
> │ 🥉 #3 \[Avatar\] You 10 800 XP ↓1│ ← biriktirish\
> └─────────────────────────────────────────┘

-   Top-3: oltin/kumush/bronza o'rama

-   Joriy foydalanuvchi --- pastda biriktirish o'z holati bilan

-   Nomi yonida --- daraja nomi (getLevelByXp(rating)'dan)

-   Cheksiz scroll --- bir vaqtning o'zida 50 yozuv

## **7.2 API liderbordi paydo bo'lgunicha**

-   \"Global\" va \"Mamlakatboʻyicha\" tablar --- \"Tez kuni\" stub

-   \"Dostlar\" tabi --- GET /api/v1/friends/list + har biri uchun GET
    > /api/v1/report/{uid} (XP uchun)

-   rating pasaytirish bo'yicha saralash

# **8. Dostlar (Friends) \[vazifalar 19--22\]**

  -----------------------------------------------------------------------
  Dostlar API REALIZATSIYALANGAN. friendsStore.ts'ni haqiqiy tugatish
  nuqtalariga ulang.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## **8.1 /friends sahifasi \[vazifa 19\]**

**\"Kelgan so'rovlar\" bo'limi:**

-   GET /api/v1/friends/incoming → List\<FriendshipResponse\>

-   Har bir so'rov: requesterUid'ni ko'rsatish --- /report/{uid} orqali profil yuklash kerak

-   Qabul qilish: POST /api/v1/friends/accept { requestId: friendship.id }

-   Rad qilish: POST /api/v1/friends/decline { requestId: friendship.id }

  -----------------------------------------------------------------------
  accept/decline tani: { requestId: long } --- friendshipId emas, maydon
  requestId deb ataladi!
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

**\"Mening dostlarim\" bo'limi:**

-   GET /api/v1/friends/list → faqat QABUL QILINGANLAR

-   Har bir do'st uchun: /report/{uid} orqali profil yuklash

**\"Topish\" bo'limi:**

  -----------------------------------------------------------------------
  GET /api/v1/users/search?q= --- Realizatsiyalangan emas. \"Foydalanuvchi
  qidirish tez kuni paydo bo'ladi\" stub ko'rsatish.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

-   So'rov jo'natish: POST /api/v1/friends/request { targetUid: UUID }

## **8.2 /friends/:id sahifasi \[vazifa 20\]**

-   Ma'lumotlar: GET /api/v1/report/{uid} --- statistika (sessions, cards,
    > training, courses)

-   Daraja: getLevelByXp(rating) hisoblash agar rating mavjud bo'lsa

-   \"O'yni talab qilish\" tugmasi → MatchmakingModal (bo'lim 9)

-   Dostlardan o'chirish: DELETE /api/v1/friends/{id} bu yerda id ---
    > FriendshipResponse.id!

  -----------------------------------------------------------------------
  DELETE /api/v1/friends/{id}: id --- bu do'stlik id'si (raqam), foydalanuvchi uid'i emas!
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## **8.3 Telegram'ga taklif va deeplink \[vazifa 21\]**

> window.Telegram.WebApp.openTelegramLink(\
> \`https://t.me/share/url?url=https://t.me/BOT\
> ?start=invite\_\${userUid}&text=Wordzen'da men bilan o'yna!\`\
> )

14. Boshlashda: Telegram startParam'ini parse qilish

15. Agar \"invite\_\" bilan boshlansa → POST /api/v1/friends/request {
    targetUid: uid }

16. Toast: \"Do'stlik so'rovi jo'natildi\"

## **8.4 TabBar'dagi Badge \[vazifa 22\]**

-   GET /api/v1/friends/incoming → agar list.length \> 0 → Dostlar tabi'da qizil nuqta

-   App boshlanganda va so'rovlarni qabul/rad qilganda yangilash

# **9. Ko'p o'yinchi (PvP) \[vazifalar 23--26\]**

  -----------------------------------------------------------------------
  WS-server realizatsiyalangan emas. Frontend infastrukturasinipa oldindan
  tayyorlanadi --- backend paydo bo'lgandan keyin ulang.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## **9.1 WebSocket-kliyent \[vazifa 23\]**

> websocket/\
> ├── client.ts \# singleton WSClient\
> ├── events.ts \# tipizatsiyalangan hodisalar\
> └── hooks/\
> ├── useGameRoom.ts\
> └── useMatchmaking.ts

-   URL (kelajakdagi): wss://api-wordzen.stnapps.com/ws?token=JWT

-   Auto-qayta ulanish: eksponent backoff 1s → 2s → 4s → ... → maksimal 30s

-   Heartbeat ping har 25 sekundda

-   Tipizatsiyalangan send(event, payload) va on(event, handler)

## **9.2 Matcheming UI \[vazifa 24\]**

  -----------------------------------------------------------------------
  **WS hodisa**          **Yo'nalishi**         **Yuklama**
  ----------------------- ----------------------- -----------------------
  matchmaking:join        → server                { gameType:
                                                  \"word_rush\" \|
                                                  \"octo_memory\" }

  matchmaking:found       ← server                { roomId, opponent:
                                                  UserPreview, startsIn:
                                                  3 }

  matchmaking:cancelled   ← server                { reason: string }
  -----------------------------------------------------------------------

## **9.3 Word Rush PvP \[vazifa 25\]**

  -------------------------------------------------------------------------
  **WS hodisa**          **Yo'nalishi**         **Yuklama**
  ----------------------- ----------------------- -------------------------
  game:start              ← server                { roomId, words,
                                                  duration: 60 }

  game:answer             → server                { roomId, wordId, answer,
                                                  timestamp }

  game:score              ← server                { userId, score, combo }

  game:end                ← server                { winner, scores:
                                                  Record\<string,number\> }
  -------------------------------------------------------------------------

-   Yon panel: raqib avatari + nomi + live-hisob

-   Agar raqib uzilgan bo'lsa → OpponentDisconnectedModal + g'alaba

## **9.4 Ko'p o'yinchi tugmalari \[vazifa 26\]**

-   /games'da: \"🆚 Dostim bilan o'yna\" Word Rush va Octo Memory uchun

  -----------------------------------------------------------------------
  Daily Challenge ko'p o'yinchiga kirmaydi --- kunlik limit bir urinish.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

# **10. Animatsiyalar (global) \[vazifalar 27--32\]**

  -----------------------------------------------------------------------
  Framer Motion 12 allaqachon o'rnatilgan. Boshqa bloklarga parallel qilish
  mumkin.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## **10.1 PageTransition --- barcha ekranlar \[vazifa 27\]**

> const variants = {\
> initial: { opacity: 0, y: 16 },\
> animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease:\
> \'easeOut\' } },\
> exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },\
> }

-   Barcha ekranlarni App.tsx'da \<PageTransition\> ichida o'rash

## **10.2 TabBar \[vazifa 28\]**

-   layoutId=\"tab-indicator\" --- faol tab indikatori (shared
    > layout animation)

-   Ikonkalar: faol bo'lganda motion.div orqali scale(1.15)

## **10.3 Kartochkalar va ro'yxatlar \[vazifa 29\]**

-   Card (bosiladigan): whileHover={{ scale: 1.02 }}, whileTap={{ scale:
    > 0.97 }}

-   Kurs / yutuq / reyting ro'yxatlari: stagger staggerChildren: 0.05 bilan

## **10.4 O'yinlar \[vazifa 30\]**

-   Word Rush: slide-up/fade so'z o'zgartirilsa AnimatePresence orqali

-   Octo Memory: flip-animatsiya kartochka rotateY orqali

-   Daily Challenge: slide left (to'g'ri) / slide right (noto'g'ri)

-   Natijalar: spring-animatsiya score/badge paydo bo'lishi

## **10.5 ProgressBar va hisoblagichlar \[vazifa 31\]**

-   ProgressBar: motion + transition { duration: 0.6, ease: \"easeOut\"
    > }

-   XP sarlavhada: useMotionValue orqali roll-up effekti raqam o'zgartirilsa

## **10.6 Toast va modal oynalar \[vazifa 32\]**

-   Toast: AnimatePresence + pastdan slide, auto-o'chirish 3s, tashqi kutubxonalar yo'q

-   Toast turlari: yutuq (yashil), XP (ko'k), xato (qizil), ulanish yo'q (kulrang, doimiy)

-   Modal: backdrop fade + kontent scale(0.95→1) + opacity

-   SubscribeModal --- bir xil animatsiya

# **11. Nonfunksional talablar \[vazifa 33\]**

## **11.1 Ish faoliyati**

-   Og'ir sahifalar (Rankings, Friends, Subscription) --- React.lazy +
    > Suspense

-   Rasmlar --- AppImage loading=\"lazy\" bilan

-   Zustand: har doim selector, to'liq store emas

-   GET-so'rovlar: tarmoq xatosi'da 1 s orqali 1 qayta urinish

## **11.2 Oflayn va ishonchlilik**

-   Ulanish yo'q bo'lsa --- doimiy Toast \"Ulanish yo'q\"

-   WS: backoff bilan auto-qayta ulanish (bo'lim 9.1)

-   Tranzaksiya polling'i: maksimal 30 s, 5 s intervali bilan 5 urinish

## **11.3 Kirish imkoniyatlari**

-   prefers-reduced-motion: Framer Motion animatsiyalarini o'chirish

-   Barcha interaktiv elementlar --- aria-label

-   Modal oynalar --- fokus-trap

## **11.4 Qabul qilish cheklisti**

  -----------------------------------------------------------------------
  **Nuqta**                               **OK?**
  ----------------------------------- -----------------------------------
  Barcha holatlar: loading / success /    ☐
  error / empty                           

  Kirayotish/chiqayotish'da Framer       ☐
  Motion har bir komponentda              

  TypeScript hech qanday any'siz          ☐

  Barcha kalit hodisalarda Toast         ☐

  Telegram Desktop va Mobile              ☐

  Qorong'i tema                           ☐

  RU, UZ, EN                              ☐

  Production'da console.log yo'q         ☐

  UI'da tangalar/dukan talvino'siz       ☐

  Barcha API yo'llari 0-bo'lim'ga mos   ☐

  friends/accept tani: { requestId }     ☐
  { friendshipId } emas                   

  training tani: { cardId, known:bool ☐
  } { moduleId, answer } emas             

  quiz tani: { cardId, answerId } emas   ☐
  { answers:\[\] }                        

  telegram invoice tani: { packageId, ☐
  idempotencyKey }                        

  click/cards/verify smsCode: number      ☐
  (string emas)                           
  -----------------------------------------------------------------------

# **12. Jami backlog --- 31 vazifa**

  -----------------------------------------------------------------------
  Vazifalar 1 (tangalar-tab) va 10 (coin API) o'chirildi. Nishtyak dukani
  o'chirildi. Faqat obunalar va XP-reyting qoldirdi.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

**Obunalar va to'lov**

  -------------------------------------------------------------------------------
  **\#**            **Vazifa**                        **Murakkablik**     **Bog'lanish**
  ----------------- --------------------------------- ------------------- -----------------
  **1**             /subscription: 2 tab ---         Yuqori              Yo'q
                    ASOSIY/PREMIUM tariflar
                    (/shop/subscriptions) +
                    tarix (/transactions)

  **2**             PaymentMethodModal: Stars /     O'rtacha            Yo'q
                    Payme / Click (karta
                    yoki havola)

  **3**             Stars: /telegram/invoice         O'rtacha            Yo'q
                    { packageId,
                    idempotencyKey } →
                    invoiceUrl → polling

  **4**             Payme: create_token →           Yuqori              Yo'q
                    verify { smsCode:string }
                    → payment { amount,
                    packageId, cardUid,
                    idempotencyKey }

  **4b**            Click: create_token →           Yuqori              Yo'q
                    verify { smsCode:number }
                    → payment yoki
                    payment_link { packageId,
                    idempotencyKey }

  **5**             CardInputForm: niqob,           O'rtacha            Yo'q
                    Luhn, BIN, GET /cards,
                    alohida Payme/Click

  **6**             Holatlar: loading /             Pastki              Yo'q
                    polling / success / error
                    qayta urinish bilan
  -------------------------------------------------------------------------------

**Obunani yangilash**

  ------------------------------------------------------------------------------
  **\#**            **Vazifa**                       **Murakkablik**     **Bog'lanish**
  ----------------- -------------------------------- ------------------- -----------------
  **7**             GET /users/me boshlashda        O'rtacha            Yo'q
                    va o'tishda;
                    subscription.code=null →
                    bepul

  **8**             usageStore chegaralari faqat    Pastki              Yo'q
                    serverdan

  **9**             expirationDate \< hozir →       Pastki              Yo'q
                    SubscribeModal; cache ≤ 5
                    min
  ------------------------------------------------------------------------------

**XP reyting va darajalar**

  -------------------------------------------------------------------------
  **\#**            **Vazifa**              **Murakkablik**     **Bog'lanish**
  ----------------- ----------------------- ------------------- -----------------
  **10**            refreshUserData()       O'rtacha            Yo'q
                    har harakat
                    tugallanganda; XP =
                    rating dan /users/me;
                    32 daraja mahalliy

  **11**            Optimistik \"+N XP\";   Pastki              Yo'q
                    LevelUpModal
                    ko'tarilsa
  -------------------------------------------------------------------------

**Yutuqlar**

  ---------------------------------------------------------------------------------------------------
  **\#**            **Vazifa**                                        **Murakkablik**     **Bog'lanish**
  ----------------- --------------------------------------------- ------------------- -----------------
  **12**            achievementsStore mahalliy /achievements       O'rtacha            Backend kutiladi
                    API paydo bo'lgunicha                                               

  **13**            training/quiz/games/streak/friends/pomodoro   O'rtacha            Yo'q
                    dan trigger'lar →
                    updateProgress()

  **14**            Toast-navbat; /profile'da to'r va Modal       O'rtacha            Yo'q
  ---------------------------------------------------------------------------------------------------

**Kunlik topshiriqlar**

  -----------------------------------------------------------------------------------------------
  **\#**            **Vazifa**                                **Murakkablik**     **Bog'lanish**
  ----------------- ----------------------------------------- ------------------- -----------------
  **15**            dailyTasksStore mahalliy /daily-tasks    O'rtacha            Backend kutiladi
                    API paydo bo'lgunicha; yarim tun shunga shunga               

  **16**            /home'dagi widget va /daily-tasks sahifasi Murakkabl         Yo'q
                    taymeri bilan                                              

  **17**            training/quiz/games/pomodoro/flashcards'dan Pastki           Yo'q
                    hodisalarni yuborish
  -----------------------------------------------------------------------------------------------

**Reyting**

  ---------------------------------------------------------------------------
  **\#**            **Vazifa**              **Murakkablik**     **Bog'lanish**
  ----------------- --------------------- ------------------- -----------------
  **18**            /rankings: dostlardan   O'rtacha            Backend kutiladi
                    /friends/list;                              
                    tablar
                    Global/Mamlakatboʻyicha=
                    /rating/leaderboard
                    kutish

  ---------------------------------------------------------------------------

**Dostlar**

  --------------------------------------------------------------------------------
  **\#**            **Vazifa**                 **Murakkablik**     **Bog'lanish**
  ----------------- -------------------------- ------------------- -----------------
  **19**            /friends: kelgan, ro'yxat, Yuqori           Qisman
                    so'rov { targetUid:UUID },                   
                    qidirish-stub /users/search
                    kutish

  **20**            /friends/:id:              O'rtacha            Yo'q
                    /report/{uid}, DELETE
                    /friends/{friendshipId},
                    \"O'yni talab qilish\"

  **21**            TG taklif + startParam     O'rtacha            Yo'q
                    invite\_\* →
                    /friends/request {
                    targetUid }

  **22**            Badge: /friends/incoming → Pastki             Yo'q
                    length \> 0
  --------------------------------------------------------------------------------

**Ko'p o'yinchi (PvP)**

  -----------------------------------------------------------------------------------
  **\#**            **Vazifa**                    **Murakkablik**     **Bog'lanish**
  ----------------- ----------------------------- ------------------- -----------------
  **23**            WS-kliyent: singleton,        Juda yuqori          WS-backend kutiladi
                    backoff, heartbeat, tipizatsiya                    

  **24**            UI matcheming:                Yuqori              WS-backend kutiladi
                    join/found/cancelled                              

  **25**            Word Rush PvP:                Juda yuqori          WS-backend kutiladi
                    game:start/answer/score/end                       

  **26**            \"Dostim bilan o'yna\"        O'rtacha            WS-backend kutiladi
                    Word Rush va Octo Memory uchun
  -----------------------------------------------------------------------------------

**Animatsiyalar**

  ---------------------------------------------------------------------------
  **\#**            **Vazifa**              **Murakkablik**     **Bog'lanish**
  ----------------- --------------------- ------------------- -----------------
  **27**            PageTransition ---      O'rtacha            Yo'q
                    barcha ekranlar App.tsx'da                  

  **28**            TabBar:                 Pastki              Yo'q
                    layoutId-indikator,
                    ikonka scale'i

  **29**            Kartochka hover/tap;    Pastki              Yo'q
                    stagger ro'yxatlarda

  **30**            O'yinlar: slide, flip,  O'rtacha            Yo'q
                    spring

  **31**            ProgressBar; roll-up    Pastki              Yo'q
                    XP-hisoblagich sarlavhada

  **32**            Toast; modal oynalar    Pastki              Yo'q
                    backdrop+scale
  ---------------------------------------------------------------------------

**Nonfunksional**

  -----------------------------------------------------------------------
  **\#**            **Vazifa**            **Murakkablik**     **Bog'lanish**
  ----------------- ------------------- ------------------- -----------------
  **33**            Lazy+Suspense,        O'rtacha            Yo'q
                    retry GET,
                    doimiy oflayn toast, a11y,
                    focus trap

  -----------------------------------------------------------------------

Wordzen TZ · v1.4 · 08.05.2026 · Tangalar/dukan o'chirildi · API account-api.md + payment-api.md + wordzen-api.md bilan tekshirildi
