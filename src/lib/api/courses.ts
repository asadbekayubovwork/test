import apiClient from './client';
import { type WordzenApiResponse, wordzenErrorMessage } from './wordzenEnvelope';
import type { NoContentView } from './auth';

import { viteMediaBaseUrl, viteMediaProxyPrefix } from '../env';

const MEDIA_BASE_URL = viteMediaBaseUrl();
const MEDIA_PROXY_PREFIX = viteMediaProxyPrefix();

const isAbsoluteUrl = (value: string): boolean => {
  return value.startsWith('http://') || value.startsWith('https://');
};

const normalizeMediaPath = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (isAbsoluteUrl(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.origin !== MEDIA_BASE_URL) {
        return trimmed;
      }
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return trimmed;
    }
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

export const getImageUrl = (relativePath: string | undefined): string | undefined => {
  if (!relativePath) return undefined;

  const normalizedPath = normalizeMediaPath(relativePath);
  if (!normalizedPath) return undefined;

  if (isAbsoluteUrl(normalizedPath)) {
    return normalizedPath;
  }

  if (MEDIA_PROXY_PREFIX) {
    return `${MEDIA_PROXY_PREFIX}${normalizedPath}`;
  }

  return `${MEDIA_BASE_URL}${normalizedPath}`;
};

export type CourseCategory = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'SPEAKING' | 'READING' | 'WRITING';
/** wordzen-api.md — `CourseAccessCode` */
export type CourseAccessCode = 'FREE' | 'BASIC' | 'PRO';
/** `FreeModuleAvailabilityCode` на `freeAccess.status` */
export type FreeModuleAvailabilityCode = 'AVAILABLE' | 'ACTIVE' | 'COMPLETED' | 'LOCKED';
export type Locale = 'RU' | 'UZ' | 'EN';

export interface TranslationView {
  id: number;
  value: string;
  locale: Locale;
}

export interface SampleView {
  id: number;
  value: string;
  translation: string;
  locale: Locale;
}

export interface CardView {
  id: number;
  term: string;
  image?: string;
  translations: TranslationView[];
  samples: SampleView[];
}

export interface FreeModuleAccessView {
  available: boolean;
  status: FreeModuleAvailabilityCode;
  lockedReason: string | null;
  cooldownUntil: string | null;
}

export interface ModuleView {
  id: number;
  title: string;
  /** Контракт wordzen-api.md; если бэк шлёт только `public`, см. `public`. */
  isPublic?: boolean;
  cards?: CardView[];
  freeAccess?: FreeModuleAccessView;
  /** Legacy (старый OpenAPI): пока бэк не на новом контракте */
  public?: boolean;
  paid?: boolean;
}

export interface CourseCategoryView {
  name: string;
  code: CourseCategory;
}

export interface CourseDescriptionView {
  id: number;
  value: string;
  locale: Locale;
}

export interface CourseView {
  id: number;
  title: string;
  category: CourseCategoryView;
  tag?: string;
  isPublic: boolean;
  inLibrary: boolean;
  purchased: boolean;
  cover?: string;
  descriptions: CourseDescriptionView[];
  modules?: ModuleView[];
  accessCode?: CourseAccessCode;
  /** Legacy (старый OpenAPI), пока нет `accessCode` */
  public?: boolean;
  paid?: boolean;
  cost?: number;
}

export interface CoursesView {
  courses: CourseView[];
}

export interface ModulesView {
  modules: ModuleView[];
}

const DEFAULT_FREE_ACCESS: FreeModuleAccessView = {
  available: true,
  status: 'AVAILABLE',
  lockedReason: null,
  cooldownUntil: null,
};

export function moduleFreeAccess(module: ModuleView): FreeModuleAccessView {
  return module.freeAccess ?? DEFAULT_FREE_ACCESS;
}

/** Доступ к контенту курса по тарифу (не FREE). */
export function isSubscriptionGatedCourse(course: CourseView): boolean {
  if (course.accessCode != null) {
    return course.accessCode !== 'FREE';
  }
  return course.paid === true;
}

/**
 * Юнит закрыт для UI: флаги `freeAccess` или курс BASIC/PRO без покупки/подписки (клиентский запасной порог).
 */
export function moduleAppearsLocked(
  module: ModuleView,
  course: CourseView,
  hasPremiumSubscription: boolean
): boolean {
  const fa = module.freeAccess;
  if (fa) {
    if (!fa.available || fa.status === 'LOCKED') {
      return true;
    }
  } else if (module.paid === true && !course.purchased) {
    return true;
  }
  if (isSubscriptionGatedCourse(course) && !course.purchased && !hasPremiumSubscription) {
    return true;
  }
  return false;
}

// API Functions

function coursesErrorMessage(body: WordzenApiResponse<unknown>, fallback: string): string {
  return wordzenErrorMessage(body, fallback);
}

/**
 * Get all courses with optional filter (повторяющийся query `filter` — см. wordzen-api.md)
 */
export const getCourses = async (
  filter?: CourseCategory | CourseCategory[]
): Promise<CourseView[]> => {
  const params =
    filter === undefined
      ? undefined
      : Array.isArray(filter)
        ? { filter }
        : { filter };

  const response = await apiClient.get<WordzenApiResponse<CoursesView>>('/api/v1/courses', { params });

  if (response.data.success && response.data.data) {
    const courses = response.data.data.courses || [];
    return courses;
  }

  throw new Error(coursesErrorMessage(response.data, 'Failed to fetch courses'));
};

/**
 * Get single course by ID
 */
export const getCourseById = async (courseId: number): Promise<CourseView> => {
  const response = await apiClient.get<WordzenApiResponse<CourseView>>(`/api/v1/courses/${courseId}`);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(coursesErrorMessage(response.data, 'Failed to fetch course'));
};

/**
 * Get modules for a course (`ModulesView`: `{ modules: [...] }`)
 */
export const getCourseModules = async (courseId: number): Promise<ModuleView[]> => {
  const response = await apiClient.get<WordzenApiResponse<ModulesView | ModuleView[]>>(
    `/api/v1/courses/${courseId}/modules`
  );

  if (response.data.success && response.data.data) {
    const data = response.data.data;
    if (Array.isArray(data)) {
      return data;
    }
    return data.modules || [];
  }

  throw new Error(coursesErrorMessage(response.data, 'Failed to fetch modules'));
};

/**
 * Get user's library courses
 */
export const getLibraryCourses = async (): Promise<CourseView[]> => {
  const response = await apiClient.get<WordzenApiResponse<CoursesView>>('/api/v1/courses/library');

  if (response.data.success && response.data.data) {
    return response.data.data.courses || [];
  }

  throw new Error(coursesErrorMessage(response.data, 'Failed to fetch library'));
};

/**
 * Add course to user's library
 */
export const addCourseToLibrary = async (courseId: number): Promise<void> => {
  const response = await apiClient.post<WordzenApiResponse<NoContentView | null>>(
    `/api/v1/courses/library/${courseId}`
  );

  if (!response.data.success) {
    throw new Error(coursesErrorMessage(response.data, 'Failed to add course to library'));
  }
};

/**
 * Remove course from user's library
 */
export const removeCourseFromLibrary = async (courseId: number): Promise<void> => {
  const response = await apiClient.delete<WordzenApiResponse<NoContentView | null>>(
    `/api/v1/courses/library/${courseId}`
  );

  if (!response.data.success) {
    throw new Error(coursesErrorMessage(response.data, 'Failed to remove course from library'));
  }
};

/**
 * Get single module by ID
 */
export const getModuleById = async (moduleId: number): Promise<ModuleView> => {
  const response = await apiClient.get<WordzenApiResponse<ModuleView>>(`/api/v1/modules/${moduleId}`);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(coursesErrorMessage(response.data, 'Failed to fetch module'));
};

/**
 * Get cards for a module
 */
export const getModuleCards = async (moduleId: number): Promise<CardView[]> => {
  const response = await apiClient.get<WordzenApiResponse<{ cards: CardView[] }>>(
    `/api/v1/modules/${moduleId}/cards`
  );

  if (response.data.success && response.data.data) {
    return response.data.data.cards;
  }

  throw new Error(coursesErrorMessage(response.data, 'Failed to fetch cards'));
};

/**
 * Get single card by ID
 */
export const getCardById = async (cardId: number): Promise<CardView> => {
  const response = await apiClient.get<WordzenApiResponse<CardView>>(`/api/v1/cards/${cardId}`);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(coursesErrorMessage(response.data, 'Failed to fetch card'));
};
