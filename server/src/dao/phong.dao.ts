import { query } from '../db';
import { Phong } from '../types';

export async function getAll(khuVuc?: string, trangThai?: string, search?: string): Promise<Phong[]> {
  let sql = 'SELECT * FROM phong WHERE 1=1';
  const params: any[] = [];
  let idx = 1;
  if (khuVuc) { sql += ` AND khu_vuc = $${idx++}`; params.push(khuVuc); }
  if (trangThai) { sql += ` AND trang_thai = $${idx++}`; params.push(trangThai); }
  if (search) { sql += ` AND ma_phong ILIKE $${idx++}`; params.push(`%${search}%`); }
  sql += ' ORDER BY ma_phong';
  const result = await query(sql, params);
  return result.rows;
}

export async function getById(maPhong: string): Promise<Phong | null> {
  const result = await query('SELECT * FROM phong WHERE ma_phong = $1', [maPhong]);
  return result.rows[0] || null;
}

export async function getByMaPhong(maPhong: string): Promise<Phong | null> {
  const result = await query('SELECT * FROM phong WHERE ma_phong = $1', [maPhong]);
  return result.rows[0] || null;
}

export async function updateStatus(maPhong: string, trangThai: string): Promise<void> {
  await query('UPDATE phong SET trang_thai = $1 WHERE ma_phong = $2', [trangThai, maPhong]);
}

export async function incrementOccupied(maPhong: string, delta: number): Promise<void> {
  await query(
    `UPDATE phong SET dang_o = GREATEST(0, LEAST(suc_chua_toi_da, dang_o + $1)) WHERE ma_phong = $2`,
    [delta, maPhong]
  );
}

export async function getStats(): Promise<{ tong: number; dang_thue: number; trong: number }> {
  const result = await query(
    `SELECT
       COUNT(*) as tong,
       COUNT(*) FILTER (WHERE trang_thai = 'Đang sử dụng') as dang_thue,
       COUNT(*) FILTER (WHERE trang_thai = 'Trống') as trong
     FROM phong`
  );
  return {
    tong:       parseInt(result.rows[0].tong, 10),
    dang_thue:  parseInt(result.rows[0].dang_thue, 10),
    trong:      parseInt(result.rows[0].trong, 10),
  };
}
