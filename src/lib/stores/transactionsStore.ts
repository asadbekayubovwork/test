import { create } from 'zustand';
import {
  listTransactions,
  type PaymentTransactionResponse,
} from '../api/transactions';

type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

interface TransactionsState {
  transactions: PaymentTransactionResponse[];
  status: FetchStatus;
  error: string | null;
}

interface TransactionsActions {
  fetchTransactions: () => Promise<void>;
}

type TransactionsStore = TransactionsState & TransactionsActions;

export const useTransactionsStore = create<TransactionsStore>((set) => ({
  transactions: [],
  status: 'idle',
  error: null,

  fetchTransactions: async () => {
    set({ status: 'loading', error: null });
    try {
      const transactions = await listTransactions();
      set({ transactions, status: 'success' });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch transactions';
      set({ status: 'error', error: message });
    }
  },
}));
