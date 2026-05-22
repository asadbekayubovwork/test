// Users
export { currentUser, friends, getFriendById } from './users';

// Words
export {
  vocabularyCards,
  getCardsByDifficulty,
  getCardsByCategory,
  getFavoriteCards,
  getLearnedCards,
  getUnlearnedCards,
} from './words';

// Courses
export {
  courses,
  getMyCourses,
  getAvailableCourses,
  getCoursesByDifficulty,
  getCoursesByType,
  getCourseById,
  getUnitsByCourseId,
  getUnitById,
} from './courses';

// Rankings
export {
  globalRankings,
  countryRankings,
  regionRankings,
  getRankingsByType,
} from './rankings';

// Games
export {
  getDailyQuestions,
  getTodayDate,
  getWordRushQuestions,
  getMemoryTiles,
} from './games';

export type {
  GameQuestion,
  MemoryTile,
} from './games';

// Countries
export {
  getCountries,
  getPinnedCountries,
  getNonPinnedCountries,
  getCountryByCode,
  getRegionsForCountry,
  searchCountries,
  getCountryName,
  getRegionName,
} from './countries';

export type { Country, Region } from './countries';

// Achievements
export {
  allAchievements,
  getUnlockedAchievements,
  getLockedAchievements,
  getAchievementProgress,
} from './achievements';
