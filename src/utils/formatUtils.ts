/**
 * Formats a number as VND currency with thousands separators and no decimals.
 * @param amount - The number or string to format.
 * @returns Formatted string (e.g., "1.000.000")
 */
export function formatVND(amount: number | string): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(value)) return "0";
  
  return Math.round(value).toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Formats a number to ensure 0 is displayed as "0" and not an empty string.
 * @param value - The value to format.
 * @returns String representation of the number.
 */
export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "0";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";
  return num.toString();
}
