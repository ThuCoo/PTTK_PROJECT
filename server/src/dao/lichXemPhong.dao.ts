import { query } from '../db';
import { LichXemPhong } from '../types';

export async function getAll(date?: string): Promise<LichXemPhong[]> {
  let sql = `
    SELECT l.*, k.ho_ten as ten_khach, k.sdt as phone_khach, p.ma_phong
    FROM lich_xem_phong l
    LEFT JOIN khach_hang k ON l.ma_khach_hang = k.ma_khach_hang
    LEFT JOIN phong p ON l.ma_phong = p.ma_phong
    WHERE 1=1
  `;
  const params: any[] = [];
  if (date) {
    sql += ` AND DATE(pdk.ngay_lap) = $1`;
    params.push(date);
  }
  sql += ' ORDER BY pdk.ngay_du_kien_vao ASC';
  const result = await query(sql, params);
  return result.rows;
}

export async function getById(id: string): Promise<LichXemPhong | null> {
  const result = await query(
    `SELECT l.*, k.ho_ten as ten_khach, k.sdt as phone_khach, p.ma_phong
     FROM lich_xem_phong l
     LEFT JOIN khach_hang k ON l.ma_khach_hang = k.ma_khach_hang
     LEFT JOIN phong p ON l.ma_phong = p.ma_phong
     WHERE l.ma_lich = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function create(data: {
  ma_khach_hang: string;
  ma_phong?: string;
  thoi_gian: string;
  ghi_chu?: string;
}): Promise<LichXemPhong> {
  const result = await query(
    `INSERT INTO lich_xem_phong (ma_lich, ma_khach_hang, ma_phong, thoi_gian, ghi_chu)
     VALUES (md5(random()::text || clock_timestamp()::text), $1, $2, $3, $4) RETURNING *`,
    [data.ma_khach_hang, data.ma_phong || null, data.thoi_gian, data.ghi_chu]
  );
  return result.rows[0];
}

export async function updateStatus(maLich: string, trangThai: string): Promise<void> {
  await query('UPDATE lich_xem_phong SET trang_thai = $1 WHERE ma_lich = $2', [trangThai, maLich]);
}

export async function getTodayAppointments(): Promise<LichXemPhong[]> {
  const result = await query(
    `SELECT l.*, k.ho_ten as ten_khach, k.sdt as phone_khach, p.ma_phong
     FROM lich_xem_phong l
     LEFT JOIN khach_hang k ON l.ma_khach_hang = k.ma_khach_hang
     LEFT JOIN phong p ON l.ma_phong = p.ma_phong
     WHERE DATE(l.thoi_gian) = CURRENT_DATE
     ORDER BY l.thoi_gian ASC`
  );
  return result.rows;
}
