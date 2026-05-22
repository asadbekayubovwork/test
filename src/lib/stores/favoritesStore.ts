import { create } from 'zustand';
import {
  getFavoriteCards,
  getFavoriteCardsByCourse,
  getFavoriteCardsByModule,
  addCardToFavorites,
  removeCardFromFavorites,
} from '../api/favorites';
import { getLibraryCourses, getCourseModules } from '../api/courses';
import type { CardView, CourseView, ModuleView } from '../api/courses';

// Types for hierarchical favorites
export interface FavoriteModule {
  module: ModuleView;
  favoriteCount: number;
  cards?: CardView[];
}

export interface FavoriteCourse {
  course: CourseView;
  favoriteCount: number;
  modules?: FavoriteModule[];
}

interface FavoritesState {
  // Flat data (for quick lookups and UnitDetail page)
  favoriteCards: CardView[];
  favoriteCardIds: Set<number>;

  // Hierarchical data
  favoriteCourses: FavoriteCourse[];

  // Current view data
  currentCourse: FavoriteCourse | null;
  currentModule: FavoriteModule | null;
  currentCards: CardView[];

  // Loading states
  isLoading: boolean;
  isLoadingCourses: boolean;
  isLoadingModules: boolean;
  isLoadingCards: boolean;
  isProcessing: boolean;

  // Error state
  error: string | null;

  // Actions
  fetchFavorites: () => Promise<void>;
  fetchFavoritesByCourse: (courseId: number) => Promise<void>;
  fetchFavoritesByModule: (moduleId: number) => Promise<void>;
  fetchFavoriteCoursesOverview: () => Promise<void>;
  fetchCourseModulesWithFavorites: (courseId: number) => Promise<void>;
  fetchModuleCards: (moduleId: number) => Promise<void>;
  selectCourse: (courseId: number) => void;
  selectModule: (moduleId: number) => void;
  clearSelection: () => void;
  addToFavorites: (card: CardView) => Promise<void>;
  removeFromFavorites: (cardId: number) => Promise<void>;
  toggleFavorite: (card: CardView) => Promise<void>;
  isFavorite: (cardId: number) => boolean;
  clearError: () => void;
  resetStore: () => void;
}

const initialState = {
  favoriteCards: [] as CardView[],
  favoriteCardIds: new Set<number>(),
  favoriteCourses: [] as FavoriteCourse[],
  currentCourse: null as FavoriteCourse | null,
  currentModule: null as FavoriteModule | null,
  currentCards: [] as CardView[],
  isLoading: false,
  isLoadingCourses: false,
  isLoadingModules: false,
  isLoadingCards: false,
  isProcessing: false,
  error: null,
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  ...initialState,

  // Fetch all favorite cards (flat list)
  fetchFavorites: async () => {
    set({ isLoading: true, error: null });

    try {
      const cards = await getFavoriteCards();
      const cardIds = new Set(cards.map((c) => c.id));
      set({
        favoriteCards: cards,
        favoriteCardIds: cardIds,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch favorites';
      set({ error: message, isLoading: false });
    }
  },

  // Fetch favorites by course
  fetchFavoritesByCourse: async (courseId: number) => {
    set({ isLoading: true, error: null });

    try {
      const cards = await getFavoriteCardsByCourse(courseId);
      const cardIds = new Set(cards.map((c) => c.id));
      set({
        favoriteCards: cards,
        favoriteCardIds: cardIds,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch favorites';
      set({ error: message, isLoading: false });
    }
  },

  // Fetch favorites by module
  fetchFavoritesByModule: async (moduleId: number) => {
    set({ isLoading: true, error: null });

    try {
      const cards = await getFavoriteCardsByModule(moduleId);
      const cardIds = new Set(cards.map((c) => c.id));
      set({
        favoriteCards: cards,
        favoriteCardIds: cardIds,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch favorites';
      set({ error: message, isLoading: false });
    }
  },

  // Fetch overview of courses with favorites
  fetchFavoriteCoursesOverview: async () => {
    set({ isLoadingCourses: true, error: null });

    try {
      // First, get all favorites to have the cardIds set
      const allFavorites = await getFavoriteCards();
      const cardIds = new Set(allFavorites.map((c) => c.id));
      set({ favoriteCards: allFavorites, favoriteCardIds: cardIds });

      // Get user's library courses
      const libraryCourses = await getLibraryCourses();

      // For each course, check if it has any favorites
      const coursesWithFavorites: FavoriteCourse[] = [];

      for (const course of libraryCourses) {
        try {
          const courseFavorites = await getFavoriteCardsByCourse(course.id);
          if (courseFavorites.length > 0) {
            coursesWithFavorites.push({
              course,
              favoriteCount: courseFavorites.length,
            });
          }
        } catch {
          // Course has no favorites, skip
        }
      }

      set({
        favoriteCourses: coursesWithFavorites,
        isLoadingCourses: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch favorite courses';
      set({ error: message, isLoadingCourses: false });
    }
  },

  // Fetch modules for a course with their favorite counts
  fetchCourseModulesWithFavorites: async (courseId: number) => {
    set({ isLoadingModules: true, error: null });

    try {
      // Get course modules
      const modules = await getCourseModules(courseId);

      // For each module, get favorites count
      const modulesWithFavorites: FavoriteModule[] = [];

      for (const module of modules) {
        try {
          const moduleFavorites = await getFavoriteCardsByModule(module.id);
          if (moduleFavorites.length > 0) {
            modulesWithFavorites.push({
              module,
              favoriteCount: moduleFavorites.length,
            });
          }
        } catch {
          // Module has no favorites, skip
        }
      }

      // Update the current course with modules
      const state = get();
      if (state.currentCourse && state.currentCourse.course.id === courseId) {
        set({
          currentCourse: {
            ...state.currentCourse,
            modules: modulesWithFavorites,
          },
          isLoadingModules: false,
        });
      } else {
        // Find and update in favoriteCourses array
        const updatedCourses = state.favoriteCourses.map((fc) =>
          fc.course.id === courseId
            ? { ...fc, modules: modulesWithFavorites }
            : fc
        );
        set({
          favoriteCourses: updatedCourses,
          isLoadingModules: false,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch modules';
      set({ error: message, isLoadingModules: false });
    }
  },

  // Fetch cards for a module
  fetchModuleCards: async (moduleId: number) => {
    set({ isLoadingCards: true, error: null });

    try {
      const cards = await getFavoriteCardsByModule(moduleId);

      // Update current module with cards
      const state = get();
      if (state.currentModule && state.currentModule.module.id === moduleId) {
        set({
          currentModule: {
            ...state.currentModule,
            cards,
          },
          currentCards: cards,
          isLoadingCards: false,
        });
      } else {
        set({
          currentCards: cards,
          isLoadingCards: false,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch cards';
      set({ error: message, isLoadingCards: false });
    }
  },

  // Select a course to view its modules
  selectCourse: (courseId: number) => {
    const state = get();
    const course = state.favoriteCourses.find((fc) => fc.course.id === courseId);
    if (course) {
      set({
        currentCourse: course,
        currentModule: null,
        currentCards: [],
      });
      // Fetch modules with favorites for this course
      state.fetchCourseModulesWithFavorites(courseId);
    }
  },

  // Select a module to view its cards
  selectModule: (moduleId: number) => {
    const state = get();
    if (state.currentCourse?.modules) {
      const module = state.currentCourse.modules.find((fm) => fm.module.id === moduleId);
      if (module) {
        set({ currentModule: module });
        state.fetchModuleCards(moduleId);
      }
    }
  },

  // Clear current selection (go back)
  clearSelection: () => {
    const state = get();
    if (state.currentModule) {
      // Go back to module list
      set({ currentModule: null, currentCards: [] });
    } else if (state.currentCourse) {
      // Go back to course list
      set({ currentCourse: null });
    }
  },

  // Add card to favorites
  addToFavorites: async (card: CardView) => {
    set({ isProcessing: true, error: null });

    try {
      await addCardToFavorites(card.id);

      // Update local state optimistically
      const state = get();
      const newCardIds = new Set(state.favoriteCardIds);
      newCardIds.add(card.id);

      set({
        favoriteCards: [...state.favoriteCards, card],
        favoriteCardIds: newCardIds,
        isProcessing: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add to favorites';
      set({ error: message, isProcessing: false });
    }
  },

  // Remove card from favorites
  removeFromFavorites: async (cardId: number) => {
    set({ isProcessing: true, error: null });

    try {
      await removeCardFromFavorites(cardId);

      // Update local state
      const state = get();
      const newCardIds = new Set(state.favoriteCardIds);
      newCardIds.delete(cardId);

      // Update currentCards if we're viewing module cards
      const newCurrentCards = state.currentCards.filter((c) => c.id !== cardId);

      set({
        favoriteCards: state.favoriteCards.filter((c) => c.id !== cardId),
        favoriteCardIds: newCardIds,
        currentCards: newCurrentCards,
        isProcessing: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove from favorites';
      set({ error: message, isProcessing: false });
    }
  },

  // Toggle favorite status
  toggleFavorite: async (card: CardView) => {
    const state = get();
    if (state.favoriteCardIds.has(card.id)) {
      await state.removeFromFavorites(card.id);
    } else {
      await state.addToFavorites(card);
    }
  },

  // Check if card is favorite
  isFavorite: (cardId: number) => {
    return get().favoriteCardIds.has(cardId);
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
