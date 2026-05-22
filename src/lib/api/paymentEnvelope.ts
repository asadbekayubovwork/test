/**
 * Общая обёртка ответов payment-api (`payment-api.md`, раздел «Базовые правила»).
 * Формат совпадает с wordzen/account: `success`, `data`, `error` (с полями message, detail, code, uid).
 */
export function paymentErrorMessage(
  body: {
    error?: { message?: string; detail?: string } | null;
  },
  fallback: string,
): string {
  return (
    body.error?.message?.trim() ||
    body.error?.detail?.trim() ||
    fallback
  );
}
