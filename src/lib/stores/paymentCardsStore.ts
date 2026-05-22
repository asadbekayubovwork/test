import { create } from 'zustand';
import {
  listCards,
  createCardToken,
  verifyCardToken,
  deleteCardToken,
  type CardResponse,
  type CardProvider,
} from '../api/paymentCards';

type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

interface AddCardDraft {
  provider: CardProvider;
  cardUid: string;
  awaitingSms: boolean;
}

interface CardsState {
  cards: CardResponse[];
  status: FetchStatus;
  error: string | null;
  addDraft: AddCardDraft | null;
  addStatus: 'idle' | 'tokenizing' | 'awaiting_sms' | 'verifying' | 'success' | 'error';
  addError: string | null;
}

interface CardsActions {
  fetchCards: () => Promise<void>;
  beginAddCard: (
    provider: CardProvider,
    body: { cardNumber: string; expireDate: string },
  ) => Promise<string | null>;
  verifyAddedCard: (smsCode: string) => Promise<boolean>;
  cancelAddCard: () => void;
  removeCard: (provider: CardProvider, cardUid: string) => Promise<boolean>;
}

type CardsStore = CardsState & CardsActions;

/**
 * Saved Click / Payme cards. Add-card flow = create_token → SMS verify → done.
 * Wired but not yet exposed in miniapp UI — Stars is the only rail in scope
 * for the first subscription milestone.
 */
export const usePaymentCardsStore = create<CardsStore>((set, get) => ({
  cards: [],
  status: 'idle',
  error: null,
  addDraft: null,
  addStatus: 'idle',
  addError: null,

  fetchCards: async () => {
    set({ status: 'loading', error: null });
    try {
      const cards = await listCards();
      set({ cards, status: 'success' });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch cards';
      set({ status: 'error', error: message });
    }
  },

  beginAddCard: async (provider, body) => {
    set({ addStatus: 'tokenizing', addError: null, addDraft: null });
    try {
      const card = await createCardToken(provider, body);
      set({
        addStatus: 'awaiting_sms',
        addDraft: { provider, cardUid: card.uid, awaitingSms: true },
      });
      return card.uid;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to tokenize card';
      set({ addStatus: 'error', addError: message });
      return null;
    }
  },

  verifyAddedCard: async (smsCode) => {
    const draft = get().addDraft;
    if (!draft) {
      set({ addStatus: 'error', addError: 'No card to verify' });
      return false;
    }
    set({ addStatus: 'verifying' });
    try {
      await verifyCardToken(draft.provider, {
        cardUid: draft.cardUid,
        smsCode,
      });
      await get().fetchCards();
      set({ addStatus: 'success', addDraft: null });
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to verify card';
      set({ addStatus: 'error', addError: message });
      return false;
    }
  },

  cancelAddCard: () => {
    set({ addStatus: 'idle', addError: null, addDraft: null });
  },

  removeCard: async (provider, cardUid) => {
    try {
      await deleteCardToken(provider, { cardUid });
      set((state) => ({
        cards: state.cards.filter((c) => c.uid !== cardUid),
      }));
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete card';
      set({ error: message });
      return false;
    }
  },
}));
