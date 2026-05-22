import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameQuestion, MemoryTile } from '../data/games';
import {
  getDailyQuestions,
  getTodayDate,
  getWordRushQuestions,
  getMemoryTiles,
} from '../data/games';

// ── Persisted best-scores / streaks ──

interface GamesBests {
  dailyStreak: number;
  dailyLastDate: string | null;
  dailyBestScore: number;
  rushBestScore: number;
  memoryBestMoves: number | null;
  totalGamesPlayed: number;
}

// ── Transient game session state ──

interface DailyChallengeState {
  questions: GameQuestion[];
  currentIndex: number;
  score: number;
  selectedAnswer: number | null;
  answerStatus: 'idle' | 'correct' | 'wrong';
  isComplete: boolean;
  alreadyPlayedToday: boolean;
}

interface WordRushState {
  questions: GameQuestion[];
  currentIndex: number;
  score: number;
  correctAnswers: number;
  totalAnswered: number;
  timeRemaining: number;
  isPlaying: boolean;
  isComplete: boolean;
  selectedAnswer: number | null;
  answerStatus: 'idle' | 'correct' | 'wrong';
}

interface OctoMemoryState {
  tiles: (MemoryTile & { isFlipped: boolean; isMatched: boolean })[];
  firstFlipped: number | null;
  moves: number;
  matchedPairs: number;
  totalPairs: number;
  isLocked: boolean;
  isComplete: boolean;
}

interface GamesState extends GamesBests {
  daily: DailyChallengeState;
  rush: WordRushState;
  memory: OctoMemoryState;

  // Daily Challenge
  initDailyChallenge: () => void;
  answerDaily: (optionIndex: number) => void;
  nextDailyQuestion: () => void;

  // Word Rush
  initWordRush: () => void;
  startWordRush: () => void;
  answerRush: (optionIndex: number) => void;
  tickRush: () => void;
  endWordRush: () => void;

  // Octo Memory
  initOctoMemory: () => void;
  flipTile: (index: number) => void;

  // Generic
  resetGame: (game: 'daily' | 'rush' | 'memory') => void;
}

const defaultDaily: DailyChallengeState = {
  questions: [],
  currentIndex: 0,
  score: 0,
  selectedAnswer: null,
  answerStatus: 'idle',
  isComplete: false,
  alreadyPlayedToday: false,
};

const defaultRush: WordRushState = {
  questions: [],
  currentIndex: 0,
  score: 0,
  correctAnswers: 0,
  totalAnswered: 0,
  timeRemaining: 60,
  isPlaying: false,
  isComplete: false,
  selectedAnswer: null,
  answerStatus: 'idle',
};

const defaultMemory: OctoMemoryState = {
  tiles: [],
  firstFlipped: null,
  moves: 0,
  matchedPairs: 0,
  totalPairs: 8,
  isLocked: false,
  isComplete: false,
};

export const useGamesStore = create<GamesState>()(
  persist(
    (set, get) => ({
      // Persisted bests
      dailyStreak: 0,
      dailyLastDate: null,
      dailyBestScore: 0,
      rushBestScore: 0,
      memoryBestMoves: null,
      totalGamesPlayed: 0,

      // Session state (not persisted — partialize below)
      daily: { ...defaultDaily },
      rush: { ...defaultRush },
      memory: { ...defaultMemory },

      // ── Daily Challenge ──

      initDailyChallenge: () => {
        const today = getTodayDate();
        const { dailyLastDate } = get();
        if (dailyLastDate === today) {
          set({ daily: { ...defaultDaily, alreadyPlayedToday: true } });
          return;
        }
        const questions = getDailyQuestions();
        set({ daily: { ...defaultDaily, questions } });
      },

      answerDaily: (optionIndex: number) => {
        const { daily } = get();
        if (daily.answerStatus !== 'idle' || daily.isComplete) return;
        const q = daily.questions[daily.currentIndex];
        const isCorrect = optionIndex === q.correctIndex;
        set({
          daily: {
            ...daily,
            selectedAnswer: optionIndex,
            answerStatus: isCorrect ? 'correct' : 'wrong',
            score: isCorrect ? daily.score + 1 : daily.score,
          },
        });
      },

      nextDailyQuestion: () => {
        const { daily, dailyLastDate, dailyStreak } = get();
        const nextIndex = daily.currentIndex + 1;
        if (nextIndex >= daily.questions.length) {
          const today = getTodayDate();
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
          const newStreak = dailyLastDate === yStr ? dailyStreak + 1 : 1;
          const finalScore = daily.answerStatus === 'correct' ? daily.score : daily.score;
          set((s) => ({
            daily: { ...daily, isComplete: true, currentIndex: nextIndex, answerStatus: 'idle', selectedAnswer: null },
            dailyLastDate: today,
            dailyStreak: newStreak,
            dailyBestScore: Math.max(s.dailyBestScore, finalScore),
            totalGamesPlayed: s.totalGamesPlayed + 1,
          }));
          return;
        }
        set({
          daily: {
            ...daily,
            currentIndex: nextIndex,
            selectedAnswer: null,
            answerStatus: 'idle',
          },
        });
      },

      // ── Word Rush ──

      initWordRush: () => {
        const questions = getWordRushQuestions();
        set({ rush: { ...defaultRush, questions } });
      },

      startWordRush: () => {
        set((s) => ({ rush: { ...s.rush, isPlaying: true } }));
      },

      answerRush: (optionIndex: number) => {
        const { rush } = get();
        if (!rush.isPlaying || rush.answerStatus !== 'idle') return;
        const q = rush.questions[rush.currentIndex];
        const isCorrect = optionIndex === q.correctIndex;
        set({
          rush: {
            ...rush,
            selectedAnswer: optionIndex,
            answerStatus: isCorrect ? 'correct' : 'wrong',
            score: isCorrect ? rush.score + 1 : rush.score,
            correctAnswers: isCorrect ? rush.correctAnswers + 1 : rush.correctAnswers,
            totalAnswered: rush.totalAnswered + 1,
          },
        });
        setTimeout(() => {
          const current = get().rush;
          if (!current.isPlaying) return;
          const nextIdx = current.currentIndex + 1;
          if (nextIdx >= current.questions.length) {
            get().endWordRush();
            return;
          }
          set({
            rush: {
              ...current,
              currentIndex: nextIdx,
              selectedAnswer: null,
              answerStatus: 'idle',
            },
          });
        }, 400);
      },

      tickRush: () => {
        const { rush } = get();
        if (!rush.isPlaying) return;
        const next = rush.timeRemaining - 1;
        if (next <= 0) {
          get().endWordRush();
          return;
        }
        set({ rush: { ...rush, timeRemaining: next } });
      },

      endWordRush: () => {
        set((s) => ({
          rush: { ...s.rush, isPlaying: false, isComplete: true },
          rushBestScore: Math.max(s.rushBestScore, s.rush.score),
          totalGamesPlayed: s.totalGamesPlayed + 1,
        }));
      },

      // ── Octo Memory ──

      initOctoMemory: () => {
        const rawTiles = getMemoryTiles();
        const tiles = rawTiles.map((t) => ({ ...t, isFlipped: false, isMatched: false }));
        set({ memory: { ...defaultMemory, tiles, totalPairs: rawTiles.length / 2 } });
      },

      flipTile: (index: number) => {
        const { memory } = get();
        if (memory.isLocked || memory.isComplete) return;
        const tile = memory.tiles[index];
        if (tile.isFlipped || tile.isMatched) return;

        const newTiles = memory.tiles.map((t, i) =>
          i === index ? { ...t, isFlipped: true } : t,
        );

        if (memory.firstFlipped === null) {
          set({ memory: { ...memory, tiles: newTiles, firstFlipped: index } });
          return;
        }

        const firstIdx = memory.firstFlipped;
        const firstTile = memory.tiles[firstIdx];
        const newMoves = memory.moves + 1;
        const isMatch = firstTile.pairId === tile.pairId;

        if (isMatch) {
          const matched = newTiles.map((t) =>
            t.pairId === tile.pairId ? { ...t, isMatched: true, isFlipped: true } : t,
          );
          const newPairs = memory.matchedPairs + 1;
          const isComplete = newPairs === memory.totalPairs;
          set((s) => ({
            memory: {
              ...memory,
              tiles: matched,
              firstFlipped: null,
              moves: newMoves,
              matchedPairs: newPairs,
              isComplete,
            },
            ...(isComplete
              ? {
                  memoryBestMoves:
                    s.memoryBestMoves === null
                      ? newMoves
                      : Math.min(s.memoryBestMoves, newMoves),
                  totalGamesPlayed: s.totalGamesPlayed + 1,
                }
              : {}),
          }));
        } else {
          set({ memory: { ...memory, tiles: newTiles, isLocked: true, moves: newMoves } });
          setTimeout(() => {
            set((s) => ({
              memory: {
                ...s.memory,
                tiles: s.memory.tiles.map((t, i) =>
                  i === firstIdx || i === index ? { ...t, isFlipped: false } : t,
                ),
                firstFlipped: null,
                isLocked: false,
              },
            }));
          }, 600);
        }
      },

      // ── Reset ──

      resetGame: (game) => {
        if (game === 'daily') get().initDailyChallenge();
        if (game === 'rush') get().initWordRush();
        if (game === 'memory') get().initOctoMemory();
      },
    }),
    {
      name: 'wordzen-games',
      partialize: (state) => ({
        dailyStreak: state.dailyStreak,
        dailyLastDate: state.dailyLastDate,
        dailyBestScore: state.dailyBestScore,
        rushBestScore: state.rushBestScore,
        memoryBestMoves: state.memoryBestMoves,
        totalGamesPlayed: state.totalGamesPlayed,
      }),
    },
  ),
);
