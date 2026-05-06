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
    `SELECT COUNT(*) as count FROM "${table}" WHERE "${column}" LIKE $1`,
    [`${prefix}%`]
  );

  const count = result.rows[0].count;
  const nextNumber = parseInt(count, 10) + 1;
  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
}
