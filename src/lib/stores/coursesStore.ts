import { create } from 'zustand';
import {
  getCourses,
  getCourseById,
  getCourseModules,
  getLibraryCourses,
  addCourseToLibrary,
  removeCourseFromLibrary,
  getModuleById,
  getModuleCards,
  type CourseView,
  type ModuleView,
  type CardView,
  type CourseCategory,
} from '../api';

interface CoursesState {
  // Courses
  courses: CourseView[];
  libraryCourses: CourseView[];
  currentCourse: CourseView | null;

  // Modules
  currentModule: ModuleView | null;
  moduleCards: CardView[];

  // Loading states
  isLoadingCourses: boolean;
  isLoadingLibrary: boolean;
  isLoadingCourse: boolean;
  isLoadingModule: boolean;
  isLoadingCards: boolean;

  // Error states
  coursesError: string | null;
  libraryError: string | null;
  courseError: string | null;
  moduleError: string | null;
  cardsError: string | null;

  // Actions - Courses
  fetchCourses: (filter?: CourseCategory | CourseCategory[]) => Promise<void>;
  fetchLibraryCourses: () => Promise<void>;
  fetchCourse: (courseId: number) => Promise<void>;
  addToLibrary: (courseId: number) => Promise<void>;
  removeFromLibrary: (courseId: number) => Promise<void>;

  // Actions - Modules
  fetchModule: (moduleId: number) => Promise<void>;
  fetchModuleCards: (moduleId: number) => Promise<void>;

  // Actions - Utils
  clearCurrentCourse: () => void;
  clearCurrentModule: () => void;
  clearErrors: () => void;
}

export const useCoursesStore = create<CoursesState>((set, get) => ({
  // Initial state
  courses: [],
  libraryCourses: [],
  currentCourse: null,
  currentModule: null,
  moduleCards: [],

  isLoadingCourses: false,
  isLoadingLibrary: false,
  isLoadingCourse: false,
  isLoadingModule: false,
  isLoadingCards: false,

  coursesError: null,
  libraryError: null,
  courseError: null,
  moduleError: null,
  cardsError: null,

  // Fetch all courses
  fetchCourses: async (filter?: CourseCategory | CourseCategory[]) => {
    set({ isLoadingCourses: true, coursesError: null });

    try {
      const courses = await getCourses(filter);
      set({ courses: courses || [], isLoadingCourses: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch courses';
      set({ coursesError: message, isLoadingCourses: false });
    }
  },

  // Fetch user's library courses
  fetchLibraryCourses: async () => {
    set({ isLoadingLibrary: true, libraryError: null });

    try {
      const libraryCourses = await getLibraryCourses();
      set({ libraryCourses: libraryCourses || [], isLoadingLibrary: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch library';
      set({ libraryError: message, isLoadingLibrary: false });
    }
  },

  // Fetch single course
  fetchCourse: async (courseId: number) => {
    set({ isLoadingCourse: true, courseError: null });

    try {
      const course = await getCourseById(courseId);

      // If course doesn't have modules, fetch them separately
      if (!course.modules || course.modules.length === 0) {
        try {
          const modules = await getCourseModules(courseId);
          course.modules = modules;
        } catch {
          // Modules fetch failed, continue without them
        }
      }

      set({ currentCourse: course, isLoadingCourse: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch course';
      set({ courseError: message, isLoadingCourse: false });
    }
  },

  // Add course to library — single endpoint now that per-course paid
  // unlocks are replaced by subscription-based access. Backend rejects
  // for premium-only courses without an active subscription.
  addToLibrary: async (courseId: number) => {
    try {
      await addCourseToLibrary(courseId);

      // Update local state
      const { courses, currentCourse } = get();

      // Update courses list
      set({
        courses: courses.map(c =>
          c.id === courseId ? { ...c, inLibrary: true } : c
        ),
      });

      // Update current course if it matches
      if (currentCourse?.id === courseId) {
        set({ currentCourse: { ...currentCourse, inLibrary: true } });
      }

      // Refresh library
      get().fetchLibraryCourses();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add to library';
      throw new Error(message);
    }
  },

  // Remove course from library
  removeFromLibrary: async (courseId: number) => {
    try {
      await removeCourseFromLibrary(courseId);

      // Update local state
      const { courses, libraryCourses, currentCourse } = get();

      // Update courses list
      set({
        courses: courses.map(c =>
          c.id === courseId ? { ...c, inLibrary: false } : c
        ),
        libraryCourses: libraryCourses.filter(c => c.id !== courseId),
      });

      // Update current course if it matches
      if (currentCourse?.id === courseId) {
        set({ currentCourse: { ...currentCourse, inLibrary: false } });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove from library';
      throw new Error(message);
    }
  },

  // Fetch single module
  fetchModule: async (moduleId: number) => {
    set({ isLoadingModule: true, moduleError: null });

    try {
      const module = await getModuleById(moduleId);
      set({ currentModule: module, isLoadingModule: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch module';
      set({ moduleError: message, isLoadingModule: false });
    }
  },

  // Fetch cards for a module
  fetchModuleCards: async (moduleId: number) => {
    set({ isLoadingCards: true, cardsError: null });

    try {
      const cards = await getModuleCards(moduleId);
      set({ moduleCards: cards, isLoadingCards: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch cards';
      set({ cardsError: message, isLoadingCards: false });
    }
  },

  // Clear current course
  clearCurrentCourse: () => {
    set({ currentCourse: null, courseError: null });
  },

  // Clear current module
  clearCurrentModule: () => {
    set({ currentModule: null, moduleCards: [], moduleError: null, cardsError: null });
  },

  // Clear all errors
  clearErrors: () => {
    set({
      coursesError: null,
      libraryError: null,
      courseError: null,
      moduleError: null,
      cardsError: null,
    });
  },
}));
