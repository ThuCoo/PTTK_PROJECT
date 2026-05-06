import { query } from '../db';
import { LichXemPhong } from '../types';

export async function getAll(date?: string): Promise<LichXemPhong[]> {
  let sql = `
    SELECT l.*, k.ho_ten as ten_khach, k.phone as phone_khach, p.ma_phong
    FROM lich_xem_phong l
    LEFT JOIN khach_hang k ON l.khach_hang_id = k.id
    LEFT JOIN phong p ON l.phong_id = p.id
    WHERE 1=1
  `;
  const params: any[] = [];
  if (date) {
    sql += ` AND DATE(l.thoi_gian) = $1`;
    params.push(date);
  }
  sql += ' ORDER BY l.thoi_gian ASC';
  const result = await query(sql, params);
  return result.rows;
}

export async function getById(id: number): Promise<LichXemPhong | null> {
  const result = await query(
    `SELECT l.*, k.ho_ten as ten_khach, k.phone as phone_khach, p.ma_phong
     FROM lich_xem_phong l
     LEFT JOIN khach_hang k ON l.khach_hang_id = k.id
     LEFT JOIN phong p ON l.phong_id = p.id
     WHERE l.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function create(data: {
  khach_hang_id: number;
  phong_id?: number;
  thoi_gian: string;
  ghi_chu?: string;
}): Promise<LichXemPhong> {
  const result = await query(
    `INSERT INTO lich_xem_phong (khach_hang_id, phong_id, thoi_gian, ghi_chu)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.khach_hang_id, data.phong_id, data.thoi_gian, data.ghi_chu]
  );
  return result.rows[0];
}

export async function updateStatus(id: number, trangThai: string): Promise<void> {
  await query('UPDATE lich_xem_phong SET trang_thai = $1 WHERE id = $2', [trangThai, id]);
}

export async function getTodayAppointments(): Promise<LichXemPhong[]> {
  const result = await query(
    `SELECT l.*, k.ho_ten as ten_khach, k.phone as phone_khach, p.ma_phong
     FROM lich_xem_phong l
     LEFT JOIN khach_hang k ON l.khach_hang_id = k.id
     LEFT JOIN phong p ON l.phong_id = p.id
     WHERE DATE(l.thoi_gian) = CURRENT_DATE
     ORDER BY l.thoi_gian ASC`
  );
  return result.rows;
}
