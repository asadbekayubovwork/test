import { create } from 'zustand';
import { getReport } from '../api/report';
import type { ReportResponse } from '../api/report';

interface ReportState {
  // Data
  report: ReportResponse | null;

  // Loading states
  isLoading: boolean;

  // Error state
  error: string | null;

  // Actions
  fetchReport: () => Promise<void>;
  clearError: () => void;
  resetStore: () => void;
}

const initialState = {
  report: null as ReportResponse | null,
  isLoading: false,
  error: null as string | null,
};

export const useReportStore = create<ReportState>((set) => ({
  ...initialState,

  // Fetch user's learning report
  fetchReport: async () => {
    set({ isLoading: true, error: null });

    try {
      const report = await getReport();
      set({
        report,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch report';
      set({ error: message, isLoading: false });
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Reset store
  resetStore: () => {
    set(initialState);
  },
}));
