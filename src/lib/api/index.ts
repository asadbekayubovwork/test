// API Client
export { default as apiClient } from './client';
export {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isAuthenticated,
  getMiniappClientKey,
} from './client';

// Auth API
export {
  loginWithTelegram,
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  getCurrentUser,
  refreshAccessToken,
  changePassword,
  requestAuthEmailConfirmation,
  authReset,
  logout,
  checkAuth,
} from './auth';

// Courses API
export {
  getCourses,
  getCourseById,
  getCourseModules,
  getLibraryCourses,
  addCourseToLibrary,
  removeCourseFromLibrary,
  getModuleById,
  getModuleCards,
  getCardById,
  getImageUrl,
  isSubscriptionGatedCourse,
  moduleAppearsLocked,
  moduleFreeAccess,
} from './courses';

// Auth Types
export type {
  TokenDto,
  UserView,
  RoleView,
  TelegramLoginRequest,
  UserLoginRequest,
  UserRegistrationRequest,
  TokenRequest,
  GoogleTokenRequest,
  EmailConfirmationType,
  EmailConfirmationRequest,
  NoContentView,
  RegisterEmailParams,
} from './auth';

// Course Types
export type {
  CourseCategory,
  CourseAccessCode,
  FreeModuleAvailabilityCode,
  FreeModuleAccessView,
  Locale,
  TranslationView,
  SampleView,
  CardView,
  ModuleView,
  CourseCategoryView,
  CourseDescriptionView,
  CourseView,
  CoursesView,
  ModulesView,
} from './courses';

// Training API
export {
  getTrainingByModule,
  submitTrainingResult,
  resetTrainingProgress,
} from './training';

// Training Types
export type {
  TrainingRequest,
  TrainingProgressResponse,
  TrainingResponse,
  TrainingReportResponse,
} from './training';

// Quiz API
export {
  getQuizByModule,
  submitQuizAnswer,
  postQuizAnswer,
  getQuizModuleProgress,
  getQuizResults,
  resetQuizProgress,
} from './quiz';

// Quiz Types
export type {
  QuizOption,
  QuizQuestion,
  QuizAnswerRequest,
  QuizAnswerResponse,
  QuizResultResponse,
  QuizAnswerOption,
  QuizQuestionResponse,
  QuizApiResponse,
  AnswerQuizRequest,
  ProgressQuizResponse,
  ProgressQuizModuleResponse,
  QuizWrapperResponse,
  QuizAnswerWire,
  QuizQuestionWire,
} from './quiz';

// Friends API (`account-api.md`)
export {
  listAcceptedFriendships,
  listIncomingFriendships,
  listOutgoingFriendships,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  deleteFriendship,
  otherUidInFriendship,
  toFriendListItem,
  isUuidString,
} from './friends';

// Friends Types
export type { FriendListItem } from './friends';

// Favorites API
export {
  getFavoriteCards,
  getFavoriteCardsByCourse,
  getFavoriteCardsByModule,
  addCardToFavorites,
  removeCardFromFavorites,
} from './favorites';

// Pomodoro API
export {
  getPomodoroByCourse,
  savePomodoroSession,
  deletePomodoroForCourse,
} from './pomodoro';

// Pomodoro Types
export type {
  PomodoroResponse,
  PomodoroRequest,
} from './pomodoro';

// Free module access (wordzen-api)
export {
  startFreeModuleAccess,
  cancelFreeModuleAccess,
  getFreeAccessStatus,
} from './freeAccess';
export type {
  FreeAccessGrantStatus,
  FreeAccessGrant,
  FreeAccessActiveSummary,
  FreeAccessStatusView,
} from './freeAccess';

// Analytics — POST learning sessions
export { postAnalyticsSession } from './analytics';
export type { AnalyticsSessionPayload, SessionsAnalytics } from './analytics';

// --- Payment-service surfaces ---

// Payment Client (separate axios for payment-wordzen.stnapps.com)
export { paymentErrorMessage } from './paymentEnvelope';
export {
  default as paymentClient,
  PAYMENT_API_V1_PREFIX,
  PAYMENT_PUBLIC_PATH_PREFIXES,
  isPaymentPublicPath,
} from './paymentClient';

// Account service — account-wordzen (аккаунт, друзья; рейтинги из того же Swagger)
export { default as accountClient } from './accountClient';

export type {
  PaymentApiResponse,
  PaymentProvider,
  PaymentCurrency,
  PaymentTransactionStatus,
  PaymentCardStatus,
  PaymentSubscriptionCode,
  CardResponse,
  CardsResponse,
  PaymentTransactionResponse,
  PaymentTransactionsResponse,
  ClickProviderCallbackResponse,
} from './paymentClient';

// Pricing API (coin packages + provider rates)
export { getPrices, calcCoins } from './pricing';
export type {
  PackageResponse,
  RateResponse,
  PriceResponse,
  CalcCoinResponse,
  CalcCoinsParams,
} from './pricing';

// Shop API (subscription catalog — публичный `GET /shop/subscriptions`)
export { getShopSubscriptions } from './shop';
export type {
  ShopSubscriptionOffer,
  SubscriptionsResponse,
} from './shop';

// Telegram Stars Payment API (miniapp default rail)
export {
  createTelegramInvoice,
  confirmTelegramPayment,
} from './telegramPayment';
export type {
  TelegramInvoiceRequest,
  TelegramInvoiceResponse,
  TelegramConfirmRequest,
  TelegramConfirmResponse,
} from './telegramPayment';

// Payment Cards API (Click + Payme) — `payment-api.md`: Cards, Payme, Click
export {
  listCards,
  getCardByUid,
  createCardToken,
  verifyCardToken,
  deleteCardToken,
  createClickPaymentLink,
  directClickPayment,
  createPaymePayment,
} from './paymentCards';
export type {
  MessageResponse,
  CreateCardRequest,
  VerifyCardRequest,
  DeleteCardRequest,
  CreatePaymentLinkRequest,
  CreatePaymentLinkResponse,
  PaymentRequest,
  DirectPaymentRequest,
  CardProvider,
} from './paymentCards';

// Transactions API
export { listTransactions, getTransactionByUid } from './transactions';

// Subscription API
export { getSubscription, cancelSubscription } from './subscription';
export type {
  SubscriptionResponse,
  SubscriptionStatusCode,
  SubscriptionSourceCode,
} from './subscription';

// Account API (`account-api.md`: users/me, coins, friends, …)
export {
  getAccount,
  getMyCoinsProfile,
  getMyRatingProfile,
  updateMyUsername,
  mapUserSubscriptionToUi,
  isValidAccountUsername,
} from './account';
export type {
  UserResponse,
  UserResponseSubscription,
  AccountSubscriptionCode,
  FriendshipResponse,
  FriendshipStatus,
  UpdateUsernameRequest,
} from './account';

// Report API
export { getReport, getReportByUserUid } from './report';

// Report Types
export type {
  VisitReportResponse,
  SessionReportResponse,
  CardsReportResponse,
  ReportTrainingStats,
  CoursesReportResponse,
  ReportResponse,
} from './report';
