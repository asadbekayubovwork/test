// User Types
export interface User {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  region: string;
  country: string;
  ratingPoints: number;
  rankPosition: number;
  friendsCount: number;
  octoCoins: number;
  backgroundImage?: string;
  subscription: Subscription;
  stats: UserStats;
  achievements: Achievement[];
  purchasedCourses: string[];
}

export interface Subscription {
  type: 'free' | 'premium' | 'pro';
  expiresAt?: string;
  autoRenew: boolean;
}

export interface UserStats {
  timeSpent: number;        // minutes
  learnedCards: number;
  testAccuracy: number;     // percentage
  visitFrequency: number;   // days streak
  lastActive: string;
}

// Word Card Types
export interface WordCard {
  id: string;
  word: string;
  transcription: string;
  translation: string;
  audioUrl: string;
  difficulty: Difficulty;
  category: string;
  isFavorite: boolean;
  learned: boolean;
  lastReviewed?: string;
  reviewCount: number;
}

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// Course Types
export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  type: CourseType;
  totalCards: number;
  progress: number;           // percentage
  accessType: AccessType;
  price?: number;
  coverImage: string;
  units?: Unit[];
  totalUnits?: number;
  completedUnits?: number;
  xpEarned?: number;
  level?: string;             // e.g., "B2 Upper Intermediate"
}

export interface Unit {
  id: string;
  courseId: string;
  title: string;
  order: number;
  totalCards: number;
  learnedCards: number;
  progress: number;           // percentage
  status: UnitStatus;
  testScore?: number;         // percentage
  testCompleted: boolean;
  words: UnitWord[];
}

export interface UnitWord {
  id: string;
  word: string;
  transcription: string;
  definition: string;
  example?: string;
  imageUrl?: string;
  audioUrl?: string;
  isFavorite: boolean;
  learned: boolean;
}

export type UnitStatus = 'completed' | 'in_progress' | 'locked';
export type CourseType = 'ielts' | 'general';
export type AccessType = 'purchased' | 'subscription' | 'locked';

// Test Types
export interface Test {
  id: string;
  courseId: string;
  questions: TestQuestion[];
  totalQuestions: number;
  currentQuestion: number;
  score: number;
  completed: boolean;
}

export interface TestQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswer: number;
  selectedAnswer?: number;
}

export type QuestionType = 'translation' | 'reverseTranslation' | 'fillBlank';

// Friend Types
export interface Friend {
  id: string;
  name: string;
  avatar: string;
  level: number;
  ratingPoints: number;
  rankPosition: number;
  region: string;
  country: string;
  lastActive: string;
  backgroundImage?: string;
  isOnline: boolean;
  tier: FriendTier;
  xp: number;
  xpToNextLevel: number;
  stats: FriendStats;
  activities: FriendActivity[];
}

export type FriendTier = 'beginner' | 'expert' | 'master' | 'pro';

export interface FriendStats {
  wordsLearned: number;
  studyHours: number;
  currentStreak: number;
  accuracy: number;
}

export interface FriendActivity {
  id: string;
  type: 'achievement' | 'milestone' | 'streak' | 'level_up';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

// Competition Types
export interface Competition {
  id: string;
  type: CompetitionType;
  participants: string[];
  duration: CompetitionDuration;
  difficulty: Difficulty;
  startedAt: string;
  endsAt: string;
  scores: Record<string, number>;
  winnerId?: string;
  status: CompetitionStatus;
}

export type CompetitionType = '1v1' | 'group';
export type CompetitionDuration = 'day' | 'week';
export type CompetitionStatus = 'pending' | 'active' | 'completed';

// Ranking Types
export interface RankingEntry {
  userId: string;
  name: string;
  avatar: string;
  level: number;
  ratingPoints: number;
  position: number;
  country?: string;
  countryFlag?: string;
  rankChange?: number; // positive = up, negative = down, 0 = no change
}

export type RankingType = 'global' | 'country' | 'region';
export type RankingPeriod = 'all_time' | 'weekly' | 'monthly';

// Achievement Types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  target: number;
}

// Game Types
export interface DailyChallenge {
  date: string;
  words: WordCard[];
  completed: boolean;
  score: number;
  time: number;
  leaderboard: DailyChallengeEntry[];
}

export interface DailyChallengeEntry {
  userId: string;
  name: string;
  avatar: string;
  score: number;
  time: number;
}

export interface GameStats {
  wordRush: {
    bestScore: number;
    lastScore: number;
    gamesPlayed: number;
  };
  octoMemory: {
    bestMoves: number;
    lastMoves: number;
    gamesPlayed: number;
  };
  pomodoro: {
    sessionsCompleted: number;
    totalMinutes: number;
  };
}

// Settings Types
export type UILanguage = 'en' | 'uz' | 'ru' | 'kk' | 'uk';

export interface UserSettings {
  translationLanguage: string;
  notifications: boolean;
  soundEffects: boolean;
  country: string;
  region: string;
  uiLanguage: UILanguage;
}

// Session Types
export interface FlashcardSession {
  courseId: string;
  cards: WordCard[];
  currentIndex: number;
  knownCards: string[];
  unknownCards: string[];
  startedAt: string;
}

export interface TestSession {
  testId: string;
  answers: number[];
  currentQuestion: number;
  startedAt: string;
}
