import { query } from '../db';

/**
 * Generates the next sequential code for a given prefix.
 * Example: prefix='PDK', table='khach_hang', column='ma_phieu' → 'PDK001'
 */
export async function generateNextCode(
  prefix: string,
  table: string,
  column: string
): Promise<string> {
  const result = await query(
    `SELECT ${column} FROM ${table} WHERE ${column} LIKE $1 ORDER BY ${column} DESC LIMIT 1`,
    [`${prefix}%`]
  );

  if (result.rows.length === 0) {
    return `${prefix}001`;
  }

  const lastCode: string = result.rows[0][column];
  const lastNumber = parseInt(lastCode.replace(prefix, ''), 10);
  const nextNumber = lastNumber + 1;
  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
}
