import { create } from 'zustand';
import { getPomodoroByCourse, savePomodoroSession } from '../api/pomodoro';
import type { PomodoroResponse } from '../api/pomodoro';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface PomodoroState {
  // Timer settings (in minutes)
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;

  // Timer state
  currentMode: TimerMode;
  timeRemaining: number; // in seconds
  isRunning: boolean;
  completedSessions: number;

  // Course tracking
  selectedCourseId: number | null;
  courseStats: PomodoroResponse | null;
  totalMinutesStudied: number;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  setFocusDuration: (minutes: number) => void;
  setShortBreakDuration: (minutes: number) => void;
  setLongBreakDuration: (minutes: number) => void;
  setSessionsUntilLongBreak: (sessions: number) => void;

  selectCourse: (courseId: number) => void;
  fetchCourseStats: (courseId: number) => Promise<void>;
  saveSession: (minutes: number) => Promise<void>;

  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  completeSession: () => void;
  switchMode: (mode: TimerMode) => void;

  clearError: () => void;
  resetStore: () => void;
}

const DEFAULT_FOCUS = 25;
const DEFAULT_SHORT_BREAK = 5;
const DEFAULT_LONG_BREAK = 15;
const DEFAULT_SESSIONS = 4;

const initialState = {
  focusDuration: DEFAULT_FOCUS,
  shortBreakDuration: DEFAULT_SHORT_BREAK,
  longBreakDuration: DEFAULT_LONG_BREAK,
  sessionsUntilLongBreak: DEFAULT_SESSIONS,

  currentMode: 'focus' as TimerMode,
  timeRemaining: DEFAULT_FOCUS * 60,
  isRunning: false,
  completedSessions: 0,

  selectedCourseId: null,
  courseStats: null,
  totalMinutesStudied: 0,

  isLoading: false,
  isSaving: false,
  error: null,
};

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  ...initialState,

  // Settings
  setFocusDuration: (minutes: number) => {
    set({ focusDuration: minutes });
    const state = get();
    if (state.currentMode === 'focus' && !state.isRunning) {
      set({ timeRemaining: minutes * 60 });
    }
  },

  setShortBreakDuration: (minutes: number) => {
    set({ shortBreakDuration: minutes });
    const state = get();
    if (state.currentMode === 'shortBreak' && !state.isRunning) {
      set({ timeRemaining: minutes * 60 });
    }
  },

  setLongBreakDuration: (minutes: number) => {
    set({ longBreakDuration: minutes });
    const state = get();
    if (state.currentMode === 'longBreak' && !state.isRunning) {
      set({ timeRemaining: minutes * 60 });
    }
  },

  setSessionsUntilLongBreak: (sessions: number) => {
    set({ sessionsUntilLongBreak: sessions });
  },

  // Course selection
  selectCourse: (courseId: number) => {
    set({ selectedCourseId: courseId });
    get().fetchCourseStats(courseId);
  },

  fetchCourseStats: async (courseId: number) => {
    set({ isLoading: true, error: null });

    try {
      const stats = await getPomodoroByCourse(courseId);
      set({
        courseStats: stats,
        totalMinutesStudied: stats.minutes,
        isLoading: false,
      });
    } catch {
      // If no stats exist yet, that's okay
      set({
        courseStats: null,
        totalMinutesStudied: 0,
        isLoading: false,
      });
    }
  },

  saveSession: async (minutes: number) => {
    const state = get();
    if (!state.selectedCourseId) return;

    set({ isSaving: true, error: null });

    try {
      const result = await savePomodoroSession(state.selectedCourseId, minutes);
      set({
        courseStats: result,
        totalMinutesStudied: result.minutes,
        isSaving: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save session';
      set({ error: message, isSaving: false });
    }
  },

  // Timer controls
  startTimer: () => {
    set({ isRunning: true });
  },

  pauseTimer: () => {
    set({ isRunning: false });
  },

  resetTimer: () => {
    const state = get();
    let duration = state.focusDuration;
    if (state.currentMode === 'shortBreak') duration = state.shortBreakDuration;
    if (state.currentMode === 'longBreak') duration = state.longBreakDuration;

    set({
      timeRemaining: duration * 60,
      isRunning: false,
    });
  },

  tick: () => {
    const state = get();
    if (!state.isRunning || state.timeRemaining <= 0) return;

    const newTime = state.timeRemaining - 1;
    set({ timeRemaining: newTime });

    if (newTime === 0) {
      state.completeSession();
    }
  },

  completeSession: () => {
    const state = get();
    set({ isRunning: false });

    if (state.currentMode === 'focus') {
      // Save the focus session
      state.saveSession(state.focusDuration);

      const newCompletedSessions = state.completedSessions + 1;
      set({ completedSessions: newCompletedSessions });

      // Determine next break type
      if (newCompletedSessions % state.sessionsUntilLongBreak === 0) {
        state.switchMode('longBreak');
      } else {
        state.switchMode('shortBreak');
      }
    } else {
      // After break, go back to focus
      state.switchMode('focus');
    }
  },

  switchMode: (mode: TimerMode) => {
    const state = get();
    let duration = state.focusDuration;
    if (mode === 'shortBreak') duration = state.shortBreakDuration;
    if (mode === 'longBreak') duration = state.longBreakDuration;

    set({
      currentMode: mode,
      timeRemaining: duration * 60,
      isRunning: false,
    });
  },

  clearError: () => {
    set({ error: null });
  },

  resetStore: () => {
    set(initialState);
  },
}));
