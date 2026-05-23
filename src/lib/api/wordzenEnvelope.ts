/**
 * Общая обёртка ответов wordzen-api (`wordzen-api.md` § «Базовые правила»).
 * Сходится с `src/api.json` → ErrorDetail / ApiResponse*.
 */
export interface WordzenApiError {
  message: string;
  detail: string;
  code: number;
  uid: string;
}

export interface WordzenApiResponse<T> {
  success: boolean;
  data: T | null;
  error: WordzenApiError | null;
}

export function wordzenErrorMessage(
  body: Pick<WordzenApiResponse<unknown>, 'error'>,
  fallback: string
): string {
  const message = body.error?.message?.trim();
  const detail = body.error?.detail?.trim();

  if (message && detail && detail !== message) {
    return `${message}: ${detail}`;
  }
  return message || detail || fallback;
}
