/**
 * Nurox ERP — Utility helpers
 *
 * cn()            – conditional classname merging
 * formatCurrency() – locale-aware money formatting
 * formatDate()     – consistent date output
 * formatNumber()   – compact number display (1.2K, 3.4M)
 * truncate()       – safe string truncation
 * sleep()          – promisified setTimeout (for testing)
 * getInitials()    – extract initials from a full name
 */

/**
 * Merge classnames conditionally.
 * Usage: cn("base", condition && "active", undefined)
 */
export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Format a number as currency.
 * @default locale "en-US", currency "USD"
 */
export function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string/Date to a human-readable format.
 * @default format "MMM dd, yyyy" via Intl
 */
export function formatDate(
  date: string | Date | undefined | null,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!date) return "—";

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  });
}

/**
 * Format a number compactly (1,200 → "1.2K", 3,400,000 → "3.4M").
 */
export function formatNumber(value: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Truncate a string to a maximum length with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1).trimEnd() + "…";
}

/**
 * Extract initials from a full name (e.g., "John Doe" → "JD").
 */
export function getInitials(name: string, maxChars = 2): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .slice(0, maxChars)
    .join("");
}

/**
 * Promisified setTimeout – useful for testing delays.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Percentage helper (avoids division by zero).
 */
export function percentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}
